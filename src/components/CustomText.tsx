import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { FontFamily, PRETENDARD_WEIGHTS, WEB_PRETENDARD_FAMILY } from '@/constants/typography';

export default function CustomText({
  style,
  lineBreakStrategyIOS = 'hangul-word',
  textBreakStrategy = 'highQuality',
  ...rest
}: TextProps) {
  const family = StyleSheet.flatten(style)?.fontFamily ?? FontFamily.pretendard.regular;
  const weight = PRETENDARD_WEIGHTS[family];
  const webFontStyle = Platform.OS === 'web' && weight
    ? { fontFamily: WEB_PRETENDARD_FAMILY, fontWeight: weight }
    : undefined;

  return (
    <Text
      style={[styles.default, style, webFontStyle]}
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
