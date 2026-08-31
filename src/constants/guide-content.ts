import type { ImageSource } from "expo-image";
import type { ComponentProps } from "react";
import type { SymbolView } from "expo-symbols";

import type { GuideCategoryId } from "@/api/home";
import { Palette } from "@/constants/colors";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

export type GuideBlock =
  | { type: "step"; number: number; title: string; description: string }
  | {
      type: "image";
      source: ImageSource;
      caption?: string;
      aspectRatio?: number;
    }
  | { type: "warning"; text: string }
  | {
      type: "phraseTable";
      title: string;
      phrases: { ko: string; en: string }[];
    }
  | {
      type: "bulletList";
      columns: { label: string; dotColor: string; items: string[] }[];
    }
  | {
      // Row/column of bordered cards, each an optional icon/image/emoji + title + description.
      // `color` swaps the card to a solid background with white text (safety's 112/119 cards).
      type: "cardList";
      layout: "row" | "column";
      cards: {
        icon?: SymbolName;
        image?: ImageSource;
        emoji?: string;
        color?: string;
        title: string;
        description: string;
        /** 'stacked' (default) — icon on top, text below. 'row' — icon on the
         * left, title/description stacked to its right. */
        orientation?: "stacked" | "row";
        /** Overrides for the icon circle — e.g. a red circle for call-center cards. */
        iconBackground?: string;
        iconTintColor?: string;
        iconBorderless?: boolean;
      }[];
    }
  | {
      // Bordered card: bold Korean phrase + romanization on the left, English
      // pill on the right (language carousel's "함께 알아두면 좋아요" cards,
      // also reused by safety's "바로 쓸 수 있는 표현").
      type: "phraseCards";
      title?: string;
      phrases: { ko: string; romanized: string; en: string }[];
    }
  | {
      // Horizontal "출발지 선택 → 목적지 입력 → ..." icon flow inside a bordered card.
      type: "iconFlow";
      steps: { icon: SymbolName; label: string }[];
    }
  | {
      // Same icon flow, but with a title + description header inside the same card
      // (bus ticket-purchase flow: "터미널에서 구매하기" + 4-step icon row).
      type: "iconFlowCard";
      title: string;
      description: string;
      steps: { icon: SymbolName; label: string }[];
    }
  | {
      // Bordered card: title + optional description + a checkmark list — plain
      // white variant of HoriTipCard's checklist, no mascot (bus's "미리 예약하고
      // 싶다면" box).
      type: "checklistCard";
      title: string;
      description?: string;
      items: string[];
    }
  | {
      // A → B → C route/stop badges with an arrow between each (bus's "이동 경로 예시").
      type: "routeStops";
      caption: string;
      stops: {
        badge: string;
        label: string;
        sublabel: string;
        highlighted?: boolean;
      }[];
    }
  | {
      // Mid-content Hori Tip callout (e.g. hiking guide's "산악위치표지판 예시") —
      // same component as the screen's closing tip, just placed inline.
      type: "horiTipInline";
      title?: string;
      body?: string;
    }
  | {
      // Dark toast/notification mockup (waiting-list "웨이팅 알림" push notification preview).
      type: "notificationCard";
      emoji: string;
      title: string;
      timestamp: string;
      body: string;
      bodySub?: string;
    }
  | {
      // Dark horizontal progress tracker with a connecting line (delivery-status steps).
      type: "statusTracker";
      steps: string[];
      activeIndex: number;
    }
  | {
      // Dark signage-example card (subway's "갈아타는 곳 / Transfer" style).
      type: "signCard";
      icon: ImageSource;
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
  "subway-transfer": {
    id: "subway-transfer",
    category: "TRANSPORT",
    hero: require("@/assets/images/guides/subway-hero.jpg"),
    title: "지하철 환승하는 방법",
    description:
      "표지판만 따라가면 어렵지 않아요.\n노선과 방향을 확인하며 갈아타는 방법을 알아보세요.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "갈아타는 곳을 찾아요",
        description:
          "열차에서 내린 뒤 **'갈아타는 곳 / Transfer'** 표지판을 \n찾아보세요. 나가는 곳이 아니라 Transfer를 따라가면 돼요.",
      },
      {
        type: "signCard",
        icon: require("@/assets/images/guides/subway-transfer-line-badge.svg"),
        title: "갈아타는 곳",
        translations: ["換乗", "乗り換え"],
        caption: "갈아타는 곳 / Transfer 표지판 예시",
      },
      {
        type: "step",
        number: 2,
        title: "노선 번호와 색상을 따라가요",
        description:
          "**표지판과 바닥 안내에서 갈아탈 노선의 번호와 색상을 확인**하세요. 역에 따라 환승 통로가 길 수 있어요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/subway-step2-signage.jpg"),
      },
      {
        type: "step",
        number: 3,
        title: "타기 전에 방향을 확인해요",
        description:
          "노선은 맞아도 반대 방향 열차를 탈 수 있어요. \n플랫폼에서 **목적지가 있는 방향과 다음 역을 확인하세요.**",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/subway-step3-platform.jpg"),
      },
      {
        type: "phraseTable",
        title: "지하철에서 자주 보는 표현",
        phrases: [
          { ko: "갈아타는 곳", en: "Transfer" },
          { ko: "나가는 곳", en: "Way Out" },
          { ko: "○○ 방면", en: "Towards ○○" },
        ],
      },
    ],
    tip: {
      title: "환승할 때 이것만 기억하세요!",
      checklist: [
        "Transfer 표지판 찾기",
        "갈아탈 노선 따라가기",
        "타기 전 방향 확인하기",
      ],
    },
  },

  "taxi-call": {
    id: "taxi-call",
    category: "TRANSPORT",
    hero: require("@/assets/images/guides/taxi-hero.jpg"),
    title: "택시 타는 방법",
    description:
      "앱으로 부르면 가장 간단해요.\n목적지를 미리 입력하면 기사님께 직접 설명하지 않아도 돼요.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "앱으로 호출하기",
        description:
          "출발지와 목적지를 입력하고 원하는 차량을 선택하세요. \n차량이 도착하면 **차량 번호를 확인하고 탑승하세요.**",
      },
      {
        type: "iconFlow",
        steps: [
          {
            icon: {
              ios: "mappin.circle",
              android: "trip_origin",
              web: "trip_origin",
            },
            label: "출발지 선택",
          },
          {
            icon: { ios: "flag", android: "flag", web: "flag" },
            label: "목적지 입력",
          },
          {
            icon: {
              ios: "car.fill",
              android: "directions_car",
              web: "directions_car",
            },
            label: "차량 선택",
          },
          {
            icon: { ios: "iphone", android: "smartphone", web: "smartphone" },
            label: "호출하기",
          },
        ],
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          {
            image: require("@/assets/images/guides/taxi-uber-icon.png"),
            title: "Uber Taxi",
            description: "기존 Uber 사용자는\n같은 앱으로 이용 가능",
          },
          {
            image: require("@/assets/images/guides/taxi-kride-icon.png"),
            title: "k.ride",
            description: "외국인 여행자를 위한 앱,\n해외카드 및 다국어 지원",
          },
        ],
      },
      {
        type: "image",
        source: require("@/assets/images/guides/taxi-step1-hail.jpg"),
      },
      {
        type: "warning",
        text: "앱마다 차량 종류와 예상 요금이 다를 수 있어요. \n 호출하기 전에 확인해보세요.",
      },
      {
        type: "step",
        number: 2,
        title: "길에서 잡는다면",
        description:
          "**앞 유리에 '빈차' 표시**가 켜진 택시를 잡으세요. \n안전한 도로 가장자리나 택시 승강장을 이용하세요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/taxi-step2-street.jpg"),
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          { title: "빈차", description: "탈 수 있어요" },
          { title: "예약", description: "다른 승객이 예약한 택시" },
        ],
      },
      {
        type: "step",
        number: 3,
        title: "목적지를 알려주세요",
        description:
          "길에서 탔다면 **한국어 장소명이나 주소**를 보여주는 것이 \n가장 쉬워요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/taxi-step3-phone.jpg"),
      },
      {
        type: "warning",
        text: "앱으로 호출했다면 목적지가 이미 기사님에게 전달돼요.",
      },
      {
        type: "step",
        number: 4,
        title: "요금을 확인하세요",
        description:
          "길에서 잡은 일반 택시는 이동하면서 \n**미터기에 요금이 표시돼요.**",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/taxi-step4-phone.jpg"),
      },
      {
        type: "warning",
        text: "실제 요금은 교통 상황, 이동 거리, 시간, 할증 등에 따라 \n달라질 수 있어요.",
      },
      { type: "step", number: 5, title: "결제하기", description: "" },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            icon: {
              ios: "creditcard.fill",
              android: "credit_card",
              web: "credit_card",
            },
            title: "신용카드",
            description: "Visa, Mastercard 등 해외 카드 가능",
            orientation: "row",
          },
          {
            icon: {
              ios: "wonsign.circle.fill",
              android: "payments",
              web: "payments",
            },
            title: "현금",
            description: "원화(KRW)만 사용 가능해요",
            orientation: "row",
          },
          {
            icon: {
              ios: "tram.fill",
              android: "directions_bus",
              web: "directions_bus",
            },
            title: "교통카드",
            description: "T-money 카드로 결제 가능",
            orientation: "row",
          },
        ],
      },
      {
        type: "warning",
        text: "앱에서 자동결제했다면 기사님께 다시 결제하지 마세요.",
      },
      {
        type: "checklistCard",
        title: "문제가 생겼다면?",
        description: "다음 정보를 확인해두면 신고하거나 상담받기 쉬워요.",
        items: ["차량 번호", "영수증", "이용 시간"],
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            icon: { ios: "phone.fill", android: "call", web: "call" },
            title: "서울 120 다산콜센터",
            description: "외국어 상담 지원",
            orientation: "row",
            iconBackground: Palette.red100,
            iconTintColor: Palette.red300,
            iconBorderless: true,
          },
        ],
      },
    ],
    tip: {
      checklist: [
        "늦은 밤에는 심야 할증이 있을 수 있어요.",
        "짐이 많다면 큰 차량이나 Van 옵션을 확인하세요.",
        "택시 문은 직접 열고 닫아요.",
      ],
    },
  },

  "order-restaurant": {
    id: "order-restaurant",
    category: "ORDER",
    hero: require("@/assets/images/guides/order-restaurant-hero.jpg"),
    title: "한국 식당에서 주문하는 방법",
    description:
      "한국 식당은 주문 방식이 조금씩 달라요.\n자리 안내부터 주문과 계산까지 차근차근 알아보세요.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "인원수를 말하고 자리를 확인해요",
        description:
          "식당에 들어가면 직원에게 몇 명인지 먼저 알려주세요. 직원이 자리를 안내하거나, 직접 앉도록 안내할 수 있어요.",
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          { title: "한 명이에요", description: "I'm alone." },
          { title: "두 명이에요", description: "There are two of us." },
        ],
      },
      {
        type: "step",
        number: 2,
        title: "주문 방법을 확인해요",
        description:
          "한국 식당은 직원 주문, 호출벨, 테이블오더, 카운터 주문 등 다양한 방식을 사용해요. 테이블 주변과 입구의 안내문을 먼저 확인하세요.",
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          {
            emoji: "🗣️",
            title: "직원 주문",
            description: "직원에게 메뉴 말하기",
          },
          {
            emoji: "🔔",
            title: "호출벨",
            description: "벨을 눌러 직원 부르기",
          },
        ],
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          {
            emoji: "📱",
            title: "테이블오더",
            description: "자리에서 화면으로 주문",
          },
          {
            emoji: "🏪",
            title: "주문대",
            description: "먼저 주문하고 자리 이용",
          },
        ],
      },
      {
        type: "step",
        number: 3,
        title: "메뉴와 주문 수량을 확인해요",
        description:
          "메뉴와 가격을 확인한 뒤 주문 수량을 선택하세요. 일부 메뉴는 2인분 이상부터 주문할 수 있어요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/order-restaurant-step3.jpg"),
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          { title: "1인분", description: "한 사람 기준의 양이에요." },
          {
            title: "2인분 이상",
            description: "최소 두 사람 분량부터 주문해야 해요.",
          },
          {
            title: "1인 1메뉴",
            description: "사람마다 메뉴를 한 개 이상 주문해야 해요.",
          },
        ],
      },
      {
        type: "warning",
        text: "고기, 전골, 닭갈비 등은 2인분부터 주문해야 할 수 있어요.",
      },
      {
        type: "step",
        number: 4,
        title: "맵기와 재료를 확인해요",
        description:
          "한국 음식은 메뉴 이름만으로 맵기나 재료를 알기 어려울 수 있어요. 주문하기 전에 직원에게 확인해보세요.",
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          { title: "이거 매워요?", description: "Is this spicy?" },
          {
            title: "안 맵게 해 주세요",
            description: "Please make it less spicy.",
          },
          {
            title: "이 재료를 빼 주세요",
            description: "Please leave this ingredient out.",
          },
        ],
      },
      {
        type: "step",
        number: 5,
        title: "셀프(Self)코너를 확인해요",
        description:
          "물, 수저, 반찬을 직접 가져와야 하는 식당도 있어요. 테이블과 매장 안에서 '셀프' 안내를 확인하세요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/order-restaurant-step5.jpg"),
      },
      {
        type: "warning",
        text: "수저와 휴지가 테이블 옆 서랍 안에 있는 식당도 있어요.",
      },
      {
        type: "step",
        number: 6,
        title: "추가 주문이 필요하면 직원을 불러요",
        description:
          "음식이나 음료를 더 주문하려면 호출벨을 누르거나 직원에게 말해보세요.",
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          { title: "여기요", description: "Excuse me." },
          { title: "이거 하나 더 주세요", description: "One more, please." },
        ],
      },
      {
        type: "step",
        number: 7,
        title: "식사를 마치면 계산해요",
        description:
          "한국 식당은 식사 후 카운터에서 계산하는 경우가 많아요. 테이블 결제나 선결제 방식인지 먼저 확인하세요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/order-restaurant-step7.jpg"),
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            icon: {
              ios: "creditcard.fill",
              android: "credit_card",
              web: "credit_card",
            },
            title: "카드 결제",
            description: "국내외 신용카드로 결제",
            orientation: "row",
          },
          {
            icon: {
              ios: "wonsign.circle.fill",
              android: "payments",
              web: "payments",
            },
            title: "현금 결제",
            description: "현금으로 직접 결제",
            orientation: "row",
          },
        ],
      },
    ],
    tip: {
      checklist: [
        "먼저 인원수를 말하고 자리를 확인해요.",
        "테이블 주변에서 주문 방식을 확인해요.",
        "최소 주문 수량과 맵기를 확인해요.",
        "계산 위치는 식당마다 다를 수 있어요.",
      ],
    },
  },

  "order-waiting": {
    id: "order-waiting",
    category: "ORDER",
    hero: require("@/assets/images/guides/order-waiting-hero.jpg"),
    title: "식당 웨이팅 · 예약하는 방법",
    description:
      "인기 있는 식당은 예약하거나 대기 등록이 필요할 수 있어요.\n방문 전에 이용 방법을 확인하고 기다리는 방법을 알아보세요.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "예약 방법을 먼저 확인해요",
        description:
          "식당마다 예약과 대기 방식이 달라요. 지도, 식당 공식 계정, 혹은 예약 서비스에서 이용 방법을 확인하세요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/order-waiting-step1.jpg"),
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          {
            emoji: "📅",
            title: "사전 예약",
            description: "방문 날짜, 시간 미리 선택",
          },
          {
            emoji: "🔢",
            title: "현장 웨이팅",
            description: "식당에 도착한 뒤 대기 등록",
          },
        ],
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          {
            emoji: "📲",
            title: "원격 웨이팅",
            description: "앱에서 미리 웨이팅 등록",
          },
          {
            emoji: "🚶",
            title: "바로 방문",
            description: "도착한 순서대로 입장",
          },
        ],
      },
      {
        type: "step",
        number: 2,
        title: "날짜와 시간을 예약해요",
        description:
          "예약 가능한 식당이라면 날짜, 시간, 인원수를 선택하세요. 일부 식당은 메뉴나 좌석을 미리 선택해야 할 수 있어요.",
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          { title: "날짜", description: "방문하려는 날짜를 선택해요." },
          { title: "시간", description: "입장 가능한 시간을 선택해요." },
          {
            title: "인원",
            description: "어린이를 포함한 전체 인원을 입력해요.",
          },
        ],
      },
      {
        type: "step",
        number: 3,
        title: "예약이 어렵다면 웨이팅을 등록해요",
        description:
          "예약이 마감됐거나 예약을 받지 않는 식당은 현장에서 대기 등록을 할 수 있어요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/order-waiting-step3.jpg"),
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          { title: "대기번호", description: "내 순서와 앞의 팀 확인" },
          { title: "예상 시간", description: "예상 대기시간을 확인" },
        ],
      },
      {
        type: "step",
        number: 4,
        title: "호출 알림을 확인해요",
        description:
          "순서가 가까워지면 문자, 앱 알림이나 매장 화면으로 안내받을 수 있어요. 호출을 놓치지 않도록 휴대전화를 확인하세요.",
      },
      {
        type: "notificationCard",
        emoji: "🔔",
        title: "웨이팅 알림",
        timestamp: "방금 전",
        body: "Your table is almost ready.",
        bodySub: "Please return to the restaurant.",
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            title: "문자 알림",
            description: "입장 순서가 되면 메시지가 와요.",
          },
          {
            title: "앱 알림",
            description: "예약 또는 웨이팅 앱에서 알려줘요.",
          },
          { title: "번호 호출", description: "직원이 번호나 이름을 불러요." },
        ],
      },
      {
        type: "warning",
        text: "호출 후 정해진 시간 안에 도착하지 않으면 순서가 취소될 수 있어요.",
      },
      {
        type: "step",
        number: 5,
        title: "식당에 도착하면 화면을 보여주세요",
        description:
          "예약 시간보다 조금 일찍 도착해 직원에게 예약 또는 웨이팅 화면을 보여주세요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/order-waiting-step5.jpg"),
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          { title: "예약했어요", description: "I have a reservation." },
          { title: "웨이팅 등록했어요", description: "I joined the waitlist." },
        ],
      },
    ],
    tip: {
      checklist: [
        "예약과 웨이팅 가능 여부를 먼저 확인해요.",
        "날짜, 시간, 인원수를 정확히 입력해요.",
        "호출 알림을 놓치지 않도록 확인해요.",
        "늦거나 방문이 어렵다면 미리 취소해요.",
      ],
    },
  },

  "order-delivery": {
    id: "order-delivery",
    category: "ORDER",
    hero: require("@/assets/images/guides/order-delivery-hero.jpg"),
    title: "배달음식 주문하는 방법",
    description:
      "정확한 주소와 배달 장소를 입력하면 숙소에서도 한국 음식을 주문할 수 있어요. 앱 선택부터 음식 받기까지 차근차근 알아보세요.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "배달 앱을 선택해요",
        description:
          "한국에서는 배달의민족, Shuttle 등 앱으로 음식을 주문할 수 있어요. 영어 지원 여부와 결제 수단을 먼저 확인하세요.",
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          {
            image: require("@/assets/images/guides/order-delivery-baemin-icon.png"),
            title: "배달의민족",
            description: "다국어 지원, 다양한 음식점, 카카오페이·카드 결제",
          },
          {
            image: require("@/assets/images/guides/order-delivery-shuttle-icon.png"),
            title: "Shuttle Delivery",
            description: "영어 지원, 해외 카드 결제 가능, 외국인 친화적 UI",
          },
        ],
      },
      {
        type: "step",
        number: 2,
        title: "주소를 입력해요",
        description:
          "배달 앱에서 현재 위치를 설정하거나 직접 주소를 입력하세요. 상세주소(동 · 호수, 객실번호 등)도 함께 입력해야 해요.",
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            title: "집 · 기숙사",
            description: "건물명, 동 · 호수를 정확히 입력해요.",
          },
          {
            title: "호텔·게스트하우스",
            description: "숙소명, 객실번호, 로비 수령 여부를 확인해요.",
          },
          {
            title: "공원 · 야외",
            description: "입구나 배달존 위치를 선택해요.",
          },
        ],
      },
      {
        type: "step",
        number: 3,
        title: "메뉴를 선택해요",
        description: "원하는 음식점과 메뉴를 고르고 수량과 옵션을 확인하세요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/order-delivery-step3.jpg"),
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            title: "최소 주문금액",
            description: "이 금액 이상이어야 주문 가능해요.",
          },
          {
            title: "배달비",
            description: "거리에 따라 금액이 달라질 수 있어요.",
          },
          { title: "예상 시간", description: "도착까지 걸리는 시간이에요." },
          {
            title: "메뉴 옵션",
            description: "맵기, 토핑 등 세부 옵션을 확인해요.",
          },
        ],
      },
      {
        type: "step",
        number: 4,
        title: "요청사항을 입력해요",
        description:
          "배달 방식과 요청사항을 선택하세요. 한국어 통화가 어렵다면 메모란에 미리 알려두세요.",
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            title: "문 앞에 놓아 주세요",
            description: "Please leave it at the door.",
          },
          {
            title: "로비에서 받을게요",
            description: "I'll receive it in the lobby.",
          },
          {
            title: "도착하면 메시지 주세요",
            description: "Please message me when you arrive.",
          },
        ],
      },
      {
        type: "step",
        number: 5,
        title: "결제를 확인해요",
        description:
          "결제 수단을 선택하고 최종 금액을 확인한 뒤 주문을 완료하세요.",
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            icon: {
              ios: "creditcard.fill",
              android: "credit_card",
              web: "credit_card",
            },
            title: "해외 신용카드",
            description: "Visa, Mastercard 등 국제 카드로 결제해요.",
          },
          {
            icon: {
              ios: "creditcard.fill",
              android: "credit_card",
              web: "credit_card",
            },
            title: "국내 카드",
            description: "한국 신용·체크카드로 결제해요.",
          },
          {
            icon: { ios: "bolt.fill", android: "bolt", web: "bolt" },
            title: "간편결제",
            description: "카카오페이, 네이버페이 등을 사용해요.",
          },
        ],
      },
      {
        type: "step",
        number: 6,
        title: "주문 상태를 확인해요",
        description:
          "앱에서 배달기사 위치와 예상 도착시간을 실시간으로 확인할 수 있어요.",
      },
      {
        type: "statusTracker",
        steps: ["주문 접수", "음식 준비", "배달 시작", "곧 도착", "배달 완료"],
        activeIndex: 2,
      },
      {
        type: "warning",
        text: "앱 알림을 켜고 기사님의 메시지나 전화를 놓치지 마세요.",
      },
      {
        type: "step",
        number: 7,
        title: "음식을 받아요",
        description:
          "기사님이 도착하면 직접 받거나 지정 장소에서 수령하세요. 받은 후에는 음식과 수량을 바로 확인하세요.",
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          { title: "지금 로비에 있어요", description: "I'm in the lobby now." },
          {
            title: "입구 앞에서 기다리고 있어요",
            description: "I'm waiting at the entrance.",
          },
          {
            title: "제가 주문한 사람이에요",
            description: "I'm the person who placed the order.",
          },
        ],
      },
    ],
    tip: {
      checklist: [
        "이용 가능한 앱인지 확인해요.",
        "주소와 상세주소를 정확히 입력해요.",
        "최소 주문금액과 배달비를 확인해요.",
        "음식이 도착할 때까지 알림을 확인해요.",
      ],
    },
  },

  "order-kiosk": {
    id: "order-kiosk",
    category: "ORDER",
    hero: require("@/assets/images/guides/order-kiosk-hero.jpg"),
    title: "키오스크로 주문하는 방법",
    description:
      "한국의 카페, 패스트푸드점, 푸드코트에서는 직원 대신\n키오스크로 주문하는 경우가 많아요.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "언어를 먼저 확인해요",
        description: "",
      },
      {
        type: "iconFlowCard",
        title: "주문 흐름",
        description: "",
        steps: [
          {
            icon: { ios: "globe", android: "language", web: "language" },
            label: "언어 선택",
          },
          {
            icon: {
              ios: "bag.fill",
              android: "shopping_bag",
              web: "shopping_bag",
            },
            label: "매장/포장",
          },
          {
            icon: {
              ios: "list.bullet",
              android: "menu_book",
              web: "menu_book",
            },
            label: "메뉴 선택",
          },
          {
            icon: {
              ios: "creditcard.fill",
              android: "credit_card",
              web: "credit_card",
            },
            label: "결제",
          },
        ],
      },
      {
        type: "warning",
        text: "키오스크 화면에서 언어 변경 버튼이 있는지 먼저 확인하세요. 영어, 중국어, 일본어를 지원하는 매장도 있어요.",
      },
      {
        type: "step",
        number: 2,
        title: "메뉴를 선택해요",
        description:
          "원하는 메뉴를 고르고 수량을 확인하세요. 카테고리별로 메뉴가 나뉘어 있는 경우가 많아요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/order-kiosk-step2.jpg"),
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          { title: "세트 메뉴", description: "음료나 사이드가 함께 포함" },
          { title: "단품 메뉴", description: "메인 메뉴만 주문" },
        ],
      },
      {
        type: "step",
        number: 3,
        title: "결제 전에 주문 내용을 확인해요",
        description: "장바구니에서 메뉴와 수량이 맞는지 확인한 뒤 결제하세요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/order-kiosk-step3.jpg"),
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            icon: {
              ios: "creditcard.fill",
              android: "credit_card",
              web: "credit_card",
            },
            title: "카드 결제",
            description: "카드를 꽂거나 태그해서 결제",
          },
          {
            icon: { ios: "iphone", android: "smartphone", web: "smartphone" },
            title: "모바일 결제",
            description: "지원되는 경우 휴대폰으로 결제",
          },
        ],
      },
      {
        type: "warning",
        text: "현금 결제가 안 되는 키오스크도 많아요. 카드 결제가 가장 일반적이에요.",
      },
      {
        type: "step",
        number: 4,
        title: "주문번호를 확인하고 기다려요",
        description:
          "결제가 끝나면 주문번호가 나오고, 화면이나 영수증, 진동벨로 호출되는 경우가 많아요.",
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          { title: "주문번호 확인", description: "화면 / 영수증 / 진동벨" },
          { title: "픽업대에서 받기", description: "Pick up 구역 확인" },
        ],
      },
    ],
    tip: {
      checklist: [
        "먼저 언어 변경 버튼이 있는지 확인",
        "매장 식사 / 포장 여부 먼저 확인",
        "메뉴와 옵션, 추가 금액 확인",
        "결제 후 주문번호 확인",
        "화면 또는 진동벨 호출 확인",
      ],
    },
  },

  "intercity-bus": {
    id: "intercity-bus",
    category: "TRANSPORT",
    hero: require("@/assets/images/guides/bus-hero.jpg"),
    title: "시외버스 이용 방법",
    description:
      "기차가 가지 않는 지역까지 버스로 이동할 수 있어요.\n터미널과 승차홈만 정확히 확인하면 어렵지 않아요.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "승차권을 구매해요",
        description:
          "출발지와 목적지를 입력하고 원하는 차량을 선택하세요. 차량이 도착하면 **차량 번호를 확인하고 탑승하세요.**",
      },
      {
        type: "iconFlowCard",
        title: "터미널에서 구매하기",
        description:
          "매표소 또는 무인발권기에서 승차권을 구매할 수 있어요. 아래 순서를 확인하고 구매하세요.",
        steps: [
          {
            icon: {
              ios: "mappin.circle",
              android: "trip_origin",
              web: "trip_origin",
            },
            label: "출발지 선택",
          },
          {
            icon: { ios: "flag", android: "flag", web: "flag" },
            label: "도착지 선택",
          },
          {
            icon: { ios: "clock", android: "schedule", web: "schedule" },
            label: "시간 선택",
          },
          {
            icon: {
              ios: "figure.seated.side",
              android: "event_seat",
              web: "event_seat",
            },
            label: "좌석 선택",
          },
        ],
      },
      {
        type: "image",
        source: require("@/assets/images/guides/bus-step1-terminal.jpg"),
      },
      {
        type: "checklistCard",
        title: "미리 예약하고 싶다면",
        description:
          "온라인으로 미리 예약할 수도 있어요. 노선이나 결제 방식에 따라 이용 가능한 서비스가 달라질 수 있으니 해외카드 결제와 모바일 티켓 지원 여부를 확인하세요.",
        items: [
          "온라인 예약 (예: GoHanpass 등)",
          "해외카드 사용 여부 확인",
          "모바일 승차권 여부 확인",
        ],
      },
      {
        type: "step",
        number: 2,
        title: "정확한 터미널을 확인해요",
        description:
          "같은 도시에도 여러 버스터미널이 있을 수 있어요. 도시 이름만 보지 말고 **정확한 터미널 이름**을 확인하세요.",
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          { emoji: "📍", title: "동서울터미널", description: "강변역 인근" },
          {
            emoji: "📍",
            title: "서울고속버스터미널",
            description: "고속터미널역 인근",
          },
        ],
      },
      {
        type: "warning",
        text: "티켓의 '출발 터미널'과 '도착 터미널'을 반드시 확인하세요!",
      },
      {
        type: "step",
        number: 3,
        title: "승차홈을 찾아요",
        description:
          "승차권에서 출발 시간, 목적지, 승차홈을 확인하고 전광판에서 내 버스를 찾아보세요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/bus-step3-board.jpg"),
      },
      {
        type: "warning",
        text: "출발 10~15분 전에는 승차홈 근처에 도착해주세요.",
      },
      {
        type: "step",
        number: 4,
        title: "승차권을 확인하고 타요",
        description: "모바일 승차권이 있다면 QR코드를 확인하고 탑승하세요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/bus-step4-ticket.jpg"),
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            icon: { ios: "iphone", android: "smartphone", web: "smartphone" },
            title: "모바일 티켓",
            description: "QR코드를 검표기에 스캔",
            orientation: "row",
          },
          {
            icon: {
              ios: "ticket.fill",
              android: "confirmation_number",
              web: "confirmation_number",
            },
            title: "종이 티켓",
            description: "승차권을 가지고 버스에 탑승",
            orientation: "row",
          },
        ],
      },
      {
        type: "warning",
        text: "예약 방식에 따라 터미널에서 종이 승차권을 \n 받아야 할 수도 있어요.",
      },
      {
        type: "step",
        number: 5,
        title: "내릴 곳을 확인해요",
        description:
          "시외버스는 목적지까지 가는 동안 다른 터미널이나 정류장에 설 수 있어요.",
      },
      {
        type: "routeStops",
        caption: "이동 경로 예시",
        stops: [
          { badge: "A", label: "A 정류장", sublabel: "일반 정차" },
          { badge: "B", label: "B 정류장", sublabel: "중간 정차" },
          {
            badge: "C",
            label: "C 정류장",
            sublabel: "내 도착지",
            highlighted: true,
          },
        ],
      },
      {
        type: "warning",
        text: "중간에 버스가 멈췄다고 바로 내리지마세요. \n 내가 예약한 도착지 이름을 확인하고 내려주세요.",
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            emoji: "🧳",
            title: "짐이 있다면?",
            description:
              "큰 캐리어나 짐은 버스 아래 수하물칸에 넣을 수 있어요. 내릴 때 짐을 잊지 말고 꼭 챙기세요.",
          },
        ],
      },
    ],
    tip: {
      checklist: [
        "정확한 터미널 확인",
        "승차홈과 출발 시간 확인",
        "내릴 정류장 확인",
      ],
    },
  },

  "safety-emergency": {
    id: "safety-emergency",
    category: "SAFETY",
    hero: require("@/assets/images/guides/safety-emergency-hero.jpg"),
    title: "긴급상황에서 도움 요청하는 방법",
    description:
      "위급한 상황에서는 어떤 번호로 연락해야 하는지 아는 것이 가장 중요해요. 112와 119의 차이부터, 신고할 때 꼭 알려야 할 정보까지 알아보세요.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "112와 119를 구분해요",
        description:
          "범죄나 위협 등 경찰의 도움이 필요하면 112, 다치거나 쓰러진 사람이 있거나 화재가 발생했다면 119에 연락해요.",
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          {
            color: "#154FA9",
            title: "112 | 경찰",
            description: "범죄·위협·도난",
          },
          {
            color: "#E23A29",
            title: "119 | 화재 · 구급",
            description: "부상·화재·응급",
          },
        ],
      },
      {
        type: "step",
        number: 2,
        title: "현재 위치를 먼저 알려주세요",
        description:
          "역 이름, 출구 번호, 건물이나 가게 이름처럼 주변에서 바로 확인할 수 있는 위치를 알려주세요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-emergency-step2.jpg"),
      },
      {
        type: "step",
        number: 3,
        title: "상황을 짧게 설명해요",
        description:
          "무슨 일이 일어났는지, 사람이 다쳤는지, 지금 어떤 도움이 필요한지 짧게 말하면 돼요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-emergency-step3.jpg"),
      },
      {
        type: "phraseCards",
        title: "바로 쓸 수 있는 표현",
        phrases: [
          {
            ko: "도와주세요",
            romanized: "Do-wa-ju-se-yo",
            en: "Please help me",
          },
          {
            ko: "경찰을 불러주세요",
            romanized: "Gyeong-cha-reul bul-leo-ju-se-yo",
            en: "Please call the police",
          },
          {
            ko: "구급차를 불러주세요",
            romanized: "Gu-geup-cha-reul bul-leo-ju-se-yo",
            en: "Please call an ambulance",
          },
          {
            ko: "사람이 다쳤어요",
            romanized: "Sa-ra-mi da-chyeo-sseo-yo",
            en: "Someone is hurt",
          },
        ],
      },
    ],
    tip: {
      checklist: [
        "경찰 도움이 필요하면 112",
        "화재·구급·응급상황은 119",
        "신고할 때는 현재 위치부터 알려주세요",
      ],
    },
  },

  "safety-lost": {
    id: "safety-lost",
    category: "SAFETY",
    hero: require("@/assets/images/guides/safety-lost-hero.jpg"),
    title: "여권 · 휴대폰을 잃어버렸을 때",
    description:
      "여행 중 중요한 물건을 잃어버렸다면 당황하지 말고 하나씩 확인해보세요. 잃어버린 장소 확인부터 분실 신고까지 필요한 순서를 알려드릴게요.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "마지막으로 사용한 장소를 확인해요",
        description:
          "카페, 식당, 지하철, 버스처럼 마지막으로 물건을 사용한 장소부터 다시 확인해보세요. 이용한 시간과 장소를 기억하면 찾는 데 도움이 돼요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-lost-step1.jpg"),
      },
      {
        type: "step",
        number: 2,
        title: "주변에 먼저 문의해요",
        description:
          "역무실, 관광지 안내소, 가게 직원에게 먼저 물어보세요. 물건의 색상, 모양, 브랜드 같은 특징을 함께 설명하면 더 좋아요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-lost-step2.jpg"),
      },
      {
        type: "step",
        number: 3,
        title: "여권이라면 바로 신고해요",
        description:
          "여권을 잃어버렸다면 일반 분실물보다 빠르게 대응해야 해요. 경찰에 분실 신고를 하고, 본인 국가의 대사관·영사관에 연락해 다음 절차를 확인하세요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-lost-step3.jpg"),
      },
      {
        type: "iconFlow",
        steps: [
          {
            icon: {
              ios: "doc.viewfinder",
              android: "document_scanner",
              web: "document_scanner",
            },
            label: "여권 분실 확인",
          },
          {
            icon: { ios: "phone.fill", android: "call", web: "call" },
            label: "경찰 신고 (112)",
          },
          {
            icon: {
              ios: "building.columns.fill",
              android: "account_balance",
              web: "account_balance",
            },
            label: "대사관 연락",
          },
        ],
      },
      {
        type: "phraseCards",
        title: "바로 쓸 수 있는 표현",
        phrases: [
          {
            ko: "물건을 잃어버렸어요",
            romanized: "Mul-geon-eul il-eo-beo-ryeo-sseo-yo",
            en: "I lost something",
          },
          {
            ko: "휴대폰을 잃어버렸어요",
            romanized: "Hyu-dae-pon-eul il-eo-beo-ryeo-sseo-yo",
            en: "I lost my phone",
          },
          {
            ko: "여권을 잃어버렸어요",
            romanized: "Yeo-gwon-eul il-eo-beo-ryeo-sseo-yo",
            en: "I lost my passport",
          },
          {
            ko: "분실물 센터가 어디예요?",
            romanized: "Bun-sil-mul sen-teo-ga eo-di-ye-yo?",
            en: "Where is the lost and found?",
          },
        ],
      },
    ],
    tip: {
      checklist: [
        "마지막으로 사용한 장소부터 확인하기",
        "역무실 · 가게 · 관광지 안내소에 먼저 문의하기",
        "여권을 잃어버렸다면 경찰 신고와 대사관 확인하기",
      ],
    },
  },

  "safety-hospital": {
    id: "safety-hospital",
    category: "SAFETY",
    hero: require("@/assets/images/guides/safety-hospital-hero.jpg"),
    title: "여행 중 아플 때 병원 가는 방법",
    description:
      "한국 여행 중 갑자기 아프더라도 너무 당황하지 않아도 돼요. 병원 찾기부터 접수, 진료, 약 받기까지 순서대로 알아볼게요.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "가까운 병원을 찾아요",
        description:
          "현재 위치 주변에서 병원이나 의원을 찾아보세요. 방문 전에 진료시간과 운영 여부를 확인하면 더 편해요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-hospital-step1.jpg"),
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          { title: "검색 예시", description: "내과 · 병원 · 의원 · 클리닉" },
        ],
      },
      {
        type: "step",
        number: 2,
        title: "접수하고 증상을 설명해요",
        description:
          "병원에 도착하면 먼저 접수 데스크에서 진료를 신청해요. 어디가 아픈지, 언제부터 아팠는지 간단히 설명하면 돼요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-hospital-step2.jpg"),
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          { title: "접수", description: "데스크 접수" },
          { title: "대기", description: "순서 기다리기" },
          { title: "진료", description: "의사와 상담" },
        ],
      },
      {
        type: "step",
        number: 3,
        title: "처방전을 받고 약국으로 가요",
        description:
          "진료가 끝난 뒤 약이 필요하면 처방전을 받을 수 있어요. 처방전을 가지고 근처 약국에 가서 약을 받고, 복용 방법을 확인하세요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-hospital-step3.jpg"),
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          { title: "병원", description: "진료 완료" },
          { title: "처방전", description: "의사에게 수령" },
          { title: "약국", description: "근처 약국 방문" },
        ],
      },
      {
        type: "warning",
        text: "한국은 병원과 약국이 분리되어 있어요. 처방전을 꼭 챙기세요!",
      },
      {
        type: "phraseCards",
        title: "바로 쓸 수 있는 표현",
        phrases: [
          {
            ko: "배가 아파요",
            romanized: "Bae-ga a-pa-yo",
            en: "My stomach hurts",
          },
          {
            ko: "머리가 아파요",
            romanized: "Meo-ri-ga a-pa-yo",
            en: "I have a headache",
          },
          { ko: "열이 나요", romanized: "Yeol-i na-yo", en: "I have a fever" },
          {
            ko: "약국이 어디예요?",
            romanized: "Yak-guk-i eo-di-ye-yo?",
            en: "Where is the pharmacy?",
          },
        ],
      },
    ],
    tip: {
      checklist: [
        "가벼운 증상이라면 가까운 병원이나 의원을 찾아보세요",
        "병원 방문 전 운영시간을 확인하면 좋아요",
        "심한 부상이나 응급상황이라면 119에 연락하세요",
      ],
    },
  },

  "safety-hiking": {
    id: "safety-hiking",
    category: "SAFETY",
    hero: require("@/assets/images/guides/safety-hiking-hero.jpg"),
    title: "한국에서 등산할 때 알아둘 안전수칙",
    description:
      "한국에는 여행 중 가볍게 방문할 수 있는 산이 많지만, 코스와 날씨를 확인하지 않고 출발하면 예상보다 산행이 어려울 수 있어요. 출발 전 준비부터 길을 잃었을 때 대처하는 방법까지 알아볼게요.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "코스와 날씨를 확인하고 출발해요",
        description:
          "출발 전에 오늘의 날씨, 코스 난이도, 예상 소요시간을 확인하세요. 등산로가 통제 중인지, 해가 지기 전에 내려올 수 있는지도 함께 확인하면 좋아요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-hiking-step1.jpg"),
      },
      {
        type: "step",
        number: 2,
        title: "이정표를 확인하며 지정된 등산로로 이동해요",
        description:
          "산에서는 지름길처럼 보여도 표시되지 않은 길로 들어가지 마세요. 이동하면서 정상, 하산 방향, 탐방지원센터 방향이 적힌 이정표를 계속 확인해요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-hiking-step2.jpg"),
      },
      {
        type: "warning",
        text: "표시되지 않은 샛길·지름길은 위험해요. 반드시 지정된 등산로만 이용하세요.",
      },
      {
        type: "step",
        number: 3,
        title: "길을 잃거나 다쳤다면 위치를 확인하고 도움을 요청해요",
        description:
          "길을 잃었거나 다쳤다면 무리해서 계속 이동하지 말고 현재 위치를 먼저 확인하세요. 혼자 내려가기 어렵다면 119에 신고하고, 주변의 산악위치표지판 번호를 함께 알려주세요.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-hiking-step3.jpg"),
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          { title: "위치표지판", description: "주변 초록 표지판 번호 확인" },
          { title: "위치 파악", description: "표지판 번호 기억하기" },
          { title: "119 신고", description: "번호 + 상황 함께 알려주기" },
        ],
      },
      {
        type: "horiTipInline",
        title: "산악위치표지판 예시",
        body: "예: 북한산 12-나-07\n119 신고 시 이 번호를 알려주세요.",
      },
      {
        type: "phraseCards",
        title: "바로 쓸 수 있는 표현",
        phrases: [
          {
            ko: "길을 잃었어요",
            romanized: "Gi-reul il-eo-sseo-yo",
            en: "I'm lost",
          },
          {
            ko: "발목을 다쳤어요",
            romanized: "Bal-mok-eul da-chyeo-sseo-yo",
            en: "I hurt my ankle",
          },
          {
            ko: "내려가는 길이 어디예요?",
            romanized: "Nae-ryeo-ga-neun gi-ri eo-di-ye-yo?",
            en: "Which way is down?",
          },
          {
            ko: "119를 불러주세요",
            romanized: "Il-il-gu-reul bul-leo-ju-se-yo",
            en: "Please call 119",
          },
        ],
      },
    ],
    tip: {
      checklist: [
        "코스 난이도와 예상 소요시간을 먼저 확인하세요",
        "물과 보조배터리를 챙기고 지정된 등산로를 이용하세요",
        "길을 잃거나 다쳤다면 산악위치표지판을 확인하고 119에 도움을 요청하세요",
      ],
    },
  },
};

export const GUIDE_CONTENT_EN: Record<string, GuideContent> = {
  "subway-transfer": {
    id: "subway-transfer",
    category: "TRANSPORT",
    hero: require("@/assets/images/guides/subway-hero.jpg"),
    title: "How to Transfer Subway Lines",
    description:
      "It's easy if you just follow the signs.\nLearn how to check your line and direction when transferring.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "Find the transfer point",
        description:
          "After getting off the train, look for a **'갈아타는 곳 / Transfer'** sign. Just follow Transfer, not the exit.",
      },
      {
        type: "signCard",
        icon: require("@/assets/images/guides/subway-transfer-line-badge.svg"),
        title: "갈아타는 곳",
        translations: ["換乗", "乗り換え"],
        caption: "Example of a '갈아타는 곳 / Transfer' sign",
      },
      {
        type: "step",
        number: 2,
        title: "Follow the line number and color",
        description:
          "**Check the number and color of the line you need** on signs and floor markings. Transfer passages can be long at some stations.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/subway-step2-signage.jpg"),
      },
      {
        type: "step",
        number: 3,
        title: "Check the direction before boarding",
        description:
          "Even on the right line, you could board a train going the wrong way. **Check the platform for your direction and the next station.**",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/subway-step3-platform.jpg"),
      },
      {
        type: "phraseTable",
        title: "Common Subway Terms",
        phrases: [
          { ko: "갈아타는 곳", en: "Transfer" },
          { ko: "나가는 곳", en: "Way Out" },
          { ko: "○○ 방면", en: "Towards ○○" },
        ],
      },
    ],
    tip: {
      title: "Just remember this when transferring!",
      checklist: [
        "Find the Transfer sign",
        "Follow your transfer line",
        "Check the direction before boarding",
      ],
    },
  },

  "taxi-call": {
    id: "taxi-call",
    category: "TRANSPORT",
    hero: require("@/assets/images/guides/taxi-hero.jpg"),
    title: "How to Take a Taxi",
    description:
      "Booking through an app is easiest.\nEnter your destination in advance so you don't have to explain it to the driver.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "Book through an app",
        description:
          "Enter your pickup and drop-off locations and choose a car type. When the car arrives, **check the license plate before getting in.**",
      },
      {
        type: "iconFlow",
        steps: [
          {
            icon: {
              ios: "mappin.circle",
              android: "trip_origin",
              web: "trip_origin",
            },
            label: "Choose pickup",
          },
          {
            icon: { ios: "flag", android: "flag", web: "flag" },
            label: "Enter destination",
          },
          {
            icon: {
              ios: "car.fill",
              android: "directions_car",
              web: "directions_car",
            },
            label: "Choose a car",
          },
          {
            icon: { ios: "iphone", android: "smartphone", web: "smartphone" },
            label: "Request ride",
          },
        ],
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          {
            image: require("@/assets/images/guides/taxi-uber-icon.png"),
            title: "Uber Taxi",
            description: "Existing Uber users can\nbook with the same app",
          },
          {
            image: require("@/assets/images/guides/taxi-kride-icon.png"),
            title: "k.ride",
            description:
              "An app for foreign travelers,\nsupports overseas cards and multiple languages",
          },
        ],
      },
      {
        type: "image",
        source: require("@/assets/images/guides/taxi-step1-hail.jpg"),
      },
      {
        type: "warning",
        text: "Car types and estimated fares can differ by app. Check before you book.",
      },
      {
        type: "step",
        number: 2,
        title: "If hailing on the street",
        description:
          "**Hail a taxi with the '빈차 (Vacant)' sign lit** on the windshield. Use a safe curb or a taxi stand.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/taxi-step2-street.jpg"),
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          { title: "빈차", description: "Available to ride" },
          { title: "예약", description: "Reserved by another passenger" },
        ],
      },
      {
        type: "step",
        number: 3,
        title: "Tell the driver your destination",
        description:
          "If you hailed on the street, showing the **Korean place name or address** is the easiest way.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/taxi-step3-phone.jpg"),
      },
      {
        type: "warning",
        text: "If you booked through an app, your destination is already shared with the driver.",
      },
      {
        type: "step",
        number: 4,
        title: "Check the fare",
        description:
          "In a regular street taxi, **the fare shows on the meter** as you ride.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/taxi-step4-phone.jpg"),
      },
      {
        type: "warning",
        text: "The actual fare can vary depending on traffic, distance, time, and surcharges.",
      },
      { type: "step", number: 5, title: "Pay the fare", description: "" },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            icon: {
              ios: "creditcard.fill",
              android: "credit_card",
              web: "credit_card",
            },
            title: "Credit Card",
            description: "Visa, Mastercard, and other overseas cards accepted",
            orientation: "row",
          },
          {
            icon: {
              ios: "wonsign.circle.fill",
              android: "payments",
              web: "payments",
            },
            title: "Cash",
            description: "Korean won (KRW) only",
            orientation: "row",
          },
          {
            icon: {
              ios: "tram.fill",
              android: "directions_bus",
              web: "directions_bus",
            },
            title: "Transit Card",
            description: "Pay with a T-money card",
            orientation: "row",
          },
        ],
      },
      {
        type: "warning",
        text: "If you paid automatically through the app, don't pay the driver again.",
      },
      {
        type: "checklistCard",
        title: "Had a problem?",
        description: "Keeping this info makes it easier to report or get help.",
        items: ["License plate", "Receipt", "Time of ride"],
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            icon: { ios: "phone.fill", android: "call", web: "call" },
            title: "Seoul 120 Dasan Call Center",
            description: "Support available in foreign languages",
            orientation: "row",
            iconBackground: Palette.red100,
            iconTintColor: Palette.red300,
            iconBorderless: true,
          },
        ],
      },
    ],
    tip: {
      checklist: [
        "Late-night rides may have a surcharge.",
        "If you have a lot of luggage, check for a larger car or van option.",
        "You open and close the taxi door yourself.",
      ],
    },
  },

  "order-restaurant": {
    id: "order-restaurant",
    category: "ORDER",
    hero: require("@/assets/images/guides/order-restaurant-hero.jpg"),
    title: "How to Order at a Korean Restaurant",
    description:
      "Ordering methods vary a bit by restaurant in Korea.\nLearn the process step by step, from getting seated to ordering and paying.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "Tell them your party size and get seated",
        description:
          "When you enter, tell the staff how many people are in your group first. They may seat you or let you choose your own seat.",
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          { title: "한 명이에요", description: "I'm alone." },
          { title: "두 명이에요", description: "There are two of us." },
        ],
      },
      {
        type: "step",
        number: 2,
        title: "Check how to order",
        description:
          "Korean restaurants use various methods — ordering with staff, a call bell, tablet ordering, or ordering at the counter. Check the signs around your table and at the entrance first.",
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          {
            emoji: "🗣️",
            title: "Order with Staff",
            description: "Tell the staff your order",
          },
          {
            emoji: "🔔",
            title: "Call Bell",
            description: "Press the bell to call staff",
          },
        ],
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          {
            emoji: "📱",
            title: "Tablet Ordering",
            description: "Order from a screen at your table",
          },
          {
            emoji: "🏪",
            title: "Order Counter",
            description: "Order first, then take a seat",
          },
        ],
      },
      {
        type: "step",
        number: 3,
        title: "Check the menu and order quantity",
        description:
          "Check the menu and prices, then choose your quantity. Some dishes can only be ordered for two or more people.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/order-restaurant-step3.jpg"),
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          { title: "1 Serving", description: "A portion for one person." },
          {
            title: "2+ Servings",
            description: "Must be ordered for at least two people.",
          },
          {
            title: "One Dish per Person",
            description: "Each person must order at least one dish.",
          },
        ],
      },
      {
        type: "warning",
        text: "Dishes like meat, hot pots, and dakgalbi may require a minimum order of two servings.",
      },
      {
        type: "step",
        number: 4,
        title: "Check spice level and ingredients",
        description:
          "It can be hard to tell how spicy a dish is or what's in it just from the name. Ask the staff before you order.",
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          { title: "이거 매워요?", description: "Is this spicy?" },
          {
            title: "안 맵게 해 주세요",
            description: "Please make it less spicy.",
          },
          {
            title: "이 재료를 빼 주세요",
            description: "Please leave this ingredient out.",
          },
        ],
      },
      {
        type: "step",
        number: 5,
        title: "Check the self-service corner",
        description:
          "Some restaurants require you to get your own water, utensils, or side dishes. Look for a '셀프 (Self)' sign around your table or in the store.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/order-restaurant-step5.jpg"),
      },
      {
        type: "warning",
        text: "At some restaurants, utensils and tissues are in a drawer next to the table.",
      },
      {
        type: "step",
        number: 6,
        title: "Call staff if you need to order more",
        description:
          "To order more food or drinks, press the call bell or speak to a staff member.",
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          { title: "여기요", description: "Excuse me." },
          { title: "이거 하나 더 주세요", description: "One more, please." },
        ],
      },
      {
        type: "step",
        number: 7,
        title: "Pay when you finish your meal",
        description:
          "At most Korean restaurants, you pay at the counter after eating. Check first whether it uses table payment or requires payment in advance.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/order-restaurant-step7.jpg"),
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            icon: {
              ios: "creditcard.fill",
              android: "credit_card",
              web: "credit_card",
            },
            title: "Card Payment",
            description: "Pay with a domestic or international credit card",
            orientation: "row",
          },
          {
            icon: {
              ios: "wonsign.circle.fill",
              android: "payments",
              web: "payments",
            },
            title: "Cash Payment",
            description: "Pay directly with cash",
            orientation: "row",
          },
        ],
      },
    ],
    tip: {
      checklist: [
        "Tell them your party size first and get seated.",
        "Check how to order around your table.",
        "Check the minimum order quantity and spice level.",
        "Where you pay can vary by restaurant.",
      ],
    },
  },

  "order-waiting": {
    id: "order-waiting",
    category: "ORDER",
    hero: require("@/assets/images/guides/order-waiting-hero.jpg"),
    title: "How to Wait for a Table or Make a Reservation",
    description:
      "Popular restaurants may require a reservation or a wait-list registration.\nCheck how it works before you visit, and learn how to wait.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "Check the reservation method first",
        description:
          "Reservation and wait-list methods vary by restaurant. Check how it works on maps, the restaurant's official account, or a reservation service.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/order-waiting-step1.jpg"),
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          {
            emoji: "📅",
            title: "Advance Reservation",
            description: "Choose your visit date and time ahead of time",
          },
          {
            emoji: "🔢",
            title: "Walk-in Wait List",
            description: "Register for the wait list after arriving",
          },
        ],
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          {
            emoji: "📲",
            title: "Remote Wait List",
            description: "Join the wait list in advance through an app",
          },
          {
            emoji: "🚶",
            title: "Just Walk In",
            description: "Seated in order of arrival",
          },
        ],
      },
      {
        type: "step",
        number: 2,
        title: "Reserve a date and time",
        description:
          "If the restaurant takes reservations, choose your date, time, and party size. Some restaurants may require you to pre-select a menu or seat.",
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          { title: "Date", description: "Choose the date you want to visit." },
          { title: "Time", description: "Choose an available entry time." },
          {
            title: "Party Size",
            description:
              "Enter the total number of people, including children.",
          },
        ],
      },
      {
        type: "step",
        number: 3,
        title: "Join the wait list if reservations are unavailable",
        description:
          "If reservations are full or unavailable, you can register for the wait list in person.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/order-waiting-step3.jpg"),
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          {
            title: "Waiting Number",
            description: "Check your position and the teams ahead of you",
          },
          {
            title: "Estimated Time",
            description: "Check your estimated wait time",
          },
        ],
      },
      {
        type: "step",
        number: 4,
        title: "Watch for your call notification",
        description:
          "When your turn is near, you may be notified by text, app alert, or an in-store screen. Keep an eye on your phone so you don't miss the call.",
      },
      {
        type: "notificationCard",
        emoji: "🔔",
        title: "Wait List Alert",
        timestamp: "Just now",
        body: "Your table is almost ready.",
        bodySub: "Please return to the restaurant.",
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            title: "Text Alert",
            description: "You'll get a message when it's your turn.",
          },
          {
            title: "App Notification",
            description: "The reservation or wait-list app notifies you.",
          },
          {
            title: "Number Called",
            description: "Staff will call your number or name.",
          },
        ],
      },
      {
        type: "warning",
        text: "If you don't arrive within the given time after being called, your turn may be canceled.",
      },
      {
        type: "step",
        number: 5,
        title: "Show your screen when you arrive",
        description:
          "Arrive a little before your reservation time and show the staff your reservation or wait-list screen.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/order-waiting-step5.jpg"),
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          { title: "예약했어요", description: "I have a reservation." },
          { title: "웨이팅 등록했어요", description: "I joined the waitlist." },
        ],
      },
    ],
    tip: {
      checklist: [
        "Check whether reservations or a wait list are available first.",
        "Enter the date, time, and party size accurately.",
        "Make sure you don't miss your call notification.",
        "Cancel in advance if you're running late or can't make it.",
      ],
    },
  },

  "order-delivery": {
    id: "order-delivery",
    category: "ORDER",
    hero: require("@/assets/images/guides/order-delivery-hero.jpg"),
    title: "How to Order Food Delivery",
    description:
      "With the right address and delivery spot, you can order Korean food straight to your accommodation. Learn the process from choosing an app to receiving your food.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "Choose a delivery app",
        description:
          "In Korea, you can order food through apps like Baemin and Shuttle. Check for English support and available payment methods first.",
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          {
            image: require("@/assets/images/guides/order-delivery-baemin-icon.png"),
            title: "Baemin",
            description:
              "Multilingual support, a wide range of restaurants, Kakao Pay and card payment",
          },
          {
            image: require("@/assets/images/guides/order-delivery-shuttle-icon.png"),
            title: "Shuttle Delivery",
            description:
              "English support, overseas card payment, foreigner-friendly UI",
          },
        ],
      },
      {
        type: "step",
        number: 2,
        title: "Enter your address",
        description:
          "Set your current location in the app or enter your address manually. Be sure to include details like your building, unit number, or room number.",
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            title: "Home / Dorm",
            description: "Enter the building name and unit number accurately.",
          },
          {
            title: "Hotel / Guesthouse",
            description:
              "Provide the accommodation name, room number, and whether to pick up at the lobby.",
          },
          {
            title: "Park / Outdoors",
            description: "Choose an entrance or a designated delivery zone.",
          },
        ],
      },
      {
        type: "step",
        number: 3,
        title: "Choose your menu",
        description:
          "Pick a restaurant and menu items, then check the quantity and options.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/order-delivery-step3.jpg"),
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            title: "Minimum Order",
            description: "Your order must meet this amount.",
          },
          {
            title: "Delivery Fee",
            description: "The fee can vary by distance.",
          },
          {
            title: "Estimated Time",
            description: "How long delivery will take.",
          },
          {
            title: "Menu Options",
            description: "Check details like spice level and toppings.",
          },
        ],
      },
      {
        type: "step",
        number: 4,
        title: "Add a delivery request",
        description:
          "Choose your delivery method and add any requests. If a Korean phone call would be difficult, note that in advance in the memo field.",
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            title: "문 앞에 놓아 주세요",
            description: "Please leave it at the door.",
          },
          {
            title: "로비에서 받을게요",
            description: "I'll receive it in the lobby.",
          },
          {
            title: "도착하면 메시지 주세요",
            description: "Please message me when you arrive.",
          },
        ],
      },
      {
        type: "step",
        number: 5,
        title: "Confirm payment",
        description:
          "Choose a payment method, confirm the final amount, and complete your order.",
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            icon: {
              ios: "creditcard.fill",
              android: "credit_card",
              web: "credit_card",
            },
            title: "International Credit Card",
            description:
              "Pay with an international card like Visa or Mastercard.",
          },
          {
            icon: {
              ios: "creditcard.fill",
              android: "credit_card",
              web: "credit_card",
            },
            title: "Domestic Card",
            description: "Pay with a Korean credit or debit card.",
          },
          {
            icon: { ios: "bolt.fill", android: "bolt", web: "bolt" },
            title: "Simple Pay",
            description: "Use services like Kakao Pay or Naver Pay.",
          },
        ],
      },
      {
        type: "step",
        number: 6,
        title: "Track your order status",
        description:
          "You can track the driver's location and estimated arrival time in real time in the app.",
      },
      {
        type: "statusTracker",
        steps: [
          "Order Received",
          "Preparing Food",
          "Out for Delivery",
          "Almost There",
          "Delivered",
        ],
        activeIndex: 2,
      },
      {
        type: "warning",
        text: "Keep app notifications on so you don't miss a message or call from the driver.",
      },
      {
        type: "step",
        number: 7,
        title: "Receive your food",
        description:
          "When the driver arrives, receive it in person or from the designated spot. Check that the food and quantity are correct right away.",
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          { title: "지금 로비에 있어요", description: "I'm in the lobby now." },
          {
            title: "입구 앞에서 기다리고 있어요",
            description: "I'm waiting at the entrance.",
          },
          {
            title: "제가 주문한 사람이에요",
            description: "I'm the person who placed the order.",
          },
        ],
      },
    ],
    tip: {
      checklist: [
        "Check whether the app is available to you.",
        "Enter your address and details accurately.",
        "Check the minimum order amount and delivery fee.",
        "Keep an eye on notifications until your food arrives.",
      ],
    },
  },

  "order-kiosk": {
    id: "order-kiosk",
    category: "ORDER",
    hero: require("@/assets/images/guides/order-kiosk-hero.jpg"),
    title: "How to Order at a Kiosk",
    description:
      "At cafes, fast food restaurants, and food courts in Korea,\nyou'll often order at a kiosk instead of with staff.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "Check the language first",
        description: "",
      },
      {
        type: "iconFlowCard",
        title: "Order Flow",
        description: "",
        steps: [
          {
            icon: { ios: "globe", android: "language", web: "language" },
            label: "Choose Language",
          },
          {
            icon: {
              ios: "bag.fill",
              android: "shopping_bag",
              web: "shopping_bag",
            },
            label: "Dine In / Take Out",
          },
          {
            icon: {
              ios: "list.bullet",
              android: "menu_book",
              web: "menu_book",
            },
            label: "Choose Menu",
          },
          {
            icon: {
              ios: "creditcard.fill",
              android: "credit_card",
              web: "credit_card",
            },
            label: "Pay",
          },
        ],
      },
      {
        type: "warning",
        text: "Check whether the kiosk screen has a language button first. Some stores support English, Chinese, and Japanese.",
      },
      {
        type: "step",
        number: 2,
        title: "Choose your menu",
        description:
          "Pick what you want and check the quantity. Menus are often organized by category.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/order-kiosk-step2.jpg"),
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          { title: "Set Menu", description: "Includes a drink or side" },
          { title: "À La Carte", description: "Order just the main item" },
        ],
      },
      {
        type: "step",
        number: 3,
        title: "Review your order before paying",
        description:
          "Check that the items and quantities in your cart are correct, then pay.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/order-kiosk-step3.jpg"),
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            icon: {
              ios: "creditcard.fill",
              android: "credit_card",
              web: "credit_card",
            },
            title: "Card Payment",
            description: "Insert or tap your card to pay",
          },
          {
            icon: { ios: "iphone", android: "smartphone", web: "smartphone" },
            title: "Mobile Payment",
            description: "Pay with your phone if supported",
          },
        ],
      },
      {
        type: "warning",
        text: "Many kiosks don't accept cash. Card payment is the most common option.",
      },
      {
        type: "step",
        number: 4,
        title: "Check your order number and wait",
        description:
          "After paying, you'll get an order number, and you'll usually be called by screen, receipt, or a buzzer.",
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          {
            title: "Check Order Number",
            description: "Screen / Receipt / Buzzer",
          },
          {
            title: "Pick Up at the Counter",
            description: "Check the pickup area",
          },
        ],
      },
    ],
    tip: {
      checklist: [
        "Check whether there's a language button first",
        "Decide dine-in or takeout first",
        "Check the menu, options, and extra charges",
        "Check your order number after paying",
        "Watch for the screen or buzzer call",
      ],
    },
  },

  "intercity-bus": {
    id: "intercity-bus",
    category: "TRANSPORT",
    hero: require("@/assets/images/guides/bus-hero.jpg"),
    title: "How to Take an Intercity Bus",
    description:
      "You can reach places trains don't go by bus.\nIt's easy as long as you check the right terminal and boarding gate.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "Buy a ticket",
        description:
          "Enter your departure and destination, then choose your preferred bus. When it arrives, **check the bus number before boarding.**",
      },
      {
        type: "iconFlowCard",
        title: "Buying at the Terminal",
        description:
          "You can buy a ticket at the ticket window or a self-service kiosk. Follow the steps below.",
        steps: [
          {
            icon: {
              ios: "mappin.circle",
              android: "trip_origin",
              web: "trip_origin",
            },
            label: "Choose Departure",
          },
          {
            icon: { ios: "flag", android: "flag", web: "flag" },
            label: "Choose Destination",
          },
          {
            icon: { ios: "clock", android: "schedule", web: "schedule" },
            label: "Choose Time",
          },
          {
            icon: {
              ios: "figure.seated.side",
              android: "event_seat",
              web: "event_seat",
            },
            label: "Choose Seat",
          },
        ],
      },
      {
        type: "image",
        source: require("@/assets/images/guides/bus-step1-terminal.jpg"),
      },
      {
        type: "checklistCard",
        title: "If you want to book in advance",
        description:
          "You can also book online in advance. Available services vary by route and payment method, so check whether overseas card payment and mobile tickets are supported.",
        items: [
          "Book online (e.g. GoHanpass)",
          "Check whether overseas cards are accepted",
          "Check whether mobile tickets are supported",
        ],
      },
      {
        type: "step",
        number: 2,
        title: "Check the exact terminal",
        description:
          "A city can have more than one bus terminal. Don't just look at the city name — **check the exact terminal name.**",
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          {
            emoji: "📍",
            title: "Dong Seoul Terminal",
            description: "Near Gangbyeon Station",
          },
          {
            emoji: "📍",
            title: "Seoul Express Bus Terminal",
            description: "Near Express Bus Terminal Station",
          },
        ],
      },
      {
        type: "warning",
        text: "Be sure to check the departure and arrival terminals printed on your ticket!",
      },
      {
        type: "step",
        number: 3,
        title: "Find your boarding gate",
        description:
          "Check the departure time, destination, and gate number on your ticket, then find your bus on the display board.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/bus-step3-board.jpg"),
      },
      {
        type: "warning",
        text: "Arrive near your boarding gate 10–15 minutes before departure.",
      },
      {
        type: "step",
        number: 4,
        title: "Show your ticket and board",
        description:
          "If you have a mobile ticket, board after your QR code is scanned.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/bus-step4-ticket.jpg"),
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            icon: { ios: "iphone", android: "smartphone", web: "smartphone" },
            title: "Mobile Ticket",
            description: "Scan your QR code at the ticket reader",
            orientation: "row",
          },
          {
            icon: {
              ios: "ticket.fill",
              android: "confirmation_number",
              web: "confirmation_number",
            },
            title: "Paper Ticket",
            description: "Bring your ticket to board the bus",
            orientation: "row",
          },
        ],
      },
      {
        type: "warning",
        text: "Depending on how you booked, you may need to pick up a paper ticket at the terminal.",
      },
      {
        type: "step",
        number: 5,
        title: "Check where to get off",
        description:
          "Intercity buses may stop at other terminals or stations on the way to your destination.",
      },
      {
        type: "routeStops",
        caption: "Example route",
        stops: [
          { badge: "A", label: "Stop A", sublabel: "Regular stop" },
          { badge: "B", label: "Stop B", sublabel: "Intermediate stop" },
          {
            badge: "C",
            label: "Stop C",
            sublabel: "Your destination",
            highlighted: true,
          },
        ],
      },
      {
        type: "warning",
        text: "Don't get off just because the bus stops — check that it's your booked destination first.",
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            emoji: "🧳",
            title: "Have luggage?",
            description:
              "Large suitcases or bags can go in the storage compartment under the bus. Be sure not to forget them when you get off.",
          },
        ],
      },
    ],
    tip: {
      checklist: [
        "Check the exact terminal",
        "Check your boarding gate and departure time",
        "Check your stop",
      ],
    },
  },

  "safety-emergency": {
    id: "safety-emergency",
    category: "SAFETY",
    hero: require("@/assets/images/guides/safety-emergency-hero.jpg"),
    title: "How to Get Help in an Emergency",
    description:
      "In an emergency, knowing which number to call matters most. Learn the difference between 112 and 119, and what information you need to give.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "Know the difference between 112 and 119",
        description:
          "Call 112 for crimes or threats that need police help. Call 119 for injuries, someone collapsing, or a fire.",
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          {
            color: "#154FA9",
            title: "112 | Police",
            description: "Crime, threats, theft",
          },
          {
            color: "#E23A29",
            title: "119 | Fire & Ambulance",
            description: "Injury, fire, emergencies",
          },
        ],
      },
      {
        type: "step",
        number: 2,
        title: "Give your location first",
        description:
          "Give a location that can be found right away — a station name, exit number, or a nearby building or shop name.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-emergency-step2.jpg"),
      },
      {
        type: "step",
        number: 3,
        title: "Briefly explain the situation",
        description:
          "Briefly say what happened, whether anyone is hurt, and what kind of help you need.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-emergency-step3.jpg"),
      },
      {
        type: "phraseCards",
        title: "Useful Phrases",
        phrases: [
          {
            ko: "도와주세요",
            romanized: "Do-wa-ju-se-yo",
            en: "Please help me",
          },
          {
            ko: "경찰을 불러주세요",
            romanized: "Gyeong-cha-reul bul-leo-ju-se-yo",
            en: "Please call the police",
          },
          {
            ko: "구급차를 불러주세요",
            romanized: "Gu-geup-cha-reul bul-leo-ju-se-yo",
            en: "Please call an ambulance",
          },
          {
            ko: "사람이 다쳤어요",
            romanized: "Sa-ra-mi da-chyeo-sseo-yo",
            en: "Someone is hurt",
          },
        ],
      },
    ],
    tip: {
      checklist: [
        "Call 112 for police help",
        "Call 119 for fire, ambulance, or emergencies",
        "Give your location first when you call",
      ],
    },
  },

  "safety-lost": {
    id: "safety-lost",
    category: "SAFETY",
    hero: require("@/assets/images/guides/safety-lost-hero.jpg"),
    title: "If You Lose Your Passport or Phone",
    description:
      "If you lose something important while traveling, stay calm and check things step by step. Here's what to do, from checking where you lost it to reporting the loss.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "Check the Last Place You Used It",
        description:
          "Start by checking the last place you used it, such as a café, restaurant, subway, or bus. Remembering when and where you last used it can help you find it.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-lost-step1.jpg"),
      },
      {
        type: "step",
        number: 2,
        title: "Ask Nearby Staff First",
        description:
          "Ask station staff, tourist information staff, or store employees if they have found it. Describe details such as its color, shape, or brand to help identify it.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-lost-step2.jpg"),
      },
      {
        type: "step",
        number: 3,
        title: "Report a Lost Passport Immediately",
        description:
          "If you lose your passport, you should act quickly. Report the loss to the police, then contact your country's embassy or consulate for the next steps.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-lost-step3.jpg"),
      },
      {
        type: "iconFlow",
        steps: [
          {
            icon: {
              ios: "doc.viewfinder",
              android: "document_scanner",
              web: "document_scanner",
            },
            label: "Lost Passport",
          },
          {
            icon: { ios: "phone.fill", android: "call", web: "call" },
            label: "Report to Police (112)",
          },
          {
            icon: {
              ios: "building.columns.fill",
              android: "account_balance",
              web: "account_balance",
            },
            label: "Contact Your Embassy",
          },
        ],
      },
      {
        type: "phraseCards",
        title: "Useful Phrases",
        phrases: [
          {
            ko: "물건을 잃어버렸어요",
            romanized: "Mul-geon-eul il-eo-beo-ryeo-sseo-yo",
            en: "I lost something",
          },
          {
            ko: "휴대폰을 잃어버렸어요",
            romanized: "Hyu-dae-pon-eul il-eo-beo-ryeo-sseo-yo",
            en: "I lost my phone",
          },
          {
            ko: "여권을 잃어버렸어요",
            romanized: "Yeo-gwon-eul il-eo-beo-ryeo-sseo-yo",
            en: "I lost my passport",
          },
          {
            ko: "분실물 센터가 어디예요?",
            romanized: "Bun-sil-mul sen-teo-ga eo-di-ye-yo?",
            en: "Where is the lost and found?",
          },
        ],
      },
    ],
    tip: {
      checklist: [
        "Check the last place you used it.",
        "Ask station staff, store employees, or tourist information staff first.",
        "If you lose your passport, report it to the police and contact your embassy.",
      ],
    },
  },

  "safety-hospital": {
    id: "safety-hospital",
    category: "SAFETY",
    hero: require("@/assets/images/guides/safety-hospital-hero.jpg"),
    title: "How to See a Doctor If You Get Sick While Traveling",
    description:
      "Don't panic if you suddenly get sick while traveling in Korea. Here's the process, from finding a clinic to check-in, treatment, and getting medicine.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "Find a nearby clinic",
        description:
          "Look for a hospital or clinic near your current location. It's easier if you check the hours and whether it's open before you go.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-hospital-step1.jpg"),
      },
      {
        type: "cardList",
        layout: "column",
        cards: [
          {
            title: "Search Examples",
            description: "Internal medicine · Hospital · Clinic",
          },
        ],
      },
      {
        type: "step",
        number: 2,
        title: "Check in and describe your symptoms",
        description:
          "When you arrive, check in at the front desk first. Briefly explain what hurts and since when.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-hospital-step2.jpg"),
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          { title: "Check-in", description: "Register at the desk" },
          { title: "Wait", description: "Wait your turn" },
          { title: "Consultation", description: "See the doctor" },
        ],
      },
      {
        type: "step",
        number: 3,
        title: "Get a prescription and go to the pharmacy",
        description:
          "After the consultation, you can get a prescription if you need medicine. Take it to a nearby pharmacy, get your medicine, and check how to take it.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-hospital-step3.jpg"),
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          { title: "Clinic", description: "Consultation complete" },
          { title: "Prescription", description: "Given by the doctor" },
          { title: "Pharmacy", description: "Visit a nearby pharmacy" },
        ],
      },
      {
        type: "warning",
        text: "Hospitals and pharmacies are separate in Korea. Be sure to keep your prescription!",
      },
      {
        type: "phraseCards",
        title: "Useful Phrases",
        phrases: [
          {
            ko: "배가 아파요",
            romanized: "Bae-ga a-pa-yo",
            en: "My stomach hurts",
          },
          {
            ko: "머리가 아파요",
            romanized: "Meo-ri-ga a-pa-yo",
            en: "I have a headache",
          },
          { ko: "열이 나요", romanized: "Yeol-i na-yo", en: "I have a fever" },
          {
            ko: "약국이 어디예요?",
            romanized: "Yak-guk-i eo-di-ye-yo?",
            en: "Where is the pharmacy?",
          },
        ],
      },
    ],
    tip: {
      checklist: [
        "For mild symptoms, look for a nearby hospital or clinic",
        "It helps to check the hours before you visit",
        "For serious injuries or emergencies, call 119",
      ],
    },
  },

  "safety-hiking": {
    id: "safety-hiking",
    category: "SAFETY",
    hero: require("@/assets/images/guides/safety-hiking-hero.jpg"),
    title: "Safety Tips for Hiking in Korea",
    description:
      "Korea has many mountains you can easily visit while traveling, but skipping the course and weather check can make the hike harder than expected. Here's what to know, from preparing beforehand to what to do if you get lost.",
    blocks: [
      {
        type: "step",
        number: 1,
        title: "Check the course and weather before you go",
        description:
          "Before setting out, check today's weather, the course difficulty, and the estimated time. It also helps to check whether the trail is closed and whether you can get back down before dark.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-hiking-step1.jpg"),
      },
      {
        type: "step",
        number: 2,
        title: "Follow marked trails and check signposts",
        description:
          "Never take an unmarked path, even if it looks like a shortcut. As you hike, keep checking signposts marked with the summit, descent direction, and visitor center.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-hiking-step2.jpg"),
      },
      {
        type: "warning",
        text: "Unmarked side trails and shortcuts are dangerous. Always stick to designated trails.",
      },
      {
        type: "step",
        number: 3,
        title: "If lost or injured, check your location and call for help",
        description:
          "If you're lost or hurt, don't push forward — check your current location first. If you can't get down on your own, call 119 and give them the nearby mountain location marker number.",
      },
      {
        type: "image",
        source: require("@/assets/images/guides/safety-hiking-step3.jpg"),
      },
      {
        type: "cardList",
        layout: "row",
        cards: [
          {
            title: "Location Marker",
            description: "Check the nearby green marker number",
          },
          {
            title: "Know Your Location",
            description: "Remember the marker number",
          },
          {
            title: "Call 119",
            description: "Give the number and describe the situation",
          },
        ],
      },
      {
        type: "horiTipInline",
        title: "Example of a mountain location marker",
        body: "e.g. Bukhansan 12-Na-07\nGive this number when you call 119.",
      },
      {
        type: "phraseCards",
        title: "Useful Phrases",
        phrases: [
          {
            ko: "길을 잃었어요",
            romanized: "Gi-reul il-eo-sseo-yo",
            en: "I'm lost",
          },
          {
            ko: "발목을 다쳤어요",
            romanized: "Bal-mok-eul da-chyeo-sseo-yo",
            en: "I hurt my ankle",
          },
          {
            ko: "내려가는 길이 어디예요?",
            romanized: "Nae-ryeo-ga-neun gi-ri eo-di-ye-yo?",
            en: "Which way is down?",
          },
          {
            ko: "119를 불러주세요",
            romanized: "Il-il-gu-reul bul-leo-ju-se-yo",
            en: "Please call 119",
          },
        ],
      },
    ],
    tip: {
      checklist: [
        "Check the course difficulty and estimated time first",
        "Bring water and a portable charger, and stick to designated trails",
        "If lost or hurt, check the mountain location marker and call 119 for help",
      ],
    },
  },
};
