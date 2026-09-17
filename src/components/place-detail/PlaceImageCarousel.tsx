import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import type { PlaceImage } from '@/api/place';
import { Palette } from '@/constants/colors';

const SIDE_PADDING = 16;
const GAP = 12;

function getImageKey(image: PlaceImage) {
  const source = image.source;
  const uri =
    typeof source === 'object' && source && !Array.isArray(source) && 'uri' in source
      ? source.uri
      : null;

  return `${image.order}:${typeof uri === 'string' ? uri : ''}`;
}

export default function PlaceImageCarousel({ images }: { images: PlaceImage[] }) {
  const { width } = useWindowDimensions();
  const [failedImageKeys, setFailedImageKeys] = useState<Set<string>>(() => new Set());
  // The Figma carousel intentionally leaves 34pt of the following card visible:
  // 16pt leading inset + 325pt card + 12pt gap + 22pt preview on a 375pt screen.
  const imageSize = width - 50;
  const sortedImages = useMemo(
    () => [...images].sort((a, b) => a.order - b.order),
    [images],
  );
  const visibleImages = sortedImages.filter((image) => !failedImageKeys.has(getImageKey(image)));

  if (visibleImages.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        snapToInterval={imageSize + GAP}
        contentContainerStyle={styles.content}>
        {visibleImages.map((image) => (
          <Image
            key={getImageKey(image)}
            source={image.source}
            style={[styles.image, { width: imageSize, height: imageSize }]}
            contentFit="cover"
            accessibilityLabel={image.altText}
            onError={() => {
              const key = getImageKey(image);
              setFailedImageKeys((current) => new Set(current).add(key));
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 12, marginBottom: 16 },
  content: { gap: GAP, paddingHorizontal: SIDE_PADDING },
  image: { borderRadius: 16, backgroundColor: Palette.grey150 },
});
