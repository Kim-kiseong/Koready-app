import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type StatusTrackerProps = {
  steps: string[];
  activeIndex: number;
};

const DELIVERY_MAP_IMAGE = require('@/assets/images/guides/order-delivery-status-map.png');

// Dark horizontal progress tracker with a map preview, matching the delivery guide card.
export default function StatusTracker({ steps, activeIndex }: StatusTrackerProps) {
  const safeActiveIndex = Math.max(0, Math.min(activeIndex, steps.length - 1));
  const isEnglish = steps.every((step) => !/[가-힣]/.test(step));

  return (
    <View style={styles.card}>
      <View style={styles.mapFrame}>
        <Image source={DELIVERY_MAP_IMAGE} style={styles.mapImage} contentFit="cover" />
      </View>

      <View style={styles.tracker}>
        <View style={[styles.railActive, isEnglish ? styles.railActiveEnglish : null]}>
          <ProgressRail />
        </View>

        {steps.map((step, index) => {
          const isDone = index < safeActiveIndex;
          const isCurrent = index === safeActiveIndex;
          const isWideLabel = isEnglish && index < 2;
          const isPreparingFood = isEnglish && index === 1;
          const isOutForDelivery = isEnglish && index === 2;

          return (
            <Fragment key={step}>
              <View
                  style={[
                    styles.step,
                    isWideLabel ? styles.stepWide : null,
                    isPreparingFood ? styles.stepPreparingEnglish : null,
                    isOutForDelivery ? styles.stepOutForDeliveryEnglish : null,
                  ]}
                >
                <View style={[styles.dot, isDone && styles.dotDone, isCurrent && styles.dotCurrent]}>
                  {isDone ? (
                    <SymbolView
                      name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                      size={12}
                      weight="semibold"
                      tintColor="#ffffff"
                    />
                  ) : isCurrent ? (
                    <View style={styles.dotCurrentInner} />
                  ) : null}
                </View>
                <CustomText
                  style={[styles.label, isWideLabel ? styles.labelWide : null]}
                  numberOfLines={2}
                >
                  {step}
                </CustomText>
              </View>
            </Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: Palette.grey700,
    padding: 20,
    gap: 18,
  },
  mapFrame: {
    width: '100%',
    height: 93,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  tracker: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  railActive: {
    position: 'absolute',
    left: 16,
    right: 38,
    top: 12,
  },
  railActiveEnglish: {
    left: 24,
  },
  step: {
    width: 51,
    alignItems: 'center',
    gap: 10,
  },
  stepWide: {
    width: 72,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dotDone: {
    backgroundColor: Palette.primary,
  },
  dotCurrent: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: Palette.primary,
  },
  dotCurrentInner: {
    width: 9,
    height: 9,
    borderRadius: 100,
    backgroundColor: Palette.primary,
  },
  label: {
    fontFamily: FontFamily.inter.medium,
    fontSize: 11,
    lineHeight: 15.4,
    color: '#ffffff',
    textAlign: 'center',
    width: 51,
    flexShrink: 1,
  },
  labelWide: {
    width: 72,
    fontSize: 10.5,
    lineHeight: 14.7,
  },
  stepPreparingEnglish: {
    transform: [{ translateX: -6 }],
  },
  stepOutForDeliveryEnglish: {
    transform: [{ translateX: -4 }],
  },
});

function ProgressRail() {
  return (
    <Svg width="100%" height={1} viewBox="0 0 350 1" fill="none">
      <Path d="M0 0.5H350" stroke="url(#paint0_linear_3034_17568)" />
      <Defs>
        <LinearGradient id="paint0_linear_3034_17568" x1="0" y1="1" x2="350" y2="1" gradientUnits="userSpaceOnUse">
          <Stop offset="0.8" stopColor="#48B89F" />
          <Stop offset="1" stopColor="#48B89F" stopOpacity={0} />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}
