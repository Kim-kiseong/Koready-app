import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DEFAULT_EVENT_FILTERS,
  EVENT_DATE_FILTER_IDS,
  EVENT_REGION_IDS,
  type EventFilters,
} from '@/api/home';
import { TRAVEL_STYLE_IDS } from '@/api/onboarding';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';

export type FilterBottomSheetProps = {
  visible: boolean;
  value: EventFilters;
  onApply: (filters: EventFilters) => void;
  onClose: () => void;
};

export default function FilterBottomSheet({ visible, value, onApply, onClose }: FilterBottomSheetProps) {
  const t = useTranslation();
  const { height: windowHeight } = useWindowDimensions();
  const [draft, setDraft] = useState<EventFilters>(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { maxHeight: windowHeight * 0.85 }]} onPress={() => {}}>
          <View style={styles.handleArea}>
            <View style={styles.handle} />
          </View>

          <View style={styles.headerRow}>
            <CustomText style={styles.headerTitle}>{t.eventFilter.title}</CustomText>
            <Pressable hitSlop={8} onPress={() => setDraft(DEFAULT_EVENT_FILTERS)}>
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
                  selected={draft.date === 'ALL'}
                  onPress={() => setDraft((d) => ({ ...d, date: 'ALL' }))}
                />
                {EVENT_DATE_FILTER_IDS.map((id) => (
                  <FilterChip
                    key={id}
                    label={t.eventFilter.dateOptions[id]}
                    selected={draft.date === id}
                    onPress={() => setDraft((d) => ({ ...d, date: id }))}
                  />
                ))}
              </View>
              {/* TODO: wire up once a calendar/date-range picker screen exists */}
              <Pressable style={styles.dateCustomButton}>
                <SymbolView
                  name={{ ios: 'calendar', android: 'event', web: 'event' }}
                  size={16}
                  weight="regular"
                  tintColor={Palette.grey500}
                />
                <CustomText style={styles.dateCustomText}>{t.eventFilter.dateCustomButton}</CustomText>
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
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <CustomText style={styles.cancelButtonText}>{t.eventFilter.cancel}</CustomText>
            </Pressable>
            <Pressable style={styles.applyButton} onPress={handleApply}>
              <CustomText style={styles.applyButtonText}>{t.eventFilter.apply}</CustomText>
            </Pressable>
          </SafeAreaView>
        </Pressable>
      </Pressable>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28,28,26,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
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
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipUnselected: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Palette.grey200,
  },
  chipSelected: {
    backgroundColor: Palette.primary,
  },
  chipLabelUnselected: {
    fontFamily: FontFamily.pretendard.medium,
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
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: '#ffffff',
    paddingLeft: 12,
    paddingRight: 16,
  },
  dateCustomText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    color: Palette.grey600,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 14,
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
