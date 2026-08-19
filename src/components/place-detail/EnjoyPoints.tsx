import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { toDisplayText, toStableListKey } from '@/utils/list-item';

export default function EnjoyPoints({ points }: { points: string[] }) {
  const t = useTranslation();
  if (points.length === 0) return null;
  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>{t.placeDetail.enjoyTitle}</CustomText>
      {points.map((point, index) => (
        <View key={toStableListKey(point, index)} style={styles.item}>
          <Image source={require('@/assets/images/check.svg')} style={styles.checkIcon} contentFit="contain" />
          <CustomText style={styles.text}>{toDisplayText(point)}</CustomText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  title: { marginBottom: 16, fontFamily: FontFamily.pretendard.semiBold, fontSize: 20, lineHeight: 28, color: Palette.text },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  checkIcon: { width: 22, height: 22 },
  text: { flex: 1, fontFamily: FontFamily.pretendard.medium, fontSize: 14, lineHeight: 19.6, color: Palette.grey900 },
});
