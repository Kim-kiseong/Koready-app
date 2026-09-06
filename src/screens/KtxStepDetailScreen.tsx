import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import CustomText from '@/components/CustomText';
import BulletList from '@/components/guide-blocks/BulletList';
import HoriTipCard from '@/components/HoriTipCard';
import OnboardingHeader from '@/components/OnboardingHeader';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { KTX_STEP3_DETAIL, KTX_STEP3_DETAIL_EN, KTX_STEPS, KTX_STEPS_EN } from '@/constants/ktx-content';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useLanguageStore } from '@/store/language-store';

function NoteBox({ text }: { text: string }) {
  const [first, ...rest] = text.split('\n');
  return (
    <View style={styles.note}>
      <CustomText style={styles.noteRegular}>{first}</CustomText>
      {rest.map((line) => (
        <CustomText key={line} style={styles.noteEmphasis}>
          {line}
        </CustomText>
      ))}
    </View>
  );
}

function ChecklistCheckIcon() {
  return (
    <Svg width={17} height={17} viewBox="0 0 17 17" fill="none">
      <Path
        d="M11 5.5L5.5 11.5L3 8.77273"
        stroke={Palette.grey500}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChecklistGrid({ title, columns }: { title: string; columns: string[][] }) {
  return (
    <View style={styles.checklistCard}>
      <CustomText style={styles.checklistTitle}>{title}</CustomText>
      <View style={styles.checklistColumns}>
        {columns.map((column, index) => (
          <View key={index} style={styles.checklistColumn}>
            {column.map((item) => (
              <View key={item} style={styles.checklistRow}>
                <ChecklistCheckIcon />
                <CustomText style={styles.checklistText}>{item}</CustomText>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function KtxStepDetailScreen() {
  const router = useRouter();
  const { stepId } = useLocalSearchParams<{ stepId: string }>();
  const language = useLanguageStore((state) => state.language);
  const steps = language === 'EN' ? KTX_STEPS_EN : KTX_STEPS;
  const step = steps.find((item) => String(item.id) === stepId);
  const isStep3 = !!step && stepId === '3';

  useEffect(() => {
    if (!isStep3) {
      goBackOrRoot(router);
    }
  }, [isStep3, router]);

  if (!isStep3) {
    return null;
  }

  const detail = language === 'EN' ? KTX_STEP3_DETAIL_EN : KTX_STEP3_DETAIL;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader
        onBack={() => goBackOrRoot(router)}
        title={detail.title}
        rightIcon={null}
        titleStyle={language === 'EN' ? styles.englishTitle : undefined}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <NoteBox text={detail.note} />

        <View style={styles.screenshotGroup}>
          <Image source={detail.screenshot} style={styles.screenshot} contentFit="cover" />
          <CustomText style={styles.screenshotCaption}>{detail.screenshotCaption}</CustomText>
        </View>

        <HoriTipCard variant="inline" body={detail.tipBody} />

        <BulletList columns={detail.stationColumns} />

        <ChecklistGrid title={detail.checklistTitle} columns={detail.checklistColumns} />
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
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 16,
  },
  note: {
    backgroundColor: Palette.grey100,
    borderRadius: 12,
    padding: 16,
  },
  noteRegular: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 20.8,
    color: Palette.grey500,
  },
  noteEmphasis: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 13,
    lineHeight: 20.8,
    color: Palette.grey700,
  },
  screenshotGroup: {
    gap: 10,
    alignItems: 'flex-end',
  },
  screenshot: {
    width: '100%',
    aspectRatio: 459 / 555,
    borderRadius: 16,
  },
  screenshotCaption: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    color: Palette.grey400,
  },
  checklistCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: Palette.grey200,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    backgroundColor: '#ffffff',
  },
  checklistTitle: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey600,
  },
  checklistColumns: {
    flexDirection: 'row',
    gap: 29,
    alignItems: 'flex-start',
  },
  checklistColumn: {
    width: 141,
    gap: 8,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checklistText: {
    fontFamily: FontFamily.inter.medium,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.text,
  },
  englishTitle: {
    fontSize: 15,
    textAlign: 'center',
  },
});
