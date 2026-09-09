import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Animated, Easing, Modal, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DEFAULT_EVENT_FILTERS,
  EVENT_DATE_FILTER_IDS,
  EVENT_REGION_IDS,
  type EventDateRange,
  type EventFilters,
} from '@/api/home';
import { TRAVEL_STYLE_IDS } from '@/api/onboarding';
import CustomText from '@/components/CustomText';
import DateRangeBottomSheet, {
  EMPTY_DATE_RANGE,
  type DateOnly,
  type DateRangeSelection,
} from '@/components/DateRangeBottomSheet';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';

function parseDateOnly(value: string): DateOnly {
  const [year, month, day] = value.split('-').map((part) => Number(part));
  return { year, monthIndex: month - 1, day };
}

function formatDateOnly(date: DateOnly) {
  return `${date.year}-${String(date.monthIndex + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
}

function toDateRangeSelection(range: EventDateRange): DateRangeSelection {
  if (!range.startDate || !range.endDate) {
    return EMPTY_DATE_RANGE;
  }
  return { start: parseDateOnly(range.startDate), end: parseDateOnly(range.endDate) };
}

function toEventDateRange(selection: DateRangeSelection): EventDateRange {
  if (!selection.start) {
    return { startDate: null, endDate: null };
  }
  const startDate = formatDateOnly(selection.start);
  return {
    startDate,
    endDate: selection.end ? formatDateOnly(selection.end) : startDate,
  };
}

function formatEventDateRangeLabel(range: EventDateRange) {
  if (!range.startDate || !range.endDate) return null;
  const start = formatShortDate(range.startDate);
  return range.startDate === range.endDate ? start : `${start} ~ ${formatShortDate(range.endDate)}`;
}

function formatShortDate(value: string) {
  const [year, month, day] = value.split('-');
  return `${year}.${month}.${day}`;
}

const EMPTY_EVENT_DATE_RANGE: EventDateRange = { startDate: null, endDate: null };

export type FilterBottomSheetProps = {
  visible: boolean;
  value: EventFilters;
  onApply: (filters: EventFilters) => void;
  onClose: () => void;
};

const ANIMATION_DURATION = 220;
const shouldUseNativeDriver = Platform.OS !== 'web';

export default function FilterBottomSheet({ visible, value, onApply, onClose }: FilterBottomSheetProps) {
  const t = useTranslation();
  const { height: windowHeight } = useWindowDimensions();
  const [draft, setDraft] = useState<EventFilters>(value);
  const [isDateSheetOpen, setIsDateSheetOpen] = useState(false);
  const [translateY] = useState(() => new Animated.Value(windowHeight));
  const [overlayOpacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: shouldUseNativeDriver,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: shouldUseNativeDriver,
      }),
    ]).start();
  }, [visible, translateY, overlayOpacity]);

  // onClose() (which flips the `visible` prop) is only called from inside the
  // finished callback below, so `visible` stays true for the whole exit
  // animation — no extra "stay mounted a bit longer" state is needed here.
  const animateOut = (onDone: () => void) => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: windowHeight,
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: shouldUseNativeDriver,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: shouldUseNativeDriver,
      }),
    ]).start(({ finished }) => {
      if (finished) onDone();
    });
  };

  const handleApply = () => {
    animateOut(() => {
      onApply(draft);
      onClose();
    });
  };

  const handleClose = () => {
    animateOut(() => {
      setDraft(value);
      setIsDateSheetOpen(false);
      onClose();
    });
  };

  const hasCustomDateRange = Boolean(draft.dateRange.startDate && draft.dateRange.endDate);
  const customDateRangeLabel = formatEventDateRangeLabel(draft.dateRange);

  const handleDateRangeApply = (selection: DateRangeSelection) => {
    setDraft((d) => ({ ...d, date: 'ALL', dateRange: toEventDateRange(selection) }));
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.overlayContainer}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.overlayBackground, { opacity: overlayOpacity }]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <Animated.View
          style={[styles.sheet, { maxHeight: windowHeight * 0.85, transform: [{ translateY }] }]}>
          <View style={styles.handleArea}>
            <View style={styles.handle} />
          </View>

          <View style={styles.headerRow}>
            <CustomText style={styles.headerTitle}>{t.eventFilter.title}</CustomText>
            <Pressable
              hitSlop={8}
              onPress={() => {
                setDraft(DEFAULT_EVENT_FILTERS);
                setIsDateSheetOpen(false);
              }}>
              <CustomText style={styles.resetText}>{t.eventFilter.reset}</CustomText>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sections}>
            <View style={styles.section}>
              <CustomText style={styles.sectionLabel}>{t.eventFilter.regionLabel}</CustomText>
              <View style={styles.chipWrap}>
                <FilterChip
                  label={t.eventFilter.regionAll}
                  selected={draft.region === 'ALL'}
                  onPress={() => setDraft((d) => ({ ...d, region: 'ALL' }))}
                />
                {EVENT_REGION_IDS.map((id) => (
                  <FilterChip
                    key={id}
                    label={t.eventFilter.regionOptions[id]}
                    selected={draft.region === id}
                    onPress={() => setDraft((d) => ({ ...d, region: id }))}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <CustomText style={styles.sectionLabel}>{t.eventFilter.dateLabel}</CustomText>
              <View style={styles.chipWrap}>
                <FilterChip
                  label={t.eventFilter.dateAll}
                  selected={!hasCustomDateRange && draft.date === 'ALL'}
                  onPress={() => setDraft((d) => ({ ...d, date: 'ALL', dateRange: EMPTY_EVENT_DATE_RANGE }))}
                />
                {EVENT_DATE_FILTER_IDS.map((id) => (
                  <FilterChip
                    key={id}
                    label={t.eventFilter.dateOptions[id]}
                    selected={!hasCustomDateRange && draft.date === id}
                    onPress={() => setDraft((d) => ({ ...d, date: id, dateRange: EMPTY_EVENT_DATE_RANGE }))}
                  />
                ))}
              </View>
              <Pressable
                style={[styles.dateCustomButton, hasCustomDateRange && styles.dateCustomButtonSelected]}
                onPress={() => setIsDateSheetOpen(true)}>
                <SymbolView
                  name={{ ios: 'calendar', android: 'event', web: 'event' }}
                  size={16}
                  weight="regular"
                  tintColor={hasCustomDateRange ? Palette.white : Palette.grey500}
                />
                <CustomText
                  numberOfLines={1}
                  style={[styles.dateCustomText, hasCustomDateRange && styles.dateCustomTextSelected]}>
                  {customDateRangeLabel ?? t.eventFilter.dateCustomButton}
                </CustomText>
              </Pressable>
            </View>

            <View style={styles.section}>
              <CustomText style={styles.sectionLabel}>{t.eventFilter.typeLabel}</CustomText>
              <View style={styles.chipWrap}>
                {TRAVEL_STYLE_IDS.map((id) => (
                  <FilterChip
                    key={id}
                    label={t.eventFilter.typeOptions[id]}
                    selected={draft.type === id}
                    onPress={() => setDraft((d) => ({ ...d, type: d.type === id ? 'ALL' : id }))}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          <SafeAreaView edges={['bottom']} style={styles.footer}>
            <Pressable style={styles.cancelButton} onPress={handleClose}>
              <CustomText style={styles.cancelButtonText}>{t.eventFilter.cancel}</CustomText>
            </Pressable>
            <Pressable style={styles.applyButton} onPress={handleApply}>
              <CustomText style={styles.applyButtonText}>{t.eventFilter.apply}</CustomText>
            </Pressable>
          </SafeAreaView>
        </Animated.View>
      </View>

      <DateRangeBottomSheet
        key={`event-date-sheet-${isDateSheetOpen ? 'open' : 'closed'}`}
        visible={isDateSheetOpen}
        value={toDateRangeSelection(draft.dateRange)}
        onApply={handleDateRangeApply}
        onClose={() => setIsDateSheetOpen(false)}
      />
    </Modal>
  );
}

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected ? styles.chipSelected : styles.chipUnselected]}>
      <CustomText style={selected ? styles.chipLabelSelected : styles.chipLabelUnselected}>{label}</CustomText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    backgroundColor: 'rgba(28,28,26,0.7)',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom:16,
    gap: 16,
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 40,
    backgroundColor: '#E5E8EB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    paddingBottom: 12,
    color: Palette.grey600,
  },
  resetText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
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
    color: Palette.text,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipUnselected: {
    backgroundColor: '#ffffff',
    borderColor: Palette.grey200,
  },
  chipSelected: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  chipLabelUnselected: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    color: Palette.grey600,
  },
  chipLabelSelected: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    color: '#ffffff',
  },
  dateCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: '#ffffff',
    paddingLeft: 12,
    paddingRight: 16,
  },
  dateCustomButtonSelected: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  dateCustomText: {
    flexShrink: 1,
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    color: Palette.grey600,
  },
  dateCustomTextSelected: {
    color: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 10,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.grey300,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 18,
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
    color: '#ffffff',
  },
});
