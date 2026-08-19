import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { fetchProfileOptions } from '@/api/buddy-profile';
import { fetchMockPlaceMates, fetchPlaceMates } from '@/api/mate';
import type { PlaceMate, ProfileOptionItem, ProfileOptionsResponse } from '@/api/types';
import CustomText from '@/components/CustomText';
import BuddyProfileModal from '@/components/place-detail/BuddyProfileModal';
import SendPlaneIcon from '@/components/icons/SendPlaneIcon';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useAuthStore } from '@/store/auth-store';
import { formatCountryDisplay } from '@/utils/country';
import { toDisplayText, toStableListKey } from '@/utils/list-item';

type MateTabProps = {
  placeId: string;
  placeTitle: string;
  placeRouteId?: string;
  placeAddress?: string;
  placeImageUrl?: string;
  placeNumericId?: number;
};

type PreviewMode = 'before' | 'after' | 'list';

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
    { code: 'JP', labelKo: '일본어', labelEn: 'Japanese', displayOrder: 3 },
    { code: 'CN', labelKo: '중국어', labelEn: 'Chinese', displayOrder: 4 },
    { code: 'FR', labelKo: '프랑스어', labelEn: 'French', displayOrder: 5 },
  ],
  koreanLevels: [
    { code: 'BEGINNER', labelKo: '초급', labelEn: 'Beginner', displayOrder: 1 },
    { code: 'INTERMEDIATE', labelKo: '중급', labelEn: 'Intermediate', displayOrder: 2 },
    { code: 'ADVANCED', labelKo: '고급', labelEn: 'Advanced', displayOrder: 3 },
  ],
};

const FALLBACK_LANGUAGE_LABELS: Record<string, string> = {
  KO: '한국어',
  EN: '영어',
  JP: '일본어',
  CN: '중국어',
  FR: '프랑스어',
};

const FALLBACK_KOREAN_LEVEL_LABELS: Record<string, string> = {
  BEGINNER: '초급',
  ELEMENTARY: '초급',
  INTERMEDIATE: '중급',
  ADVANCED: '고급',
  FLUENT: '유창',
  NATIVE: '원어민 수준',
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

  const [previewMode, setPreviewMode] = useState<PreviewMode | null>(null);
  const [profileOptions, setProfileOptions] = useState<ProfileOptionsResponse | null>(null);
  const [mates, setMates] = useState<PlaceMate[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const isPreviewBefore = previewMode === 'before';
  const isPreviewAfter = previewMode === 'after';
  const isPreviewList = previewMode === 'list';
  const openMessageCompose = (profileId: number) => {
    router.push({
      pathname: '/message-threads/new',
      params: {
        placeId,
        placeRouteId: placeRouteId ?? placeId,
        placeTitle,
        placeAddress: placeAddress ?? '',
        placeImageUrl: placeImageUrl ?? '',
        placeNumericId: placeNumericId != null ? String(placeNumericId) : '',
        receiverProfileId: String(profileId),
      },
    } as never);
  };

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (isPreviewBefore || isPreviewAfter || (!buddyProfileExists && !isPreviewList)) {
      setIsLoading(false);
      setIsLoadingMore(false);
      setError(null);
      setProfileOptions(null);
      setMates([]);
      setNextCursor(null);
      setHasMore(false);
      return;
    }

    let cancelled = false;

    setIsLoading(true);
    setIsLoadingMore(false);
    setError(null);
    setProfileOptions(null);
    setMates([]);
    setNextCursor(null);
    setHasMore(false);

    (async () => {
      if (isPreviewList) {
        const previewResult = await fetchMockPlaceMates(placeId);
        if (cancelled) {
          return;
        }

        setProfileOptions(null);
        setMates(previewResult.items);
        setNextCursor(previewResult.nextCursor);
        setHasMore(previewResult.hasMore);
        setIsLoading(false);
        return;
      }

      const [optionsResult, matesResult] = await Promise.allSettled([
        fetchProfileOptions(),
        fetchPlaceMates(placeId),
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
        setError(extractErrorMessage(matesResult.reason));
      }

      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [buddyProfileExists, hasHydrated, isPreviewAfter, isPreviewBefore, isPreviewList, placeId, reloadToken]);

  if (!hasHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Palette.primary} />
      </View>
    );
  }

  if (isPreviewBefore || (!previewMode && !buddyProfileExists)) {
    return (
      <View style={styles.screenRoot}>
        {renderPreviewSwitcher(previewMode, setPreviewMode)}
        <BeforeProfileView onPressProfileEdit={() => router.push('/profile-edit' as never)} />
      </View>
    );
  }

  if (isPreviewAfter) {
    return (
      <View style={styles.screenRoot}>
        {renderPreviewSwitcher(previewMode, setPreviewMode)}
        <SearchingState />
      </View>
    );
  }

  if (isPreviewList && isLoading) {
    return (
      <View style={styles.screenRoot}>
        {renderPreviewSwitcher(previewMode, setPreviewMode)}
        <SearchingState />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.screenRoot}>
        {renderPreviewSwitcher(previewMode, setPreviewMode)}
        <SearchingState />
      </View>
    );
  }

  if (error && mates.length === 0) {
    return (
      <View style={styles.screenRoot}>
        {renderPreviewSwitcher(previewMode, setPreviewMode)}
        <ErrorState
          message="메이트를 불러오지 못했어요."
          description={error}
          onPressRetry={() => setReloadToken((value) => value + 1)}
        />
      </View>
    );
  }

  if (mates.length === 0) {
    return (
      <View style={styles.screenRoot}>
        {renderPreviewSwitcher(previewMode, setPreviewMode)}
        <SearchingState />
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
      const response = isPreviewList
        ? await fetchMockPlaceMates(placeId, nextCursor)
        : await fetchPlaceMates(placeId, nextCursor);
      setMates((current) => mergeUniqueMates(current, response.items));
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (loadMoreError) {
      setError(extractErrorMessage(loadMoreError));
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <View style={styles.screenRoot}>
      {renderPreviewSwitcher(previewMode, setPreviewMode)}
      <View style={styles.container}>
        <View style={styles.listHeader}>
          <CustomText style={styles.listTitle}>이 여행지에 관심 있는 친구들</CustomText>
          <CustomText style={styles.listSubtitle}>같이 여행갈 친구를 찾고 있나요?</CustomText>
        </View>

        <View style={styles.cardList}>
          {mates.map((mate) => (
          <MateCard
              key={mate.profileId}
              mate={mate}
              options={resolvedOptions}
              onPressProfile={(profileId) => setSelectedProfileId(profileId)}
              onPressMessage={(profileId) => {
                if (!mate.canMessage) {
                  Alert.alert('쪽지 불가', '이 메이트는 쪽지를 받을 수 없어요.');
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
              <CustomText style={styles.loadMoreText}>메이트 더 보기</CustomText>
            )}
          </Pressable>
        ) : null}
      </View>

      <BuddyProfileModal
        visible={selectedProfileId !== null}
        profileId={selectedProfileId}
        options={profileOptions}
        onPressMessage={(profileId) => {
          setSelectedProfileId(null);
          if (!buddyProfileExists) {
            Alert.alert('쪽지 불가', '프로필을 먼저 설정해 주세요.');
            return;
          }

          openMessageCompose(profileId);
        }}
        onClose={() => setSelectedProfileId(null)}
      />
    </View>
  );
}

function BeforeProfileView({ onPressProfileEdit }: { onPressProfileEdit: () => void }) {
  return (
    <View style={styles.previewBlock}>
      <Image
        source={require('@/assets/images/mate-preview-before.png')}
        style={styles.beforeIllustration}
        contentFit="contain"
      />

      <CustomText style={styles.previewTitle}>
        여행 메이트를 찾기 위한{`\n`}준비가 필요해요
      </CustomText>

      <CustomText style={styles.previewDescription}>
        프로필을 완성하고 취향이 맞는 친구들을 만나보세요.
      </CustomText>

      <Pressable style={styles.primaryButton} onPress={onPressProfileEdit}>
        <CustomText style={styles.primaryButtonText}>프로필 설정하기</CustomText>
      </Pressable>
    </View>
  );
}

function SearchingState() {
  return (
    <View style={styles.searchingState}>
      <Image
        source={require('@/assets/images/mate-preview-after.png')}
        style={styles.afterIllustration}
        contentFit="contain"
      />

      <CustomText style={styles.previewTitle}>
        함께할 여행 메이트를{`\n`}찾고 있어요
      </CustomText>

      <CustomText style={styles.previewDescription}>
        나와 취향이 맞는 메이트가 나타나면 알려드릴게요.
      </CustomText>
    </View>
  );
}

function ErrorState({
  message,
  description,
  onPressRetry,
}: {
  message: string;
  description: string;
  onPressRetry: () => void;
}) {
  return (
    <View style={styles.errorState}>
      <CustomText style={styles.errorTitle}>{message}</CustomText>
      <CustomText style={styles.errorDescription}>{description}</CustomText>

      <Pressable style={styles.primaryButton} onPress={onPressRetry}>
        <CustomText style={styles.primaryButtonText}>다시 시도</CustomText>
      </Pressable>
    </View>
  );
}

function MateCard({
  mate,
  options,
  onPressProfile,
  onPressMessage,
}: {
  mate: PlaceMate;
  options: Pick<ProfileOptionsResponse, 'countries' | 'languages' | 'koreanLevels'>;
  onPressProfile: (profileId: number) => void;
  onPressMessage: (profileId: number) => void;
}) {
  const countryLabel = formatCountryDisplay(mate.nationalityCode, options.countries);
  const languageChips = buildLanguageChips(mate, options.languages, options.koreanLevels);

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
          <CustomText style={styles.outlineButtonText}>프로필 보기</CustomText>
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
            {mate.canMessage ? '쪽지 보내기' : '쪽지 불가'}
          </CustomText>
        </Pressable>
      </View>
    </View>
  );
}

function ProfileAvatar({ imageUrl, nickname }: { imageUrl: string | null; nickname: string }) {
  return (
    <View style={styles.avatarFrame}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.avatarImage} contentFit="cover" />
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
) {
  const sortedLanguages = sortCodesByOptionOrder(mate.availableLanguages, languageOptions);
  const levelLabel = getLabel(
    mate.koreanLevel,
    koreanLevelOptions,
    FALLBACK_KOREAN_LEVEL_LABELS,
  );
  const hasKorean = sortedLanguages.includes('KO');

  return sortedLanguages.map((languageCode, index) => {
    const languageLabel = getLabel(languageCode, languageOptions, FALLBACK_LANGUAGE_LABELS);
    const shouldAppendLevel = languageCode === 'KO' || (!hasKorean && index === 0);
    return shouldAppendLevel && levelLabel ? `${languageLabel} (${levelLabel})` : languageLabel;
  });
}

function sortCodesByOptionOrder(codes: string[], options: ProfileOptionItem[]) {
  return [...codes].sort((left, right) => {
    const leftIndex = options.findIndex((option) => option.code === left);
    const rightIndex = options.findIndex((option) => option.code === right);

    if (leftIndex === -1 && rightIndex === -1) {
      return left.localeCompare(right);
    }

    if (leftIndex === -1) {
      return 1;
    }

    if (rightIndex === -1) {
      return -1;
    }

    return leftIndex - rightIndex;
  });
}

function getLabel(
  code: string,
  options: ProfileOptionItem[],
  fallbackLabels: Record<string, string>,
) {
  return options.find((option) => option.code === code)?.labelKo ?? fallbackLabels[code] ?? code;
}

function mergeUniqueMates(existing: PlaceMate[], incoming: PlaceMate[]) {
  const byProfileId = new Map<number, PlaceMate>();

  for (const mate of [...existing, ...incoming]) {
    byProfileId.set(mate.profileId, mate);
  }

  return [...byProfileId.values()];
}

function extractErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '메이트 목록을 불러오지 못했어요.';
}

function renderPreviewSwitcher(
  previewMode: PreviewMode | null,
  onChangePreviewMode: (mode: PreviewMode | null) => void,
) {
  const options: Array<{ key: PreviewMode; label: string }> = [
    { key: 'before', label: '프로필 설정 전' },
    { key: 'after', label: '프로필 설정 후' },
    { key: 'list', label: '다른 사용자들 목록' },
  ];

  return (
    <View style={styles.previewPanel}>
      <CustomText style={styles.previewPanelTitle}>개발 토글</CustomText>
      <View style={styles.previewSwitcher}>
        {options.map((option) => {
          const isActive = previewMode === option.key;
          return (
            <Pressable
              key={option.key}
              style={({ pressed }) => [
                styles.previewButton,
                isActive && styles.previewButtonActive,
                pressed && styles.pressed,
              ]}
              onPress={() => onChangePreviewMode(isActive ? null : option.key)}>
              <CustomText
                style={[
                  styles.previewButtonText,
                  isActive && styles.previewButtonTextActive,
                ]}>
                {option.label}
              </CustomText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
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
  previewPanel: {
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  previewPanelTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 12,
    lineHeight: 16,
    color: Palette.grey600,
  },
  previewSwitcher: {
    flexDirection: 'row',
    gap: 8,
  },
  previewButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D7DEE5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  previewButtonActive: {
    borderColor: Palette.primary,
    backgroundColor: '#F4FFF8',
  },
  previewButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 11,
    lineHeight: 15,
    color: Palette.grey600,
    textAlign: 'center',
  },
  previewButtonTextActive: {
    color: Palette.primary,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
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
    paddingTop: 4,
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
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: {
      width: 5,
      height: 5,
    },
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
