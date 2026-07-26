import { Image } from 'expo-image';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import type { PlaceImage } from '@/api/place';
import { Palette } from '@/constants/colors';

const SIDE_PADDING = 16;
const GAP = 12;

export default function PlaceImageCarousel({ images }: { images: PlaceImage[] }) {
  const { width } = useWindowDimensions();
  // The Figma carousel intentionally leaves 34pt of the following card visible:
  // 16pt leading inset + 325pt card + 12pt gap + 22pt preview on a 375pt screen.
  const imageSize = width - 50;
  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  if (sortedImages.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        snapToInterval={imageSize + GAP}
        contentContainerStyle={styles.content}>
        {sortedImages.map((image) => (
          <Image
            key={image.order}
            source={image.source}
            style={[styles.image, { width: imageSize, height: imageSize }]}
            contentFit="cover"
            accessibilityLabel={image.altText}
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
