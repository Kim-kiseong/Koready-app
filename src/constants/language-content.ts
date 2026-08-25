import type { ImageSource } from 'expo-image';
import type { ComponentProps } from 'react';
import type { SymbolView } from 'expo-symbols';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

export type LanguageMascotCard = {
  kind: 'mascot';
  title: string;
  subtitle: string;
  mascot: ImageSource;
  phrase: string;
};

export type LanguageQuestionCard = {
  kind: 'question';
  title: string;
  image: ImageSource;
  questionEn: string;
  answerKo: [string, string, string];
  answerRomanized: [string, string, string];
  related?: { ko: string; romanized: string; en: string }[];
};

export type LanguageSummaryCard = {
  kind: 'summary';
  badge: string;
  title: string;
  items: { icon: SymbolName; ko: string; en: string }[];
};

export type LanguageCard = LanguageMascotCard | LanguageQuestionCard | LanguageSummaryCard;

export const LANGUAGE_CARDS: LanguageCard[] = [
  {
    kind: 'mascot',
    title: '길을 물어볼 때 쓰는 한국어',
    subtitle: '한국에서 길을 찾을 때 바로 꺼내 쓰는 표현',
    mascot: require('@/assets/images/guides/lang-card1-mascot.png'),
    phrase: '어디로 가야 하지?',
  },
  {
    kind: 'question',
    title: '목적지까지 가는 방법 묻기',
    image: require('@/assets/images/guides/lang-card2-photo.jpg'),
    questionEn: 'How do I get from here to [destination]?',
    answerKo: ['여기서 ', '[목적지]', ' 어떻게 가요?'],
    answerRomanized: ['Yeo-gi-seo ', '[mok-jeok-ji]', ' eo-tteo-ke ga-yo?'],
  },
  {
    kind: 'question',
    title: '버스나 지하철 탈지 확인하기',
    image: require('@/assets/images/guides/lang-card3-photo.jpg'),
    questionEn: 'Should I take this bus?',
    answerKo: ['이 버스 ', '타면 돼요?', ''],
    answerRomanized: ['I beo-seu ', 'ta-myeon dwae-yo?', ''],
    related: [
      { ko: '이 지하철 타면 돼요?', romanized: 'I ji-ha-cheol ta-myeon dwae-yo?', en: 'Should I take this subway?' },
      { ko: '여기서 타면 돼요?', romanized: 'Yeo-gi-seo ta-myeon dwae-yo?', en: 'Can I get on here?' },
    ],
  },
  {
    kind: 'question',
    title: '걸어서 갈 수 있는지 묻기',
    image: require('@/assets/images/guides/lang-card4-photo.jpg'),
    questionEn: 'Can I walk there?',
    answerKo: ['걸어서 ', '갈 수 있어요?', ''],
    answerRomanized: ['Geo-reo-seo ', 'gal su i-sseo-yo?', ''],
    related: [
      { ko: '걸어서 얼마나 걸려요?', romanized: 'Geo-reo-seo eol-ma-na geol-lyeo-yo?', en: 'How long does it take on foot?' },
      { ko: '여기서 멀어요?', romanized: 'Yeo-gi-seo meo-reo-yo?', en: 'Is it far from here?' },
    ],
  },
  {
    kind: 'question',
    title: '갈아타야 하는지 묻기',
    image: require('@/assets/images/guides/lang-card5-photo.jpg'),
    questionEn: 'Do I need to transfer?',
    answerKo: ['', '갈아타야', ' 해요?'],
    answerRomanized: ['', 'Ga-ra-ta-ya', ' hae-yo?'],
    related: [
      { ko: '어디서 갈아타요?', romanized: 'Eo-di-seo ga-ra-ta-yo?', en: 'Where do I transfer?' },
      { ko: '몇 번 갈아타요?', romanized: 'Myeot beon ga-ra-ta-yo?', en: 'How many times do I need to transfer?' },
    ],
  },
  {
    kind: 'summary',
    badge: '총정리',
    title: '이 4개만 기억해도\n길 묻기가 쉬워져요!',
    items: [
      {
        icon: { ios: 'signpost.right', android: 'assistant_navigation', web: 'assistant_navigation' },
        ko: '여기서 [목적지]까지 어떻게 가요?',
        en: 'How do I get to [destination] from here?',
      },
      {
        icon: { ios: 'bus.fill', android: 'directions_bus', web: 'directions_bus' },
        ko: '이 버스 타면 돼요?',
        en: 'Should I take this bus?',
      },
      {
        icon: { ios: 'figure.walk', android: 'directions_walk', web: 'directions_walk' },
        ko: '걸어서 갈 수 있어요?',
        en: 'Can I walk there?',
      },
      {
        icon: { ios: 'arrow.triangle.2.circlepath', android: 'sync', web: 'sync' },
        ko: '갈아타야 해요?',
        en: 'Do I need to transfer?',
      },
    ],
  },
];

export const LANGUAGE_CARDS_EN: LanguageCard[] = [
  {
    kind: 'mascot',
    title: 'Korean for Asking Directions',
    subtitle: 'Handy phrases for finding your way in Korea',
    mascot: require('@/assets/images/guides/lang-card1-mascot.png'),
    phrase: '어디로 가야 하지?',
  },
  {
    kind: 'question',
    title: 'Asking how to get to your destination',
    image: require('@/assets/images/guides/lang-card2-photo.jpg'),
    questionEn: 'How do I get from here to [destination]?',
    answerKo: ['여기서 ', '[목적지]', ' 어떻게 가요?'],
    answerRomanized: ['Yeo-gi-seo ', '[mok-jeok-ji]', ' eo-tteo-ke ga-yo?'],
  },
  {
    kind: 'question',
    title: 'Checking if this bus or subway works',
    image: require('@/assets/images/guides/lang-card3-photo.jpg'),
    questionEn: 'Should I take this bus?',
    answerKo: ['이 버스 ', '타면 돼요?', ''],
    answerRomanized: ['I beo-seu ', 'ta-myeon dwae-yo?', ''],
    related: [
      { ko: '이 지하철 타면 돼요?', romanized: 'I ji-ha-cheol ta-myeon dwae-yo?', en: 'Should I take this subway?' },
      { ko: '여기서 타면 돼요?', romanized: 'Yeo-gi-seo ta-myeon dwae-yo?', en: 'Can I get on here?' },
    ],
  },
  {
    kind: 'question',
    title: 'Asking if you can walk there',
    image: require('@/assets/images/guides/lang-card4-photo.jpg'),
    questionEn: 'Can I walk there?',
    answerKo: ['걸어서 ', '갈 수 있어요?', ''],
    answerRomanized: ['Geo-reo-seo ', 'gal su i-sseo-yo?', ''],
    related: [
      { ko: '걸어서 얼마나 걸려요?', romanized: 'Geo-reo-seo eol-ma-na geol-lyeo-yo?', en: 'How long does it take on foot?' },
      { ko: '여기서 멀어요?', romanized: 'Yeo-gi-seo meo-reo-yo?', en: 'Is it far from here?' },
    ],
  },
  {
    kind: 'question',
    title: 'Asking if you need to transfer',
    image: require('@/assets/images/guides/lang-card5-photo.jpg'),
    questionEn: 'Do I need to transfer?',
    answerKo: ['', '갈아타야', ' 해요?'],
    answerRomanized: ['', 'Ga-ra-ta-ya', ' hae-yo?'],
    related: [
      { ko: '어디서 갈아타요?', romanized: 'Eo-di-seo ga-ra-ta-yo?', en: 'Where do I transfer?' },
      { ko: '몇 번 갈아타요?', romanized: 'Myeot beon ga-ra-ta-yo?', en: 'How many times do I need to transfer?' },
    ],
  },
  {
    kind: 'summary',
    badge: 'Summary',
    title: 'Remember just these 4\nand asking for directions gets easy!',
    items: [
      {
        icon: { ios: 'signpost.right', android: 'assistant_navigation', web: 'assistant_navigation' },
        ko: '여기서 [목적지]까지 어떻게 가요?',
        en: 'How do I get to [destination] from here?',
      },
      {
        icon: { ios: 'bus.fill', android: 'directions_bus', web: 'directions_bus' },
        ko: '이 버스 타면 돼요?',
        en: 'Should I take this bus?',
      },
      {
        icon: { ios: 'figure.walk', android: 'directions_walk', web: 'directions_walk' },
        ko: '걸어서 갈 수 있어요?',
        en: 'Can I walk there?',
      },
      {
        icon: { ios: 'arrow.triangle.2.circlepath', android: 'sync', web: 'sync' },
        ko: '갈아타야 해요?',
        en: 'Do I need to transfer?',
      },
    ],
  },
];
