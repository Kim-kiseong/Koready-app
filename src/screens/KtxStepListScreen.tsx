import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomText from '@/components/CustomText';
import WarningBox from '@/components/guide-blocks/WarningBox';
import OnboardingHeader from '@/components/OnboardingHeader';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { KTX_LIST_WARNING, KTX_LIST_WARNING_EN, KTX_STEPS, KTX_STEPS_EN } from '@/constants/ktx-content';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useLanguageStore } from '@/store/language-store';

export default function KtxStepListScreen() {
  const router = useRouter();
  const t = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const steps = language === 'EN' ? KTX_STEPS_EN : KTX_STEPS;
  const listWarning = language === 'EN' ? KTX_LIST_WARNING_EN : KTX_LIST_WARNING;
  const [currentStep, setCurrentStep] = useState(3);

  const handleStepPress = (stepId: number) => {
    setCurrentStep(stepId);
    router.push({ pathname: '/guides/ktx/steps/[stepId]', params: { stepId: String(stepId) } });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader onBack={() => goBackOrRoot(router)} title={t.guideDetail.stepListTitle} rightIcon={null} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressGroup}>
          <View style={styles.progressLabelRow}>
            <CustomText style={styles.totalSteps}>
              {t.guideDetail.totalStepsPrefix}
              {steps.length}
              {t.guideDetail.totalStepsSuffix}
            </CustomText>
            <Pressable
              style={styles.resumeRow}
              onPress={() => handleStepPress(currentStep)}
              hitSlop={8}>
              <CustomText style={styles.resumeText}>
                {t.guideDetail.resumeStepPrefix}
                {currentStep}
                {t.guideDetail.resumeStepSuffix}
              </CustomText>
              <SymbolView
                name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
                size={12}
                weight="semibold"
                tintColor={Palette.primary}
              />
            </Pressable>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(currentStep / steps.length) * 100}%` }]} />
          </View>
        </View>

        <View style={styles.stepList}>
          {steps.map((step, index) => {
            const active = step.id === currentStep;
            const isLast = index === steps.length - 1;
            return (
              <Pressable
                key={step.id}
                style={[styles.stepRow, active && styles.stepRowActive, !isLast && styles.stepRowDivider]}
                onPress={() => handleStepPress(step.id)}>
                <View style={[styles.stepBadge, active && styles.stepBadgeActive]}>
                  <CustomText style={[styles.stepBadgeText, active && styles.stepBadgeTextActive]}>
                    {step.id}
                  </CustomText>
                </View>
                <View style={styles.stepTextGroup}>
                  <CustomText style={styles.stepTitle}>{step.title}</CustomText>
                  <CustomText style={styles.stepDescription}>{step.description}</CustomText>
                </View>
                <SymbolView
                  name={{ ios: 'chevron.right', android: 'arrow_forward_ios', web: 'arrow_forward_ios' }}
                  size={14}
                  weight="regular"
                  tintColor={Palette.grey350}
                />
              </Pressable>
            );
          })}
        </View>

        <WarningBox text={listWarning} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingBottom: 24,
  },
  progressGroup: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 12,
  },
  progressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalSteps: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    color: Palette.grey400,
  },
  resumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  resumeText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 13,
    color: Palette.primary,
  },
  progressTrack: {
    height: 6,
    borderRadius: 100,
    backgroundColor: Palette.grey150,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 100,
    backgroundColor: Palette.primary,
  },
  stepList: {
    marginTop: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  stepRowActive: {
    backgroundColor: Palette.secondary,
  },
  stepRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Palette.grey150,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: Palette.grey100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeActive: {
    borderWidth: 0,
    backgroundColor: Palette.primary,
  },
  stepBadgeText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    color: Palette.grey600,
  },
  stepBadgeTextActive: {
    color: '#ffffff',
  },
  stepTextGroup: {
    flex: 1,
    gap: 6,
  },
  stepTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    color: Palette.text,
  },
  stepDescription: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    color: Palette.grey600,
  },
});
