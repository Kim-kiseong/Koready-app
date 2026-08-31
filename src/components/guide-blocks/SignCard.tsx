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
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Image source={icon} style={styles.icon} contentFit="contain" />
        <CustomText style={styles.title}>{title}</CustomText>
        <View style={styles.divider} />
        <View style={styles.translations}>
          {translations.map((line) => (
            <CustomText key={line} style={styles.translationText}>
              {line}
            </CustomText>
          ))}
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
    gap: 12,
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
    color: '#ffffff',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
  translations: {
    gap: 2,
    alignItems: 'flex-end',
  },
  translationText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    color: '#ffffff',
  },
  caption: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    color: Palette.grey500,
    textAlign: 'right',
  },
});
