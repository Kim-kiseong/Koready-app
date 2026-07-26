import { StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type StepProgressIndicatorProps = {
  currentStep: number;
  totalSteps: number;
};

export default function StepProgressIndicator({
  currentStep,
  totalSteps,
}: StepProgressIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.segments}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            style={[styles.segment, index === currentStep - 1 ? styles.active : styles.inactive]}
          />
        ))}
      </View>
      <CustomText style={styles.stepText}>{String(currentStep).padStart(2, '0')}</CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  segments: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  segment: {
    height: 5,
    borderRadius: 10,
  },
  active: {
    width: 44,
    backgroundColor: Palette.primary,
  },
  inactive: {
    width: 5,
    backgroundColor: Palette.grey300,
  },
  stepText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    color: Palette.primary,
  },
});
