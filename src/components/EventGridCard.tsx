import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { EventListing } from '@/api/home';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type EventGridCardProps = {
  event: EventListing;
  categoryLabel: string;
  width: number;
  onPress?: () => void;
};

export default function EventGridCard({ event, categoryLabel, width, onPress }: EventGridCardProps) {
  return (
    <Pressable style={[styles.card, { width }]} onPress={onPress}>
      <View style={styles.photoSection}>
        {event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.imageFallback]} />
        )}
        <CustomText style={styles.badge}>
          {categoryLabel}
        </CustomText>
      </View>

      <View style={styles.content}>
        <View style={styles.locationRow}>
          <LocationPinIcon />
          <CustomText style={styles.locationText}>{event.location}</CustomText>
        </View>
        <CustomText numberOfLines={2} style={styles.title}>
          {event.title}
        </CustomText>
        <CustomText style={styles.dateRange}>{event.dateRangeLabel}</CustomText>
      </View>
    </Pressable>
  );
}

function LocationPinIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M8.59418 15.9304C8.46897 15.8838 8.342 15.8115 8.21326 15.7133C7.82077 15.3895 7.329 14.9476 6.73796 14.3875C6.14705 13.8276 5.57158 13.1989 5.01157 12.5012C4.45142 11.8036 3.97612 11.0562 3.58567 10.259C3.19522 9.4617 3 8.66135 3 7.85798C3 6.24729 3.55845 4.86829 4.67535 3.72097C5.79239 2.57366 7.23394 2 9 2C10.7524 2 12.1906 2.57366 13.3144 3.72097C14.4381 4.86829 15 6.24729 15 7.85798C15 8.66135 14.8014 9.46367 14.4041 10.2649C14.0069 11.0663 13.5329 11.8171 12.9823 12.5172C12.4315 13.2173 11.8607 13.8428 11.2698 14.3937C10.6789 14.9446 10.1871 15.382 9.7945 15.7056C9.66576 15.8038 9.53756 15.8774 9.40991 15.9264C9.28212 15.9755 9.14548 16 9 16C8.85452 16 8.71924 15.9768 8.59418 15.9304ZM9.93107 8.70633C10.1856 8.46051 10.3128 8.16056 10.3128 7.80649C10.3128 7.45241 10.1856 7.1524 9.93107 6.90644C9.67671 6.66062 9.36636 6.5377 9 6.5377C8.63364 6.5377 8.32329 6.66062 8.06893 6.90644C7.81444 7.1524 7.68719 7.45241 7.68719 7.80649C7.68719 8.16056 7.81444 8.46051 8.06893 8.70633C8.32329 8.95216 8.63364 9.07507 9 9.07507C9.36636 9.07507 9.67671 8.95216 9.93107 8.70633Z"
        fill={Palette.primary}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: Palette.white,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  photoSection: {
    height: 110,
    backgroundColor: Palette.grey150,
    justifyContent: 'flex-start',
    padding: 16,
  },
  imageFallback: {
    backgroundColor: Palette.grey200,
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 11.6,
    lineHeight: 16.8,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  content: {
    padding: 12,
    gap: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.primary,
  },
  title: {
    fontFamily: FontFamily.pretendard.bold,
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.text,
  },
  dateRange: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey600,
  },
});
