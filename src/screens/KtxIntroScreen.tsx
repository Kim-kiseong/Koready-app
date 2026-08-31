import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import CustomText from '@/components/CustomText';
import GuideDetailHero from '@/components/guide-blocks/GuideDetailHero';
import OnboardingHeader from '@/components/OnboardingHeader';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { KTX_INTRO, KTX_INTRO_EN, type KtxInfoIconKind } from '@/constants/ktx-content';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useLanguageStore } from '@/store/language-store';

// 32px circle-badge icons matching the Figma "calendar / globe / triangle-alert"
// assets exactly — plain SymbolView icons don't have the colored circle backdrop.
function InfoIcon({ kind }: { kind: KtxInfoIconKind }) {
  switch (kind) {
    case 'calendar':
      return (
        <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
          <Circle cx={16} cy={16} r={15.5} fill={Palette.infoBlueBg} stroke={Palette.infoBlueBorder} />
          <Path
            d="M13.1111 9V11.8M18.8889 9V11.8M9.5 14.6H22.5M10.9444 10.4H21.0556C21.8533 10.4 22.5 11.0268 22.5 11.8V21.6C22.5 22.3732 21.8533 23 21.0556 23H10.9444C10.1467 23 9.5 22.3732 9.5 21.6V11.8C9.5 11.0268 10.1467 10.4 10.9444 10.4Z"
            stroke={Palette.infoBlue}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'globe':
      return (
        <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
          <Circle cx={16} cy={16} r={15.5} fill={Palette.secondary} stroke={Palette.tipBorder} />
          <Path
            d="M23 16C23 19.866 19.866 23 16 23M23 16C23 12.134 19.866 9 16 9M23 16H9M16 23C12.134 23 9 19.866 9 16M16 23C14.2026 21.1127 13.2 18.6063 13.2 16C13.2 13.3937 14.2026 10.8873 16 9M16 23C17.7974 21.1127 18.8 18.6063 18.8 16C18.8 13.3937 17.7974 10.8873 16 9M9 16C9 12.134 12.134 9 16 9"
            stroke={Palette.infoGreen}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'warning':
      return (
        <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
          <Circle cx={16} cy={16} r={15.5} fill={Palette.warningBg} stroke={Palette.warningBorder} />
          <Path
            d="M16.008 13.6737V16.7824M16.008 19.8911H16.016M23.7858 20.6684L17.3909 9.78797C17.2515 9.54876 17.0493 9.34979 16.8049 9.21136C16.5606 9.07293 16.2828 9 16 9C15.7172 9 15.4395 9.07293 15.1951 9.21136C14.9508 9.34979 14.7486 9.54876 14.6091 9.78797L8.21423 20.6684C8.07328 20.9057 7.99938 21.1751 8 21.4491C8.00063 21.7231 8.07576 21.9921 8.21778 22.2288C8.3598 22.4656 8.56367 22.6615 8.80871 22.797C9.05375 22.9324 9.33126 23.0024 9.61311 22.9999H22.4029C22.6834 22.9997 22.9589 22.9276 23.2017 22.7911C23.4445 22.6546 23.6461 22.4583 23.7862 22.2221C23.9263 21.9858 24.0001 21.7179 24 21.4452C23.9999 21.1725 23.9261 20.9046 23.7858 20.6684Z"
            stroke={Palette.warningIcon}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
  }
}

function InfoRow({
  icon,
  label,
  value,
  showDivider,
}: {
  icon: KtxInfoIconKind;
  label: string;
  value: string;
  showDivider: boolean;
}) {
  return (
    <>
      <View style={styles.infoRow}>
        <InfoIcon kind={icon} />
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
  const language = useLanguageStore((state) => state.language);
  const intro = language === 'EN' ? KTX_INTRO_EN : KTX_INTRO;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <OnboardingHeader onBack={() => goBackOrRoot(router)} title="" rightIcon={null} />

      <ScrollView contentContainerStyle={styles.content}>
        <GuideDetailHero
          image={intro.hero}
          categoryBadge={t.guideDetail.categoryBadge.TRANSPORT}
          title={intro.title}
          description={intro.description}
        />

        <View style={styles.infoCard}>
          {intro.infoRows.map((row, index) => (
            <InfoRow key={row.label} {...row} showDivider={index < intro.infoRows.length - 1} />
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
