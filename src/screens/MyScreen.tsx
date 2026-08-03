import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { fetchMyBuddyProfile } from '@/api/buddy-profile';
import type { BuddyProfile } from '@/api/types';
import BottomNavBar from '@/components/BottomNavBar';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useAuthStore } from '@/store/auth-store';
import { formatCountryDisplay } from '@/utils/country';

type BuddyProfileState = {
  exists: boolean;
  profile: BuddyProfile | null;
};

const LANGUAGE_LABELS: Record<string, string> = {
  KO: '한국어',
  EN: '영어',
  JP: '일본어',
  CN: '중국어',
};

const KOREAN_LEVEL_LABELS: Record<string, string> = {
  BEGINNER: '초급',
  ELEMENTARY: '초급',
  INTERMEDIATE: '중급',
  ADVANCED: '고급',
  FLUENT: '유창',
  NATIVE: '원어민 수준',
};

export default function MyScreen() {
  const router = useRouter();
  const unreadMessageCount = useAuthStore((state) => state.unreadMessageCount);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [profileState, setProfileState] = useState<BuddyProfileState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null);

  const loadProfile = useCallback(() => {
    if (!hasHydrated) {
      return undefined;
    }

    let cancelled = false;
    setIsLoading(true);
    setProfileLoadError(null);
    setProfileState(null);

    (async () => {
      try {
        const data = await fetchMyBuddyProfile();
        if (!cancelled) {
          setProfileState(data);
          setProfileLoadError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setProfileLoadError(
            error instanceof Error ? error.message : '프로필을 불러오지 못했어요.',
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasHydrated]);

  useFocusEffect(loadProfile);

  const profile = profileState?.profile ?? null;
  const hasProfile = !!profileState?.exists && !!profile;

  const handleOpenSettings = () => {
    router.push('/settings' as never);
  };

  const handleOpenProfileSetup = () => {
    router.push('/profile-edit' as never);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <CustomText style={styles.headerTitle}>마이페이지</CustomText>
        <Pressable style={styles.headerIconButton} onPress={handleOpenSettings} hitSlop={10}>
          <SymbolView
            name={{ ios: 'gearshape', android: 'settings', web: 'settings' }}
            size={24}
            weight="regular"
            tintColor={Palette.text}
          />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Palette.primary} />
          </View>
        ) : profileLoadError ? (
          <ErrorState
            message="프로필 정보를 불러오지 못했어요."
            description={profileLoadError}
            onPressRetry={loadProfile ?? undefined}
          />
        ) : hasProfile ? (
          <View style={styles.profileContent}>
            <View style={styles.profileCard}>
              <View style={styles.profileTopRow}>
                <ProfileAvatar profile={profile} />

                <View style={styles.profileMeta}>
                  <View style={styles.nameRow}>
                    <CustomText style={styles.nickname}>{profile.nickname}</CustomText>
                    <CustomText style={styles.nationality}>
                      {' '}
                      · {formatNationality(profile.nationality)}
                    </CustomText>
                  </View>

                  <CustomText style={styles.languageLine}>
                    {formatLanguageLine(profile.availableLanguages, profile.koreanLevel)}
                  </CustomText>
                </View>

                <View style={styles.badgeWrap}>
                  <View
                    style={[
                      styles.publicBadge,
                      profile.profilePublic ? styles.publicBadgePublic : styles.publicBadgePrivate,
                    ]}>
                    <CustomText
                      style={[
                        styles.publicBadgeText,
                        profile.profilePublic
                          ? styles.publicBadgeTextPublic
                          : styles.publicBadgeTextPrivate,
                      ]}>
                      {profile.profilePublic ? '프로필 공개 중' : '프로필 비공개'}
                    </CustomText>
                  </View>
                </View>
              </View>

              <Pressable style={styles.editButton} onPress={handleOpenProfileSetup}>
                <CustomText style={styles.editButtonText}>프로필 수정</CustomText>
              </Pressable>
            </View>

            <View style={styles.shortcutRow}>
              <ShortcutCard
                title="쪽지함"
                icon={<MessageIcon hasBadge={unreadMessageCount > 0} />}
                onPress={() => Alert.alert('준비 중', '쪽지함은 다음 단계에서 연결됩니다.')}
              />

              <ShortcutCard
                title="출발지 관리"
                icon={<MapPinIcon />}
                onPress={() => router.push('/address')}
              />
            </View>
          </View>
        ) : (
          <EmptyState onPress={handleOpenProfileSetup} />
        )}
      </ScrollView>

      <BottomNavBar active="my" />
    </SafeAreaView>
  );
}

function ProfileAvatar({ profile }: { profile: BuddyProfile }) {
  if (profile.profileImageUrl) {
    return (
      <Image
        source={{ uri: profile.profileImageUrl }}
        style={styles.avatarImage}
        contentFit="cover"
      />
    );
  }

  const initial = profile.nickname.trim().charAt(0).toUpperCase() || 'M';

  return (
    <View style={styles.avatarFallback}>
      <CustomText style={styles.avatarInitial}>{initial}</CustomText>
    </View>
  );
}

function ShortcutCard({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.shortcutCard} onPress={onPress}>
      <View style={styles.shortcutIconWrap}>{icon}</View>
      <CustomText style={styles.shortcutLabel}>{title}</CustomText>
    </Pressable>
  );
}

function MessageIcon({ hasBadge }: { hasBadge: boolean }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5.49399 14.8399C5.59692 15.0995 5.61983 15.384 5.55979 15.6568L4.81429 17.9598C4.79027 18.0766 4.79648 18.1976 4.83233 18.3113C4.86819 18.425 4.93249 18.5277 5.01916 18.6096C5.10582 18.6915 5.21196 18.7499 5.32753 18.7792C5.44309 18.8086 5.56424 18.8079 5.67949 18.7774L8.06858 18.0788C8.32599 18.0277 8.59255 18.05 8.83788 18.1432C10.3327 18.8412 12.0259 18.9889 13.619 18.5602C15.212 18.1314 16.6025 17.1538 17.545 15.7998C18.4875 14.4459 18.9215 12.8025 18.7704 11.1597C18.6193 9.51691 17.8929 7.98027 16.7192 6.82089C15.5456 5.66151 14.0002 4.95389 12.3557 4.82289C10.7111 4.6919 9.07318 5.14593 7.73079 6.10489C6.38841 7.06386 5.42786 8.46612 5.01861 10.0643C4.60937 11.6624 4.77773 13.3538 5.49399 14.8399Z"
        stroke={Palette.primary}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {hasBadge ? <Circle cx={21} cy={3} r={2} fill="#F25152" /> : null}
    </Svg>
  );
}

function MapPinIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18.5 10.4001C18.5 14.3945 13.9996 18.5546 12.4883 19.8394C12.3475 19.9436 12.1761 20 12 20C11.8239 20 11.6525 19.9436 11.5117 19.8394C10.0004 18.5546 5.5 14.3945 5.5 10.4001C5.5 8.70267 6.18482 7.07479 7.40381 5.87454C8.62279 4.67429 10.2761 4 12 4C13.7239 4 15.3772 4.67429 16.5962 5.87454C17.8152 7.07479 18.5 8.70267 18.5 10.4001Z"
        stroke={Palette.primary}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 12.8001C13.3462 12.8001 14.4375 11.7256 14.4375 10.4001C14.4375 9.07458 13.3462 8.00005 12 8.00005C10.6538 8.00005 9.5625 9.07458 9.5625 10.4001C9.5625 11.7256 10.6538 12.8001 12 12.8001Z"
        stroke={Palette.primary}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function formatNationality(nationality: string) {
  return formatCountryDisplay(nationality);
}

function formatLanguageLine(languages: string[], koreanLevel: string) {
  const mappedLanguages = languages.map((language) => LANGUAGE_LABELS[language] ?? language);
  const levelLabel = KOREAN_LEVEL_LABELS[koreanLevel] ?? koreanLevel;
  const languageText = mappedLanguages.length > 0 ? mappedLanguages.join(' · ') : '언어 정보 없음';
  return levelLabel ? `${languageText} (${levelLabel})` : languageText;
}

function EmptyState({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.emptyState}>
      <Image
        source={require('@/assets/images/mate-preview-before.png')}
        style={styles.emptyIllustration}
        contentFit="contain"
      />

      <CustomText style={styles.emptyTitle}>여행 메이트를 찾기 위한{'\n'}준비가 필요해요</CustomText>
      <CustomText style={styles.emptyDescription}>
        프로필을 완성하고 취향이 맞는 친구들을 만나보세요.
      </CustomText>

      <Pressable style={styles.emptyButton} onPress={onPress}>
        <CustomText style={styles.emptyButtonText}>프로필 설정하기</CustomText>
      </Pressable>
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
  onPressRetry: (() => void) | undefined;
}) {
  return (
    <View style={styles.errorState}>
      <CustomText style={styles.errorTitle}>{message}</CustomText>
      <CustomText style={styles.errorDescription}>{description}</CustomText>

      {onPressRetry ? (
        <Pressable style={styles.errorButton} onPress={onPressRetry}>
          <CustomText style={styles.errorButtonText}>다시 시도</CustomText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 54,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    color: Palette.text,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    minHeight: 420,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileContent: {
    gap: 16,
  },
  profileCard: {
    borderWidth: 1,
    borderColor: Palette.grey150,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 16,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: Palette.grey100,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: Palette.grey100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    color: Palette.primary,
  },
  profileMeta: {
    flex: 1,
    paddingTop: 2,
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  nickname: {
    fontFamily: FontFamily.pretendard.bold,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.text,
  },
  nationality: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey500,
  },
  languageLine: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey500,
  },
  badgeWrap: {
    alignItems: 'flex-end',
  },
  publicBadge: {
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  publicBadgePublic: {
    borderWidth: 1,
    borderColor: Palette.primaryPale,
    backgroundColor: Palette.secondary,
  },
  publicBadgePrivate: {
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: Palette.grey100,
  },
  publicBadgeText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 12,
    lineHeight: 16.8,
  },
  publicBadgeTextPublic: {
    color: Palette.primary,
  },
  publicBadgeTextPrivate: {
    color: Palette.grey500,
  },
  editButton: {
    height: 42,
    paddingHorizontal:10,
    borderRadius: 10,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    lineHeight: 22.4,
    color: '#ffffff',
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: 10,
  },
  shortcutCard: {
    flex: 1,
    minHeight: 68,
    borderWidth: 1,
    borderColor: Palette.grey200,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 10,
    gap: 4,
  },
  shortcutIconWrap: {
    width: 24,
    height: 24,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    color: Palette.text,
  },
  emptyState: {
    flex: 1,
    minHeight: 560,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16,
  },
  emptyIllustration: {
    width: 133,
    height: 142,
    marginTop: 14,
    marginBottom: 12,
  },
  emptyTitle: {
    textAlign: 'center',
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 27,
    color: Palette.text,
  },
  emptyDescription: {
    marginTop:8,
    textAlign: 'center',
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey600,
  },
  emptyButton: {
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
  emptyButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    lineHeight: 19.6,
    color: '#ffffff',
  },
  errorState: {
    flex: 1,
    minHeight: 560,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 12,
  },
  errorTitle: {
    textAlign: 'center',
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 27,
    color: Palette.text,
  },
  errorDescription: {
    textAlign: 'center',
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey600,
  },
  errorButton: {
    minWidth: 152,
    minHeight: 44,
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  errorButtonText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    lineHeight: 19.6,
    color: '#ffffff',
  },
});
