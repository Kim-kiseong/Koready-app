import { Pressable, StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type SelectableCardProps = {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
};

export default function SelectableCard({ title, subtitle, selected, onPress }: SelectableCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: selected ? Palette.secondary : '#ffffff',
          borderColor: selected ? Palette.primary : Palette.grey200,
          borderWidth: selected ? 1.4 : 1,
        },
      ]}>
      <View style={styles.textGroup}>
        <CustomText style={styles.title}>{title}</CustomText>
        <CustomText style={styles.subtitle}>{subtitle}</CustomText>
      </View>
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected && <CustomText style={styles.checkmark}>✓</CustomText>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
  },
  textGroup: {
    gap: 6,
  },
  title: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.text,
  },
  subtitle: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    color: Palette.grey600,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Palette.grey300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: FontFamily.pretendard.bold,
  },
});
