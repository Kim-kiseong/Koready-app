export type KtxInfoIconKind = 'calendar' | 'globe' | 'warning';

export const KTX_INTRO = {
  hero: require("@/assets/images/guides/ktx-intro-hero.jpg"),
  title: "KTX 쉽게 예매하기",
  description:
    "서울에서 부산, 경주, 강릉, 전주, 여수까지!\nKTX를 타고 한국 로컬 여행을 떠나보세요.",
  infoRows: [
    {
      icon: "calendar" as const,
      label: "예매 시작",
      value: "출발 1개월 전 오전 7시부터",
    },
    {
      icon: "globe" as const,
      label: "예매 채널",
      value: "KORAIL 공식 웹사이트 / Korail+ 앱",
    },
    {
      icon: "warning" as const,
      label: "주의 사항",
      value: "KTX와 SRT는 예매 사이트가 달라요!",
    },
  ],
};

export type KtxStep = {
  id: number;
  title: string;
  description: string;
};

export const KTX_STEPS: KtxStep[] = [
  {
    id: 1,
    title: "KORAIL 공식 웹사이트 또는 Korail+ 앱 열기",
    description: "공식 채널을 이용해야 수수료 없이 예매할 수 있어요.",
  },
  {
    id: 2,
    title: "언어 선택하기",
    description: "영어, 일본어, 중국어 등 다국어를 지원해요.",
  },
  {
    id: 3,
    title: "출발역과 도착역 입력하기",
    description: "역 이름을 정확히 확인하세요. \n예: 신경주역, 여수엑스포역",
  },
  {
    id: 4,
    title: "날짜와 시간 선택하기",
    description: "출발 1개월 전 오전 7시부터 예매 가능해요.",
  },
  {
    id: 5,
    title: "인원과 좌석 선택하기",
    description: "좌석 방향과 좌석 종류를 선택할 수 있어요.",
  },
  {
    id: 6,
    title: "승객 정보 입력하기",
    description: "여권 이름과 동일하게 입력하고 \n이메일을 정확히 적어주세요.",
  },
  {
    id: 7,
    title: "결제하기",
    description: "해외카드 결제가 안 될 경우 다른 방법을 확인하세요.",
  },
  {
    id: 8,
    title: "My Ticket에서 확인하기",
    description: "예매 내역을 확인하고 티켓을 캡처해 두세요.",
  },
  {
    id: 9,
    title: "역에서 탑승하기",
    description: "출발 시간과 승강장을 미리 확인하세요.",
  },
  {
    id: 10,
    title: "일정 변경 / 취소하기",
    description: "출발 전 온라인으로 취소하면 수수료가 적어요.",
  },
];

export const KTX_LIST_WARNING =
  "KTX와 SRT는 예매 사이트가 다릅니다. 해당 가이드는 \nKTX(코레일) 기준이에요.";

export const KTX_INTRO_EN = {
  hero: require("@/assets/images/guides/ktx-intro-hero.jpg"),
  title: "Book KTX Tickets Easily",
  description:
    "From Seoul to Busan, Gyeongju, Gangneung, Jeonju, and Yeosu! Take the KTX and explore local destinations across Korea.",
  infoRows: [
    {
      icon: "calendar" as const,
      label: "Booking Opens",
      value: "From 7:00 AM, one month before departure",
    },
    {
      icon: "globe" as const,
      label: "Where to Book",
      value: "KORAIL Official Website / Korail+ App",
    },
    {
      icon: "warning" as const,
      label: "Good to Know",
      value: "KTX and SRT use different booking websites!",
    },
  ],
};

export const KTX_STEPS_EN: KtxStep[] = [
  {
    id: 1,
    title: "Open the KORAIL Website or the Korail+ App",
    description: "Use an official channel to book without\nextra fees.",
  },
  {
    id: 2,
    title: "Select Your Language",
    description: "English, Japanese, Chinese, and other\nlanguages are available.",
  },
  {
    id: 3,
    title: "Enter Your Departure and Arrival Stations",
    description: "Check the exact station name. e.g.,\nSingyeongju Station, Yeosu Expo Station",
  },
  {
    id: 4,
    title: "Select the Date and Time",
    description: "Tickets are available from 7:00 AM, one\nmonth before departure.",
  },
  {
    id: 5,
    title: "Select Passengers and Seats",
    description: "You can choose your seat type and direction.",
  },
  {
    id: 6,
    title: "Enter Passenger Information",
    description:
      "Enter your name exactly as it appears on your\npassport and provide a valid email address.",
  },
  {
    id: 7,
    title: "Make Payment",
    description: "If your international card doesn't work, try\nanother payment method.",
  },
  {
    id: 8,
    title: "Check Your Ticket in My Ticket",
    description: "Check your booking details and save a\nscreenshot of your ticket.",
  },
  {
    id: 9,
    title: "Board at the Station",
    description: "Check your departure time and platform in\nadvance.",
  },
  {
    id: 10,
    title: "Change or Cancel Your Trip",
    description: "Cancellation fees are usually lower if you\ncancel online before departure.",
  },
];

export const KTX_LIST_WARNING_EN =
  "KTX and SRT have different booking websites.\nThis guide is based on KTX (KORAIL).";

export const KTX_STEP3_DETAIL_EN = {
  title: "Step 3. Enter Departure & Arrival Stations",
  note:
    "The KTX station name may be different from your destination name.\nMake sure to enter the correct station name.",
  screenshot: require("@/assets/images/guides/ktx-step3-korail-en.jpg"),
  screenshotCaption: "Actual KorailTalk App Screen",
  tipBody:
    'For a trip to Gyeongju, you may need to search for **"Singyeongju"** instead of **"Gyeongju"**!',
  stationColumns: [
    {
      label: "Main Stations in Seoul",
      dotColor: "#3B82F6",
      items: [
        "Seoul Station (서울역)",
        "Yongsan Station (용산역)",
        "Cheongnyangni Station (청량리역)",
      ],
    },
    {
      label: "Popular Destination Stations",
      dotColor: "#4FAE98",
      items: [
        "Busan (부산역)",
        "Singyeongju (신경주역)",
        "Gangneung (강릉역)",
        "Jeonju (전주역)",
      ],
    },
  ],
  checklistTitle: "Check Before Boarding",
  checklistColumns: [
    ["Train Number", "Car Number", "Seat Number"],
    ["Platform Number", "Departure Time"],
  ],
};

export const KTX_STEP3_DETAIL = {
  title: "Step 3. 출발역과 도착역 입력하기",
  note: "관광지 이름과 KTX역 이름이 다를 수 있어요.\n정확한 역 이름을 입력해야 해요.",
  screenshot: require("@/assets/images/guides/ktx-step3-korail.jpg"),
  screenshotCaption: "실제 코레일+ 앱 화면",
  tipBody:
    '경주 여행은 **"Gyeongju"가 아니라 "Singyeongju"**를 검색해야 하는 경우가 \n 많아요!',
  stationColumns: [
    {
      label: "서울 대표 출발역",
      dotColor: "#3B82F6",
      items: [
        "Seoul Station (서울역)",
        "Yongsan Station (용산역)",
        "Cheongnyangni Station (청량리역)",
      ],
    },
    {
      label: "대표 도착역",
      dotColor: "#4FAE98",
      items: [
        "Busan (부산역)",
        "Singyeongju (신경주역)",
        "Gangneung (강릉역)",
        "Jeonju (전주역)",
      ],
    },
  ],
  checklistTitle: "역에서 탑승할 때 확인할 것",
  checklistColumns: [
    ["열차 번호", "객차 번호", "좌석 번호"],
    ["승강장 번호", "출발 시간"],
  ],
};
