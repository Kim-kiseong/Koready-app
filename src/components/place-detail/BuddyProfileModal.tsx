import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SvgUri } from 'react-native-svg';

import { BuddyProfileNotFoundError, fetchBuddyProfile } from '@/api/buddy-profile';
import type {
  BuddyProfileDetail,
  BuddyProfileSocialLink,
  LanguageCode,
  ProfileOptionItem,
  ProfileOptionsResponse,
} from '@/api/types';
import CustomText from '@/components/CustomText';
import SendPlaneIcon from '@/components/icons/SendPlaneIcon';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useLanguageStore } from '@/store/language-store';
import { formatCountryDisplay } from '@/utils/country';
import { buildLanguageDisplayLabels } from '@/utils/language-display';
import { toDisplayText, toStableListKey } from '@/utils/list-item';
import { resolveProfileImageUri } from '@/utils/profile-image';

const SOCIAL_PLATFORM_ICON_URIS = {
  INSTAGRAM: Asset.fromModule(require('../../assets/images/social/instagram.svg')).uri,
  TIKTOK: Asset.fromModule(require('../../assets/images/social/tiktok.svg')).uri,
  WECHAT: Asset.fromModule(require('../../assets/images/social/wechat.svg')).uri,
  XIAOHONGSHU: Asset.fromModule(require('../../assets/images/social/xiaohongshu.svg')).uri,
  LINE: Asset.fromModule(require('../../assets/images/social/line.svg')).uri,
  KAKAOTALK: Asset.fromModule(require('../../assets/images/social/kakaotalk.svg')).uri,
} as const;

const FALLBACK_PROFILE_OPTIONS: ProfileOptionsResponse = {
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
    { code: 'TH', labelKo: '태국어', labelEn: 'Thai', displayOrder: 6 },
    { code: 'VI', labelKo: '베트남어', labelEn: 'Vietnamese', displayOrder: 7 },
    { code: 'MN', labelKo: '몽골어', labelEn: 'Mongolian', displayOrder: 8 },
    { code: 'RU', labelKo: '러시아어', labelEn: 'Russian', displayOrder: 9 },
    { code: 'ID', labelKo: '인도네시아어', labelEn: 'Indonesian', displayOrder: 10 },
    { code: 'ES', labelKo: '스페인어', labelEn: 'Spanish', displayOrder: 11 },
    { code: 'DE', labelKo: '독일어', labelEn: 'German', displayOrder: 12 },
    { code: 'AR', labelKo: '아랍어', labelEn: 'Arabic', displayOrder: 13 },
  ],
  koreanLevels: [
    { code: 'BEGINNER', labelKo: '초급', labelEn: 'Beginner', displayOrder: 1 },
    { code: 'INTERMEDIATE', labelKo: '중급', labelEn: 'Intermediate', displayOrder: 2 },
    { code: 'ADVANCED', labelKo: '고급', labelEn: 'Advanced', displayOrder: 3 },
  ],
  travelStyles: [
    { code: 'LOCAL_FOOD', labelKo: '로컬 맛집', labelEn: 'Local Food', displayOrder: 1 },
    { code: 'LOCAL_FESTIVAL', labelKo: '지역 축제', labelEn: 'Local Festival', displayOrder: 2 },
    { code: 'TRADITIONAL_MARKET', labelKo: '전통시장', labelEn: 'Traditional Market', displayOrder: 3 },
    { code: 'CULTURE_EXPERIENCE', labelKo: '문화 체험', labelEn: 'Culture Experience', displayOrder: 4 },
    { code: 'NATURE', labelKo: '자연 명소', labelEn: 'Nature', displayOrder: 5 },
    { code: 'EXHIBITION_MUSEUM', labelKo: '전시/미술관', labelEn: 'Exhibition / Museum', displayOrder: 6 },
    { code: 'DRAMA_LOCATION', labelKo: '드라마 촬영지', labelEn: 'Drama Location', displayOrder: 7 },
  ],
  socialPlatforms: [
    { code: 'INSTAGRAM', labelKo: 'Instagram', labelEn: 'Instagram', displayOrder: 1 },
    { code: 'TIKTOK', labelKo: 'TikTok', labelEn: 'TikTok', displayOrder: 2 },
    { code: 'WECHAT', labelKo: 'WeChat', labelEn: 'WeChat', displayOrder: 3 },
    { code: 'XIAOHONGSHU', labelKo: 'Xiaohongshu', labelEn: 'Xiaohongshu', displayOrder: 4 },
    { code: 'LINE', labelKo: 'LINE', labelEn: 'LINE', displayOrder: 5 },
    { code: 'KAKAOTALK', labelKo: 'KakaoTalk', labelEn: 'KakaoTalk', displayOrder: 6 },
  ],
};

const PROFILE_MODAL_COPY: Record<
  LanguageCode,
  {
    loading: string;
    errorTitle: string;
    retry: string;
    subtitle: string;
    sectionAbout: string;
    aboutEmpty: string;
    sectionTravelStyle: string;
    sectionContact: string;
    contactDescription: string;
    canMessage: string;
    cannotMessage: string;
    linkErrorTitle: string;
    linkErrorBody: string;
    messageUnavailable: string;
  }
> = {
  KO: {
    loading: '프로필을 불러오는 중이에요',
    errorTitle: '프로필을 불러오지 못했어요',
    retry: '다시 시도',
    subtitle: '같은 여행지에 관심 있는 Buddy예요.',
    sectionAbout: '한 줄 소개',
    aboutEmpty: '소개가 아직 없어요.',
    sectionTravelStyle: '관심 여행 스타일',
    sectionContact: '연락 정보',
    contactDescription: '공개로 설정한 정보만 표시됩니다.',
    canMessage: '쪽지 보내기',
    cannotMessage: '쪽지 불가',
    linkErrorTitle: '링크를 열 수 없어요',
    linkErrorBody: '잠시 후 다시 시도해 주세요.',
    messageUnavailable: '쪽지 불가',
  },
  EN: {
    loading: 'Loading profile...',
    errorTitle: "Couldn't load the profile.",
    retry: 'Try again',
    subtitle: "You're both interested in this destination.",
    sectionAbout: 'About Me',
    aboutEmpty: 'No bio yet.',
    sectionTravelStyle: 'Travel Interests',
    sectionContact: 'Contact Info',
    contactDescription: 'Only information set to public will be shown.',
    canMessage: 'Send Message',
    cannotMessage: 'Not available',
    linkErrorTitle: 'Couldn’t open the link',
    linkErrorBody: 'Please try again in a moment.',
    messageUnavailable: 'Message unavailable',
  },
};

const LANGUAGE_CODE_ALIASES: Record<string, string> = {
  EN: 'EN',
  ENGLISH: 'EN',
  '영어': 'EN',
  KO: 'KO',
  KOREAN: 'KO',
  '한국어': 'KO',
  JP: 'JA',
  JA: 'JA',
  JPN: 'JA',
  JAPANESE: 'JA',
  '일본어': 'JA',
  CN: 'ZH',
  ZH: 'ZH',
  CHN: 'ZH',
  'ZH CN': 'ZH',
  'ZH HANS': 'ZH',
  'ZH HANT': 'ZH',
  CHINESE: 'ZH',
  '중국어': 'ZH',
  FR: 'FR',
  FRENCH: 'FR',
  '프랑스어': 'FR',
  TH: 'TH',
  THAI: 'TH',
  '태국어': 'TH',
  VI: 'VI',
  VIETNAMESE: 'VI',
  '베트남어': 'VI',
  MN: 'MN',
  MONGOLIAN: 'MN',
  '몽골어': 'MN',
  RU: 'RU',
  RUSSIAN: 'RU',
  '러시아어': 'RU',
  ID: 'ID',
  INDONESIAN: 'ID',
  INDONESSIAN: 'ID',
  '인도네시아어': 'ID',
  ES: 'ES',
  SPANISH: 'ES',
  '스페인어': 'ES',
  DE: 'DE',
  GERMAN: 'DE',
  '독일어': 'DE',
  AR: 'AR',
  ARABIC: 'AR',
  '아랍어': 'AR',
};

const TRAVEL_STYLE_CODE_ALIASES: Record<string, string> = {
  LOCAL_FOOD: 'LOCAL_FOOD',
  'LOCAL FOOD': 'LOCAL_FOOD',
  '로컬 맛집': 'LOCAL_FOOD',
  LOCAL_FESTIVAL: 'LOCAL_FESTIVAL',
  'LOCAL FESTIVAL': 'LOCAL_FESTIVAL',
  '지역 축제': 'LOCAL_FESTIVAL',
  TRADITIONAL_MARKET: 'TRADITIONAL_MARKET',
  'TRADITIONAL MARKET': 'TRADITIONAL_MARKET',
  전통시장: 'TRADITIONAL_MARKET',
  CULTURE_EXPERIENCE: 'CULTURE_EXPERIENCE',
  'CULTURE EXPERIENCE': 'CULTURE_EXPERIENCE',
  '문화 체험': 'CULTURE_EXPERIENCE',
  NATURE: 'NATURE',
  '자연 명소': 'NATURE',
  EXHIBITION_MUSEUM: 'EXHIBITION_MUSEUM',
  'EXHIBITION MUSEUM': 'EXHIBITION_MUSEUM',
  '전시/미술관': 'EXHIBITION_MUSEUM',
  DRAMA_LOCATION: 'DRAMA_LOCATION',
  'DRAMA LOCATION': 'DRAMA_LOCATION',
  '드라마 촬영지': 'DRAMA_LOCATION',
};

const KOREAN_LEVEL_CODE_ALIASES: Record<string, string> = {
  BEGINNER: 'BEGINNER',
  '초급': 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  '중급': 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
  '고급': 'ADVANCED',
};

type BuddyProfileModalProps = {
  visible: boolean;
  profileId: number | null;
  options: ProfileOptionsResponse | null;
  onPressMessage?: (profileId: number) => void;
  onClose: () => void;
};

type DisplaySocialLink = BuddyProfileSocialLink & {
  displayValue: string;
  url: string | null;
  label: string;
};

export default function BuddyProfileModal({
  visible,
  profileId,
  options,
  onPressMessage,
  onClose,
}: BuddyProfileModalProps) {
  const language = useLanguageStore((state) => state.language);
  const copy = PROFILE_MODAL_COPY[language];
  const [profile, setProfile] = useState<BuddyProfileDetail | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(visible && profileId != null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const loadKey = JSON.stringify([visible, profileId, language, reloadKey]);
  const [loadedKey, setLoadedKey] = useState(loadKey);

  // Reset before rendering children so a newly opened profile never shows the previous one.
  if (loadedKey !== loadKey) {
    setLoadedKey(loadKey);
    setProfile(null);
    setError(null);
    setIsLoading(visible && profileId != null);
  }

  const resolvedOptions = options ?? FALLBACK_PROFILE_OPTIONS;
  const languageOptions = resolvedOptions.languages;
  const koreanLevelOptions = resolvedOptions.koreanLevels;
  const travelStyleOptions = resolvedOptions.travelStyles;
  const socialPlatformOptions = resolvedOptions.socialPlatforms;

  const handleClose = useCallback(() => {
    setProfile(null);
    setError(null);
    setIsLoading(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!visible || profileId == null) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const loadedProfile = await fetchBuddyProfile(profileId);
        if (cancelled) {
          return;
        }

        setProfile(loadedProfile);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        if (loadError instanceof BuddyProfileNotFoundError) {
          handleClose();
          return;
        }

        setError(loadError instanceof Error ? loadError.message : copy.errorTitle);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [copy.errorTitle, handleClose, language, profileId, reloadKey, visible]);

  const languageChips = useMemo(() => {
    if (!profile) {
      return [];
    }

    const languageFallbacks = createFallbackLabelMaps(languageOptions);
    const levelFallbacks = createFallbackLabelMaps(koreanLevelOptions);

    const sortedLanguages = sortLanguageCodesByOptionOrder(profile.availableLanguages, languageOptions);
    return buildLanguageDisplayLabels(
      sortedLanguages,
      normalizeKoreanLevel(profile.koreanLevel),
      (code) => getLabel(code, languageOptions, language, languageFallbacks),
      (level) => getLabel(level, koreanLevelOptions, language, levelFallbacks),
      '',
      { koreanLevelPlacement: 'append' },
    );
  }, [language, koreanLevelOptions, languageOptions, profile]);

  const travelStyleChips = useMemo(() => {
    if (!profile) {
      return [];
    }

    const travelStyleFallbacks = createFallbackLabelMaps(travelStyleOptions);

    return sortCodesByOptionOrder(
      profile.travelStyles.map(normalizeTravelStyleCode),
      travelStyleOptions,
    ).map((code) =>
      getLabel(code, travelStyleOptions, language, travelStyleFallbacks),
    );
  }, [language, profile, travelStyleOptions]);

  const socialLinks = useMemo<DisplaySocialLink[]>(() => {
    if (!profile) {
      return [];
    }

    const socialFallbacks = createFallbackLabelMaps(socialPlatformOptions);

    return (profile.socialLinks ?? []).reduce<DisplaySocialLink[]>((acc, link) => {
      if (!link) {
        return acc;
      }

      const displayValue = typeof link.displayValue === 'string' ? link.displayValue.trim() : '';
      const url = typeof link.url === 'string' ? link.url.trim() : '';
      if (!displayValue && !url) {
        return acc;
      }

      const type = normalizeSocialType(link.type ?? '');
      acc.push({
        ...link,
        displayValue: displayValue || url,
        url: url || null,
        type,
        label: getLabel(type, socialPlatformOptions, language, socialFallbacks),
      });
      return acc;
    }, []);
  }, [language, profile, socialPlatformOptions]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View style={styles.card}>
          {profile ? (
            <>
              <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                <View style={styles.headerRow}>
                  <ProfileAvatar imageUrl={profile.profileImageUrl} nickname={profile.nickname} />

                  <View style={styles.headerMeta}>
                    <View style={styles.nameRow}>
                      <CustomText style={styles.nickname}>{profile.nickname}</CustomText>
                      <CustomText style={styles.separator}>·</CustomText>
                      <CustomText style={styles.country}>
                        {formatCountryDisplay(
                          profile.nationalityCode ?? profile.nationality ?? '',
                          resolvedOptions.countries,
                          language,
                        )}
                      </CustomText>
                    </View>

                    <View style={styles.chipRow}>
                      {languageChips.map((chipLabel, index) => (
                        <View key={toStableListKey(chipLabel, index)} style={styles.languageChip}>
                          <CustomText style={styles.languageChipText}>{toDisplayText(chipLabel)}</CustomText>
                        </View>
                      ))}
                    </View>

                    <CustomText style={styles.subtitle}>{copy.subtitle}</CustomText>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                  <CustomText style={styles.sectionTitle}>{copy.sectionAbout}</CustomText>
                  <CustomText style={styles.bioText}>{profile.bio || copy.aboutEmpty}</CustomText>
                </View>

                {travelStyleChips.length > 0 ? (
                  <View style={styles.section}>
                    <CustomText style={styles.sectionTitle}>{copy.sectionTravelStyle}</CustomText>
                    <View style={styles.travelChipWrap}>
                      {travelStyleChips.map((chipLabel, index) => (
                        <View key={toStableListKey(chipLabel, index)} style={styles.travelChip}>
                          <CustomText style={styles.travelChipText}>{toDisplayText(chipLabel)}</CustomText>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                <View style={styles.section}>
                  <CustomText style={styles.sectionTitle}>{copy.sectionContact}</CustomText>
                  <CustomText style={styles.contactDescription}>{copy.contactDescription}</CustomText>

                  <View style={styles.socialList}>
                    {socialLinks.map((link) => {
                      const canOpenLink = typeof link.url === 'string' && link.url.length > 0;

                      return (
                        <Pressable
                          key={`${link.type}-${link.displayValue}`}
                          style={({ pressed }) => [styles.socialRow, canOpenLink && pressed && styles.pressed]}
                          disabled={!canOpenLink}
                          onPress={async () => {
                            if (!link.url) {
                              return;
                            }

                            try {
                              await Linking.openURL(link.url);
                            } catch {
                              Alert.alert(copy.linkErrorTitle, copy.linkErrorBody);
                            }
                          }}>
                        <SocialPlatformIcon code={link.type} size={40} />

                        <View style={styles.socialTextGroup}>
                          <CustomText style={styles.socialLabel}>{link.label}</CustomText>
                          <CustomText style={styles.socialValue}>{link.displayValue}</CustomText>
                        </View>

                          {canOpenLink ? (
                            <SymbolView
                              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                              size={14}
                              weight="semibold"
                              tintColor={Palette.grey400}
                            />
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>

              <Pressable
                style={({ pressed }) => [
                  styles.messageButton,
                  pressed && styles.pressed,
                  !profile.canMessage && styles.messageButtonDisabled,
                ]}
                disabled={!profile.canMessage}
                onPress={() => {
                  if (!profile.canMessage) {
                    return;
                  }

                  if (onPressMessage) {
                    onPressMessage(profile.profileId);
                    return;
                  }

                  Alert.alert(
                    copy.messageUnavailable,
                    language === 'EN'
                      ? 'Message sending will be connected in the next step.'
                      : '쪽지 보내기 기능은 다음 단계에서 연결됩니다.',
                  );
                }}>
                <SendPlaneIcon color={profile.canMessage ? '#FFFFFF' : Palette.grey500} />
                <CustomText
                  style={[
                    styles.messageButtonText,
                    !profile.canMessage && styles.messageButtonTextDisabled,
                  ]}>
                  {profile.canMessage ? copy.canMessage : copy.cannotMessage}
                </CustomText>
              </Pressable>
            </>
          ) : isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={Palette.primary} />
              <CustomText style={styles.loadingText}>{copy.loading}</CustomText>
            </View>
          ) : error ? (
            <View style={styles.loadingState}>
              <CustomText style={styles.errorTitle}>{copy.errorTitle}</CustomText>
              <CustomText style={styles.errorDescription}>{error}</CustomText>
              <Pressable style={styles.retryButton} onPress={() => setReloadKey((value) => value + 1)}>
                <CustomText style={styles.retryButtonText}>{copy.retry}</CustomText>
              </Pressable>
            </View>
          ) : null}

          <Pressable style={styles.closeButton} onPress={handleClose}>
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              size={16}
              weight="regular"
              tintColor={Palette.grey350}
            />
          </Pressable>
        </View>
      </View>
    </Modal>
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

function SocialPlatformIcon({ code, size = 40}: { code: string; size?: number }) {
  const uri = SOCIAL_PLATFORM_ICON_URIS[normalizeSocialType(code) as keyof typeof SOCIAL_PLATFORM_ICON_URIS];

  if (uri) {
    return <SvgUri uri={uri} width={size} height={size} />;
  }

  return (
    <View style={[styles.fallbackIcon, { width: size, height: size, borderRadius: size * 0.2 }]}>
      <CustomText style={styles.fallbackGlyph}>{code.slice(0, 2)}</CustomText>
    </View>
  );
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

function sortLanguageCodesByOptionOrder(codes: string[], options: ProfileOptionItem[]) {
  const order = new Map(
    options.map((option, index) => [normalizeLanguageCode(option.code), index] as const),
  );
  const normalized = codes
    .map(normalizeLanguageCode)
    .filter((code): code is string => typeof code === 'string' && code.length > 0);
  const unique = Array.from(new Set(normalized));

  return unique.sort((left, right) => {
    const leftOrder = order.get(left);
    const rightOrder = order.get(right);

    if (leftOrder == null && rightOrder == null) {
      return left.localeCompare(right);
    }

    if (leftOrder == null) {
      return 1;
    }

    if (rightOrder == null) {
      return -1;
    }

    return leftOrder - rightOrder;
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

function normalizeLanguageCode(value: string) {
  const key = normalizeLookupKey(value);
  return LANGUAGE_CODE_ALIASES[key] ?? value.trim().toUpperCase();
}

function normalizeTravelStyleCode(value: string) {
  const key = normalizeLookupKey(value);
  return TRAVEL_STYLE_CODE_ALIASES[key] ?? value.trim().toUpperCase();
}

function normalizeKoreanLevel(value: string) {
  const key = normalizeLookupKey(value);
  return KOREAN_LEVEL_CODE_ALIASES[key] ?? value.trim().toUpperCase();
}

function normalizeLookupKey(value: string) {
  return value.trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').toUpperCase();
}

function normalizeSocialType(type: string) {
  return type.trim().toUpperCase();
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  backdrop: {
    position: 'absolute',
    top: 7,
    right: 5,
    bottom: 0,
    left: 0,
  },
  card: {
    width: '100%',
    maxWidth: 343,
    height: Platform.OS === 'web' ? '80%' : '70%',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 16,
    position: 'relative',
    overflow: 'visible',
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
  closeButton: {
    position: 'absolute',
    top: 7,
    right: 5,
    zIndex: 20,
    elevation: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 25,
    paddingBottom: Platform.OS === 'web' ? 72 : 16,
  },
  loadingState: {
    minHeight: 420,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    lineHeight: 20,
    color: Palette.grey600,
  },
  errorTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 26,
    color: Palette.text,
    textAlign: 'center',
  },
  errorDescription: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 20,
    color: Palette.grey600,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingRight: 8,
  },
  avatarFrame: {
    width: 66,
    height: 66,
    padding: 10,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 66,
    height: 66,
    borderRadius: 100,
    backgroundColor: '#E8EEF2',
  },
  avatarFallback: {
    width: 66,
    height: 66,
    borderRadius: 100,
    backgroundColor: '#E8EEF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    color: Palette.grey500,
  },
  headerMeta: {
    flex: 1,
    paddingTop: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 4,
  },
  nickname: {
    fontFamily: FontFamily.pretendard.bold,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.text,
  },
  separator: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey500,
  },
  country: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey500,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  languageChip: {
    minHeight: 24,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#9BE6C6',
    backgroundColor: '#F4FFF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageChipText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 12,
    lineHeight: 16.8,
    color: Palette.primary,
  },
  subtitle: {
    marginTop: 8,
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey400,
  },
  divider: {
    marginTop: 16,
    marginBottom: 16,
    height: 1,
    backgroundColor: Palette.grey200,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.primary,
    marginBottom: 12,
  },
  bioText: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.text,
  },
  travelChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  travelChip: {
    minHeight: 28,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Palette.grey100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelChipText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 12,
    lineHeight: 16.8,
    color: Palette.grey600,
  },
  contactDescription: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey400,
    marginBottom: 12,
  },
  socialList: {
    gap: 16,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  socialTextGroup: {
    flex: 1,
    gap: 2,
  },
  socialLabel: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 12,
    lineHeight: 16.8,
    color: Palette.grey400,
  },
  socialValue: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.text,
  },
  messageButton: {
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  messageButtonDisabled: {
    backgroundColor: Palette.grey300,
  },
  messageButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    lineHeight: 22.4,
    color: '#FFFFFF',
  },
  messageButtonTextDisabled: {
    color: Palette.grey500,
  },
  fallbackIcon: {
    backgroundColor: Palette.grey100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackGlyph: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 12,
    color: Palette.grey500,
  },
  pressed: {
    opacity: 0.85,
  },
});
