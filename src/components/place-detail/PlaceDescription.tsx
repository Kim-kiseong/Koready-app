import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import {
  normalizePlaceDescription,
  type PlaceDescription as PlaceDescriptionData,
  type PlaceImage,
} from '@/api/place';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

type Props = { description?: PlaceDescriptionData | null; images: PlaceImage[] };

function getImageKey(image: PlaceImage) {
  const source = image.source;
  const uri =
    typeof source === 'object' && source && !Array.isArray(source) && 'uri' in source
      ? source.uri
      : null;

  return `${image.order}:${typeof uri === 'string' ? uri : ''}`;
}

export default function PlaceDescription({ description, images }: Props) {
  const { width } = useWindowDimensions();
  const [failedImageKeys, setFailedImageKeys] = useState<Set<string>>(() => new Set());
  const normalizedDescription = normalizePlaceDescription(description);
  const detailImages = useMemo(
    () =>
      [...images]
        .sort((a, b) => a.order - b.order)
        .slice(1)
        .filter((image) => !failedImageKeys.has(getImageKey(image))),
    [failedImageKeys, images],
  );
  const heroImage = detailImages[0];
  const galleryImages = detailImages.slice(1, 3);
  const galleryImageSize = (width - 16 * 2 - 16) / 2;
  const { topic, oneLineDescription, introParagraphs } = normalizedDescription;

  const hasContent = Boolean(
    topic ||
      oneLineDescription ||
      introParagraphs.length > 0 ||
      heroImage ||
      galleryImages.length > 0,
  );

  if (!hasContent) {
    return null;
  }

  return (
    <View style={styles.container}>
      {topic ? <CustomText style={styles.title}>{topic}</CustomText> : null}

      {heroImage ? (
        <Image
          source={heroImage.source}
          style={styles.heroImage}
          contentFit="cover"
          accessibilityLabel={heroImage.altText}
          onError={() => {
            const key = getImageKey(heroImage);
            setFailedImageKeys((current) => new Set(current).add(key));
          }}
        />
      ) : null}

      {oneLineDescription ? <CustomText style={styles.body}>{oneLineDescription}</CustomText> : null}

      {galleryImages.length > 0 ? (
        <View style={styles.gallery}>
          {galleryImages.map((image) => (
            <Image
              key={getImageKey(image)}
              source={image.source}
              style={[styles.galleryImage, { width: galleryImageSize, height: galleryImageSize }]}
              contentFit="cover"
              accessibilityLabel={image.altText}
              onError={() => {
                const key = getImageKey(image);
                setFailedImageKeys((current) => new Set(current).add(key));
              }}
            />
          ))}
        </View>
      ) : null}

      {introParagraphs.length > 0 ? (
        <>
          {introParagraphs.map((paragraph, index) => (
            <CustomText
              key={`${index}-${paragraph}`}
              style={[styles.body, index === introParagraphs.length - 1 && styles.lastBody]}
            >
              {paragraph}
            </CustomText>
          ))}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 42 },
  title: { marginBottom: 16, fontFamily: FontFamily.pretendard.semiBold, fontSize: 20, lineHeight: 28, color: Palette.text },
  heroImage: { width: '100%', height: 220, borderRadius: 16, backgroundColor: Palette.grey200, marginBottom: 16 },
  gallery: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  galleryImage: { borderRadius: 16, backgroundColor: Palette.grey200 },
  body: { alignSelf: 'stretch', marginBottom: 42, fontFamily: FontFamily.pretendard.medium, fontSize: 14, lineHeight: 19.6, color: Palette.grey900 },
  lastBody: { marginBottom: 42 },
});
