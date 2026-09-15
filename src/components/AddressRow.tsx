import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type AddressRowProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  right: ReactNode;
  selected?: boolean;
  onPress?: () => void;
};

export default function AddressRow({ title, subtitle, badge, right, selected, onPress }: AddressRowProps) {
  return (
    <Pressable style={[styles.row, selected && styles.rowSelected]} onPress={onPress}>
      <Image source={require('@/assets/images/map-pin.svg')} style={styles.pin} />
      <View style={styles.textGroup}>
        <CustomText style={styles.title}>{title}</CustomText>
        {badge ? (
          <View style={[styles.badge, selected && styles.badgeOnSelected]}>
            <CustomText style={styles.badgeText}>{badge}</CustomText>
          </View>
        ) : subtitle ? (
          <CustomText style={styles.subtitle}>{subtitle}</CustomText>
        ) : null}
      </View>
      {right}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Palette.grey150,
  },
  rowSelected: {
    backgroundColor: Palette.secondary,
  },
  pin: {
    width: 24,
    height: 24,
  },
  textGroup: {
    flex: 1,
    gap: 8,
  },
  title: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    color: Palette.text,
  },
  subtitle: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    color: Palette.grey600,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Palette.secondary,
    borderWidth: 1,
    borderColor: Palette.primaryPale,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  // Selected rows already fill with Palette.secondary, so the badge needs a
  // white fill of its own here or it would blend invisibly into the row.
  badgeOnSelected: {
    backgroundColor: Palette.white,
  },
  badgeText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 12,
    color: Palette.primary,
  },
});
