import { Image, type ImageSource } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type SignCardProps = {
  icon: ImageSource;
  title: string;
  translations: string[];
  caption?: string;
};

// Dark real-world-signage example card (subway's "갈아타는 곳 / Transfer" style).
export default function SignCard({ icon, title, translations, caption }: SignCardProps) {
  const [primaryTranslation, ...secondaryTranslations] = translations;

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Image source={icon} style={styles.icon} contentFit="contain" />
        <CustomText style={styles.title}>{title}</CustomText>
        <View style={styles.divider} />
        <View style={styles.translations}>
          {primaryTranslation ? <CustomText style={styles.translationPrimary}>{primaryTranslation}</CustomText> : null}
          {secondaryTranslations.length > 0 ? (
            <View style={styles.translationSecondaryRow}>
              {secondaryTranslations.map((line) => (
                <CustomText key={line} style={styles.translationSecondary}>
                  {line}
                </CustomText>
              ))}
            </View>
          ) : null}
        </View>
      </View>
      {caption ? <CustomText style={styles.caption}>{caption}</CustomText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderRadius: 16,
    backgroundColor: Palette.grey700,
    padding: 20,
  },
  icon: {
    width: 48,
    height: 48,
  },
  title: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 24,
    lineHeight: 33.6,
    color: '#ffffff',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: '#ffffff',
  },
  translations: {
    minWidth: 94,
    gap: 2,
    alignItems: 'flex-start',
  },
  translationPrimary: {
    fontFamily: FontFamily.inter.medium,
    fontSize: 18,
    lineHeight: 25.2,
    color: '#ffffff',
  },
  translationSecondaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  translationSecondary: {
    fontFamily: FontFamily.inter.medium,
    fontSize: 14,
    lineHeight: 19.6,
    color: '#ffffff',
  },
  caption: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey500,
    textAlign: 'right',
  },
});
