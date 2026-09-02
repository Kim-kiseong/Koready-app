import { StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type PhraseCard = {
  ko: string;
  romanized: string;
  en: string;
};

export type PhraseCardsProps = {
  title?: string;
  phrases: PhraseCard[];
};

// Bordered card(s): bold Korean phrase + romanization on the left, English
// pill on the right. Shared by the language carousel's "함께 알아두면 좋아요"
// and safety guides' "바로 쓸 수 있는 표현".
export default function PhraseCards({ title, phrases }: PhraseCardsProps) {
  return (
    <View style={styles.group}>
      {title ? <CustomText style={styles.title}>{title}</CustomText> : null}
      <View style={styles.cards}>
        {phrases.map((phrase) => (
          <View key={phrase.ko} style={styles.card}>
            <View style={styles.textGroup}>
              <CustomText style={styles.ko}>{phrase.ko}</CustomText>
              <CustomText style={styles.romanized}>{phrase.romanized}</CustomText>
            </View>
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
  group: {
    width: '100%',
  },
  title: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    color: Palette.text,
    marginTop: 16,
    marginBottom: 16,
  },
  cards: {
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Palette.grey200,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  textGroup: {
    gap: 6,
    flexShrink: 1,
  },
  ko: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    color: Palette.text,
  },
  romanized: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    color: Palette.grey600,
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
