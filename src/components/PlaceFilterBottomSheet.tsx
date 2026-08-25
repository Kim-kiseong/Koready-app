import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import type { TravelStyleId } from '@/api/onboarding';
import CustomText from '@/components/CustomText';
import DateRangeBottomSheet, {
  EMPTY_DATE_RANGE,
  type DateOnly,
  type DateRangeSelection,
} from '@/components/DateRangeBottomSheet';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
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

const DATE_OPTIONS: { value: PlaceDateFilterPreset; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'THIS_WEEK', label: '이번 주' },
  { value: 'THIS_MONTH', label: '이번 달' },
  { value: 'NEXT_MONTH', label: '다음 달' },
];

const TRAVEL_STYLE_OPTIONS: { value: TravelStyleId; label: string }[] = [
  { value: 'LOCAL_FOOD', label: '로컬맛집' },
  { value: 'LOCAL_FESTIVAL', label: '지역축제' },
  { value: 'TRADITIONAL_MARKET', label: '전통시장' },
  { value: 'CULTURE_EXPERIENCE', label: '문화체험' },
  { value: 'NATURE', label: '자연명소' },
  { value: 'EXHIBITION_MUSEUM', label: '전시/미술관' },
  { value: 'DRAMA_LOCATION', label: '드라마 촬영지' },
];

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

export default function PlaceFilterBottomSheet({
  visible,
  value,
  onApply,
  onClose,
}: PlaceFilterBottomSheetProps) {
  const { height: windowHeight } = useWindowDimensions();
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
                <CustomText style={styles.filterHeaderTitle}>필터</CustomText>
              </View>
              <Pressable hitSlop={8} onPress={resetFilterDraft}>
                <CustomText style={styles.resetText}>초기화</CustomText>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sections}
              bounces={false}
            >
              <View style={styles.section}>
                <CustomText style={styles.sectionLabel}>날짜</CustomText>
                <View style={styles.chipWrap}>
                  {DATE_OPTIONS.map((option) => (
                    <FilterChip
                      key={option.value}
                      label={option.label}
                      selected={!hasCustomDateRange && draftFilter.datePreset === option.value}
                      onPress={() => handleDatePresetSelect(option.value)}
                    />
                  ))}
                </View>

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
                    {formatPlaceFilterDateButtonLabel(draftFilter)}
                  </CustomText>
                </Pressable>
              </View>

              <View style={styles.section}>
                <CustomText style={styles.sectionLabel}>관광 유형</CustomText>
                <View style={styles.chipWrap}>
                  {TRAVEL_STYLE_OPTIONS.map((option) => (
                    <FilterChip
                      key={option.value}
                      label={option.label}
                      selected={draftFilter.travelStyles.includes(option.value)}
                      onPress={() => toggleTravelStyle(option.value)}
                    />
                  ))}
                </View>
              </View>
            </ScrollView>

            <SafeAreaView edges={['bottom']} style={styles.filterFooter}>
              <Pressable style={styles.cancelButton} onPress={handleClose}>
                <CustomText style={styles.cancelButtonText}>취소</CustomText>
              </Pressable>
              <Pressable style={styles.applyButton} onPress={handleApply}>
                <CustomText style={styles.applyButtonText}>적용하기</CustomText>
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
        />
      </Modal>
    </>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28,28,26,0.7)',
    justifyContent: 'flex-end',
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
  filterFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
    paddingBottom: 32,
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
