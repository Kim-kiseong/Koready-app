import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import type { TravelStyleId } from '@/api/onboarding';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useLanguageStore } from '@/store/language-store';
import {
  DEFAULT_PLACE_FILTER_SELECTION,
  formatPlaceFilterDateButtonLabel,
  type PlaceDateFilterPreset,
  type PlaceDateRange,
  type PlaceFilterSelection,
} from '@/utils/place-filter';

export type PlaceFilterBottomSheetProps = {
  visible: boolean;
  value: PlaceFilterSelection;
  onApply: (value: PlaceFilterSelection) => void;
  onClose: () => void;
};

type DateOnly = {
  year: number;
  monthIndex: number;
  day: number;
};

type DateRangeSelection = {
  start: DateOnly | null;
  end: DateOnly | null;
};

type YearMonth = {
  year: number;
  monthIndex: number;
};

type MonthCell = {
  date: DateOnly;
  inCurrentMonth: boolean;
};

type LanguageCode = 'KO' | 'EN';

const DATE_OPTIONS: { value: PlaceDateFilterPreset; labelKo: string; labelEn: string }[] = [
  { value: 'ALL', labelKo: '전체', labelEn: 'All' },
  { value: 'THIS_WEEK', labelKo: '이번 주', labelEn: 'This Week' },
  { value: 'THIS_MONTH', labelKo: '이번 달', labelEn: 'This Month' },
  { value: 'NEXT_MONTH', labelKo: '다음 달', labelEn: 'Next Month' },
];

const TRAVEL_STYLE_OPTIONS: { value: TravelStyleId; labelKo: string; labelEn: string }[] = [
  { value: 'LOCAL_FOOD', labelKo: '로컬맛집', labelEn: 'Local Food' },
  { value: 'LOCAL_FESTIVAL', labelKo: '지역축제', labelEn: 'Local Festivals' },
  { value: 'TRADITIONAL_MARKET', labelKo: '전통시장', labelEn: 'Traditional Markets' },
  { value: 'CULTURE_EXPERIENCE', labelKo: '문화체험', labelEn: 'Cultural Experiences' },
  { value: 'NATURE', labelKo: '자연명소', labelEn: 'Nature' },
  { value: 'EXHIBITION_MUSEUM', labelKo: '전시/미술관', labelEn: 'Exhibitions & Museums' },
  { value: 'DRAMA_LOCATION', labelKo: '드라마 촬영지', labelEn: 'K-Drama Locations' },
];

const WEEKDAY_LABELS_KO = [
  { label: '일', color: '#FD4C4D' },
  { label: '월', color: Palette.grey600 },
  { label: '화', color: Palette.grey600 },
  { label: '수', color: Palette.grey600 },
  { label: '목', color: Palette.grey600 },
  { label: '금', color: Palette.grey600 },
  { label: '토', color: '#3B82F6' },
] as const;

const WEEKDAY_LABELS_EN = [
  { label: 'Sun', color: '#FD4C4D' },
  { label: 'Mon', color: Palette.grey600 },
  { label: 'Tue', color: Palette.grey600 },
  { label: 'Wed', color: Palette.grey600 },
  { label: 'Thu', color: Palette.grey600 },
  { label: 'Fri', color: Palette.grey600 },
  { label: 'Sat', color: '#3B82F6' },
] as const;

const EMPTY_DATE_RANGE: DateRangeSelection = { start: null, end: null };

function toPlaceDateRange(selection: DateRangeSelection): PlaceDateRange {
  if (!selection.start && !selection.end) {
    return {
      startDate: null,
      endDate: null,
    };
  }

  if (selection.start && !selection.end) {
    const startDate = formatDateOnly(selection.start);
    return {
      startDate,
      endDate: startDate,
    };
  }

  if (!selection.start || !selection.end) {
    return {
      startDate: null,
      endDate: null,
    };
  }

  return {
    startDate: formatDateOnly(selection.start),
    endDate: formatDateOnly(selection.end),
  };
}

function toDateRangeSelection(range: PlaceDateRange): DateRangeSelection {
  if (!range.startDate || !range.endDate) {
    return EMPTY_DATE_RANGE;
  }

  return {
    start: parseDateOnly(range.startDate),
    end: parseDateOnly(range.endDate),
  };
}

function parseDateOnly(value: string): DateOnly {
  const [year, month, day] = value.split('-').map((part) => Number(part));

  return {
    year,
    monthIndex: month - 1,
    day,
  };
}

function formatDateOnly(date: DateOnly) {
  return `${date.year}-${String(date.monthIndex + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
}

function getTodayDateOnly(): DateOnly {
  const now = new Date();

  return {
    year: now.getFullYear(),
    monthIndex: now.getMonth(),
    day: now.getDate(),
  };
}

export default function PlaceFilterBottomSheet({
  visible,
  value,
  onApply,
  onClose,
}: PlaceFilterBottomSheetProps) {
  const { height: windowHeight } = useWindowDimensions();
  const language = useLanguageStore((state) => state.language);
  const isEnglish = language === 'EN';
  const [draftFilter, setDraftFilter] = useState<PlaceFilterSelection>(value);
  const [isDateSheetOpen, setIsDateSheetOpen] = useState(false);

  const handleClose = () => {
    setIsDateSheetOpen(false);
    onClose();
  };

  const handleApply = () => {
    onApply(draftFilter);
    handleClose();
  };

  const resetFilterDraft = () => {
    setDraftFilter(DEFAULT_PLACE_FILTER_SELECTION);
    setIsDateSheetOpen(false);
  };

  const toggleTravelStyle = (travelStyle: TravelStyleId) => {
    setDraftFilter((current) => ({
      ...current,
      travelStyles: current.travelStyles.includes(travelStyle)
        ? current.travelStyles.filter((item) => item !== travelStyle)
        : [...current.travelStyles, travelStyle],
    }));
  };

  const handleDatePresetSelect = (datePreset: PlaceDateFilterPreset) => {
    setDraftFilter((current) => ({
      ...current,
      datePreset,
      dateRange: {
        startDate: null,
        endDate: null,
      },
    }));
  };

  const handleDateRangeApply = (selection: DateRangeSelection) => {
    setDraftFilter((current) => ({
      ...current,
      datePreset: 'ALL',
      dateRange: toPlaceDateRange(selection),
    }));
  };

  const hasCustomDateRange = Boolean(draftFilter.dateRange.startDate && draftFilter.dateRange.endDate);

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
        onShow={() => {
          setDraftFilter(value);
          setIsDateSheetOpen(false);
        }}
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Pressable style={[styles.sheet, { maxHeight: windowHeight * 0.9 }]} onPress={() => {}}>
            <View style={styles.handleArea}>
              <View style={styles.handle} />
            </View>

            <View style={styles.filterHeaderRow}>
              <View style={styles.filterHeaderSpacer} />
              <View pointerEvents="none" style={styles.filterHeaderTitleWrap}>
                <CustomText style={styles.filterHeaderTitle}>{isEnglish ? 'Filters' : '필터'}</CustomText>
              </View>
              <Pressable hitSlop={8} onPress={resetFilterDraft}>
                <CustomText style={styles.resetText}>{isEnglish ? 'Reset' : '초기화'}</CustomText>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sections}
              bounces={false}
            >
              <View style={styles.section}>
                <CustomText style={styles.sectionLabel}>{isEnglish ? 'Date' : '날짜'}</CustomText>
                <View style={styles.chipWrap}>
                  {DATE_OPTIONS
                    .filter((option) => (isEnglish ? option.value !== 'NEXT_MONTH' : true))
                    .map((option) => (
                    <FilterChip
                      key={option.value}
                      label={isEnglish ? option.labelEn : option.labelKo}
                      selected={!hasCustomDateRange && draftFilter.datePreset === option.value}
                      onPress={() => handleDatePresetSelect(option.value)}
                    />
                  ))}
                </View>
                <View style={styles.dateActionRow}>
                  {isEnglish ? (
                    <FilterChip
                      key="NEXT_MONTH"
                      label="Next Month"
                      selected={!hasCustomDateRange && draftFilter.datePreset === 'NEXT_MONTH'}
                      onPress={() => handleDatePresetSelect('NEXT_MONTH')}
                    />
                  ) : null}
                  <Pressable
                    style={[
                      styles.dateSelectButton,
                      hasCustomDateRange ? styles.dateSelectButtonSelected : null,
                    ]}
                    onPress={() => setIsDateSheetOpen((current) => !current)}
                  >
                    <CalendarIcon
                      color={hasCustomDateRange ? Palette.white : Palette.grey500}
                    />
                    <CustomText
                      numberOfLines={1}
                      style={[
                        styles.dateSelectText,
                        hasCustomDateRange ? styles.dateSelectTextSelected : null,
                      ]}
                    >
                      {formatPlaceFilterDateButtonLabel(draftFilter, isEnglish ? 'EN' : 'KO')}
                    </CustomText>
                  </Pressable>
                </View>
              </View>

              <View style={styles.section}>
                <CustomText style={styles.sectionLabel}>{isEnglish ? 'Travel Type' : '관광 유형'}</CustomText>
                <View style={styles.chipWrap}>
                  {TRAVEL_STYLE_OPTIONS.map((option) => (
                    <FilterChip
                      key={option.value}
                      label={isEnglish ? option.labelEn : option.labelKo}
                      selected={draftFilter.travelStyles.includes(option.value)}
                      onPress={() => toggleTravelStyle(option.value)}
                    />
                  ))}
                </View>
              </View>
            </ScrollView>

            <SafeAreaView edges={['bottom']} style={styles.filterFooter}>
              <Pressable style={styles.cancelButton} onPress={handleClose}>
                <CustomText style={styles.cancelButtonText}>{isEnglish ? 'Cancel' : '취소'}</CustomText>
              </Pressable>
              <Pressable style={styles.applyButton} onPress={handleApply}>
                <CustomText style={styles.applyButtonText}>{isEnglish ? 'Apply Filters' : '적용하기'}</CustomText>
              </Pressable>
            </SafeAreaView>
          </Pressable>
        </Pressable>
        <DateRangeBottomSheet
          key={`date-sheet-${isDateSheetOpen ? 'open' : 'closed'}`}
          visible={isDateSheetOpen}
          value={toDateRangeSelection(draftFilter.dateRange)}
          onApply={handleDateRangeApply}
          onClose={() => setIsDateSheetOpen(false)}
          language={language}
        />
      </Modal>
    </>
  );
}

function DateRangeBottomSheet({
  visible,
  value,
  onApply,
  onClose,
  language,
}: {
  visible: boolean;
  value: DateRangeSelection;
  onApply: (value: DateRangeSelection) => void;
  onClose: () => void;
  language: LanguageCode;
}) {
  const { height: windowHeight } = useWindowDimensions();
  const [draft, setDraft] = useState<DateRangeSelection>(value);
  const [sheetTranslateY] = useState(() => new Animated.Value(windowHeight));
  const today = useMemo(() => getTodayDateOnly(), []);
  const isEnglish = language === 'EN';

  useEffect(() => {
    const listenerId = sheetTranslateY.addListener(() => {});

    return () => {
      sheetTranslateY.removeListener(listenerId);
    };
  }, [sheetTranslateY]);

  const monthStart = useMemo<YearMonth>(() => {
    const now = new Date();
    return { year: now.getFullYear(), monthIndex: now.getMonth() };
  }, []);
  const visibleMonths = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => shiftMonth(monthStart, index));
  }, [monthStart]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    sheetTranslateY.setValue(windowHeight);
    Animated.timing(sheetTranslateY, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [sheetTranslateY, visible, windowHeight]);

  const requestClose = useCallback(() => {
    Animated.timing(sheetTranslateY, {
      toValue: windowHeight,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        onClose();
      }
    });
  }, [onClose, sheetTranslateY, windowHeight]);

  const handleApply = useCallback(() => {
    onApply(draft);
    requestClose();
  }, [draft, onApply, requestClose]);

  const resetDraft = () => {
    setDraft(EMPTY_DATE_RANGE);
  };

  const handleDayPress = (date: DateOnly) => {
    setDraft((current) => {
      if (!current.start || (current.start && current.end)) {
        return { start: date, end: null };
      }

      if (compareDateOnly(date, current.start) < 0) {
        return { start: date, end: null };
      }

      return { start: current.start, end: date };
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          gestureState.dy > 4 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_, gestureState) => {
          sheetTranslateY.setValue(Math.max(0, gestureState.dy));
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 80 || gestureState.vy > 1.1) {
            requestClose();
            return;
          }

          Animated.spring(sheetTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 180,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(sheetTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 180,
          }).start();
        },
      }),
    [requestClose, sheetTranslateY],
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={requestClose}
    >
      <View style={styles.dateSheetOverlay} pointerEvents="box-none">
        <Pressable style={styles.dateDismissArea} onPress={requestClose} />
        <Animated.View
          style={[
            styles.sheet,
            styles.dateSheet,
            styles.dateSheetPosition,
            { height: windowHeight * 0.78, transform: [{ translateY: sheetTranslateY }] },
          ]}
        >
          <View style={styles.dateBody}>
            <View style={styles.handleArea} {...panResponder.panHandlers}>
              <View style={styles.handle} />
            </View>

            <View style={styles.dateHeaderRow}>
              <CustomText style={styles.dateHeaderTitle}>{isEnglish ? 'Select Dates' : '날짜 선택'}</CustomText>
              <Pressable hitSlop={8} onPress={resetDraft}>
                <CustomText style={styles.resetText}>{isEnglish ? 'Reset' : '초기화'}</CustomText>
              </Pressable>
            </View>

            <ScrollView
              style={styles.calendarScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.calendarContent}
              bounces={false}
              nestedScrollEnabled
            >
              {visibleMonths.map((month) => (
                <CalendarMonth
                  key={`${month.year}-${month.monthIndex}`}
                  month={month}
                  selection={draft}
                  today={today}
                  onDayPress={handleDayPress}
                  language={language}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.dateFooter}>
            <Pressable style={styles.cancelButton} onPress={requestClose}>
              <CustomText style={styles.cancelButtonText}>{isEnglish ? 'Cancel' : '취소'}</CustomText>
            </Pressable>
            <Pressable style={styles.applyButton} onPress={handleApply}>
              <CustomText style={styles.applyButtonText}>{isEnglish ? 'Done' : '적용하기'}</CustomText>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function CalendarMonth({
  month,
  selection,
  today,
  onDayPress,
  language,
}: {
  month: YearMonth;
  selection: DateRangeSelection;
  today: DateOnly;
  onDayPress: (date: DateOnly) => void;
  language: LanguageCode;
}) {
  const monthRows = useMemo(() => buildMonthRows(month), [month]);
  const isEnglish = language === 'EN';
  const weekdayLabels = isEnglish ? WEEKDAY_LABELS_EN : WEEKDAY_LABELS_KO;

  return (
    <View style={styles.monthBlock}>
      <CustomText style={styles.monthLabel}>{formatMonthLabel(month, language)}</CustomText>

      <View style={styles.weekdayRow}>
        {weekdayLabels.map((weekday) => (
          <View key={weekday.label} style={styles.weekdayCell}>
            <CustomText style={[styles.weekdayLabel, { color: weekday.color }]}>{weekday.label}</CustomText>
          </View>
        ))}
      </View>

      <View style={styles.dateGrid}>
        {monthRows.map((row, rowIndex) => (
          <View key={`${month.year}-${month.monthIndex}-row-${rowIndex}`} style={styles.dateRow}>
            {row.map((cell) => (
              <CalendarDayCell
                key={formatDateKey(cell.date)}
                cell={cell}
                selection={selection}
                today={today}
                onPress={() => onDayPress(cell.date)}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

function CalendarDayCell({
  cell,
  selection,
  today,
  onPress,
}: {
  cell: MonthCell;
  selection: DateRangeSelection;
  today: DateOnly;
  onPress: () => void;
}) {
  const isRangeStart = Boolean(selection.start && isSameDate(cell.date, selection.start));
  const isRangeEnd = Boolean(selection.end && isSameDate(cell.date, selection.end));
  const isSingleSelected = Boolean(selection.start && !selection.end && isRangeStart);
  const isInRange =
    Boolean(selection.start && selection.end) &&
    isDateBetweenInclusive(cell.date, selection.start!, selection.end!);

  const selected = isSingleSelected || isInRange;
  const isPastDate = compareDateOnly(cell.date, today) < 0;

  return (
    <Pressable
      disabled={isPastDate}
      onPress={onPress}
      style={[
        styles.dayCell,
        cell.inCurrentMonth ? styles.dayCellCurrentMonth : styles.dayCellOutsideMonth,
        selected ? styles.dayCellSelected : null,
        isSingleSelected ? styles.dayCellSelectedSingle : null,
        isRangeStart && selection.end ? styles.dayCellSelectedStart : null,
        isRangeEnd && selection.start ? styles.dayCellSelectedEnd : null,
      ]}
    >
        <CustomText
          style={[
            styles.dayText,
            { color: getDayTextColor(cell.date, cell.inCurrentMonth, selected, isPastDate) },
            selected ? styles.dayTextSelected : null,
          ]}
        >
          {cell.date.day}
      </CustomText>
    </Pressable>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected ? styles.chipSelected : styles.chipUnselected,
      ]}
    >
      <CustomText style={selected ? styles.chipLabelSelected : styles.chipLabelUnselected}>{label}</CustomText>
    </Pressable>
  );
}

function CalendarIcon({ color = Palette.grey500 }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M6.33333 3.5V6.1M11.6667 3.5V6.1M3 8.7H15M4.33333 4.8H13.6667C14.403 4.8 15 5.38203 15 6.1V15.2C15 15.918 14.403 16.5 13.6667 16.5H4.33333C3.59695 16.5 3 15.918 3 15.2V6.1C3 5.38203 3.59695 4.8 4.33333 4.8Z"
        stroke={color}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function buildMonthRows(month: YearMonth): MonthCell[][] {
  const firstDay = new Date(month.year, month.monthIndex, 1).getDay();
  const daysInMonth = new Date(month.year, month.monthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(month.year, month.monthIndex, 0).getDate();
  const prevMonth = shiftMonth(month, -1);
  const nextMonth = shiftMonth(month, 1);

  const cells: MonthCell[] = [];

  for (let index = firstDay - 1; index >= 0; index -= 1) {
    cells.push({
      date: {
        year: prevMonth.year,
        monthIndex: prevMonth.monthIndex,
        day: daysInPrevMonth - index,
      },
      inCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      date: {
        year: month.year,
        monthIndex: month.monthIndex,
        day,
      },
      inCurrentMonth: true,
    });
  }

  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({
      date: {
        year: nextMonth.year,
        monthIndex: nextMonth.monthIndex,
        day: nextDay,
      },
      inCurrentMonth: false,
    });
    nextDay += 1;
  }

  const rows: MonthCell[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    rows.push(cells.slice(index, index + 7));
  }

  return rows;
}

function shiftMonth(month: YearMonth, offset: number): YearMonth {
  const shifted = new Date(month.year, month.monthIndex + offset, 1);
  return {
    year: shifted.getFullYear(),
    monthIndex: shifted.getMonth(),
  };
}

function formatMonthLabel(month: YearMonth, language: LanguageCode) {
  if (language === 'EN') {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(month.year, month.monthIndex, 1));
  }

  return `${month.year}년 ${month.monthIndex + 1}월`;
}

function formatDateKey(date: DateOnly) {
  return `${date.year}-${date.monthIndex + 1}-${date.day}`;
}

function compareDateOnly(left: DateOnly, right: DateOnly) {
  return Date.UTC(left.year, left.monthIndex, left.day) - Date.UTC(right.year, right.monthIndex, right.day);
}

function isSameDate(left: DateOnly, right: DateOnly) {
  return left.year === right.year && left.monthIndex === right.monthIndex && left.day === right.day;
}

function isDateBetweenInclusive(date: DateOnly, start: DateOnly, end: DateOnly) {
  const current = Date.UTC(date.year, date.monthIndex, date.day);
  const startTime = Date.UTC(start.year, start.monthIndex, start.day);
  const endTime = Date.UTC(end.year, end.monthIndex, end.day);
  return current >= startTime && current <= endTime;
}

function getDayTextColor(
  date: DateOnly,
  inCurrentMonth: boolean,
  selected: boolean,
  isPastDate: boolean,
) {
  if (selected) {
    return Palette.white;
  }

  if (isPastDate) {
    return Palette.grey400;
  }

  const weekday = new Date(date.year, date.monthIndex, date.day).getDay();
  if (weekday === 0) {
    return inCurrentMonth ? '#FD4C4D' : '#FFB6B8';
  }

  if (weekday === 6) {
    return inCurrentMonth ? '#3B82F6' : '#A9C7FF';
  }

  return inCurrentMonth ? Palette.grey700 : Palette.grey400;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28,28,26,0.7)',
    justifyContent: 'flex-end',
  },
  dateSheetOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  dateDismissArea: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    alignSelf: 'stretch',
    backgroundColor: Palette.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 16,
  },
  dateSheet: {
    overflow: 'hidden',
  },
  dateSheetPosition: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  dateBody: {
    flex: 1,
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E8EB',
  },
  filterHeaderRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterHeaderSpacer: {
    width: 40,
  },
  filterHeaderTitleWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterHeaderTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: Palette.text,
  },
  dateHeaderRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateHeaderTitle: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    lineHeight: 19.6,
    marginTop:10,
    marginBottom: 24,
    color: Palette.grey600,
  },
  resetText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18.2,
    color: Palette.primary,
  },
  sections: {
    gap: 24,
    paddingBottom: 8,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.text,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipUnselected: {
    backgroundColor: Palette.white,
    borderColor: Palette.grey200,
  },
  chipSelected: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  chipLabelUnselected: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19.6,
    color: Palette.grey600,
  },
  chipLabelSelected: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.white,
  },
  dateSelectButton: {
    alignSelf: 'flex-start',
    height: 36,
    paddingLeft: 12,
    paddingRight: 16,
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: Palette.white,
  },
  dateSelectButtonSelected: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  dateSelectText: {
    flexShrink: 1,
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19.6,
    color: Palette.grey600,
  },
  dateSelectTextSelected: {
    color: Palette.white,
  },
  calendarContent: {
    gap: 24,
    paddingBottom: 8,
  },
  calendarScroll: {
    flex: 1,
  },
  monthBlock: {
    gap: 16,
  },
  monthLabel: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.text,
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayLabel: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19.6,
  },
  dateGrid: {
    gap: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  dayCell: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellCurrentMonth: {},
  dayCellOutsideMonth: {},
  dayCellSelected: {
    backgroundColor: Palette.primary,
  },
  dayCellSelectedSingle: {
    borderRadius: 999,
  },
  dayCellSelectedStart: {
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
  },
  dayCellSelectedEnd: {
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },
  dayText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19.6,
  },
  dayTextCurrentMonth: {
    color: Palette.grey700,
  },
  dayTextOutsideMonth: {
    color: Palette.grey400,
  },
  dayTextSelected: {
    color: Palette.white,
  },
  filterFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
    paddingBottom: 32,
  },
  dateFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
    paddingBottom: 32,
    backgroundColor: Palette.white,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.grey300,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 18,
    lineHeight: 25.2,
    color: Palette.grey400,
  },
  applyButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: Palette.white,
  },
});
