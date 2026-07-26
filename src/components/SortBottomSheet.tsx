import { SymbolView } from 'expo-symbols';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { EventSortOrder } from '@/api/home';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
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
                    <SymbolView
                      name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                      size={16}
                      weight="semibold"
                      tintColor={Palette.text}
                    />
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
  title: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    color: Palette.grey600,
  },
  optionGroup: {
    gap: 24,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLabel: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    color: Palette.text,
  },
  optionLabelSelected: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    color: Palette.text,
  },
});
