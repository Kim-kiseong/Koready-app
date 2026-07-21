import { Theme } from "@/constants/theme";
import { Image } from "expo-image";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = (width - 32 - 16) / 2;

interface PlaceImage {
  imageUrl: string;
  order: number;
  altText: string;
}

interface DescriptionData {
  impactTitle: string;

  impactSubtitle: string;

  introParagraphs: string[];

  sourceType:
    | "KTO_ORIGINAL"
    | "AI_GENERATED"
    | "MANUAL_EDITED";
}

interface Props {
  data: DescriptionData;

  images: PlaceImage[];
}

export default function Description({
  data,
  images,
}: Props) {
  // order 순으로 정렬
  const sortedImages = [...images].sort(
    (a, b) => a.order - b.order
  );

  // Header에서 첫 번째 이미지를 이미 사용했으므로 제외
const descriptionImages = sortedImages.slice(1);

const heroImage = descriptionImages[0];

const galleryImages = descriptionImages.slice(1, 3);

  return (
    <View style={styles.container}>
      {/* 임팩트 타이틀 */}
      <Text style={styles.title}>
        {data.impactTitle}
      </Text>

      {/* 대표 이미지 */}
      {heroImage && (
        <Image
          source={{ uri: heroImage.imageUrl }}
          style={styles.mainImage}
          contentFit="cover"
          accessibilityLabel={heroImage.altText}
        />
      )}

      {/* 임팩트 서브타이틀 */}
      <Text style={styles.body}>
        {data.impactSubtitle}
      </Text>

      {/* 서브 이미지 */}
      {galleryImages.length > 0 && (
        <View style={styles.row}>
          {galleryImages.map((image) => (
            <Image
              key={`${image.order}-${image.imageUrl}`}
              source={{ uri: image.imageUrl }}
              style={styles.subImage}
              contentFit="cover"
              accessibilityLabel={image.altText}
            />
          ))}
        </View>
      )}

      {/* 소개 문단 */}
      {data.introParagraphs.map((paragraph, index) => (
        <Text
          key={index}
          style={[
            styles.body,
            index === data.introParagraphs.length - 1 &&
              styles.lastParagraph,
          ]}
          lineBreakStrategyIOS="standard"
        >
          {paragraph}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.spacing.xl, //16
    marginTop: Theme.spacing.xxxxxl, //42
  },

  title: {
    ...Theme.typography.text20SemiBold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xl, //16
  },

  mainImage: {
    width: "100%",
    height: 220,
    borderRadius: Theme.radius.lg, //16
    backgroundColor: Theme.colors.grey200,
    marginBottom: Theme.spacing.xl, //16
  },

  body: {
    ...Theme.typography.text14Medium,
    color: Theme.colors.grey900,
    flexShrink: 1, 
    maxWidth: "86%",
    marginBottom: Theme.spacing.xxxxxl, //42
  },

  lastParagraph: {
     marginBottom: Theme.spacing.xxxxxl, // 24
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Theme.spacing.xl, //16
  },

  subImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: Theme.radius.lg, //16
    backgroundColor: Theme.colors.grey200,
  },
});