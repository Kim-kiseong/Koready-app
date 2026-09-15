import type {
  EventDateFilterId,
  EventRegionId,
  FeaturedEventCategory,
  GuideCategoryId,
} from "@/api/home";
import type { TravelStyleId } from "@/api/onboarding";
import type { LanguageCode } from "@/api/types";

export interface Translations {
  login: {
    googleButton: string;
    appleButton: string;
  };
  language: {
    title: string;
    subtitle: string;
    next: string;
  };
  location: {
    title: string;
    headline: string;
    headlineSubtitle: string;
    searchPlaceholder: string;
    roadAddressBadge: string;
    lotNumberBadge: string;
    next: string;
    alerts: {
      errorTitle: string;
      mapServiceError: string;
      searchResultExpired: string;
      saveFailed: string;
    };
  };
  travelStyle: {
    title: string;
    subtitle: string;
    next: string;
    options: Record<TravelStyleId, string>;
    alerts: {
      noticeTitle: string;
      maxSelection: string;
    };
  };
  destination: {
    title: string;
    subtitle: string;
    next: string;
    loadingText: string;
    errorText: string;
    retryButton: string;
  };
  complete: {
    title: string;
    subtitle: string;
    next: string;
    alerts: {
      errorTitle: string;
      noticeTitle: string;
      genericFailed: string;
      alreadyCompletedOther: string;
      resumeCheckFailed: string;
      invalidLocation: string;
      invalidTravelStyles: string;
      invalidCandidateSet: string;
      invalidSelection: string;
      incompleteSelection: string;
    };
  };
  home: {
    locationPlaceholder: string;
    searchPlaceholder: string;
    featuredTitlePrefix: string;
    featuredTitleConnector: string;
    featuredTitleSuffix: string;
    guidesSectionTitle: string;
    seeAll: string;
    languageKo: string;
    languageEn: string;
    categories: Record<FeaturedEventCategory, string>;
  };
  map: {
    title: string;
    instruction: string;
    regionLabels: Record<
      | "seoul"
      | "gyeonggi"
      | "gangwon"
      | "chungcheong"
      | "jeolla"
      | "gyeongsang"
      | "jeju",
      string
    >;
    countPrefix: string;
    countSuffix: string;
    sortRecommended: string;
    sortDeadline: string;
    loading: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  placeSearch: {
    emptyTitle: string;
  };
  nav: {
    home: string;
    map: string;
    picks: string;
    saved: string;
    my: string;
  };
  settings: {
    title: string;
    sections: {
      preferences: string;
      serviceInfo: string;
      account: string;
    };
    rows: {
      language: string;
      termsOfService: string;
      privacyPolicy: string;
      appVersion: string;
      logOut: string;
      deleteAccount: string;
    };
    languageValues: Record<LanguageCode, string>;
    actions: {
      logoutConfirmTitle: string;
      withdrawConfirmTitle: string;
      withdrawConfirmBody: string;
      logoutConfirmButton: string;
      withdrawConfirmButton: string;
      cancel: string;
    };
    alerts: {
      errorTitle: string;
      logoutFailed: string;
      withdrawComingSoonTitle: string;
      withdrawComingSoonBody: string;
    };
  };
  my: {
    title: string;
    profileBadgePublic: string;
    profileBadgePrivate: string;
    editProfile: string;
    languageLabels: Record<string, string>;
    koreanLevelLabels: Record<string, string>;
    shortcuts: {
      messages: string;
      addresses: string;
    };
    error: {
      title: string;
      retry: string;
      description: string;
    };
    languageFallback: string;
    emptyProfileSetup: {
      title: string;
      description: string;
      button: string;
    };
  };
  settingsLanguage: {
    title: string;
    subtitle: string;
    options: Record<LanguageCode, { title: string; subtitle: string }>;
    done: string;
    unsavedChangesMessage: string;
    cancel: string;
    leave: string;
    errorTitle: string;
    errorMessage: string;
  };
  profileEdit: {
    titleSetup: string;
    titleEdit: string;
    loadErrorTitle: string;
    retry: string;
    alerts: {
      errorTitle: string;
      infoTitle: string;
      travelStyleMin: string;
      travelStyleMax: string;
      photoPermissionTitle: string;
      photoPermissionBody: string;
      unsupportedTypeTitle: string;
      unsupportedTypeBody: string;
      unreadableFileTitle: string;
      unreadableFileBody: string;
      fileTooLargeTitle: string;
      fileTooLargeBody: string;
    };
    errors: {
      generic: string;
      uploadFailed: string;
      uploadUrl: string;
      imageId: string;
      loadOptions: string;
    };
    sections: {
      profilePhoto: string;
      nickname: string;
      nationality: string;
      languages: string;
      koreanLevel: string;
      bio: string;
      travelStyles: {
        title: string;
        subtitle: string;
      };
      socialAccounts: {
        title: string;
        subtitle: string;
      };
      contactSettings: string;
    };
    placeholders: {
      nickname: string;
      nationality: string;
      bio: string;
      snsId: string;
    };
    buttons: {
      done: string;
      addSocialAccount: string;
      cancel: string;
      save: string;
    };
    toggles: {
      profilePublic: string;
      snsPublic: string;
      allowsMessages: string;
    };
    modals: {
      country: {
        title: string;
        subtitle: string;
        confirm: string;
        searchPlaceholder: string;
      };
      language: {
        title: string;
        subtitle: string;
        confirm: string;
        searchPlaceholder: string;
      };
      searchNoResults: string;
      unsavedChanges: {
        message: string;
        cancel: string;
        confirm: string;
      };
      avatar: {
        selectPhoto: string;
        deletePhoto: string;
        cancel: string;
      };
      sns: {
        title: string;
        platformsTitle: string;
        platformsSubtitle: string;
        idsTitle: string;
        idsSubtitle: string;
        inputPlaceholder: string;
        cancel: string;
        save: string;
      };
    };
  };
  guideList: {
    title: string;
    description: Record<GuideCategoryId, string>;
    categories: Record<GuideCategoryId, string>;
  };
  guideDetail: {
    categoryBadge: Record<GuideCategoryId, string>;
    startButton: string;
    stepListTitle: string;
    totalStepsPrefix: string;
    totalStepsSuffix: string;
    resumeStepPrefix: string;
    resumeStepSuffix: string;
    stepComingSoonTitle: string;
    stepComingSoonBody: string;
  };
  languageGuide: {
    relatedTitle: string;
    previous: string;
    next: string;
    close: string;
  };
  languageModal: {
    title: Record<LanguageCode, string>;
    subtitle: Record<LanguageCode, string>;
    cancel: string;
    confirm: string;
  };
  address: {
    title: string;
    searchPlaceholder: string;
    currentAddressBadge: string;
    alerts: {
      errorTitle: string;
      locationMissing: string;
      setDefaultFailed: string;
    };
  };
  addressSearch: {
    title: string;
    alerts: {
      errorTitle: string;
      mapServiceError: string;
      searchResultExpired: string;
      saveFailed: string;
    };
  };
  addressEdit: {
    title: string;
    delete: string;
    alerts: {
      errorTitle: string;
      deleteFailed: string;
      refreshFailed: string;
    };
  };
  deleteAddressModal: {
    suffix: string;
    cancel: string;
    confirm: string;
  };
  eventList: {
    titleSuffix: string;
    total: string;
    countUnit: string;
    sortTitle: string;
    sortRecommended: string;
    sortDeadline: string;
  };
  eventFilter: {
    title: string;
    reset: string;
    regionLabel: string;
    regionAll: string;
    regionOptions: Record<EventRegionId, string>;
    dateLabel: string;
    dateAll: string;
    dateOptions: Record<EventDateFilterId, string>;
    dateCustomButton: string;
    typeLabel: string;
    typeOptions: Record<TravelStyleId, string>;
    cancel: string;
    apply: string;
  };
  dateRangePicker: {
    title: string;
    reset: string;
    cancel: string;
    apply: string;
  };
  saved: {
    title: string;
    loading: string;
    emptyTitle: string;
    emptyDescription: string;
    sortTitle: string;
    sortOptions: {
      savedAt: string;
      deadline: string;
    };
  };
  placeDetail: {
    loading: string;
    tabs: {
      description: string;
      route: string;
      mates: string;
    };
    enjoyTitle: string;
    nearbyTitle: string;
    routeTab: {
      title: string;
      subtitle: string;
      loading: string;
      error: string;
      retry: string;
      summaryLabels: {
        transport: string;
        time: string;
        dayTrip: string;
      };
      timeFormats: {
        minuteOnly: string;
        hourOnly: string;
        hourMinute: string;
      };
      statLabels: {
        estimatedTime: string;
        transport: string;
        difficulty: string;
        dayTrip: string;
      };
      difficultyValues: {
        easy: string;
        normal: string;
        hard: string;
      };
      dayTripValues: {
        available: string;
        stayRecommended: string;
      };
      fareTitle: string;
      fareOneWay: string;
      fareRoundTrip: string;
      farePrefix: string;
      fareDisclaimer: string;
      detailButton: string;
      routeBetween: string;
    };
    routePlaceholder: string;
    matePlaceholder: string;
  };
  terms: {
    headerTitle: string;
    title: string;
    agreeAll: string;
    age14RequiredLabel: string;
    requiredPrefix: string;
    connector: string;
    requiredSuffix: string;
    optionalPrefix: string;
    optionalSuffix: string;
    next: string;
    loadError: string;
    submitError: string;
    linkOpenError: string;
  };
  picks: {
    headerTitle: string;
    scopeNearby: string;
    scopeNationwide: string;
    loadingText: string;
    errorText: string;
    emptyText: string;
    retry: string;
    detailButton: string;
    guideTapText: string;
    guideSwipeText: string;
  };
  messages: {
    threads: {
      title: string;
      loading: string;
      errorTitle: string;
      errorDescriptionFallback: string;
      retry: string;
      emptyTitle: string;
      emptyDescription: string;
    };
    compose: {
      loading: string;
      errorTitle: string;
      errorDescriptionFallback: string;
      back: string;
      retry: string;
      title: string;
      sectionMessage: string;
      placeholder: string;
      safetyNotice: string;
      delayNotice: string;
      send: string;
      sentTitle: string;
      sentDescription: string;
      viewMessages: string;
      continueBrowsing: string;
      unsavedMessage: string;
      unsavedCancel: string;
      unsavedLeave: string;
      bioFallback: string;
      sendFailedTitle: string;
    };
    thread: {
      loading: string;
      errorTitle: string;
      errorDescriptionFallback: string;
      back: string;
      note: string;
      viewDestination: string;
      loadMore: string;
      replySection: string;
      replyPlaceholder: string;
      replyPlaceholderDisabled: string;
      send: string;
      me: string;
    };
  };
}

export const ko: Translations = {
  login: {
    googleButton: "Google로 시작하기",
    appleButton: "Apple로 시작하기",
  },
  language: {
    title: "언어를 선택해주세요",
    subtitle: "Choose your language",
    next: "다음",
  },
  location: {
    title: "위치 검색",
    headline: "지금 머무는 곳은 어디인가요?",
    headlineSubtitle: "현재 위치를 기준으로 가까운 로컬 여행지를 추천해드려요.",
    searchPlaceholder: "도시 · 학교 · 동네를 검색해보세요",
    roadAddressBadge: "도로명",
    lotNumberBadge: "지번",
    next: "다음",
    alerts: {
      errorTitle: "오류",
      mapServiceError:
        "지도 서비스에 일시적인 문제가 있어요. 잠시 후 다시 시도해 주세요.",
      searchResultExpired:
        "검색 결과가 만료됐어요. 같은 검색어로 다시 검색해 주세요.",
      saveFailed: "위치 저장에 실패했습니다.",
    },
  },
  travelStyle: {
    title: "어떤 여행을 즐기고 싶으신가요?",
    subtitle: "관심 있는 여행 스타일을 선택해 주세요.",
    next: "다음",
    options: {
      LOCAL_FOOD: "로컬 맛집",
      LOCAL_FESTIVAL: "지역 축제",
      TRADITIONAL_MARKET: "전통시장",
      CULTURE_EXPERIENCE: "문화체험",
      NATURE: "자연 명소",
      EXHIBITION_MUSEUM: "전시/미술관",
      DRAMA_LOCATION: "드라마 촬영지",
    },
    alerts: {
      noticeTitle: "안내",
      maxSelection: "여행 스타일은 최대 4개까지 선택할 수 있어요.",
    },
  },
  destination: {
    title: "관심 있는 여행지를 \n3개까지 선택해 주세요",
    subtitle: "여행 취향을 반영해 더 알맞은 여행지를 추천해 드릴게요.",
    next: "다음",
    loadingText: "여행지 후보를 불러오는 중이에요.",
    errorText: "여행지 후보를 불러오지 못했어요.",
    retryButton: "다시 시도",
  },
  complete: {
    title: "취향 설정이 완료되었어요",
    subtitle: "선택한 여행지를 바탕으로\n맞춤 여행지를 추천해드릴게요!",
    next: "다음",
    alerts: {
      errorTitle: "오류",
      noticeTitle: "알림",
      genericFailed: "온보딩 완료에 실패했습니다.",
      alreadyCompletedOther: "이미 다른 선택으로 완료된 온보딩이에요.",
      resumeCheckFailed:
        "저장된 온보딩 상태를 확인하지 못했어요. 다시 시도해 주세요.",
      invalidLocation:
        "위치 정보가 유효하지 않아요. 위치를 다시 선택해 주세요.",
      invalidTravelStyles: "여행 스타일을 1~4개, 중복 없이 다시 선택해 주세요.",
      invalidCandidateSet: "여행지 후보가 갱신됐어요. 다시 선택해 주세요.",
      invalidSelection:
        "선택한 여행지를 확인해 주세요 (1~3개, 같은 후보 세트).",
      incompleteSelection: "위치와 여행지를 모두 선택해야 완료할 수 있어요.",
    },
  },
  home: {
    locationPlaceholder: "위치 정보 없음",
    searchPlaceholder: "오늘은 어떤 여행을 해보실래요?",
    featuredTitlePrefix: "한국",
    featuredTitleConnector: "에 왔으면,",
    featuredTitleSuffix: "월에 '이건' 해야지!",
    guidesSectionTitle: "호리가 알려주는 한국 여행 가이드",
    seeAll: "전체보기",
    languageKo: "한국어",
    languageEn: "English",
    categories: {
      POPULAR: "인기",
      LOCAL_FOOD: "로컬 맛집",
      LOCAL_FESTIVAL: "지역 축제",
      TRADITIONAL_MARKET: "전통시장",
      CULTURE_EXPERIENCE: "문화체험",
      NATURE: "자연 명소",
      EXHIBITION_MUSEUM: "전시/미술관",
      DRAMA_LOCATION: "드라마 촬영지",
    },
  },
  map: {
    title: "대한민국 지도",
    instruction: "원하는 지역을 선택해 추천 여행지를 둘러보세요.",
    regionLabels: {
      seoul: "서울",
      gyeonggi: "경기도",
      gangwon: "강원도",
      chungcheong: "충청도",
      jeolla: "전라도",
      gyeongsang: "경상도",
      jeju: "제주도",
    },
    countPrefix: "전체",
    countSuffix: "개",
    sortRecommended: "추천순",
    sortDeadline: "마감순",
    loading: "{region} 장소를 불러오는 중이에요.",
    emptyTitle: "조건에 맞는 장소가 없어요.",
    emptyDescription: "다른 날짜나 관광 유형을 선택해보세요.",
  },
  placeSearch: {
    emptyTitle: "일치하는 검색 결과가 없어요",
  },
  nav: {
    home: "홈",
    map: "지도",
    picks: "추천",
    saved: "저장",
    my: "마이",
  },
  settings: {
    title: "설정",
    sections: {
      preferences: "이용 설정",
      serviceInfo: "서비스 정보",
      account: "계정",
    },
    rows: {
      language: "언어 설정",
      termsOfService: "이용약관",
      privacyPolicy: "개인정보 처리방침",
      appVersion: "앱 버전",
      logOut: "로그아웃",
      deleteAccount: "회원 탈퇴",
    },
    languageValues: {
      KO: "한국어",
      EN: "English",
    },
    actions: {
      logoutConfirmTitle: "정말 로그아웃 하시나요?",
      withdrawConfirmTitle: "정말 탈퇴 하시나요?",
      withdrawConfirmBody:
        "신청 후 7일 이내에는 탈퇴를 철회할 수 있으며,\n7일이 지나면 탈퇴가 확정되고 회원정보가 삭제됩니다.",
      logoutConfirmButton: "로그아웃",
      withdrawConfirmButton: "탈퇴하기",
      cancel: "취소",
    },
    alerts: {
      errorTitle: "오류",
      logoutFailed: "로그아웃에 실패했습니다.",
      withdrawComingSoonTitle: "준비 중",
      withdrawComingSoonBody: "회원 탈퇴는 다음 단계에서 연결됩니다.",
    },
  },
  my: {
    title: "마이페이지",
    profileBadgePublic: "프로필 공개 중",
    profileBadgePrivate: "프로필 비공개",
    editProfile: "프로필 수정",
    languageLabels: {
      KO: "한국어",
      EN: "영어",
      JA: "일본어",
      JP: "일본어",
      ZH: "중국어",
      CN: "중국어",
      TH: "태국어",
      VI: "베트남어",
      MN: "몽골어",
      RU: "러시아어",
      ID: "인도네시아어",
      ES: "스페인어",
      FR: "프랑스어",
      DE: "독일어",
      AR: "아랍어",
    },
    koreanLevelLabels: {
      BEGINNER: "초급",
      ELEMENTARY: "초급",
      INTERMEDIATE: "중급",
      ADVANCED: "고급",
      FLUENT: "유창",
      NATIVE: "원어민 수준",
    },
    shortcuts: {
      messages: "쪽지함",
      addresses: "출발지 관리",
    },
    error: {
      title: "오류",
      retry: "다시 시도",
      description: "프로필 정보를 불러오지 못했어요.",
    },
    languageFallback: "언어 정보 없음",
    emptyProfileSetup: {
      title: "여행 메이트를 찾기 위한\n준비가 필요해요",
      description: "프로필을 완성하고 취향이 맞는 친구들을 만나보세요.",
      button: "프로필 설정하기",
    },
  },
  settingsLanguage: {
    title: "언어를 선택해주세요",
    subtitle: "Choose your language",
    options: {
      EN: { title: "English", subtitle: "영어" },
      KO: { title: "한국어", subtitle: "Korean" },
    },
    done: "완료",
    unsavedChangesMessage: "지금 나가면 \n변경한 내용이 저장되지 않아요",
    cancel: "취소",
    leave: "나가기",
    errorTitle: "오류",
    errorMessage: "언어 설정에 실패했습니다.",
  },
  profileEdit: {
    titleSetup: "프로필 설정",
    titleEdit: "프로필 수정",
    loadErrorTitle: "프로필 설정을 불러오지 못했어요",
    retry: "다시 시도",
    alerts: {
      errorTitle: "오류",
      infoTitle: "안내",
      travelStyleMin: "관심 여행 스타일은 최소 1개 이상 선택해야 해요.",
      travelStyleMax: "관심 여행 스타일은 최대 4개까지 선택할 수 있어요.",
      photoPermissionTitle: "권한 필요",
      photoPermissionBody: "사진 보관함 접근 권한을 허용해 주세요.",
      unsupportedTypeTitle: "지원하지 않는 파일 형식",
      unsupportedTypeBody: "JPEG, PNG, WebP 사진만 업로드할 수 있어요.",
      unreadableFileTitle: "파일을 읽을 수 없어요",
      unreadableFileBody: "다른 사진으로 다시 시도해 주세요.",
      fileTooLargeTitle: "파일이 너무 커요",
      fileTooLargeBody: "5MiB 이하의 사진만 업로드할 수 있어요.",
    },
    errors: {
      generic: "알 수 없는 오류가 발생했습니다.",
      uploadFailed: "프로필 사진 업로드에 실패했어요.",
      uploadUrl: "프로필 사진 업로드 URL을 받지 못했어요.",
      imageId: "프로필 사진 ID를 받지 못했어요.",
      loadOptions: "프로필 옵션을 불러오지 못했습니다.",
    },
    sections: {
      profilePhoto: "프로필 사진",
      nickname: "닉네임",
      nationality: "국적",
      languages: "사용 언어",
      koreanLevel: "한국어 수준",
      bio: "한 줄 소개",
      travelStyles: {
        title: "관심 여행 스타일",
        subtitle: "중복 선택이 가능해요",
      },
      socialAccounts: {
        title: "공개 SNS",
        subtitle: "최대 2개까지 공개할 수 있어요.",
      },
      contactSettings: "연락 및 공개 설정",
    },
    placeholders: {
      nickname: "나를 표현하는 닉네임을 적어주세요",
      nationality: "어디서 오셨나요?",
      bio: "나를 한 줄로 표현한다면?",
      snsId: "아이디를 입력해 주세요.",
    },
    buttons: {
      done: "완료",
      addSocialAccount: "+ SNS 추가",
      cancel: "취소",
      save: "저장",
    },
    toggles: {
      profilePublic: "프로필 공개",
      snsPublic: "SNS 공개",
      allowsMessages: "쪽지 받기",
    },
    modals: {
      country: {
        title: "국적 선택",
        subtitle: "어느 나라에서 오셨나요?",
        confirm: "선택",
        searchPlaceholder: "국가 검색",
      },
      language: {
        title: "사용 언어 추가",
        subtitle: "대화할 수 있는 언어를 선택해 주세요.",
        confirm: "추가",
        searchPlaceholder: "언어 검색",
      },
      searchNoResults: "검색 결과가 없습니다.",
      unsavedChanges: {
        message: "지금 나가면 \n변경한 내용이 저장되지 않아요",
        cancel: "취소",
        confirm: "나가기",
      },
      avatar: {
        selectPhoto: "사진 선택",
        deletePhoto: "프로필 사진 삭제",
        cancel: "취소",
      },
      sns: {
        title: "SNS 공개 설정",
        platformsTitle: "플랫폼 선택",
        platformsSubtitle: "최대 2개까지 공개할 수 있어요.",
        idsTitle: "아이디 입력",
        idsSubtitle: "선택한 플랫폼의 아이디를 입력해 주세요.",
        inputPlaceholder: "아이디를 입력해 주세요.",
        cancel: "취소",
        save: "저장",
      },
    },
  },
  guideList: {
    title: "한국 여행 가이드",
    description: {
      TRANSPORT:
        "교통 이용부터 결제, 안전, 언어까지 필요한 정보를 영상으로 확인해보세요.",
      ORDER:
        "식당 주문부터 웨이팅, 배달, 키오스크까지 필요한 정보를 영상으로 확인해보세요.",
      SAFETY:
        "긴급 상황, 분실, 병원, 등산까지 필요한 안전 정보를 영상으로 확인해보세요.",
      LANGUAGE: "여행 중 자주 쓰는 한국어 표현을 상황별로 익혀보세요.",
    },
    categories: {
      TRANSPORT: "교통",
      ORDER: "주문",
      SAFETY: "안전",
      LANGUAGE: "언어",
    },
  },
  guideDetail: {
    categoryBadge: {
      TRANSPORT: "교통 가이드",
      ORDER: "주문 가이드",
      SAFETY: "안전 가이드",
      LANGUAGE: "언어 가이드",
    },
    startButton: "가이드 시작하기",
    stepListTitle: "단계별 예매 방법",
    totalStepsPrefix: "전체 ",
    totalStepsSuffix: "단계",
    resumeStepPrefix: "Step ",
    resumeStepSuffix: " 보러가기",
    stepComingSoonTitle: "준비 중이에요",
    stepComingSoonBody: "이 단계는 아직 준비 중이에요. 곧 만나보실 수 있어요!",
  },
  languageGuide: {
    relatedTitle: "함께 알아두면 좋아요",
    previous: "이전",
    next: "다음",
    close: "가이드 닫기",
  },
  languageModal: {
    title: {
      EN: "영어로 변경할까요?",
      KO: "한국어로 변경할까요?",
    },
    subtitle: {
      EN: "앱 언어를 English로 전환할까요?\n변경 후 일부 화면은 다시 불러올 수 있어요.",
      KO: "앱 언어를 한국어로 전환할까요?\n변경 후 일부 화면은 다시 불러올 수 있어요.",
    },
    cancel: "취소",
    confirm: "변경하기",
  },
  address: {
    title: "주소 설정",
    searchPlaceholder: "도로명, 건물명, 지번으로 검색해 보세요",
    currentAddressBadge: "현재 설정된 주소",
    alerts: {
      errorTitle: "오류",
      locationMissing: "삭제되었거나 존재하지 않는 위치예요.",
      setDefaultFailed: "기본 위치 변경에 실패했습니다.",
    },
  },
  addressSearch: {
    title: "주소 검색",
    alerts: {
      errorTitle: "오류",
      mapServiceError:
        "지도 서비스에 일시적인 문제가 있어요. 잠시 후 다시 시도해 주세요.",
      searchResultExpired:
        "검색 결과가 만료됐어요. 같은 검색어로 다시 검색해 주세요.",
      saveFailed: "위치 저장에 실패했습니다.",
    },
  },
  addressEdit: {
    title: "주소 편집",
    delete: "삭제",
    alerts: {
      errorTitle: "오류",
      deleteFailed: "위치 삭제에 실패했습니다.",
      refreshFailed:
        "위치 목록을 새로고침하지 못했어요. 화면을 다시 열어 확인해 주세요.",
    },
  },
  deleteAddressModal: {
    suffix: "주소를 삭제하시나요?",
    cancel: "닫기",
    confirm: "삭제",
  },
  eventList: {
    titleSuffix: "월에 가볼 만한 곳",
    total: "전체",
    countUnit: "개",
    sortTitle: "정렬",
    sortRecommended: "추천순",
    sortDeadline: "마감순",
  },
  eventFilter: {
    title: "필터",
    reset: "초기화",
    regionLabel: "지역",
    regionAll: "전체",
    regionOptions: {
      SEOUL: "서울",
      GYEONGGI: "경기도",
      GANGWON: "강원도",
      CHUNGCHEONG: "충청도",
      JEOLLA: "전라도",
      GYEONGSANG: "경상도",
      JEJU: "제주도",
    },
    dateLabel: "날짜",
    dateAll: "전체",
    dateOptions: {
      THIS_WEEK: "이번 주",
      THIS_MONTH: "이번 달",
      NEXT_MONTH: "다음 달",
    },
    dateCustomButton: "날짜 선택",
    typeLabel: "관광 유형",
    typeOptions: {
      LOCAL_FOOD: "로컬맛집",
      LOCAL_FESTIVAL: "지역축제",
      TRADITIONAL_MARKET: "전통시장",
      CULTURE_EXPERIENCE: "문화체험",
      NATURE: "자연명소",
      EXHIBITION_MUSEUM: "전시/미술관",
      DRAMA_LOCATION: "드라마 촬영지",
    },
    cancel: "취소",
    apply: "적용하기",
  },
  dateRangePicker: {
    title: "날짜 선택",
    reset: "초기화",
    cancel: "취소",
    apply: "적용하기",
  },
  saved: {
    title: "저장",
    loading: "저장한 여행지를 불러오는 중이에요.",
    emptyTitle: "저장한 장소가 없어요.",
    emptyDescription: "마음에 드는 여행지의 하트를 눌러 저장해보세요.",
    sortTitle: "정렬",
    sortOptions: {
      savedAt: "담은순",
      deadline: "마감순",
    },
  },
  placeDetail: {
    loading: "정보를 불러오는 중이에요.",
    tabs: {
      description: "설명",
      route: "이동",
      mates: "메이트",
    },
    enjoyTitle: "이렇게 즐겨보세요",
    nearbyTitle: "같이 가보면 좋은 명소",
    routeTab: {
      title: "Buddy Route",
      subtitle: "추천 여행지까지 가는 방법을 확인해보세요.",
      loading: "이동 경로를 불러오는 중이에요.",
      error: "이동 경로를 불러오지 못했어요.",
      retry: "다시 시도",
      summaryLabels: {
        transport: "교통수단",
        time: "예상 시간",
        dayTrip: "당일치기",
      },
      timeFormats: {
        minuteOnly: "약 {minutes}분",
        hourOnly: "약 {hours}시간",
        hourMinute: "약 {hours}시간 {minutes}분",
      },
      statLabels: {
        estimatedTime: "예상 이동 시간",
        transport: "추천 교통수단",
        difficulty: "이동 난이도",
        dayTrip: "여행 판단",
      },
      difficultyValues: {
        easy: "쉬움",
        normal: "보통",
        hard: "어려움",
      },
      dayTripValues: {
        available: "당일치기 가능",
        stayRecommended: "숙박 권장",
      },
      fareTitle: "예상 교통비",
      fareOneWay: "편도",
      fareRoundTrip: "왕복",
      farePrefix: "약",
      fareDisclaimer: "* 전체 경비 기준으로 작성",
      detailButton: "자세한 경로 보기  →",
      routeBetween: "{origin}에서 {destination}까지",
    },
    routePlaceholder: "이동 정보는 준비 중이에요.",
    matePlaceholder: "메이트 기능은 준비 중이에요.",
  },
  terms: {
    headerTitle: "약관동의",
    title: "여행을 떠나기 전\n약관에 동의해주세요!",
    agreeAll: "전체 동의",
    age14RequiredLabel: "[필수] 만 14세 이상입니다",
    requiredPrefix: "[필수] ",
    connector: " 및 ",
    requiredSuffix: " 동의",
    optionalPrefix: "[선택] ",
    optionalSuffix: "",
    next: "다음",
    loadError: "약관 정보를 불러오지 못했어요.",
    submitError: "약관 동의에 실패했어요.",
    linkOpenError: "페이지를 열지 못했어요.",
  },
  picks: {
    headerTitle: "나를 위한 추천 여행지",
    scopeNearby: "근교",
    scopeNationwide: "전국",
    loadingText: "추천 여행지를 불러오는 중이에요.",
    errorText: "추천 여행지를 불러오지 못했어요.",
    emptyText: "추천할 만한 여행지가 없어요.",
    retry: "다시 시도",
    detailButton: "여행 코스 확인하기",
    guideTapText: "이미지를 터치하여\n여행 정보를 확인하세요",
    guideSwipeText: "카드를 옆으로 밀어\n다른 여행지를 구경해보세요",
  },
  messages: {
    threads: {
      title: "쪽지함",
      loading: "쪽지함을 불러오는 중이에요",
      errorTitle: "쪽지함을 불러오지 못했어요",
      errorDescriptionFallback: "잠시 후 다시 시도해 주세요.",
      retry: "다시 시도",
      emptyTitle: "쪽지함이 비어 있어요",
      emptyDescription:
        "아직 받은 쪽지가 없어요.\n여행지에서 쪽지를 보내면 여기에서 확인할 수 있어요",
    },
    compose: {
      loading: "쪽지 화면을 불러오는 중이에요",
      errorTitle: "쪽지 화면을 불러오지 못했어요",
      errorDescriptionFallback: "잠시 후 다시 시도해 주세요.",
      back: "돌아가기",
      retry: "다시 시도",
      title: "쪽지 보내기",
      sectionMessage: "메시지",
      placeholder: "전하고 싶은 내용을 작성해보세요.",
      safetyNotice:
        "안전을 위해 전화번호, 주소, 금융정보 등 민감한 개인정보는 공유하지 마세요.",
      delayNotice: "실시간 채팅이 아니라 답장이 조금 늦을 수 있어요.",
      send: "쪽지 보내기",
      sentTitle: "쪽지를 보냈어요!",
      sentDescription:
        "답장은 바로 오지 않을 수 있어요.\n새로운 답장은 쪽지함에서 확인할 수 있어요.",
      viewMessages: "쪽지함 보기",
      continueBrowsing: "계속 둘러보기",
      unsavedMessage: "아직 쪽지가 전송되지 않았어요\n정말 나가실건가요?",
      unsavedCancel: "취소",
      unsavedLeave: "나가기",
      bioFallback: "소개가 아직 없어요.",
      sendFailedTitle: "쪽지를 보내지 못했어요",
    },
    thread: {
      loading: "쪽지 내용을 불러오는 중이에요",
      errorTitle: "쪽지 내용을 불러오지 못했어요",
      errorDescriptionFallback: "잠시 후 다시 시도해 주세요.",
      back: "돌아가기",
      note: "이메일처럼 주고받는 쪽지예요. 답장이 늦을 수 있어요.",
      viewDestination: "여행지 보기",
      loadMore: "이전 메시지 더보기",
      replySection: "답변 작성하기",
      replyPlaceholder: "전하고 싶은 내용을 작성해보세요.",
      replyPlaceholderDisabled: "답장을 보낼 수 없는 쪽지예요.",
      send: "쪽지 보내기",
      me: "나",
    },
  },
};
