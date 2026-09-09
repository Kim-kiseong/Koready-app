import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { fetchMyBuddyProfile, fetchProfileOptions } from '@/api/buddy-profile';
import { fetchPlaceMates } from '@/api/mate';
import type { LanguageCode, PlaceMate, ProfileOptionItem, ProfileOptionsResponse } from '@/api/types';
import CustomText from '@/components/CustomText';
import SendPlaneIcon from '@/components/icons/SendPlaneIcon';
import BuddyProfileModal from '@/components/place-detail/BuddyProfileModal';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { getMockBuddyProfileDetailById } from '@/mock/buddy-profiles';
import { formatCountryDisplay } from '@/utils/country';
import { buildLanguageDisplayLabels, normalizeLanguageCode } from '@/utils/language-display';
import { toDisplayText, toStableListKey } from '@/utils/list-item';
import { resolveProfileImageUri } from '@/utils/profile-image';

type MateTabProps = {
  placeId: string;
  placeTitle: string;
  placeRouteId?: string;
  placeAddress?: string;
  placeImageUrl?: string;
  placeNumericId?: number;
};

const FALLBACK_PROFILE_OPTIONS: Pick<ProfileOptionsResponse, 'countries' | 'languages' | 'koreanLevels'> = {
  countries: [
    { code: 'FR', labelKo: '프랑스', labelEn: 'France', displayOrder: 1 },
    { code: 'KR', labelKo: '한국', labelEn: 'Korea', displayOrder: 2 },
    { code: 'JP', labelKo: '일본', labelEn: 'Japan', displayOrder: 3 },
    { code: 'US', labelKo: '미국', labelEn: 'United States', displayOrder: 4 },
    { code: 'CN', labelKo: '중국', labelEn: 'China', displayOrder: 5 },
    { code: 'TW', labelKo: '대만', labelEn: 'Taiwan', displayOrder: 6 },
  ],
  languages: [
    { code: 'EN', labelKo: '영어', labelEn: 'English', displayOrder: 1 },
    { code: 'KO', labelKo: '한국어', labelEn: 'Korean', displayOrder: 2 },
    { code: 'JA', labelKo: '일본어', labelEn: 'Japanese', displayOrder: 3 },
    { code: 'ZH', labelKo: '중국어', labelEn: 'Chinese', displayOrder: 4 },
    { code: 'FR', labelKo: '프랑스어', labelEn: 'French', displayOrder: 5 },
  ],
  koreanLevels: [
    { code: 'BEGINNER', labelKo: '초급', labelEn: 'Beginner', displayOrder: 1 },
    { code: 'INTERMEDIATE', labelKo: '중급', labelEn: 'Intermediate', displayOrder: 2 },
    { code: 'ADVANCED', labelKo: '고급', labelEn: 'Advanced', displayOrder: 3 },
  ],
};

const MATE_TAB_COPY: Record<
  LanguageCode,
  {
    listTitle: string;
    listSubtitle: string;
    beforeTitle: string;
    beforeDescription: string;
    beforeButton: string;
    afterTitle: string;
    afterDescription: string;
    moreButton: string;
    profileButton: string;
    messageButtonAvailable: string;
    messageButtonUnavailable: string;
    errorTitle: string;
    errorDescription: string;
    errorRetry: string;
    messageUnavailableTitle: string;
    messageUnavailableBody: string;
    profileRequiredTitle: string;
    profileRequiredBody: string;
  }
> = {
  KO: {
    listTitle: '이 여행지에 관심 있는 친구들',
    listSubtitle: '같이 여행갈 친구를 찾고 있나요?',
    beforeTitle: '여행 메이트를 찾기 위한\n준비가 필요해요',
    beforeDescription: '프로필을 완성하고 취향이 맞는 친구들을 만나보세요.',
    beforeButton: '프로필 설정하기',
    afterTitle: '함께할 여행 메이트를\n찾고 있어요',
    afterDescription: '나와 취향이 맞는 메이트가 나타나면 알려드릴게요.',
    moreButton: '메이트 더 보기',
    profileButton: '프로필 보기',
    messageButtonAvailable: '쪽지 보내기',
    messageButtonUnavailable: '쪽지 불가',
    errorTitle: '메이트를 불러오지 못했어요.',
    errorDescription: '잠시 후 다시 시도해 주세요.',
    errorRetry: '다시 시도',
    messageUnavailableTitle: '쪽지 불가',
    messageUnavailableBody: '이 메이트는 쪽지를 받을 수 없어요.',
    profileRequiredTitle: '쪽지 불가',
    profileRequiredBody: '프로필을 먼저 설정해 주세요.',
  },
  EN: {
    listTitle: 'Travelers Interested in This Place',
    listSubtitle: 'Looking for someone to travel with?',
    beforeTitle: 'Set up your profile to find travel mates',
    beforeDescription: 'Complete your profile and meet travelers who share your\ninterests.',
    beforeButton: 'Set Up Profile',
    afterTitle: 'Finding travel mates for you',
    afterDescription: 'We’ll let you know when we find someone who matches\nyour travel style.',
    moreButton: 'See more mates',
    profileButton: 'View profile',
    messageButtonAvailable: 'Send message',
    messageButtonUnavailable: 'Not available',
    errorTitle: "Couldn't load travel buddies.",
    errorDescription: 'Please try again in a moment.',
    errorRetry: 'Try again',
    messageUnavailableTitle: 'Message unavailable',
    messageUnavailableBody: "This mate can't receive messages.",
    profileRequiredTitle: 'Message unavailable',
    profileRequiredBody: 'Please set up your profile first.',
  },
};

export default function MateTab({
  placeId,
  placeTitle,
  placeRouteId,
  placeAddress,
  placeImageUrl,
  placeNumericId,
}: MateTabProps) {
  const router = useRouter();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const buddyProfileExists = useAuthStore((state) => state.buddyProfileExists);
  const language = useLanguageStore((state) => state.language);
  const copy = MATE_TAB_COPY[language];

  const [profileOptions, setProfileOptions] = useState<ProfileOptionsResponse | null>(null);
  const [mates, setMates] = useState<PlaceMate[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasCheckedProfileExists, setHasCheckedProfileExists] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const selectedProfileFallback = selectedProfileId == null ? null : getMockBuddyProfileDetailById(selectedProfileId);
  const matesApiPlaceId = placeNumericId != null ? String(placeNumericId) : placeId;
  const openMessageCompose = (profileId: number) => {
    router.push({
      pathname: '/message-threads/new',
      params: {
        placeId,
        placeRouteId: placeRouteId ?? placeId,
        placeTitle,
        placeAddress: placeAddress ?? '',
        placeImageUrl: placeImageUrl ?? '',
        placeNumericId: matesApiPlaceId,
        receiverProfileId: String(profileId),
      },
    } as never);
  };

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    let cancelled = false;

    if (!buddyProfileExists) {
      if (!hasCheckedProfileExists) {
        setIsLoading(true);
        setIsLoadingMore(false);
        setError(null);
        setProfileOptions(null);
        setMates([]);
        setNextCursor(null);
        setHasMore(false);

        fetchMyBuddyProfile()
          .then((profileResponse) => {
            if (cancelled) {
              return;
            }

            setHasCheckedProfileExists(true);
            if (profileResponse.exists) {
              useAuthStore.getState().setBuddyProfileExists(true);
              return;
            }

            setIsLoading(false);
          })
          .catch(() => {
            if (cancelled) {
              return;
            }

            setHasCheckedProfileExists(true);
            setIsLoading(false);
          });

        return () => {
          cancelled = true;
        };
      }

      if (!buddyProfileExists) {
        setIsLoading(false);
        setIsLoadingMore(false);
        setError(null);
        setProfileOptions(null);
        setMates([]);
        setNextCursor(null);
        setHasMore(false);
      }
      return;
    }

    setIsLoading(true);
    setIsLoadingMore(false);
    setError(null);
    setProfileOptions(null);
    setMates([]);
    setNextCursor(null);
    setHasMore(false);

    (async () => {
      const [optionsResult, matesResult] = await Promise.allSettled([
        fetchProfileOptions(),
        fetchPlaceMates(matesApiPlaceId),
      ]);

      if (cancelled) {
        return;
      }

      if (optionsResult.status === 'fulfilled') {
        setProfileOptions(optionsResult.value);
      }

      if (matesResult.status === 'fulfilled') {
        setMates(matesResult.value.items);
        setNextCursor(matesResult.value.nextCursor);
        setHasMore(matesResult.value.hasMore);
      } else {
        setError(extractErrorMessage(matesResult.reason, copy.errorDescription));
      }

      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [buddyProfileExists, copy.errorDescription, hasCheckedProfileExists, hasHydrated, language, matesApiPlaceId, reloadToken]);

  if (!hasHydrated || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Palette.primary} />
      </View>
    );
  }

  if (!buddyProfileExists) {
    return (
      <View style={styles.screenRoot}>
        <BeforeProfileView
          title={copy.beforeTitle}
          description={copy.beforeDescription}
          buttonLabel={copy.beforeButton}
          onPressProfileEdit={() => router.push('/profile-edit' as never)}
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.screenRoot}>
        <SearchingState title={copy.afterTitle} description={copy.afterDescription} />
      </View>
    );
  }

  if (error && mates.length === 0) {
    return (
      <View style={styles.screenRoot}>
        <ErrorState message={copy.errorTitle} description={error || copy.errorDescription} retryLabel={copy.errorRetry} onPressRetry={() => setReloadToken((value) => value + 1)} />
      </View>
    );
  }

  if (mates.length === 0) {
    return (
      <View style={styles.screenRoot}>
        <SearchingState title={copy.afterTitle} description={copy.afterDescription} />
      </View>
    );
  }

  const resolvedOptions = profileOptions ?? FALLBACK_PROFILE_OPTIONS;

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);

    try {
      const response = await fetchPlaceMates(matesApiPlaceId, nextCursor);
      setMates((current) => mergeUniqueMates(current, response.items));
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (loadMoreError) {
      setError(extractErrorMessage(loadMoreError, copy.errorDescription));
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
      <View style={styles.screenRoot}>
      <View style={styles.container}>
        <View style={styles.listHeader}>
          <CustomText style={styles.listTitle}>{copy.listTitle}</CustomText>
          <CustomText style={styles.listSubtitle}>{copy.listSubtitle}</CustomText>
        </View>

        <View style={styles.cardList}>
          {mates.map((mate) => (
          <MateCard
              key={mate.profileId}
              mate={mate}
              options={resolvedOptions}
              language={language}
              copy={copy}
              onPressProfile={(profileId) => setSelectedProfileId(profileId)}
              onPressMessage={(profileId) => {
                if (!mate.canMessage) {
                  Alert.alert(copy.messageUnavailableTitle, copy.messageUnavailableBody);
                  return;
                }

                openMessageCompose(profileId);
              }}
            />
          ))}
        </View>

        {hasMore ? (
          <Pressable
            style={({ pressed }) => [
              styles.loadMoreButton,
              pressed && styles.pressed,
              isLoadingMore && styles.loadMoreButtonDisabled,
            ]}
            onPress={handleLoadMore}
            disabled={isLoadingMore}>
            {isLoadingMore ? (
              <ActivityIndicator color={Palette.primary} />
            ) : (
              <CustomText style={styles.loadMoreText}>{copy.moreButton}</CustomText>
            )}
          </Pressable>
        ) : null}
      </View>

      <BuddyProfileModal
        visible={selectedProfileId !== null}
        profileId={selectedProfileId}
        options={profileOptions}
        fallbackProfile={selectedProfileFallback}
        onPressMessage={(profileId) => {
          setSelectedProfileId(null);
          if (!buddyProfileExists) {
            Alert.alert(copy.profileRequiredTitle, copy.profileRequiredBody);
            return;
          }

          openMessageCompose(profileId);
        }}
        onClose={() => setSelectedProfileId(null)}
      />
    </View>
  );
}

function BeforeProfileView({
  title,
  description,
  buttonLabel,
  onPressProfileEdit,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  onPressProfileEdit: () => void;
}) {
  return (
    <View style={styles.previewBlock}>
      <Image
        source={require('@/assets/images/mate-preview-before.png')}
        style={styles.beforeIllustration}
        contentFit="contain"
      />

      <CustomText style={styles.previewTitle}>{title}</CustomText>

      <CustomText style={styles.previewDescription}>{description}</CustomText>

      <Pressable style={styles.primaryButton} onPress={onPressProfileEdit}>
        <CustomText style={styles.primaryButtonText}>{buttonLabel}</CustomText>
      </Pressable>
    </View>
  );
}

function SearchingState({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.searchingState}>
      <Image
        source={require('@/assets/images/mate-preview-after.png')}
        style={styles.afterIllustration}
        contentFit="contain"
      />

      <CustomText style={styles.previewTitle}>{title}</CustomText>

      <CustomText style={styles.previewDescription}>{description}</CustomText>
    </View>
  );
}

function ErrorState({
  message,
  description,
  retryLabel,
  onPressRetry,
}: {
  message: string;
  description: string;
  retryLabel: string;
  onPressRetry: () => void;
}) {
  return (
    <View style={styles.errorState}>
      <CustomText style={styles.errorTitle}>{message}</CustomText>
      <CustomText style={styles.errorDescription}>{description}</CustomText>

      <Pressable style={styles.primaryButton} onPress={onPressRetry}>
        <CustomText style={styles.primaryButtonText}>{retryLabel}</CustomText>
      </Pressable>
    </View>
  );
}

function MateCard({
  mate,
  options,
  language,
  copy,
  onPressProfile,
  onPressMessage,
}: {
  mate: PlaceMate;
  options: Pick<ProfileOptionsResponse, 'countries' | 'languages' | 'koreanLevels'>;
  language: LanguageCode;
  copy: (typeof MATE_TAB_COPY)[LanguageCode];
  onPressProfile: (profileId: number) => void;
  onPressMessage: (profileId: number) => void;
}) {
  const countryLabel = formatCountryDisplay(mate.nationalityCode, options.countries, language);
  const languageChips = buildLanguageChips(mate, options.languages, options.koreanLevels, language);

  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <ProfileAvatar imageUrl={mate.profileImageUrl} nickname={mate.nickname} />

        <View style={styles.cardMeta}>
          <View style={styles.nameRow}>
            <CustomText style={styles.nickname}>{mate.nickname}</CustomText>
            <CustomText style={styles.country}>·</CustomText>
            <CustomText style={styles.country}>{countryLabel}</CustomText>
          </View>

            <View style={styles.chipRow}>
              {languageChips.map((chipLabel, index) => (
                <View key={toStableListKey(chipLabel, index)} style={styles.chip}>
                  <CustomText style={styles.chipText}>{toDisplayText(chipLabel)}</CustomText>
                </View>
              ))}
            </View>

          <CustomText style={styles.bio}>{mate.bio}</CustomText>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.buttonRow}>
        <Pressable
          style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
          onPress={() => onPressProfile(mate.profileId)}>
          <SymbolView
            name={{ ios: 'person', android: 'person', web: 'person' }}
            size={16}
            weight="regular"
            tintColor={Palette.primary}
          />
          <CustomText style={styles.outlineButtonText}>{copy.profileButton}</CustomText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.filledButton,
            pressed && styles.pressed,
            !mate.canMessage && styles.filledButtonDisabled,
          ]}
          onPress={() => onPressMessage(mate.profileId)}
          disabled={!mate.canMessage}>
          <SendPlaneIcon color={mate.canMessage ? '#FFFFFF' : Palette.grey500} />
          <CustomText
            style={[
              styles.filledButtonText,
              !mate.canMessage && styles.filledButtonTextDisabled,
            ]}>
            {mate.canMessage ? copy.messageButtonAvailable : copy.messageButtonUnavailable}
          </CustomText>
        </Pressable>
      </View>
    </View>
  );
}

function ProfileAvatar({ imageUrl, nickname }: { imageUrl: string | null; nickname: string }) {
  const resolvedImageUrl = resolveProfileImageUri(imageUrl);

  return (
    <View style={styles.avatarFrame}>
      {resolvedImageUrl ? (
        <Image source={{ uri: resolvedImageUrl }} style={styles.avatarImage} contentFit="cover" />
      ) : (
        <View style={styles.avatarFallback}>
          <CustomText style={styles.avatarInitial}>{nickname.trim().charAt(0).toUpperCase() || 'M'}</CustomText>
        </View>
      )}
    </View>
  );
}

function buildLanguageChips(
  mate: PlaceMate,
  languageOptions: ProfileOptionItem[],
  koreanLevelOptions: ProfileOptionItem[],
  language: LanguageCode,
) {
  const sortedLanguages = sortCodesByOptionOrder(mate.availableLanguages, languageOptions);
  const languageFallbacks = createFallbackLabelMaps(languageOptions);
  const levelFallbacks = createFallbackLabelMaps(koreanLevelOptions);

  return buildLanguageDisplayLabels(
    sortedLanguages,
    mate.koreanLevel,
    (code) => getLabel(code, languageOptions, language, languageFallbacks),
    (level) => getLabel(level, koreanLevelOptions, language, levelFallbacks),
    '',
    { koreanLevelPlacement: 'append' },
  );
}

function sortCodesByOptionOrder(codes: string[], options: ProfileOptionItem[]) {
  const order = new Map(
    options.map((option, index) => [normalizeLanguageCode(option.code), index] as const),
  );
  const normalized = codes
    .map(normalizeLanguageCode)
    .filter((code): code is string => typeof code === 'string' && code.length > 0);
  const unique = Array.from(new Set(normalized));

  return unique.sort((left, right) => {
    const leftIndex = order.get(left);
    const rightIndex = order.get(right);

    if (leftIndex == null && rightIndex == null) {
      return left.localeCompare(right);
    }

    if (leftIndex == null) {
      return 1;
    }

    if (rightIndex == null) {
      return -1;
    }

    return leftIndex - rightIndex;
  });
}

function getLabel(
  code: string,
  options: ProfileOptionItem[],
  language: LanguageCode,
  fallbackLabels: Record<LanguageCode, Record<string, string>>,
) {
  const matchedOption = options.find((option) => option.code === code);
  if (matchedOption) {
    return language === 'EN' ? matchedOption.labelEn : matchedOption.labelKo;
  }

  return fallbackLabels[language][code] ?? fallbackLabels.KO[code] ?? code;
}

function createFallbackLabelMaps(options: ProfileOptionItem[]) {
  return {
    KO: Object.fromEntries(options.map((option) => [option.code, option.labelKo])),
    EN: Object.fromEntries(options.map((option) => [option.code, option.labelEn])),
  } satisfies Record<LanguageCode, Record<string, string>>;
}

function mergeUniqueMates(existing: PlaceMate[], incoming: PlaceMate[]) {
  const byProfileId = new Map<number, PlaceMate>();

  for (const mate of [...existing, ...incoming]) {
    byProfileId.set(mate.profileId, mate);
  }

  return [...byProfileId.values()];
}

function extractErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage;
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
  },
  previewBlock: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  searchingState: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 12,
  },
  beforeIllustration: {
    width: 133,
    height: 142,
    marginTop: 14,
    marginBottom: 12,
  },
  afterIllustration: {
    width: 180,
    height: 170,
    marginTop: 14,
    marginBottom: 0,
  },
  previewTitle: {
    textAlign: 'center',
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 27,
    color: Palette.text,
  },
  previewDescription: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey600,
    paddingHorizontal: 12,
  },
  primaryButton: {
    minWidth: 152,
    minHeight: 44,
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  primaryButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    lineHeight: 19.6,
    color: '#ffffff',
  },
  errorState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  errorTitle: {
    textAlign: 'center',
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 26,
    color: Palette.text,
  },
  errorDescription: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 20,
    color: Palette.grey600,
    paddingHorizontal: 12,
  },
  listHeader: {
    gap: 4,
    paddingBottom: 24,
  },
  listTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: Palette.text,
  },
  listSubtitle: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: '#4E5968',
  },
  cardList: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '5px 5px 20px rgba(0, 0, 0, 0.08)' } as object)
      : {
          shadowColor: '#000000',
          shadowOpacity: 0.08,
          shadowRadius: 20,
          shadowOffset: {
            width: 5,
            height: 5,
          },
        }),
    elevation: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  avatarFrame: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FFFFFF',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 66,
    height: 66,
    borderRadius: 23,
    backgroundColor: '#E8EEF2',
  },
  avatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E8EEF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    color: Palette.grey500,
  },
  cardMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  nickname: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.text,
  },
  country: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: '#6B7684',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#9BE6C6',
    backgroundColor: '#F4FFF8',
    alignSelf: 'flex-start',
  },
  chipText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 12,
    lineHeight: 16.8,
    color: '#56B7A0',
  },
  bio: {
    marginTop: 8,
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 18.2,
    color: '#4E5968',
  },
  divider: {
    marginTop: 16,
    height: 1,
    backgroundColor: '#E8EEF2',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  outlineButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.primary,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 2,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  outlineButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.primary,
  },
  filledButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 2,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  filledButtonDisabled: {
    backgroundColor: Palette.grey300,
  },
  filledButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    lineHeight: 19.6,
    color: '#FFFFFF',
  },
  filledButtonTextDisabled: {
    color: Palette.grey500,
  },
  loadMoreButton: {
    marginTop: 16,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadMoreButtonDisabled: {
    opacity: 0.6,
  },
  loadMoreText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: Palette.primary,
  },
  pressed: {
    opacity: 0.85,
  },
});
