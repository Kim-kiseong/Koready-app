import { StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type Phrase = {
  ko: string;
  en: string;
};

export type PhraseTableProps = {
  title: string;
  phrases: Phrase[];
};

// "자주 보는 표현" style card — Korean term on the left, English pill on the right.
export default function PhraseTable({ title, phrases }: PhraseTableProps) {
  return (
    <View style={styles.card}>
      <CustomText style={styles.title}>{title}</CustomText>
      <View style={styles.rows}>
        {phrases.map((phrase) => (
          <View key={phrase.ko} style={styles.row}>
            <CustomText style={styles.ko}>{phrase.ko}</CustomText>
            <View style={styles.enPill}>
              <CustomText style={styles.enText}>{phrase.en}</CustomText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: Palette.grey200,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 14,
  },
  title: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    color: Palette.grey600,
  },
  rows: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ko: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    color: Palette.text,
  },
  enPill: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Palette.tipBorder,
    backgroundColor: Palette.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  enText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    color: Palette.primary,
  },
});
