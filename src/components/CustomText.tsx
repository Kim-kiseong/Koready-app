import { StyleSheet, Text, type TextProps } from 'react-native';

import { FontFamily } from '@/constants/typography';

export default function CustomText({ style, ...rest }: TextProps) {
  return <Text style={[styles.default, style]} {...rest} />;
}

const styles = StyleSheet.create({
  default: {
    fontFamily: FontFamily.pretendard.regular,
  },
});
