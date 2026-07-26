import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import type { RelatedPlace } from '@/api/place';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

type Props = { place: RelatedPlace; onPress: () => void };

export default function NearbyPlaceCard({ place, onPress }: Props) {
  return <Pressable style={styles.card} onPress={onPress}><Image source={{ uri: place.imageUrl }} style={styles.image} contentFit="cover" /><View style={styles.content}><CustomText numberOfLines={1} style={styles.title}>{place.title}</CustomText><CustomText style={styles.description}>{place.shortDescription}</CustomText></View></Pressable>;
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, borderColor: Palette.grey200, borderRadius: 16, backgroundColor: '#ffffff', marginBottom: 12 },
  image: { width: 80, height: 80, borderRadius: 12, marginRight: 16, backgroundColor: Palette.grey200 },
  content: { flex: 1 },
  title: { marginBottom: 4, fontFamily: FontFamily.pretendard.bold, fontSize: 16, lineHeight: 22.4, color: Palette.grey900 },
  description: { fontFamily: FontFamily.pretendard.regular, fontSize: 14, lineHeight: 19.6, color: Palette.grey600 },
});
