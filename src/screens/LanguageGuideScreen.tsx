import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomText from '@/components/CustomText';
import PhraseCards from '@/components/guide-blocks/PhraseCards';
import OnboardingHeader from '@/components/OnboardingHeader';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { LANGUAGE_CARDS, LANGUAGE_CARDS_EN, type LanguageCard } from '@/constants/language-content';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useLanguageStore } from '@/store/language-store';

function MascotCardView({
  card,
  badge,
}: {
  card: Extract<LanguageCard, { kind: 'mascot' }>;
  badge: string;
}) {
  return (
    <View style={[styles.cardBody, styles.mascotCardBody]}>
      <View style={styles.mascotHeader}>
        <CustomText style={styles.badge}>{badge}</CustomText>
        <View style={styles.titleGroup}>
          <CustomText style={styles.title}>{card.title}</CustomText>
          <CustomText style={styles.subtitle}>{card.subtitle}</CustomText>
        </View>
      </View>

      <View style={styles.mascotArea}>
        <View style={styles.mascotImageWrap}>
          <Image source={card.mascot} style={styles.mascotImage} contentFit="contain" />

          <View style={styles.bubbleGroup}>
            <Image source={require('@/assets/images/bubble-tail.svg')} style={styles.bubbleTail} contentFit="fill" />
            <View style={styles.bubble}>
              <CustomText style={styles.bubbleText}>&ldquo;{card.phrase}&rdquo;</CustomText>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function QuestionCardView({
  card,
  relatedTitle,
}: {
  card: Extract<LanguageCard, { kind: 'question' }>;
  relatedTitle: string;
}) {
  return (
    <View style={styles.questionCardBody}>
      <View style={styles.questionHeaderGroup}>
        <CustomText style={styles.questionTitle}>{card.title}</CustomText>
        <Image source={card.image} style={styles.questionImage} contentFit="cover" />
      </View>

      <View style={styles.questionAnswerGroup}>
        <View style={styles.questionBox}>
          <CustomText style={styles.questionText}>{card.questionEn}</CustomText>
        </View>
        <SymbolView
          name={{ ios: 'arrow.down', android: 'arrow_downward', web: 'arrow_downward' }}
          size={20}
          weight="regular"
          tintColor={Palette.grey350}
          style={styles.downArrow}
        />
        <View style={styles.answerBox}>
          <CustomText style={styles.answerKo}>
            &ldquo;{card.answerKo[0]}
            <CustomText style={styles.answerKoHighlight}>{card.answerKo[1]}</CustomText>
            {card.answerKo[2]}&rdquo;
          </CustomText>
          <CustomText style={styles.answerRom}>
            &ldquo;{card.answerRomanized[0]}
            <CustomText style={styles.answerRomHighlight}>{card.answerRomanized[1]}</CustomText>
            {card.answerRomanized[2]}&rdquo;
          </CustomText>
        </View>
      </View>

      {card.related?.length ? <PhraseCards title={relatedTitle} phrases={card.related} /> : null}
    </View>
  );
}

function SummaryCardView({ card }: { card: Extract<LanguageCard, { kind: 'summary' }> }) {
  return (
    <View style={styles.cardBody}>
      <View style={styles.summaryHeader}>
        <CustomText style={styles.summaryBadge}>{card.badge}</CustomText>
        <CustomText style={styles.summaryTitle}>{card.title}</CustomText>
      </View>

      <View style={styles.summaryList}>
        {card.items.map((item) => (
          <View key={item.ko} style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <SymbolView name={item.icon} size={24} weight="regular" tintColor={Palette.primary} />
            </View>
            <View style={styles.summaryTextGroup}>
              <CustomText style={styles.summaryKo}>{item.ko}</CustomText>
              <CustomText style={styles.summaryEn}>{item.en}</CustomText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function LanguageGuideScreen() {
  const router = useRouter();
  const t = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const cards = language === 'EN' ? LANGUAGE_CARDS_EN : LANGUAGE_CARDS;
  const [index, setIndex] = useState(0);
  const card = cards[index];
  const isFirst = index === 0;
  const isLast = index === cards.length - 1;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader
        onBack={() => goBackOrRoot(router)}
        progress={{ currentStep: index + 1, totalSteps: cards.length }}
        rightIcon={null}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {card.kind === 'mascot' && <MascotCardView card={card} badge={t.guideDetail.categoryBadge.LANGUAGE} />}
        {card.kind === 'question' && <QuestionCardView card={card} relatedTitle={t.languageGuide.relatedTitle} />}
        {card.kind === 'summary' && <SummaryCardView card={card} />}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.buttonBar}>
        <View style={styles.buttonRow}>
          {!isFirst && (
            <Pressable style={styles.secondaryButton} onPress={() => setIndex((current) => current - 1)}>
              <CustomText style={styles.secondaryButtonText}>{t.languageGuide.previous}</CustomText>
            </Pressable>
          )}
          <Pressable
            style={styles.primaryButton}
            onPress={() => (isLast ? goBackOrRoot(router) : setIndex((current) => current + 1))}>
            <CustomText style={styles.primaryButtonText}>{isLast ? t.languageGuide.close : t.languageGuide.next}</CustomText>
          </Pressable>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  buttonBar: {
    backgroundColor: '#ffffff',
    paddingTop: 14,
    // Fallback so the buttons keep breathing room from the screen edge even
    // when the safe-area bottom inset is 0 (e.g. web preview, gesture-nav Android).
    paddingBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  secondaryButton: {
    width: 100,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.grey300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 18,
    color: Palette.grey500,
  },
  primaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    color: '#ffffff',
  },
  cardBody: {
    gap: 32,
  },
  badge: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    color: Palette.primary,
    textAlign: 'center',
  },
  mascotHeader: {
    alignItems: 'center',
    gap: 8,
  },
  titleGroup: {
    gap: 4,
    alignItems: 'flex-start',
    width: '100%',
  },
  title: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 22,
    color: Palette.text,
  },
  subtitle: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    color: Palette.grey500,
  },
  mascotCardBody: {
    flex: 1,
  },
  mascotArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  mascotImageWrap: {
    width: '100%',
    position: 'relative',
  },
  mascotImage: {
    width: 186,
    height: 253,
    marginLeft: 16,
  },
  bubbleGroup: {
    position: 'absolute',
    left: 168,
    top: -32,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bubbleTail: {
    width: 16,
    height: 18,
    marginRight: -10,
  },
  bubble: {
    backgroundColor: Palette.grey150,
    borderRadius: 16,
    paddingLeft: 19,
    paddingRight: 14,
    paddingVertical: 12,
  },
  bubbleText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    color: Palette.grey700,
  },
  questionCardBody: {
    gap: 32,
  },
  questionHeaderGroup: {
    gap: 16,
  },
  questionTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 22,
    color: Palette.text,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: Palette.grey100,
  },
  questionAnswerGroup: {
    gap: 16,
  },
  questionBox: {
    height: 52,
    borderWidth: 1,
    borderColor: Palette.grey200,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  questionText: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    color: Palette.text,
  },
  downArrow: {
    alignSelf: 'center',
  },
  answerBox: {
    minHeight: 91,
    borderWidth: 1,
    borderColor: Palette.grey200,
    borderRadius: 16,
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  answerKo: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 22,
    color: Palette.text,
  },
  answerKoHighlight: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 22,
    color: Palette.primary,
  },
  answerRom: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    color: Palette.grey600,
  },
  answerRomHighlight: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    color: Palette.primary,
  },
  summaryHeader: {
    gap: 8,
  },
  summaryBadge: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    color: Palette.primary,
  },
  summaryTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 22,
    color: Palette.text,
  },
  summaryList: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Palette.grey200,
    borderRadius: 16,
    padding: 16,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Palette.tipBorder,
    backgroundColor: Palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextGroup: {
    gap: 4,
  },
  summaryKo: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    color: Palette.text,
  },
  summaryEn: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    color: Palette.grey600,
  },
});
