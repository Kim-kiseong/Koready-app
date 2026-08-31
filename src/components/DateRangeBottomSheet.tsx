import { useCallback, useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Modal, PanResponder, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import type { LanguageCode } from '@/api/types';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { useLanguageStore } from '@/store/language-store';

export type DateOnly = {
  year: number;
  monthIndex: number;
  day: number;
};

export type DateRangeSelection = {
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

export const EMPTY_DATE_RANGE: DateRangeSelection = { start: null, end: null };

export function getTodayDateOnly(): DateOnly {
  const now = new Date();

  return {
    year: now.getFullYear(),
    monthIndex: now.getMonth(),
    day: now.getDate(),
  };
}

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

export type DateRangeBottomSheetProps = {
  visible: boolean;
  value: DateRangeSelection;
  onApply: (value: DateRangeSelection) => void;
  onClose: () => void;
};

export default function DateRangeBottomSheet({ visible, value, onApply, onClose }: DateRangeBottomSheetProps) {
  const t = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const isEnglish = language === 'EN';
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = windowHeight * (isEnglish ? 0.84 : 0.78);
  const [draft, setDraft] = useState<DateRangeSelection>(value);
  const [sheetTranslateY] = useState(() => new Animated.Value(windowHeight));
  const today = useMemo(() => getTodayDateOnly(), []);

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
  }, [visible, windowHeight, sheetTranslateY]);

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
    <Modal visible={visible} transparent animationType="none" onRequestClose={requestClose}>
      <View style={styles.overlay} pointerEvents="box-none">
        <Pressable style={styles.dismissArea} onPress={requestClose} />
        <Animated.View
          style={[
            styles.sheet,
            isEnglish && styles.sheetEnglish,
            { height: sheetHeight, transform: [{ translateY: sheetTranslateY }] },
          ]}
        >
          <View style={styles.body}>
            <View style={styles.handleArea} {...panResponder.panHandlers}>
              <View style={styles.handle} />
            </View>

            <View style={styles.headerRow}>
              <CustomText style={styles.headerTitle}>{t.dateRangePicker.title}</CustomText>
              <Pressable hitSlop={8} onPress={resetDraft}>
                <CustomText style={styles.resetText}>{t.dateRangePicker.reset}</CustomText>
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

          <View style={styles.footer}>
            <Pressable style={styles.cancelButton} onPress={requestClose}>
              <CustomText style={styles.cancelButtonText}>{t.dateRangePicker.cancel}</CustomText>
            </Pressable>
            <Pressable style={styles.applyButton} onPress={handleApply}>
              <CustomText style={styles.applyButtonText}>{t.dateRangePicker.apply}</CustomText>
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
  const weekdayLabels = language === 'EN' ? WEEKDAY_LABELS_EN : WEEKDAY_LABELS_KO;

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
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
      new Date(month.year, month.monthIndex, 1),
    );
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

function getDayTextColor(date: DateOnly, inCurrentMonth: boolean, selected: boolean, isPastDate: boolean) {
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
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignSelf: 'stretch',
    backgroundColor: Palette.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 16,
    overflow: 'hidden',
  },
  sheetEnglish: {
    bottom: 10,
  },
  body: {
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
  headerRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey600,
  },
  resetText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.primary,
  },
  calendarScroll: {
    flex: 1,
  },
  calendarContent: {
    gap: 24,
    paddingTop: 24,
    paddingBottom: 8,
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
    lineHeight: 19.6,
  },
  dayTextSelected: {
    color: Palette.white,
  },
  footer: {
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
