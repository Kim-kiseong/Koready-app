import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import type { EventListing } from '@/api/home';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { EventImages } from '@/constants/event-images';
import { FontFamily } from '@/constants/typography';

export type EventGridCardProps = {
  event: EventListing;
  categoryLabel: string;
  onPress?: () => void;
};

export default function EventGridCard({ event, categoryLabel, onPress }: EventGridCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.photoSection}>
        <Image source={EventImages[event.imageKey]} style={StyleSheet.absoluteFill} contentFit="cover" />
        <View style={styles.badge}>
          <CustomText style={styles.badgeText}>{categoryLabel}</CustomText>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.locationRow}>
          <SymbolView
            name={{ ios: 'mappin', android: 'location_on', web: 'location_on' }}
            size={14}
            weight="regular"
            tintColor={Palette.primary}
          />
          <CustomText style={styles.locationText}>{event.location}</CustomText>
        </View>
        <CustomText style={styles.title}>{event.title}</CustomText>
        <CustomText style={styles.dateRange}>{event.dateRangeLabel}</CustomText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 165,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.grey200,
    overflow: 'hidden',
  },
  photoSection: {
    height: 110,
    padding: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#000000',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 12,
    color: '#ffffff',
  },
  content: {
    padding: 12,
    gap: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    color: Palette.primary,
  },
  title: {
    fontFamily: FontFamily.pretendard.bold,
    fontSize: 16,
    color: Palette.text,
  },
  dateRange: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    color: Palette.grey600,
  },
});
