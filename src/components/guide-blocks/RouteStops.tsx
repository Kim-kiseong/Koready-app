import { SymbolView } from 'expo-symbols';
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type RouteStop = {
  badge: string;
  label: string;
  sublabel: string;
  highlighted?: boolean;
};

export type RouteStopsProps = {
  caption: string;
  stops: RouteStop[];
};

// A → B → C route/stop badges with arrows between (bus's "이동 경로 예시").
export default function RouteStops({ caption, stops }: RouteStopsProps) {
  return (
    <View style={styles.card}>
      <CustomText style={styles.caption}>{caption}</CustomText>
      <View style={styles.row}>
        {stops.map((stop, index) => (
          <Fragment key={stop.label}>
            <View style={styles.stop}>
              <View style={[styles.badge, stop.highlighted && styles.badgeHighlighted]}>
                <CustomText style={[styles.badgeText, stop.highlighted && styles.badgeTextHighlighted]}>
                  {stop.badge}
                </CustomText>
              </View>
              <CustomText style={styles.label}>{stop.label}</CustomText>
              <CustomText style={styles.sublabel}>{stop.sublabel}</CustomText>
            </View>
            {index < stops.length - 1 && (
              <SymbolView
                name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
                size={16}
                weight="regular"
                tintColor={Palette.grey350}
              />
            )}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: Palette.grey200,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 16,
  },
  caption: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    color: Palette.grey600,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stop: {
    alignItems: 'center',
    gap: 4,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: Palette.grey200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeHighlighted: {
    backgroundColor: Palette.primary,
  },
  badgeText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    color: Palette.grey600,
  },
  badgeTextHighlighted: {
    color: '#ffffff',
  },
  label: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 12,
    color: Palette.text,
  },
  sublabel: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    color: Palette.grey600,
  },
});
