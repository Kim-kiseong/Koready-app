import { StyleSheet, Text, type TextProps } from 'react-native';

import { FontFamily } from '@/constants/typography';

export default function CustomText({
  style,
  lineBreakStrategyIOS = 'hangul-word',
  textBreakStrategy = 'highQuality',
  ...rest
}: TextProps) {
  return (
    <Text
      style={[styles.default, style]}
      lineBreakStrategyIOS={lineBreakStrategyIOS}
      textBreakStrategy={textBreakStrategy}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: FontFamily.pretendard.regular,
  },
});
