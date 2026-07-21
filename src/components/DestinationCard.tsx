import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Destination } from '@/api/onboarding';
import CustomText from '@/components/CustomText';
import { DestinationImages } from '@/constants/destination-images';
import { FontFamily } from '@/constants/typography';

export type DestinationCardProps = {
  destination: Destination;
  selected: boolean;
  onPress: () => void;
};

export default function DestinationCard({ destination, selected, onPress }: DestinationCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={DestinationImages[destination.id]} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)']}
        start={{ x: 0.5, y: 0.12 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {selected && (
        <View style={styles.checkBadge}>
          <CustomText style={styles.checkMark}>✓</CustomText>
        </View>
      )}

      <View style={styles.content}>
        <CustomText style={styles.title}>{destination.name}</CustomText>
        <View style={styles.tagRow}>
          {destination.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <CustomText style={styles.tagText}>{tag}</CustomText>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    aspectRatio: 165 / 204,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 12,
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 12,
    color: '#1C1C1A',
    fontFamily: FontFamily.pretendard.bold,
  },
  content: {
    gap: 8,
  },
  title: {
    fontFamily: FontFamily.pretendard.bold,
    fontSize: 15,
    color: '#ffffff',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#ffffff',
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 12,
    fontFamily: FontFamily.pretendard.medium,
    color: '#ffffff',
  },
});
