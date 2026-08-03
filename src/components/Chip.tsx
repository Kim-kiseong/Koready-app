import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function Chip({ label, selected, onPress, style }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected ? styles.selected : styles.unselected, style]}>
      <CustomText style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}>
        {label}
      </CustomText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselected: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Palette.grey200,
  },
  selected: {
    backgroundColor: Palette.primary,
    borderWidth: 1,
    borderColor: Palette.primary,
  },
  label: {
    fontSize: 14,
    lineHeight: 19.6,
  },
  labelUnselected: {
    fontFamily: FontFamily.pretendard.medium,
    color: Palette.grey600,
  },
  labelSelected: {
    fontFamily: FontFamily.pretendard.medium,
    color: '#ffffff',
  },
});
