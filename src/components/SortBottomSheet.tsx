import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { EventSortOrder } from '@/api/home';
import CustomText from '@/components/CustomText';
import SortCheckIcon from '@/components/icons/SortCheckIcon';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';

export type SortBottomSheetProps = {
  visible: boolean;
  value: EventSortOrder;
  onSelect: (value: EventSortOrder) => void;
  onClose: () => void;
};

const OPTIONS: EventSortOrder[] = ['RECOMMENDED', 'DEADLINE'];

export default function SortBottomSheet({ visible, value, onSelect, onClose }: SortBottomSheetProps) {
  const t = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handleArea}>
            <View style={styles.handle} />
          </View>

          <CustomText style={styles.title}>{t.eventList.sortTitle}</CustomText>

          <View style={styles.optionGroup}>
            {OPTIONS.map((option) => {
              const selected = option === value;
              const label = option === 'RECOMMENDED' ? t.eventList.sortRecommended : t.eventList.sortDeadline;
              return (
                <Pressable key={option} style={styles.optionRow} onPress={() => onSelect(option)}>
                  <CustomText style={selected ? styles.optionLabelSelected : styles.optionLabel}>
                    {label}
                  </CustomText>
                  {selected && (
                    <SortCheckIcon />
                  )}
                </Pressable>
              );
            })}
          </View>

          <SafeAreaView edges={['bottom']} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28,28,26,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height:190,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 16,
  },
  handleArea: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E8EB',
  },
  title: {
    fontFamily: FontFamily.inter.medium,
    fontSize: 14,
    lineHeight: 19.6,
    color: '#4E5968',
  },
  optionGroup: {
    gap: 24,
    alignSelf: 'stretch',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLabel: {
    fontFamily: FontFamily.inter.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: '#1C1C1A',
  },
  optionLabelSelected: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    lineHeight: 22.4,
    color: '#1C1C1A',
  },
});
