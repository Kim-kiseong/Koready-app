import { StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export default function DetailTag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <CustomText style={styles.label}>{label}</CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: 8,
    backgroundColor: Palette.grey150,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16.8,
    color: Palette.grey600,
  },
});
