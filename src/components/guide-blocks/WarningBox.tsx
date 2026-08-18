import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type WarningBoxProps = {
  text: string;
};

export default function WarningBox({ text }: WarningBoxProps) {
  return (
    <View style={styles.box}>
      <SymbolView
        name={{
          ios: 'exclamationmark.triangle.fill',
          android: 'warning',
          web: 'warning',
        }}
        size={24}
        weight="regular"
        tintColor={Palette.warningText}
      />
      <CustomText style={styles.text}>{text}</CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.warningBorder,
    backgroundColor: Palette.warningBg,
  },
  text: {
    flex: 1,
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    lineHeight: 20.8,
    color: Palette.warningText,
  },
});
