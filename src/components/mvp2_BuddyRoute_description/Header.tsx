import { Theme } from "@/constants/theme";
import { Image } from "expo-image";
import { Dimensions, ScrollView, StyleSheet, View, } from "react-native";

interface PlaceImage {
  imageUrl: string;
  order: number;
  altText: string;
}

interface HeaderProps {
  images: PlaceImage[];
}

const { width } = Dimensions.get("window");
const HORIZONTAL_PADDING = Theme.spacing.xl; //16
const IMAGE_SPACING = Theme.spacing.md; //12
const IMAGE_WIDTH = width - 50;
const IMAGE_HEIGHT = IMAGE_WIDTH;
const IMAGE_TRANSITION = 150;

export default function Header({ images }: HeaderProps) {
  const sortedImages = [...images].sort(
    (a, b) => a.order - b.order
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={IMAGE_WIDTH + IMAGE_SPACING}
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}
      >
        {sortedImages.map((image, index) => (
          <View
            key={`${image.order}-${image.imageUrl}`}
            style={[
              styles.imageWrapper,
              index === sortedImages.length - 1 &&
                styles.lastImage,
            ]}
          >
            <Image
              source={{ uri: image.imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={IMAGE_TRANSITION}
              accessible
              accessibilityLabel={image.altText}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Theme.spacing.md, //12
    marginBottom: Theme.spacing.xl, //16
  },

  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
  },

  imageWrapper: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    marginRight: IMAGE_SPACING,

    borderRadius: Theme.radius.lg, //16
    overflow: "hidden",

    backgroundColor: Theme.colors.grey150,
  },

  lastImage: {
    marginRight: HORIZONTAL_PADDING,
  },

  image: {
    width: "100%",
    height: "100%",
  },
});