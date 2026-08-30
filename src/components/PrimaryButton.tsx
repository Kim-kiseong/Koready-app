import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';

export type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  style,
}: PrimaryButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: disabled ? theme.disabled : theme.primary },
        pressed && !disabled && styles.pressed,
        style,
      ]}>
      <CustomText style={[styles.text, { color: disabled ? Palette.grey400 : '#ffffff' }]}>
        {title}
      </CustomText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 52,
    padding: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
  },
});
