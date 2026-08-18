import { Image } from 'expo-image';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { DEFAULT_PLACE_DESCRIPTION, type PlaceDescription as PlaceDescriptionData, type PlaceImage } from '@/api/place';
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
  const safeDescription = {
    ...DEFAULT_PLACE_DESCRIPTION,
    ...description,
    introParagraphs:
      Array.isArray(description?.introParagraphs) && description.introParagraphs.length > 0
        ? description.introParagraphs.filter((paragraph): paragraph is string => typeof paragraph === 'string' && paragraph.trim().length > 0)
        : DEFAULT_PLACE_DESCRIPTION.introParagraphs,
    enjoyPoints:
      Array.isArray(description?.enjoyPoints) && description.enjoyPoints.length > 0
        ? description.enjoyPoints.filter((point): point is string => typeof point === 'string' && point.trim().length > 0)
        : DEFAULT_PLACE_DESCRIPTION.enjoyPoints,
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
