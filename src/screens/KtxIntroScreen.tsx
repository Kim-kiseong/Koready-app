import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomText from '@/components/CustomText';
import GuideDetailHero from '@/components/guide-blocks/GuideDetailHero';
import OnboardingHeader from '@/components/OnboardingHeader';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { KTX_INTRO } from '@/constants/ktx-content';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

function InfoRow({
  icon,
  label,
  value,
  showDivider,
}: {
  icon: SymbolName;
  label: string;
  value: string;
  showDivider: boolean;
}) {
  return (
    <>
      <View style={styles.infoRow}>
        <SymbolView name={icon} size={22} weight="regular" tintColor={Palette.grey600} />
        <View style={styles.infoTextGroup}>
          <CustomText style={styles.infoLabel}>{label}</CustomText>
          <CustomText style={styles.infoValue}>{value}</CustomText>
        </View>
      </View>
      {showDivider && <View style={styles.divider} />}
    </>
  );
}

export default function KtxIntroScreen() {
  const router = useRouter();
  const t = useTranslation();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <OnboardingHeader onBack={() => goBackOrRoot(router)} title="" rightIcon={null} />

      <ScrollView contentContainerStyle={styles.content}>
        <GuideDetailHero
          image={KTX_INTRO.hero}
          categoryBadge={t.guideDetail.categoryBadge.TRANSPORT}
          title={KTX_INTRO.title}
          description={KTX_INTRO.description}
        />

        <View style={styles.infoCard}>
          {KTX_INTRO.infoRows.map((row, index) => (
            <InfoRow key={row.label} {...row} showDivider={index < KTX_INTRO.infoRows.length - 1} />
          ))}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.buttonBar}>
        <Pressable style={styles.startButton} onPress={() => router.push('/guides/ktx/steps')}>
          <CustomText style={styles.startButtonText}>{t.guideDetail.startButton}</CustomText>
          <SymbolView
            name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
            size={18}
            weight="semibold"
            tintColor="#ffffff"
          />
        </Pressable>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 16,
  },
  infoCard: {
    borderWidth: 1,
    borderColor: Palette.grey200,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  infoTextGroup: {
    flex: 1,
    gap: 6,
  },
  infoLabel: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    color: Palette.grey600,
  },
  infoValue: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    color: Palette.text,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.grey150,
  },
  buttonBar: {
    backgroundColor: '#ffffff',
    paddingTop: 14,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 52,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Palette.primary,
  },
  startButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    color: '#ffffff',
  },
});
