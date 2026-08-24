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
import { LANGUAGE_CARDS } from '@/constants/language-content';
import { goBackOrRoot } from '@/navigation/safe-back';

function MascotCardView({ card }: { card: Extract<(typeof LANGUAGE_CARDS)[number], { kind: 'mascot' }> }) {
  return (
    <View style={styles.cardBody}>
      <View style={styles.mascotHeader}>
        <CustomText style={styles.badge}>언어 가이드</CustomText>
        <View style={styles.titleGroup}>
          <CustomText style={styles.title}>{card.title}</CustomText>
          <CustomText style={styles.subtitle}>{card.subtitle}</CustomText>
        </View>
      </View>

      <View style={styles.mascotArea}>
        <View style={styles.bubble}>
          <CustomText style={styles.bubbleText}>&ldquo;{card.phrase}&rdquo;</CustomText>
        </View>
        <View style={styles.bubbleTail} />
        <Image source={card.mascot} style={styles.mascotImage} contentFit="contain" />
      </View>
    </View>
  );
}

function QuestionCardView({ card }: { card: Extract<(typeof LANGUAGE_CARDS)[number], { kind: 'question' }> }) {
  return (
    <View style={styles.cardBody}>
      <CustomText style={styles.questionTitle}>{card.title}</CustomText>
      <Image source={card.image} style={styles.questionImage} contentFit="cover" />

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

      {card.related?.length ? (
        <View style={styles.relatedGroup}>
          <PhraseCards title="함께 알아두면 좋아요" phrases={card.related} />
        </View>
      ) : null}
    </View>
  );
}

function SummaryCardView({ card }: { card: Extract<(typeof LANGUAGE_CARDS)[number], { kind: 'summary' }> }) {
  return (
    <View style={styles.cardBody}>
      <View style={styles.summaryHeader}>
        <CustomText style={styles.badge}>{card.badge}</CustomText>
        <CustomText style={styles.summaryTitle}>{card.title}</CustomText>
      </View>

      <View style={styles.summaryList}>
        {card.items.map((item) => (
          <View key={item.ko} style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <SymbolView name={item.icon} size={18} weight="regular" tintColor={Palette.primary} />
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
  const [index, setIndex] = useState(0);
  const card = LANGUAGE_CARDS[index];
  const isFirst = index === 0;
  const isLast = index === LANGUAGE_CARDS.length - 1;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader
        onBack={() => goBackOrRoot(router)}
        progress={{ currentStep: index + 1, totalSteps: LANGUAGE_CARDS.length }}
        rightIcon={null}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {card.kind === 'mascot' && <MascotCardView card={card} />}
        {card.kind === 'question' && <QuestionCardView card={card} />}
        {card.kind === 'summary' && <SummaryCardView card={card} />}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.buttonBar}>
        <View style={styles.buttonRow}>
          {!isFirst && (
            <Pressable style={styles.secondaryButton} onPress={() => setIndex((current) => current - 1)}>
              <CustomText style={styles.secondaryButtonText}>이전</CustomText>
            </Pressable>
          )}
          <Pressable
            style={styles.primaryButton}
            onPress={() => (isLast ? goBackOrRoot(router) : setIndex((current) => current + 1))}>
            <CustomText style={styles.primaryButtonText}>{isLast ? '가이드 닫기' : '다음'}</CustomText>
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  buttonBar: {
    backgroundColor: '#ffffff',
    paddingTop: 14,
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
  mascotArea: {
    alignItems: 'center',
    paddingTop: 16,
  },
  bubble: {
    backgroundColor: Palette.grey150,
    borderRadius: 16,
    paddingHorizontal: 19,
    paddingVertical: 12,
  },
  bubbleText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    color: Palette.grey700,
  },
  bubbleTail: {
    width: 12,
    height: 12,
    backgroundColor: Palette.grey150,
    transform: [{ rotate: '45deg' }],
    marginTop: -6,
    marginBottom: -6,
    zIndex: -1,
  },
  mascotImage: {
    width: 186,
    height: 200,
    marginTop: 12,
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
    marginTop: 16,
    backgroundColor: Palette.grey100,
  },
  questionBox: {
    marginTop: 16,
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
    marginVertical: 12,
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
  relatedGroup: {
    marginTop: 32,
  },
  summaryHeader: {
    gap: 8,
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
