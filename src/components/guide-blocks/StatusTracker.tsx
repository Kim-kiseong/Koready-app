import { SymbolView } from 'expo-symbols';
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type StatusTrackerProps = {
  steps: string[];
  activeIndex: number;
};

// Dark horizontal progress tracker with a connecting line (delivery-status steps).
export default function StatusTracker({ steps, activeIndex }: StatusTrackerProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {steps.map((step, index) => {
          const reached = index <= activeIndex;
          return (
            <Fragment key={step}>
              <View style={styles.step}>
                <View style={[styles.dot, reached && styles.dotActive]}>
                  {reached && (
                    <SymbolView
                      name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                      size={12}
                      weight="semibold"
                      tintColor="#ffffff"
                    />
                  )}
                </View>
                <CustomText style={styles.label}>{step}</CustomText>
              </View>
              {index < steps.length - 1 && <View style={styles.connector} />}
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
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  step: {
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    backgroundColor: Palette.primary,
  },
  label: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 11,
    color: '#ffffff',
    textAlign: 'center',
    width: 51,
  },
  connector: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    marginTop: 12,
  },
});
