import { Theme } from "@/constants/theme";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Place {
  placeId: number;
  title: string;
  shortDescription: string;
  imageUrl: string;
}

interface Props {
  place: Place;
}

export default function NearbyPlaceCard({ place }: Props) {
  const router = useRouter();

  const handlePress = () => {
    // TODO
    // router.push(`/places/${place.placeId}`);
    console.log(place.placeId);
  };

  return (
    <Pressable
      style={styles.card}
      onPress={handlePress}
    >
      <Image
        source={
          place.imageUrl
            ? { uri: place.imageUrl }
            : undefined
        }
        style={styles.image}
        contentFit="cover"
      />

      <View style={styles.content}>
        <Text
          numberOfLines={1}
          style={styles.title}
        >
          {place.title}
        </Text>

        <Text
          
          style={styles.description}
          lineBreakStrategyIOS="standard"
          textBreakStrategy="highQuality"
        >
          {place.shortDescription}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",

    padding: Theme.spacing.lg, //14

    borderWidth: 1,
    borderColor: Theme.colors.grey200,
    borderRadius: Theme.radius.lg, //16

    backgroundColor: Theme.colors.white,

    marginBottom: Theme.spacing.md, //12
  },

  image: {
    width: 80,
    height: 80,

    borderRadius: Theme.radius.md, //12
    marginRight: Theme.spacing.xl, //16

    backgroundColor: Theme.colors.grey200,
  },

  content: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    ...Theme.typography.text16Bold,
    color: Theme.colors.grey900,
    marginBottom: Theme.spacing.xxs, //4
  },

  description: {
    ...Theme.typography.text14Regular,
    color: Theme.colors.grey700,
  },
});