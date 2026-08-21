import { Image } from 'expo-image';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import type { PlaceDescription as PlaceDescriptionData, PlaceImage } from '@/api/place';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

type Props = { description?: PlaceDescriptionData | null; images: PlaceImage[] };

export default function PlaceDescription({ description, images }: Props) {
  const { width } = useWindowDimensions();
  const detailImages = [...images].sort((a, b) => a.order - b.order).slice(1);
  const heroImage = detailImages[0];
  const galleryImages = detailImages.slice(1, 3);
  const galleryImageSize = (width - 16 * 2 - 16) / 2;
  // No per-place fallback text here on purpose — backfilling from another
  // place's own description (e.g. a food festival's intro) previously showed
  // up verbatim on unrelated places. Missing fields just render nothing.
  const safeDescription = {
    impactTitle: description?.impactTitle ?? '',
    impactSubtitle: description?.impactSubtitle ?? '',
    introParagraphs: (description?.introParagraphs ?? []).filter(
      (paragraph): paragraph is string => typeof paragraph === 'string' && paragraph.trim().length > 0,
    ),
    enjoyPoints: (description?.enjoyPoints ?? []).filter(
      (point): point is string => typeof point === 'string' && point.trim().length > 0,
    ),
  };

  return <View style={styles.container}>
    <CustomText style={styles.title}>{safeDescription.impactTitle}</CustomText>
    {heroImage && <Image source={heroImage.source} style={styles.heroImage} contentFit="cover" accessibilityLabel={heroImage.altText} />}
    <CustomText style={styles.body}>{safeDescription.impactSubtitle}</CustomText>
    {galleryImages.length > 0 && <View style={styles.gallery}>{galleryImages.map((image) => <Image key={image.order} source={image.source} style={[styles.galleryImage, { width: galleryImageSize, height: galleryImageSize }]} contentFit="cover" accessibilityLabel={image.altText} />)}</View>}
    {safeDescription.introParagraphs.map((paragraph, index) => <CustomText key={`${index}-${paragraph}`} style={[styles.body, index === safeDescription.introParagraphs.length - 1 && styles.lastBody]}>{paragraph}</CustomText>)}
  </View>;
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 42 },
  title: { marginBottom: 16, fontFamily: FontFamily.pretendard.semiBold, fontSize: 20, lineHeight: 28, color: Palette.text },
  heroImage: { width: '100%', height: 220, borderRadius: 16, backgroundColor: Palette.grey200, marginBottom: 16 },
  body: { maxWidth: '86%', marginBottom: 42, fontFamily: FontFamily.pretendard.medium, fontSize: 14, lineHeight: 19.6, color: Palette.grey900 },
  lastBody: { marginBottom: 42 },
  gallery: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  galleryImage: { borderRadius: 16, backgroundColor: Palette.grey200 },
});
