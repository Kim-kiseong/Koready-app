import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

import CustomText from '@/components/CustomText';
import PhraseCards from '@/components/guide-blocks/PhraseCards';
import OnboardingHeader from '@/components/OnboardingHeader';
import { Palette } from '@/constants/colors';
import { LANGUAGE_CARDS, LANGUAGE_CARDS_EN, type LanguageCard } from '@/constants/language-content';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useLanguageStore } from '@/store/language-store';

function MascotCardView({
  card,
  badge,
  isEnglish = false,
}: {
  card: Extract<LanguageCard, { kind: 'mascot' }>;
  badge: string;
  isEnglish?: boolean;
}) {
  return (
    <View style={[styles.cardBody, styles.mascotCardBody]}>
      <View style={[styles.mascotHeader, styles.mascotHeaderLeft]}>
        <CustomText style={[styles.badge, styles.badgeLeft]}>{badge}</CustomText>
        <View style={styles.titleGroup}>
          <CustomText style={styles.title}>{card.title}</CustomText>
          <CustomText style={styles.subtitle}>{card.subtitle}</CustomText>
        </View>
      </View>

      <View style={styles.mascotArea}>
        <View style={[styles.mascotImageWrap, isEnglish ? styles.mascotImageWrapEnglish : null]}>
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
        <View style={styles.downArrowWrap}>
          <DownArrowIcon />
        </View>
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
              <SummaryIcon icon={item.icon} />
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
  const insets = useSafeAreaInsets();
  const language = useLanguageStore((state) => state.language);
  const cards = language === 'EN' ? LANGUAGE_CARDS_EN : LANGUAGE_CARDS;
  const [index, setIndex] = useState(0);
  const card = cards[index];
  const isFirst = index === 0;
  const isLast = index === cards.length - 1;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <OnboardingHeader
        onBack={() => goBackOrRoot(router)}
        progress={{ currentStep: index + 1, totalSteps: cards.length }}
        rightIcon={null}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {card.kind === 'mascot' && (
          <MascotCardView
            card={card}
            badge={t.guideDetail.categoryBadge.LANGUAGE}
            isEnglish={language === 'EN'}
          />
        )}
        {card.kind === 'question' && <QuestionCardView card={card} relatedTitle={t.languageGuide.relatedTitle} />}
        {card.kind === 'summary' && <SummaryCardView card={card} />}
      </ScrollView>

      <View style={[styles.buttonBar, { paddingBottom: Math.max(insets.bottom, 34) }]}>
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
      </View>
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
    // paddingBottom comes from insets.bottom at the call site (Figma's own
    // reference frame reserves 34px here for the iPhone home indicator —
    // Math.max keeps that same floor on devices/web with a 0 inset).
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
  badgeLeft: {
    textAlign: 'left',
  },
  mascotHeader: {
    alignItems: 'center',
    gap: 8,
  },
  mascotHeaderLeft: {
    alignItems: 'flex-start',
    width: '100%',
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
    transform: [{ translateX: 25 }],
  },
  mascotImageWrapEnglish: {
    transform: [{ translateX: 0 }],
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
    gap: 16,
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
  downArrowWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  questionBox: {
    height: 52,
    borderWidth: 1,
    borderColor: Palette.grey200,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  questionText: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    color: Palette.text,
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

function DownArrowIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
      <Rect x={32} width={32} height={32} rx={16} transform="rotate(90 32 0)" fill="#4FAE98" />
      <Path
        d="M15.369 19.9517V10.6155C15.369 10.4408 15.429 10.2946 15.5488 10.1768C15.6685 10.0589 15.8172 10 15.9947 10C16.1723 10 16.3209 10.0589 16.4406 10.1768C16.5605 10.2946 16.6204 10.4408 16.6204 10.6155V19.9517L20.933 15.7097C21.057 15.5877 21.2022 15.5275 21.3685 15.529C21.5348 15.5306 21.6826 15.595 21.8121 15.7222C21.9329 15.8496 21.9955 15.9937 21.9998 16.1547C22.0041 16.3157 21.9415 16.4598 21.8121 16.5872L16.5226 21.7901C16.4445 21.867 16.3621 21.9212 16.2755 21.9526C16.1888 21.9842 16.0953 22 15.9947 22C15.8942 22 15.8006 21.9842 15.714 21.9526C15.6274 21.9212 15.545 21.867 15.4668 21.7901L10.1774 16.5872C10.0618 16.4735 10.0027 16.3328 10.0001 16.1649C9.99744 15.9971 10.0565 15.8496 10.1774 15.7222C10.3068 15.595 10.4555 15.5314 10.6233 15.5314C10.7913 15.5314 10.94 15.595 11.0694 15.7222L15.369 19.9517Z"
        fill="white"
      />
    </Svg>
  );
}

type SummaryIconName = Extract<LanguageCard, { kind: 'summary' }>['items'][number]['icon'];

function SummaryIcon({ icon }: { icon: SummaryIconName }) {
  const iconName = typeof icon === 'string' ? icon : icon.ios;

  switch (iconName) {
    case 'signpost.right':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 20C10.8933 20 9.85333 19.79 8.88 19.37C7.90667 18.95 7.06 18.38 6.34 17.66C5.62 16.94 5.05 16.0933 4.63 15.12C4.21 14.1467 4 13.1067 4 12C4 10.8933 4.21 9.85333 4.63 8.88C5.05 7.90667 5.62 7.06 6.34 6.34C7.06 5.62 7.90667 5.05 8.88 4.63C9.85333 4.21 10.8933 4 12 4C13.1067 4 14.1467 4.21 15.12 4.63C16.0933 5.05 16.94 5.62 17.66 6.34C18.38 7.06 18.95 7.90667 19.37 8.88C19.79 9.85333 20 10.8933 20 12C20 13.1067 19.79 14.1467 19.37 15.12C18.95 16.0933 18.38 16.94 17.66 17.66C16.94 18.38 16.0933 18.95 15.12 19.37C14.1467 19.79 13.1067 20 12 20ZM9.36 15.7L11.82 14.62C11.8867 14.5933 11.95 14.58 12.01 14.58C12.07 14.58 12.1333 14.5933 12.2 14.62L14.64 15.7C14.8267 15.78 14.9933 15.75 15.14 15.61C15.2867 15.47 15.32 15.3067 15.24 15.12L12.42 8.24C12.34 8.05333 12.2 7.96 12 7.96C11.8 7.96 11.66 8.05333 11.58 8.24L8.76 15.12C8.68 15.3067 8.71333 15.47 8.86 15.61C9.00667 15.75 9.17333 15.78 9.36 15.7Z"
            fill={Palette.primary}
          />
        </Svg>
      );
    case 'bus.fill':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M8.75 17.8158V18.2368C8.75 18.5877 8.63151 18.886 8.39453 19.1316C8.15755 19.3772 7.86979 19.5 7.53125 19.5C7.19271 19.5 6.90495 19.3772 6.66797 19.1316C6.43099 18.886 6.3125 18.5877 6.3125 18.2368V16.9316C6.06875 16.6509 5.8724 16.3386 5.72344 15.9947C5.57448 15.6509 5.5 15.2754 5.5 14.8684V6.86842C5.5 5.70351 6.02135 4.85088 7.06406 4.31053C8.10677 3.77018 9.75208 3.5 12 3.5C14.3292 3.5 15.9948 3.75965 16.9969 4.27895C17.999 4.79825 18.5 5.6614 18.5 6.86842V14.8684C18.5 15.2754 18.4255 15.6509 18.2766 15.9947C18.1276 16.3386 17.9312 16.6509 17.6875 16.9316V18.2368C17.6875 18.5877 17.569 18.886 17.332 19.1316C17.0951 19.3772 16.8073 19.5 16.4688 19.5C16.1302 19.5 15.8424 19.3772 15.6055 19.1316C15.3685 18.886 15.25 18.5877 15.25 18.2368V17.8158H8.75ZM7.125 10.2368H16.875V7.71053H7.125V10.2368ZM10.0195 14.9211C10.2565 14.6754 10.375 14.3772 10.375 14.0263C10.375 13.6754 10.2565 13.3772 10.0195 13.1316C9.78255 12.886 9.49479 12.7632 9.15625 12.7632C8.81771 12.7632 8.52995 12.886 8.29297 13.1316C8.05599 13.3772 7.9375 13.6754 7.9375 14.0263C7.9375 14.3772 8.05599 14.6754 8.29297 14.9211C8.52995 15.1667 8.81771 15.2895 9.15625 15.2895C9.49479 15.2895 9.78255 15.1667 10.0195 14.9211ZM15.707 14.9211C15.944 14.6754 16.0625 14.3772 16.0625 14.0263C16.0625 13.6754 15.944 13.3772 15.707 13.1316C15.4701 12.886 15.1823 12.7632 14.8438 12.7632C14.5052 12.7632 14.2174 12.886 13.9805 13.1316C13.7435 13.3772 13.625 13.6754 13.625 14.0263C13.625 14.3772 13.7435 14.6754 13.9805 14.9211C14.2174 15.1667 14.5052 15.2895 14.8438 15.2895C15.1823 15.2895 15.4701 15.1667 15.707 14.9211Z"
            fill={Palette.primary}
          />
        </Svg>
      );
    case 'figure.walk':
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M11.1462 14.2186L9.77115 20.3302C9.72885 20.5256 9.6266 20.686 9.46442 20.8116C9.30224 20.9372 9.11538 21 8.90385 21C8.62179 21 8.39615 20.8953 8.22692 20.686C8.05769 20.4767 8.00128 20.2395 8.05769 19.9744L10.2154 9.19535L8.69231 9.7814V11.7907C8.69231 12.0279 8.61122 12.2267 8.44904 12.3872C8.28686 12.5477 8.0859 12.6279 7.84615 12.6279C7.60641 12.6279 7.40545 12.5477 7.24327 12.3872C7.08109 12.2267 7 12.0279 7 11.7907V9.23721C7 9.06977 7.04583 8.91977 7.1375 8.78721C7.22917 8.65465 7.35256 8.55349 7.50769 8.48372L11.2731 6.89302C11.4705 6.8093 11.6785 6.76046 11.8971 6.74651C12.1157 6.73256 12.3237 6.76047 12.5212 6.83023C12.7186 6.9 12.9054 6.99767 13.0817 7.12326C13.258 7.24884 13.4026 7.4093 13.5154 7.60465L14.3615 8.94419C14.5449 9.22326 14.7599 9.48837 15.0067 9.73953C15.2535 9.9907 15.5321 10.207 15.8423 10.3884C16.0397 10.5 16.2583 10.6012 16.4981 10.6919C16.7378 10.7826 16.9776 10.8488 17.2173 10.8907C17.4429 10.9326 17.6298 11.0337 17.7779 11.1942C17.926 11.3547 18 11.5535 18 11.7907C18 12.0279 17.9154 12.2233 17.7462 12.3767C17.5769 12.5302 17.3724 12.593 17.1327 12.5651C16.3429 12.4535 15.6343 12.2093 15.0067 11.8326C14.3792 11.4558 13.8327 11.0023 13.3673 10.4721L12.8385 13.0465L14.3615 14.4698C14.4462 14.5535 14.5096 14.6477 14.5519 14.7523C14.5942 14.857 14.6154 14.9651 14.6154 15.0767V20.1628C14.6154 20.4 14.5343 20.5988 14.3721 20.7593C14.2099 20.9198 14.009 21 13.7692 21C13.5295 21 13.3285 20.9198 13.1663 20.7593C13.0042 20.5988 12.9231 20.4 12.9231 20.1628V15.5581L11.1462 14.2186ZM12.151 5.85698C11.8196 5.52907 11.6538 5.13488 11.6538 4.67442C11.6538 4.21395 11.8196 3.81977 12.151 3.49186C12.4824 3.16395 12.8808 3 13.3462 3C13.8115 3 14.2099 3.16395 14.5413 3.49186C14.8728 3.81977 15.0385 4.21395 15.0385 4.67442C15.0385 5.13488 14.8728 5.52907 14.5413 5.85698C14.2099 6.18488 13.8115 6.34884 13.3462 6.34884C12.8808 6.34884 12.4824 6.18488 12.151 5.85698Z"
            fill={Palette.primary}
          />
        </Svg>
      );
    case 'arrow.triangle.2.circlepath':
    default:
      return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M6.75 12.0438C6.75 12.7 6.87396 13.338 7.12188 13.9578C7.36979 14.5776 7.75625 15.15 8.28125 15.675L8.5 15.8938V14.625C8.5 14.3771 8.58385 14.1693 8.75156 14.0016C8.91927 13.8339 9.12708 13.75 9.375 13.75C9.62292 13.75 9.83073 13.8339 9.99844 14.0016C10.1661 14.1693 10.25 14.3771 10.25 14.625V18.125C10.25 18.3729 10.1661 18.5807 9.99844 18.7484C9.83073 18.9161 9.62292 19 9.375 19H5.875C5.62708 19 5.41927 18.9161 5.25156 18.7484C5.08385 18.5807 5 18.3729 5 18.125C5 17.8771 5.08385 17.6693 5.25156 17.5016C5.41927 17.3339 5.62708 17.25 5.875 17.25H7.40625L7.05625 16.9438C6.29792 16.2729 5.76562 15.5073 5.45938 14.6469C5.15313 13.7865 5 12.9188 5 12.0438C5 10.6729 5.35 9.42969 6.05 8.31406C6.75 7.19844 7.69063 6.34167 8.87188 5.74375C9.07604 5.62708 9.29115 5.61979 9.51719 5.72188C9.74323 5.82396 9.89271 5.99167 9.96563 6.225C10.0385 6.44375 10.0349 6.6625 9.95469 6.88125C9.87448 7.1 9.73229 7.26771 9.52813 7.38438C8.68229 7.85104 8.00781 8.49635 7.50469 9.32031C7.00156 10.1443 6.75 11.0521 6.75 12.0438ZM17.25 11.9563C17.25 11.3 17.126 10.662 16.8781 10.0422C16.6302 9.4224 16.2437 8.85 15.7188 8.325L15.5 8.10625V9.375C15.5 9.62292 15.4161 9.83073 15.2484 9.99844C15.0807 10.1661 14.8729 10.25 14.625 10.25C14.3771 10.25 14.1693 10.1661 14.0016 9.99844C13.8339 9.83073 13.75 9.62292 13.75 9.375V5.875C13.75 5.62708 13.8339 5.41927 14.0016 5.25156C14.1693 5.08385 14.3771 5 14.625 5H18.125C18.3729 5 18.5807 5.08385 18.7484 5.25156C18.9161 5.41927 19 5.62708 19 5.875C19 6.12292 18.9161 6.33073 18.7484 6.49844C18.5807 6.66615 18.3729 6.75 18.125 6.75H16.5938L16.9438 7.05625C17.6583 7.77083 18.1797 8.5474 18.5078 9.38594C18.8359 10.2245 19 11.0813 19 11.9563C19 13.3271 18.65 14.5703 17.95 15.6859C17.25 16.8016 16.3094 17.6583 15.1281 18.2563C14.924 18.3729 14.7089 18.3802 14.4828 18.2781C14.2568 18.176 14.1073 18.0083 14.0344 17.775C13.9615 17.5563 13.9651 17.3375 14.0453 17.1188C14.1255 16.9 14.2677 16.7323 14.4719 16.6156C15.3177 16.149 15.9922 15.5036 16.4953 14.6797C16.9984 13.8557 17.25 12.9479 17.25 11.9563Z"
            fill={Palette.primary}
          />
        </Svg>
      );
  }
}
