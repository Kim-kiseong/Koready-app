import type { ImageSource } from 'expo-image';
import type { ComponentProps } from 'react';
import type { SymbolView } from 'expo-symbols';

import type { GuideCategoryId } from '@/api/home';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

export type GuideBlock =
  | { type: 'step'; number: number; title: string; description: string }
  | { type: 'image'; source: ImageSource; caption?: string; aspectRatio?: number }
  | { type: 'warning'; text: string }
  | { type: 'phraseTable'; title: string; phrases: { ko: string; en: string }[] }
  | {
      type: 'bulletList';
      columns: { label: string; dotColor: string; items: string[] }[];
    }
  | {
      // Row/column of bordered cards, each an optional icon/image/emoji + title + description.
      // `color` swaps the card to a solid background with white text (safety's 112/119 cards).
      type: 'cardList';
      layout: 'row' | 'column';
      cards: {
        icon?: SymbolName;
        image?: ImageSource;
        emoji?: string;
        color?: string;
        title: string;
        description: string;
      }[];
    }
  | {
      // Bordered card: bold Korean phrase + romanization on the left, English
      // pill on the right (language carousel's "함께 알아두면 좋아요" cards,
      // also reused by safety's "바로 쓸 수 있는 표현").
      type: 'phraseCards';
      title?: string;
      phrases: { ko: string; romanized: string; en: string }[];
    }
  | {
      // Horizontal "출발지 선택 → 목적지 입력 → ..." icon flow inside a bordered card.
      type: 'iconFlow';
      steps: { icon: SymbolName; label: string }[];
    }
  | {
      // Same icon flow, but with a title + description header inside the same card
      // (bus ticket-purchase flow: "터미널에서 구매하기" + 4-step icon row).
      type: 'iconFlowCard';
      title: string;
      description: string;
      steps: { icon: SymbolName; label: string }[];
    }
  | {
      // Bordered card: title + optional description + a checkmark list — plain
      // white variant of HoriTipCard's checklist, no mascot (bus's "미리 예약하고
      // 싶다면" box).
      type: 'checklistCard';
      title: string;
      description?: string;
      items: string[];
    }
  | {
      // A → B → C route/stop badges with an arrow between each (bus's "이동 경로 예시").
      type: 'routeStops';
      caption: string;
      stops: { badge: string; label: string; sublabel: string; highlighted?: boolean }[];
    }
  | {
      // Mid-content Hori Tip callout (e.g. hiking guide's "산악위치표지판 예시") —
      // same component as the screen's closing tip, just placed inline.
      type: 'horiTipInline';
      title?: string;
      body?: string;
    }
  | {
      // Dark toast/notification mockup (waiting-list "웨이팅 알림" push notification preview).
      type: 'notificationCard';
      emoji: string;
      title: string;
      timestamp: string;
      body: string;
      bodySub?: string;
    }
  | {
      // Dark horizontal progress tracker with a connecting line (delivery-status steps).
      type: 'statusTracker';
      steps: string[];
      activeIndex: number;
    }
  | {
      // Dark signage-example card (subway's "갈아타는 곳 / Transfer" style).
      type: 'signCard';
      icon: SymbolName;
      title: string;
      translations: string[];
      caption?: string;
    };

export type GuideContent = {
  id: string;
  category: GuideCategoryId;
  hero: ImageSource;
  title: string;
  description: string;
  blocks: GuideBlock[];
  tip: { title?: string; body?: string; checklist?: string[] };
};

export const GUIDE_CONTENT: Record<string, GuideContent> = {
  'subway-transfer': {
    id: 'subway-transfer',
    category: 'TRANSPORT',
    hero: require('@/assets/images/guides/subway-hero.jpg'),
    title: '지하철 환승하는 방법',
    description: '표지판만 따라가면 어렵지 않아요.\n노선과 방향을 확인하며 갈아타는 방법을 알아보세요.',
    blocks: [
      {
        type: 'step',
        number: 1,
        title: '갈아타는 곳을 찾아요',
        description:
          "열차에서 내린 뒤 '갈아타는 곳 / Transfer' 표지판을 찾아보세요. 나가는 곳이 아니라 Transfer를 따라가면 돼요.",
      },
      {
        type: 'signCard',
        icon: { ios: 'arrow.triangle.2.circlepath', android: 'sync_alt', web: 'sync_alt' },
        title: '갈아타는 곳',
        translations: ['換乗', '乗り換え'],
        caption: '갈아타는 곳 / Transfer 표지판 예시',
      },
      {
        type: 'step',
        number: 2,
        title: '노선 번호와 색상을 따라가요',
        description:
          '표지판과 바닥 안내에서 갈아탈 노선의 번호와 색상을 확인하세요. 역에 따라 환승 통로가 길 수 있어요.',
      },
      { type: 'image', source: require('@/assets/images/guides/subway-step2-signage.jpg') },
      {
        type: 'step',
        number: 3,
        title: '타기 전에 방향을 확인해요',
        description:
          '노선은 맞아도 반대 방향 열차를 탈 수 있어요. 플랫폼에서 목적지가 있는 방향과 다음 역을 확인하세요.',
      },
      { type: 'image', source: require('@/assets/images/guides/subway-step3-platform.jpg') },
      {
        type: 'phraseTable',
        title: '지하철에서 자주 보는 표현',
        phrases: [
          { ko: '갈아타는 곳', en: 'Transfer' },
          { ko: '나가는 곳', en: 'Way Out' },
          { ko: '○○ 방면', en: 'Towards ○○' },
        ],
      },
    ],
    tip: {
      title: '환승할 때 이것만 기억하세요!',
      checklist: ['Transfer 표지판 찾기', '갈아탈 노선 따라가기', '타기 전 방향 확인하기'],
    },
  },

  'taxi-call': {
    id: 'taxi-call',
    category: 'TRANSPORT',
    hero: require('@/assets/images/guides/taxi-hero.jpg'),
    title: '택시 타는 방법',
    description: '앱으로 부르면 가장 간단해요.\n목적지를 미리 입력하면 기사님께 직접 설명하지 않아도 돼요.',
    blocks: [
      {
        type: 'step',
        number: 1,
        title: '앱으로 호출하기',
        description:
          '출발지와 목적지를 입력하고 원하는 차량을 선택하세요. 차량이 도착하면 차량 번호를 확인하고 탑승하세요.',
      },
      {
        type: 'iconFlow',
        steps: [
          { icon: { ios: 'mappin.circle', android: 'trip_origin', web: 'trip_origin' }, label: '출발지 선택' },
          { icon: { ios: 'flag', android: 'flag', web: 'flag' }, label: '목적지 입력' },
          { icon: { ios: 'car.fill', android: 'directions_car', web: 'directions_car' }, label: '차량 선택' },
          { icon: { ios: 'iphone', android: 'smartphone', web: 'smartphone' }, label: '호출하기' },
        ],
      },
      {
        type: 'cardList',
        layout: 'row',
        cards: [
          {
            image: require('@/assets/images/guides/taxi-uber-icon.png'),
            title: 'Uber Taxi',
            description: '기존 Uber 사용자는\n같은 앱으로 이용 가능',
          },
          {
            image: require('@/assets/images/guides/taxi-kride-icon.png'),
            title: 'k.ride',
            description: '외국인 여행자를 위한 앱,\n해외카드 및 다국어 지원',
          },
        ],
      },
      { type: 'image', source: require('@/assets/images/guides/taxi-step1-hail.jpg') },
      { type: 'warning', text: '앱마다 차량 종류와 예상 요금이 다를 수 있어요. 호출하기 전에 확인해보세요.' },
      {
        type: 'step',
        number: 2,
        title: '길에서 잡는다면',
        description: "앞 유리에 '빈차' 표시가 켜진 택시를 잡으세요. 안전한 도로 가장자리나 택시 승강장을 이용하세요.",
      },
      { type: 'image', source: require('@/assets/images/guides/taxi-step2-street.jpg') },
      {
        type: 'cardList',
        layout: 'row',
        cards: [
          { title: '빈차', description: '탈 수 있어요' },
          { title: '예약', description: '다른 승객이 예약한 택시' },
        ],
      },
      {
        type: 'step',
        number: 3,
        title: '목적지를 알려주세요',
        description: '길에서 탔다면 한국어 장소명이나 주소를 보여주는 것이 가장 쉬워요.',
      },
      { type: 'image', source: require('@/assets/images/guides/taxi-step3-phone.jpg') },
      { type: 'warning', text: '앱으로 호출했다면 목적지가 이미 기사님에게 전달돼요.' },
      {
        type: 'step',
        number: 4,
        title: '요금을 확인하세요',
        description: '길에서 잡은 일반 택시는 이동하면서 미터기에 요금이 표시돼요.',
      },
      { type: 'image', source: require('@/assets/images/guides/taxi-step4-phone.jpg') },
      { type: 'warning', text: '실제 요금은 교통 상황, 이동 거리, 시간, 할증 등에 따라 달라질 수 있어요.' },
      { type: 'step', number: 5, title: '결제하기', description: '' },
      {
        type: 'cardList',
        layout: 'column',
        cards: [
          {
            icon: { ios: 'creditcard.fill', android: 'credit_card', web: 'credit_card' },
            title: '신용카드',
            description: 'Visa, Mastercard 등 해외 카드 가능',
          },
          {
            icon: { ios: 'wonsign.circle.fill', android: 'payments', web: 'payments' },
            title: '현금',
            description: '원화(KRW)만 사용 가능해요',
          },
          {
            icon: { ios: 'tram.fill', android: 'directions_bus', web: 'directions_bus' },
            title: '교통카드',
            description: 'T-money 카드로 결제 가능',
          },
        ],
      },
      { type: 'warning', text: '앱에서 자동결제했다면 기사님께 다시 결제하지 마세요.' },
      {
        type: 'cardList',
        layout: 'column',
        cards: [
          {
            title: '문제가 생겼다면?',
            description: '다음 정보를 확인해두면 신고하거나 상담받기 쉬워요.\n· 차량 번호  · 영수증  · 이용 시간',
          },
          {
            icon: { ios: 'phone.fill', android: 'call', web: 'call' },
            title: '서울 120 다산콜센터',
            description: '외국어 상담 지원',
          },
        ],
      },
    ],
    tip: {
      checklist: [
        '늦은 밤에는 심야 할증이 있을 수 있어요.',
        '짐이 많다면 큰 차량이나 Van 옵션을 확인하세요.',
        '택시 문은 직접 열고 닫아요.',
      ],
    },
  },

  'order-restaurant': {
    id: 'order-restaurant',
    category: 'ORDER',
    hero: require('@/assets/images/guides/order-restaurant-hero.jpg'),
    title: '한국 식당에서 주문하는 방법',
    description: '한국 식당은 주문 방식이 조금씩 달라요.\n자리 안내부터 주문과 계산까지 차근차근 알아보세요.',
    blocks: [
      {
        type: 'step',
        number: 1,
        title: '인원수를 말하고 자리를 확인해요',
        description: '식당에 들어가면 직원에게 몇 명인지 먼저 알려주세요. 직원이 자리를 안내하거나, 직접 앉도록 안내할 수 있어요.',
      },
      {
        type: 'cardList',
        layout: 'row',
        cards: [
          { title: '한 명이에요', description: "I'm alone." },
          { title: '두 명이에요', description: 'There are two of us.' },
        ],
      },
      {
        type: 'step',
        number: 2,
        title: '주문 방법을 확인해요',
        description: '한국 식당은 직원 주문, 호출벨, 테이블오더, 카운터 주문 등 다양한 방식을 사용해요. 테이블 주변과 입구의 안내문을 먼저 확인하세요.',
      },
      {
        type: 'cardList',
        layout: 'row',
        cards: [
          { emoji: '🗣️', title: '직원 주문', description: '직원에게 메뉴 말하기' },
          { emoji: '🔔', title: '호출벨', description: '벨을 눌러 직원 부르기' },
        ],
      },
      {
        type: 'cardList',
        layout: 'row',
        cards: [
          { emoji: '📱', title: '테이블오더', description: '자리에서 화면으로 주문' },
          { emoji: '🏪', title: '주문대', description: '먼저 주문하고 자리 이용' },
        ],
      },
      {
        type: 'step',
        number: 3,
        title: '메뉴와 주문 수량을 확인해요',
        description: '메뉴와 가격을 확인한 뒤 주문 수량을 선택하세요. 일부 메뉴는 2인분 이상부터 주문할 수 있어요.',
      },
      { type: 'image', source: require('@/assets/images/guides/order-restaurant-step3.jpg') },
      {
        type: 'cardList',
        layout: 'column',
        cards: [
          { title: '1인분', description: '한 사람 기준의 양이에요.' },
          { title: '2인분 이상', description: '최소 두 사람 분량부터 주문해야 해요.' },
          { title: '1인 1메뉴', description: '사람마다 메뉴를 한 개 이상 주문해야 해요.' },
        ],
      },
      { type: 'warning', text: '고기, 전골, 닭갈비 등은 2인분부터 주문해야 할 수 있어요.' },
      {
        type: 'step',
        number: 4,
        title: '맵기와 재료를 확인해요',
        description: '한국 음식은 메뉴 이름만으로 맵기나 재료를 알기 어려울 수 있어요. 주문하기 전에 직원에게 확인해보세요.',
      },
      {
        type: 'cardList',
        layout: 'column',
        cards: [
          { title: '이거 매워요?', description: 'Is this spicy?' },
          { title: '안 맵게 해 주세요', description: 'Please make it less spicy.' },
          { title: '이 재료를 빼 주세요', description: 'Please leave this ingredient out.' },
        ],
      },
      {
        type: 'step',
        number: 5,
        title: '셀프(Self)코너를 확인해요',
        description: "물, 수저, 반찬을 직접 가져와야 하는 식당도 있어요. 테이블과 매장 안에서 '셀프' 안내를 확인하세요.",
      },
      { type: 'image', source: require('@/assets/images/guides/order-restaurant-step5.jpg') },
      { type: 'warning', text: '수저와 휴지가 테이블 옆 서랍 안에 있는 식당도 있어요.' },
      {
        type: 'step',
        number: 6,
        title: '추가 주문이 필요하면 직원을 불러요',
        description: '음식이나 음료를 더 주문하려면 호출벨을 누르거나 직원에게 말해보세요.',
      },
      {
        type: 'cardList',
        layout: 'row',
        cards: [
          { title: '여기요', description: 'Excuse me.' },
          { title: '이거 하나 더 주세요', description: 'One more, please.' },
        ],
      },
      {
        type: 'step',
        number: 7,
        title: '식사를 마치면 계산해요',
        description: '한국 식당은 식사 후 카운터에서 계산하는 경우가 많아요. 테이블 결제나 선결제 방식인지 먼저 확인하세요.',
      },
      { type: 'image', source: require('@/assets/images/guides/order-restaurant-step7.jpg') },
      {
        type: 'cardList',
        layout: 'column',
        cards: [
          {
            icon: { ios: 'creditcard.fill', android: 'credit_card', web: 'credit_card' },
            title: '카드 결제',
            description: '국내외 신용카드로 결제',
          },
          {
            icon: { ios: 'wonsign.circle.fill', android: 'payments', web: 'payments' },
            title: '현금 결제',
            description: '현금으로 직접 결제',
          },
        ],
      },
    ],
    tip: {
      checklist: [
        '먼저 인원수를 말하고 자리를 확인해요.',
        '테이블 주변에서 주문 방식을 확인해요.',
        '최소 주문 수량과 맵기를 확인해요.',
        '계산 위치는 식당마다 다를 수 있어요.',
      ],
    },
  },

  'order-waiting': {
    id: 'order-waiting',
    category: 'ORDER',
    hero: require('@/assets/images/guides/order-waiting-hero.jpg'),
    title: '식당 웨이팅 · 예약하는 방법',
    description: '인기 있는 식당은 예약하거나 대기 등록이 필요할 수 있어요.\n방문 전에 이용 방법을 확인하고 기다리는 방법을 알아보세요.',
    blocks: [
      {
        type: 'step',
        number: 1,
        title: '예약 방법을 먼저 확인해요',
        description: '식당마다 예약과 대기 방식이 달라요. 지도, 식당 공식 계정, 혹은 예약 서비스에서 이용 방법을 확인하세요.',
      },
      { type: 'image', source: require('@/assets/images/guides/order-waiting-step1.jpg') },
      {
        type: 'cardList',
        layout: 'row',
        cards: [
          { emoji: '📅', title: '사전 예약', description: '방문 날짜, 시간 미리 선택' },
          { emoji: '🔢', title: '현장 웨이팅', description: '식당에 도착한 뒤 대기 등록' },
        ],
      },
      {
        type: 'cardList',
        layout: 'row',
        cards: [
          { emoji: '📲', title: '원격 웨이팅', description: '앱에서 미리 웨이팅 등록' },
          { emoji: '🚶', title: '바로 방문', description: '도착한 순서대로 입장' },
        ],
      },
      {
        type: 'step',
        number: 2,
        title: '날짜와 시간을 예약해요',
        description: '예약 가능한 식당이라면 날짜, 시간, 인원수를 선택하세요. 일부 식당은 메뉴나 좌석을 미리 선택해야 할 수 있어요.',
      },
      {
        type: 'cardList',
        layout: 'column',
        cards: [
          { title: '날짜', description: '방문하려는 날짜를 선택해요.' },
          { title: '시간', description: '입장 가능한 시간을 선택해요.' },
          { title: '인원', description: '어린이를 포함한 전체 인원을 입력해요.' },
        ],
      },
      {
        type: 'step',
        number: 3,
        title: '예약이 어렵다면 웨이팅을 등록해요',
        description: '예약이 마감됐거나 예약을 받지 않는 식당은 현장에서 대기 등록을 할 수 있어요.',
      },
      { type: 'image', source: require('@/assets/images/guides/order-waiting-step3.jpg') },
      {
        type: 'cardList',
        layout: 'row',
        cards: [
          { title: '대기번호', description: '내 순서와 앞의 팀 확인' },
          { title: '예상 시간', description: '예상 대기시간을 확인' },
        ],
      },
      {
        type: 'step',
        number: 4,
        title: '호출 알림을 확인해요',
        description: '순서가 가까워지면 문자, 앱 알림이나 매장 화면으로 안내받을 수 있어요. 호출을 놓치지 않도록 휴대전화를 확인하세요.',
      },
      {
        type: 'notificationCard',
        emoji: '🔔',
        title: '웨이팅 알림',
        timestamp: '방금 전',
        body: 'Your table is almost ready.',
        bodySub: 'Please return to the restaurant.',
      },
      {
        type: 'cardList',
        layout: 'column',
        cards: [
          { title: '문자 알림', description: '입장 순서가 되면 메시지가 와요.' },
          { title: '앱 알림', description: '예약 또는 웨이팅 앱에서 알려줘요.' },
          { title: '번호 호출', description: '직원이 번호나 이름을 불러요.' },
        ],
      },
      { type: 'warning', text: '호출 후 정해진 시간 안에 도착하지 않으면 순서가 취소될 수 있어요.' },
      {
        type: 'step',
        number: 5,
        title: '식당에 도착하면 화면을 보여주세요',
        description: '예약 시간보다 조금 일찍 도착해 직원에게 예약 또는 웨이팅 화면을 보여주세요.',
      },
      { type: 'image', source: require('@/assets/images/guides/order-waiting-step5.jpg') },
      {
        type: 'cardList',
        layout: 'row',
        cards: [
          { title: '예약했어요', description: 'I have a reservation.' },
          { title: '웨이팅 등록했어요', description: 'I joined the waitlist.' },
        ],
      },
    ],
    tip: {
      checklist: [
        '예약과 웨이팅 가능 여부를 먼저 확인해요.',
        '날짜, 시간, 인원수를 정확히 입력해요.',
        '호출 알림을 놓치지 않도록 확인해요.',
        '늦거나 방문이 어렵다면 미리 취소해요.',
      ],
    },
  },

  'order-delivery': {
    id: 'order-delivery',
    category: 'ORDER',
    hero: require('@/assets/images/guides/order-delivery-hero.jpg'),
    title: '배달음식 주문하는 방법',
    description: '정확한 주소와 배달 장소를 입력하면 숙소에서도 한국 음식을 주문할 수 있어요. 앱 선택부터 음식 받기까지 차근차근 알아보세요.',
    blocks: [
      {
        type: 'step',
        number: 1,
        title: '배달 앱을 선택해요',
        description: '한국에서는 배달의민족, Shuttle 등 앱으로 음식을 주문할 수 있어요. 영어 지원 여부와 결제 수단을 먼저 확인하세요.',
      },
      {
        type: 'cardList',
        layout: 'row',
        cards: [
          {
            image: require('@/assets/images/guides/order-delivery-baemin-icon.png'),
            title: '배달의민족',
            description: '다국어 지원, 다양한 음식점, 카카오페이·카드 결제',
          },
          {
            image: require('@/assets/images/guides/order-delivery-shuttle-icon.png'),
            title: 'Shuttle Delivery',
            description: '영어 지원, 해외 카드 결제 가능, 외국인 친화적 UI',
          },
        ],
      },
      {
        type: 'step',
        number: 2,
        title: '주소를 입력해요',
        description: '배달 앱에서 현재 위치를 설정하거나 직접 주소를 입력하세요. 상세주소(동 · 호수, 객실번호 등)도 함께 입력해야 해요.',
      },
      {
        type: 'cardList',
        layout: 'column',
        cards: [
          { title: '집 · 기숙사', description: '건물명, 동 · 호수를 정확히 입력해요.' },
          { title: '호텔·게스트하우스', description: '숙소명, 객실번호, 로비 수령 여부를 확인해요.' },
          { title: '공원 · 야외', description: '입구나 배달존 위치를 선택해요.' },
        ],
      },
      {
        type: 'step',
        number: 3,
        title: '메뉴를 선택해요',
        description: '원하는 음식점과 메뉴를 고르고 수량과 옵션을 확인하세요.',
      },
      { type: 'image', source: require('@/assets/images/guides/order-delivery-step3.jpg') },
      {
        type: 'cardList',
        layout: 'column',
        cards: [
          { title: '최소 주문금액', description: '이 금액 이상이어야 주문 가능해요.' },
          { title: '배달비', description: '거리에 따라 금액이 달라질 수 있어요.' },
          { title: '예상 시간', description: '도착까지 걸리는 시간이에요.' },
          { title: '메뉴 옵션', description: '맵기, 토핑 등 세부 옵션을 확인해요.' },
        ],
      },
      {
        type: 'step',
        number: 4,
        title: '요청사항을 입력해요',
        description: '배달 방식과 요청사항을 선택하세요. 한국어 통화가 어렵다면 메모란에 미리 알려두세요.',
      },
      {
        type: 'cardList',
        layout: 'column',
        cards: [
          { title: '문 앞에 놓아 주세요', description: 'Please leave it at the door.' },
          { title: '로비에서 받을게요', description: "I'll receive it in the lobby." },
          { title: '도착하면 메시지 주세요', description: 'Please message me when you arrive.' },
        ],
      },
      {
        type: 'step',
        number: 5,
        title: '결제를 확인해요',
        description: '결제 수단을 선택하고 최종 금액을 확인한 뒤 주문을 완료하세요.',
      },
      {
        type: 'cardList',
        layout: 'column',
        cards: [
          {
            icon: { ios: 'creditcard.fill', android: 'credit_card', web: 'credit_card' },
            title: '해외 신용카드',
            description: 'Visa, Mastercard 등 국제 카드로 결제해요.',
          },
          {
            icon: { ios: 'creditcard.fill', android: 'credit_card', web: 'credit_card' },
            title: '국내 카드',
            description: '한국 신용·체크카드로 결제해요.',
          },
          {
            icon: { ios: 'bolt.fill', android: 'bolt', web: 'bolt' },
            title: '간편결제',
            description: '카카오페이, 네이버페이 등을 사용해요.',
          },
        ],
      },
      {
        type: 'step',
        number: 6,
        title: '주문 상태를 확인해요',
        description: '앱에서 배달기사 위치와 예상 도착시간을 실시간으로 확인할 수 있어요.',
      },
      {
        type: 'statusTracker',
        steps: ['주문 접수', '음식 준비', '배달 시작', '곧 도착', '배달 완료'],
        activeIndex: 2,
      },
      { type: 'warning', text: '앱 알림을 켜고 기사님의 메시지나 전화를 놓치지 마세요.' },
      {
        type: 'step',
        number: 7,
        title: '음식을 받아요',
        description: '기사님이 도착하면 직접 받거나 지정 장소에서 수령하세요. 받은 후에는 음식과 수량을 바로 확인하세요.',
      },
      {
        type: 'cardList',
        layout: 'column',
        cards: [
          { title: '지금 로비에 있어요', description: "I'm in the lobby now." },
          { title: '입구 앞에서 기다리고 있어요', description: "I'm waiting at the entrance." },
          { title: '제가 주문한 사람이에요', description: "I'm the person who placed the order." },
        ],
      },
    ],
    tip: {
      checklist: [
        '이용 가능한 앱인지 확인해요.',
        '주소와 상세주소를 정확히 입력해요.',
        '최소 주문금액과 배달비를 확인해요.',
        '음식이 도착할 때까지 알림을 확인해요.',
      ],
    },
  },

  'order-kiosk': {
    id: 'order-kiosk',
    category: 'ORDER',
    hero: require('@/assets/images/guides/order-kiosk-hero.jpg'),
    title: '키오스크로 주문하는 방법',
    description: '한국의 카페, 패스트푸드점, 푸드코트에서는 직원 대신\n키오스크로 주문하는 경우가 많아요.',
    blocks: [
      { type: 'step', number: 1, title: '언어를 먼저 확인해요', description: '' },
      {
        type: 'iconFlowCard',
        title: '주문 흐름',
        description: '',
        steps: [
          { icon: { ios: 'globe', android: 'language', web: 'language' }, label: '언어 선택' },
          { icon: { ios: 'bag.fill', android: 'shopping_bag', web: 'shopping_bag' }, label: '매장/포장' },
          { icon: { ios: 'list.bullet', android: 'menu_book', web: 'menu_book' }, label: '메뉴 선택' },
          {
            icon: { ios: 'creditcard.fill', android: 'credit_card', web: 'credit_card' },
            label: '결제',
          },
        ],
      },
      {
        type: 'warning',
        text: '키오스크 화면에서 언어 변경 버튼이 있는지 먼저 확인하세요. 영어, 중국어, 일본어를 지원하는 매장도 있어요.',
      },
      {
        type: 'step',
        number: 2,
        title: '메뉴를 선택해요',
        description: '원하는 메뉴를 고르고 수량을 확인하세요. 카테고리별로 메뉴가 나뉘어 있는 경우가 많아요.',
      },
      { type: 'image', source: require('@/assets/images/guides/order-kiosk-step2.jpg') },
      {
        type: 'cardList',
        layout: 'row',
        cards: [
          { title: '세트 메뉴', description: '음료나 사이드가 함께 포함' },
          { title: '단품 메뉴', description: '메인 메뉴만 주문' },
        ],
      },
      {
        type: 'step',
        number: 3,
        title: '결제 전에 주문 내용을 확인해요',
        description: '장바구니에서 메뉴와 수량이 맞는지 확인한 뒤 결제하세요.',
      },
      { type: 'image', source: require('@/assets/images/guides/order-kiosk-step3.jpg') },
      {
        type: 'cardList',
        layout: 'column',
        cards: [
          {
            icon: { ios: 'creditcard.fill', android: 'credit_card', web: 'credit_card' },
            title: '카드 결제',
            description: '카드를 꽂거나 태그해서 결제',
          },
          {
            icon: { ios: 'iphone', android: 'smartphone', web: 'smartphone' },
            title: '모바일 결제',
            description: '지원되는 경우 휴대폰으로 결제',
          },
        ],
      },
      { type: 'warning', text: '현금 결제가 안 되는 키오스크도 많아요. 카드 결제가 가장 일반적이에요.' },
      {
        type: 'step',
        number: 4,
        title: '주문번호를 확인하고 기다려요',
        description: '결제가 끝나면 주문번호가 나오고, 화면이나 영수증, 진동벨로 호출되는 경우가 많아요.',
      },
      {
        type: 'cardList',
        layout: 'row',
        cards: [
          { title: '주문번호 확인', description: '화면 / 영수증 / 진동벨' },
          { title: '픽업대에서 받기', description: 'Pick up 구역 확인' },
        ],
      },
    ],
    tip: {
      checklist: [
        '먼저 언어 변경 버튼이 있는지 확인',
        '매장 식사 / 포장 여부 먼저 확인',
        '메뉴와 옵션, 추가 금액 확인',
        '결제 후 주문번호 확인',
        '화면 또는 진동벨 호출 확인',
      ],
    },
  },

  'intercity-bus': {
    id: 'intercity-bus',
    category: 'TRANSPORT',
    hero: require('@/assets/images/guides/bus-hero.jpg'),
    title: '시외버스 이용 방법',
    description: '기차가 가지 않는 지역까지 버스로 이동할 수 있어요.\n터미널과 승차홈만 정확히 확인하면 어렵지 않아요.',
    blocks: [
      {
        type: 'step',
        number: 1,
        title: '승차권을 구매해요',
        description: '출발지와 목적지를 입력하고 원하는 차량을 선택하세요. 차량이 도착하면 차량 번호를 확인하고 탑승하세요.',
      },
      {
        type: 'iconFlowCard',
        title: '터미널에서 구매하기',
        description: '매표소 또는 무인발권기에서 승차권을 구매할 수 있어요. 아래 순서를 확인하고 구매하세요.',
        steps: [
          { icon: { ios: 'mappin.circle', android: 'trip_origin', web: 'trip_origin' }, label: '출발지 선택' },
          { icon: { ios: 'flag', android: 'flag', web: 'flag' }, label: '도착지 선택' },
          { icon: { ios: 'clock', android: 'schedule', web: 'schedule' }, label: '시간 선택' },
          { icon: { ios: 'figure.seated.side', android: 'event_seat', web: 'event_seat' }, label: '좌석 선택' },
        ],
      },
      { type: 'image', source: require('@/assets/images/guides/bus-step1-terminal.jpg') },
      {
        type: 'checklistCard',
        title: '미리 예약하고 싶다면',
        description:
          '온라인으로 미리 예약할 수도 있어요. 노선이나 결제 방식에 따라 이용 가능한 서비스가 달라질 수 있으니 해외카드 결제와 모바일 티켓 지원 여부를 확인하세요.',
        items: ['온라인 예약 (예: GoHanpass 등)', '해외카드 사용 여부 확인', '모바일 승차권 여부 확인'],
      },
      {
        type: 'step',
        number: 2,
        title: '정확한 터미널을 확인해요',
        description: '같은 도시에도 여러 버스터미널이 있을 수 있어요. 도시 이름만 보지 말고 정확한 터미널 이름을 확인하세요.',
      },
      {
        type: 'cardList',
        layout: 'row',
        cards: [
          { emoji: '📍', title: '동서울터미널', description: '강변역 인근' },
          { emoji: '📍', title: '서울고속버스터미널', description: '고속터미널역 인근' },
        ],
      },
      { type: 'warning', text: "티켓의 '출발 터미널'과 '도착 터미널'을 반드시 확인하세요!" },
      {
        type: 'step',
        number: 3,
        title: '승차홈을 찾아요',
        description: '승차권에서 출발 시간, 목적지, 승차홈을 확인하고 전광판에서 내 버스를 찾아보세요.',
      },
      { type: 'image', source: require('@/assets/images/guides/bus-step3-board.jpg') },
      { type: 'warning', text: '출발 10~15분 전에는 승차홈 근처에 도착해주세요.' },
      {
        type: 'step',
        number: 4,
        title: '승차권을 확인하고 타요',
        description: '모바일 승차권이 있다면 QR코드를 확인하고 탑승하세요.',
      },
      { type: 'image', source: require('@/assets/images/guides/bus-step4-ticket.jpg') },
      {
        type: 'cardList',
        layout: 'column',
        cards: [
          {
            icon: { ios: 'iphone', android: 'smartphone', web: 'smartphone' },
            title: '모바일 티켓',
            description: 'QR코드를 검표기에 스캔',
          },
          {
            icon: { ios: 'ticket.fill', android: 'confirmation_number', web: 'confirmation_number' },
            title: '종이 티켓',
            description: '승차권을 가지고 버스에 탑승',
          },
        ],
      },
      { type: 'warning', text: '예약 방식에 따라 터미널에서 종이 승차권을 받아야 할 수도 있어요.' },
      {
        type: 'step',
        number: 5,
        title: '내릴 곳을 확인해요',
        description: '시외버스는 목적지까지 가는 동안 다른 터미널이나 정류장에 설 수 있어요.',
      },
      {
        type: 'routeStops',
        caption: '이동 경로 예시',
        stops: [
          { badge: 'A', label: 'A 정류장', sublabel: '일반 정차' },
          { badge: 'B', label: 'B 정류장', sublabel: '중간 정차' },
          { badge: 'C', label: 'C 정류장', sublabel: '내 도착지', highlighted: true },
        ],
      },
      {
        type: 'warning',
        text: '중간에 버스가 멈췄다고 바로 내리지마세요. 내가 예약한 도착지 이름을 확인하고 내려주세요.',
      },
      {
        type: 'cardList',
        layout: 'column',
        cards: [
          {
            emoji: '🧳',
            title: '짐이 있다면?',
            description: '큰 캐리어나 짐은 버스 아래 수하물칸에 넣을 수 있어요. 내릴 때 짐을 잊지 말고 꼭 챙기세요.',
          },
        ],
      },
    ],
    tip: {
      checklist: ['정확한 터미널 확인', '승차홈과 출발 시간 확인', '내릴 정류장 확인'],
    },
  },

  'safety-emergency': {
    id: 'safety-emergency',
    category: 'SAFETY',
    hero: require('@/assets/images/guides/safety-emergency-hero.jpg'),
    title: '긴급상황에서 도움 요청하는 방법',
    description: '위급한 상황에서는 어떤 번호로 연락해야 하는지 아는 것이 가장 중요해요. 112와 119의 차이부터, 신고할 때 꼭 알려야 할 정보까지 알아보세요.',
    blocks: [
      {
        type: 'step',
        number: 1,
        title: '112와 119를 구분해요',
        description: '범죄나 위협 등 경찰의 도움이 필요하면 112, 다치거나 쓰러진 사람이 있거나 화재가 발생했다면 119에 연락해요.',
      },
      {
        type: 'cardList',
        layout: 'row',
        cards: [
          { color: '#154FA9', title: '112 | 경찰', description: '범죄·위협·도난' },
          { color: '#E23A29', title: '119 | 화재 · 구급', description: '부상·화재·응급' },
        ],
      },
      {
        type: 'step',
        number: 2,
        title: '현재 위치를 먼저 알려주세요',
        description: '역 이름, 출구 번호, 건물이나 가게 이름처럼 주변에서 바로 확인할 수 있는 위치를 알려주세요.',
      },
      { type: 'image', source: require('@/assets/images/guides/safety-emergency-step2.jpg') },
      {
        type: 'step',
        number: 3,
        title: '상황을 짧게 설명해요',
        description: '무슨 일이 일어났는지, 사람이 다쳤는지, 지금 어떤 도움이 필요한지 짧게 말하면 돼요.',
      },
      { type: 'image', source: require('@/assets/images/guides/safety-emergency-step3.jpg') },
      {
        type: 'phraseCards',
        title: '바로 쓸 수 있는 표현',
        phrases: [
          { ko: '도와주세요', romanized: 'Do-wa-ju-se-yo', en: 'Please help me' },
          { ko: '경찰을 불러주세요', romanized: 'Gyeong-cha-reul bul-leo-ju-se-yo', en: 'Please call the police' },
          { ko: '구급차를 불러주세요', romanized: 'Gu-geup-cha-reul bul-leo-ju-se-yo', en: 'Please call an ambulance' },
          { ko: '사람이 다쳤어요', romanized: 'Sa-ra-mi da-chyeo-sseo-yo', en: 'Someone is hurt' },
        ],
      },
    ],
    tip: {
      checklist: ['경찰 도움이 필요하면 112', '화재·구급·응급상황은 119', '신고할 때는 현재 위치부터 알려주세요'],
    },
  },

  'safety-lost': {
    id: 'safety-lost',
    category: 'SAFETY',
    hero: require('@/assets/images/guides/safety-lost-hero.jpg'),
    title: '여권 · 휴대폰을 잃어버렸을 때',
    description: '여행 중 중요한 물건을 잃어버렸다면 당황하지 말고 하나씩 확인해보세요. 잃어버린 장소 확인부터 분실 신고까지 필요한 순서를 알려드릴게요.',
    blocks: [
      {
        type: 'step',
        number: 1,
        title: '마지막으로 사용한 장소를 확인해요',
        description: '카페, 식당, 지하철, 버스처럼 마지막으로 물건을 사용한 장소부터 다시 확인해보세요. 이용한 시간과 장소를 기억하면 찾는 데 도움이 돼요.',
      },
      { type: 'image', source: require('@/assets/images/guides/safety-lost-step1.jpg') },
      {
        type: 'step',
        number: 2,
        title: '주변에 먼저 문의해요',
        description: '역무실, 관광지 안내소, 가게 직원에게 먼저 물어보세요. 물건의 색상, 모양, 브랜드 같은 특징을 함께 설명하면 더 좋아요.',
      },
      { type: 'image', source: require('@/assets/images/guides/safety-lost-step2.jpg') },
      {
        type: 'step',
        number: 3,
        title: '여권이라면 바로 신고해요',
        description: '여권을 잃어버렸다면 일반 분실물보다 빠르게 대응해야 해요. 경찰에 분실 신고를 하고, 본인 국가의 대사관·영사관에 연락해 다음 절차를 확인하세요.',
      },
      { type: 'image', source: require('@/assets/images/guides/safety-lost-step3.jpg') },
      {
        type: 'iconFlow',
        steps: [
          { icon: { ios: 'doc.viewfinder', android: 'document_scanner', web: 'document_scanner' }, label: '여권 분실 확인' },
          { icon: { ios: 'phone.fill', android: 'call', web: 'call' }, label: '경찰 신고 (112)' },
          { icon: { ios: 'building.columns.fill', android: 'account_balance', web: 'account_balance' }, label: '대사관 연락' },
        ],
      },
      {
        type: 'phraseCards',
        title: '바로 쓸 수 있는 표현',
        phrases: [
          { ko: '물건을 잃어버렸어요', romanized: 'Mul-geon-eul il-eo-beo-ryeo-sseo-yo', en: 'I lost something' },
          { ko: '휴대폰을 잃어버렸어요', romanized: 'Hyu-dae-pon-eul il-eo-beo-ryeo-sseo-yo', en: 'I lost my phone' },
          { ko: '여권을 잃어버렸어요', romanized: 'Yeo-gwon-eul il-eo-beo-ryeo-sseo-yo', en: 'I lost my passport' },
          { ko: '분실물 센터가 어디예요?', romanized: 'Bun-sil-mul sen-teo-ga eo-di-ye-yo?', en: 'Where is the lost and found?' },
        ],
      },
    ],
    tip: {
      checklist: [
        '마지막으로 사용한 장소부터 확인하기',
        '역무실 · 가게 · 관광지 안내소에 먼저 문의하기',
        '여권을 잃어버렸다면 경찰 신고와 대사관 확인하기',
      ],
    },
  },

  'safety-hospital': {
    id: 'safety-hospital',
    category: 'SAFETY',
    hero: require('@/assets/images/guides/safety-hospital-hero.jpg'),
    title: '여행 중 아플 때 병원 가는 방법',
    description: '한국 여행 중 갑자기 아프더라도 너무 당황하지 않아도 돼요. 병원 찾기부터 접수, 진료, 약 받기까지 순서대로 알아볼게요.',
    blocks: [
      {
        type: 'step',
        number: 1,
        title: '가까운 병원을 찾아요',
        description: '현재 위치 주변에서 병원이나 의원을 찾아보세요. 방문 전에 진료시간과 운영 여부를 확인하면 더 편해요.',
      },
      { type: 'image', source: require('@/assets/images/guides/safety-hospital-step1.jpg') },
      {
        type: 'cardList',
        layout: 'column',
        cards: [{ title: '검색 예시', description: '내과 · 병원 · 의원 · 클리닉' }],
      },
      {
        type: 'step',
        number: 2,
        title: '접수하고 증상을 설명해요',
        description: '병원에 도착하면 먼저 접수 데스크에서 진료를 신청해요. 어디가 아픈지, 언제부터 아팠는지 간단히 설명하면 돼요.',
      },
      { type: 'image', source: require('@/assets/images/guides/safety-hospital-step2.jpg') },
      {
        type: 'cardList',
        layout: 'row',
        cards: [
          { title: '접수', description: '데스크 접수' },
          { title: '대기', description: '순서 기다리기' },
          { title: '진료', description: '의사와 상담' },
        ],
      },
      {
        type: 'step',
        number: 3,
        title: '처방전을 받고 약국으로 가요',
        description: '진료가 끝난 뒤 약이 필요하면 처방전을 받을 수 있어요. 처방전을 가지고 근처 약국에 가서 약을 받고, 복용 방법을 확인하세요.',
      },
      { type: 'image', source: require('@/assets/images/guides/safety-hospital-step3.jpg') },
      {
        type: 'cardList',
        layout: 'row',
        cards: [
          { title: '병원', description: '진료 완료' },
          { title: '처방전', description: '의사에게 수령' },
          { title: '약국', description: '근처 약국 방문' },
        ],
      },
      { type: 'warning', text: '한국은 병원과 약국이 분리되어 있어요. 처방전을 꼭 챙기세요!' },
      {
        type: 'phraseCards',
        title: '바로 쓸 수 있는 표현',
        phrases: [
          { ko: '배가 아파요', romanized: 'Bae-ga a-pa-yo', en: 'My stomach hurts' },
          { ko: '머리가 아파요', romanized: 'Meo-ri-ga a-pa-yo', en: 'I have a headache' },
          { ko: '열이 나요', romanized: 'Yeol-i na-yo', en: 'I have a fever' },
          { ko: '약국이 어디예요?', romanized: 'Yak-guk-i eo-di-ye-yo?', en: 'Where is the pharmacy?' },
        ],
      },
    ],
    tip: {
      checklist: [
        '가벼운 증상이라면 가까운 병원이나 의원을 찾아보세요',
        '병원 방문 전 운영시간을 확인하면 좋아요',
        '심한 부상이나 응급상황이라면 119에 연락하세요',
      ],
    },
  },

  'safety-hiking': {
    id: 'safety-hiking',
    category: 'SAFETY',
    hero: require('@/assets/images/guides/safety-hiking-hero.jpg'),
    title: '한국에서 등산할 때 알아둘 안전수칙',
    description: '한국에는 여행 중 가볍게 방문할 수 있는 산이 많지만, 코스와 날씨를 확인하지 않고 출발하면 예상보다 산행이 어려울 수 있어요. 출발 전 준비부터 길을 잃었을 때 대처하는 방법까지 알아볼게요.',
    blocks: [
      {
        type: 'step',
        number: 1,
        title: '코스와 날씨를 확인하고 출발해요',
        description: '출발 전에 오늘의 날씨, 코스 난이도, 예상 소요시간을 확인하세요. 등산로가 통제 중인지, 해가 지기 전에 내려올 수 있는지도 함께 확인하면 좋아요.',
      },
      { type: 'image', source: require('@/assets/images/guides/safety-hiking-step1.jpg') },
      {
        type: 'step',
        number: 2,
        title: '이정표를 확인하며 지정된 등산로로 이동해요',
        description: '산에서는 지름길처럼 보여도 표시되지 않은 길로 들어가지 마세요. 이동하면서 정상, 하산 방향, 탐방지원센터 방향이 적힌 이정표를 계속 확인해요.',
      },
      { type: 'image', source: require('@/assets/images/guides/safety-hiking-step2.jpg') },
      { type: 'warning', text: '표시되지 않은 샛길·지름길은 위험해요. 반드시 지정된 등산로만 이용하세요.' },
      {
        type: 'step',
        number: 3,
        title: '길을 잃거나 다쳤다면 위치를 확인하고 도움을 요청해요',
        description: '길을 잃었거나 다쳤다면 무리해서 계속 이동하지 말고 현재 위치를 먼저 확인하세요. 혼자 내려가기 어렵다면 119에 신고하고, 주변의 산악위치표지판 번호를 함께 알려주세요.',
      },
      { type: 'image', source: require('@/assets/images/guides/safety-hiking-step3.jpg') },
      {
        type: 'cardList',
        layout: 'row',
        cards: [
          { title: '위치표지판', description: '주변 초록 표지판 번호 확인' },
          { title: '위치 파악', description: '표지판 번호 기억하기' },
          { title: '119 신고', description: '번호 + 상황 함께 알려주기' },
        ],
      },
      {
        type: 'horiTipInline',
        title: '산악위치표지판 예시',
        body: '예: 북한산 12-나-07\n119 신고 시 이 번호를 알려주세요.',
      },
      {
        type: 'phraseCards',
        title: '바로 쓸 수 있는 표현',
        phrases: [
          { ko: '길을 잃었어요', romanized: 'Gi-reul il-eo-sseo-yo', en: "I'm lost" },
          { ko: '발목을 다쳤어요', romanized: 'Bal-mok-eul da-chyeo-sseo-yo', en: 'I hurt my ankle' },
          { ko: '내려가는 길이 어디예요?', romanized: 'Nae-ryeo-ga-neun gi-ri eo-di-ye-yo?', en: 'Which way is down?' },
          { ko: '119를 불러주세요', romanized: 'Il-il-gu-reul bul-leo-ju-se-yo', en: 'Please call 119' },
        ],
      },
    ],
    tip: {
      checklist: [
        '코스 난이도와 예상 소요시간을 먼저 확인하세요',
        '물과 보조배터리를 챙기고 지정된 등산로를 이용하세요',
        '길을 잃거나 다쳤다면 산악위치표지판을 확인하고 119에 도움을 요청하세요',
      ],
    },
  },
};
