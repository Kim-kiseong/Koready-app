import { Image } from 'expo-image';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import type { PlaceDescription as PlaceDescriptionData, PlaceImage } from '@/api/place';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

type Props = { description: PlaceDescriptionData; images: PlaceImage[] };

export default function PlaceDescription({ description, images }: Props) {
  const { width } = useWindowDimensions();
  const detailImages = [...images].sort((a, b) => a.order - b.order).slice(1);
  const heroImage = detailImages[0];
  const galleryImages = detailImages.slice(1, 3);
  const galleryImageSize = (width - 16 * 2 - 16) / 2;

  return <View style={styles.container}>
    <CustomText style={styles.title}>{description.impactTitle}</CustomText>
    {heroImage && <Image source={heroImage.source} style={styles.heroImage} contentFit="cover" accessibilityLabel={heroImage.altText} />}
    <CustomText style={styles.body}>{description.impactSubtitle}</CustomText>
    {galleryImages.length > 0 && <View style={styles.gallery}>{galleryImages.map((image) => <Image key={image.order} source={image.source} style={[styles.galleryImage, { width: galleryImageSize, height: galleryImageSize }]} contentFit="cover" accessibilityLabel={image.altText} />)}</View>}
    {description.introParagraphs.map((paragraph, index) => <CustomText key={`${index}-${paragraph}`} style={[styles.body, index === description.introParagraphs.length - 1 && styles.lastBody]}>{paragraph}</CustomText>)}
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
