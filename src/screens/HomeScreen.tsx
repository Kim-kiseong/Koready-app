import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { FeaturedEvent, FeaturedEventCategory, GuideArticle } from '@/api/home';
import { FEATURED_EVENT_CATEGORIES, fetchFeaturedEvents, fetchHome, fetchTravelGuides } from '@/api/home';
import type { LanguageCode } from '@/api/types';
import { updateMyLanguage } from '@/api/user';
import BottomNavBar from '@/components/BottomNavBar';
import CustomText from '@/components/CustomText';
import EventCard from '@/components/EventCard';
import GuideCard from '@/components/GuideCard';
import ArrowDropDownIcon from '@/components/icons/ArrowDropDownIcon';
import ArrowForwardIosIcon from '@/components/icons/ArrowForwardIosIcon';
import LanguageSwitchModal from '@/components/LanguageSwitchModal';
import PillChip from '@/components/PillChip';
import { Palette } from '@/constants/colors';
import { DEV_MOCK_ACCESS_TOKEN } from '@/constants/dev';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { useOnboardingStore } from '@/store/onboarding-store';

const EN_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Trims a full road-name address down to the "구 + 도로명" form shown in the
// header pill — this is presentational only, there's no location-edit screen yet.
function formatShortAddress(address: string): string {
  const tokens = address.split(' ').filter((token) => !/^\(.*\)$/.test(token) && !/^\d/.test(token));
  if (tokens.length <= 2) return address;
  return tokens.slice(1, 3).join(' ');
}

const GUIDE_CARD_GAP = 16;
const SCREEN_PADDING = 16;

export default function HomeScreen() {
  const router = useRouter();
  const t = useTranslation();
  const location = useOnboardingStore((state) => state.location);
  const language = useLanguageStore((state) => state.language);
  const accessToken = useAuthStore((state) => state.accessToken);
  const applyLanguageChange = useAuthStore((state) => state.applyLanguageChange);
  // The dev-bypass session's token isn't real — sending it to PATCH
  // /users/me/language 401s, which trips client.ts's refresh-then-logout
  // cascade. Mirrors LanguageScreen's/TermsScreen's same dev-only bypass.
  const isDevMockSession = __DEV__ && accessToken === DEV_MOCK_ACCESS_TOKEN;
  const { width: windowWidth } = useWindowDimensions();

  const [category, setCategory] = useState<FeaturedEventCategory>('POPULAR');
  const [events, setEvents] = useState<FeaturedEvent[]>([]);
  const [guides, setGuides] = useState<GuideArticle[]>([]);
  const [guidePage, setGuidePage] = useState(0);
  const [pendingLanguage, setPendingLanguage] = useState<LanguageCode | null>(null);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  useEffect(() => {
    // Toggling language fires a new request before the previous one settles —
    // without this guard, a slower first response (e.g. KO right after
    // switching to EN) can resolve after the newer one and clobber it, so the
    // screen gets stuck showing the language you just switched away from.
    let cancelled = false;
    fetchFeaturedEvents(category).then((result) => {
      if (cancelled) return;
      setEvents(result);
    });
    return () => {
      cancelled = true;
    };
  }, [category, language]);

  useEffect(() => {
    let cancelled = false;
    fetchTravelGuides(language).then((result) => {
      if (cancelled) return;
      setGuides(result);
    });
    return () => {
      cancelled = true;
    };
  }, [language]);

  // The current location's display name is localized server-side from the
  // account's preferredLanguage, but onboarding-store only caches whatever
  // string was captured when the location was first selected/searched — so a
  // language toggle has to explicitly re-fetch it via GET /home instead of
  // trusting the cached value, otherwise the address stays frozen in
  // whichever language was active at selection time.
  useEffect(() => {
    let cancelled = false;
    fetchHome()
      .then((home) => {
        if (cancelled || !home.currentLocation) return;
        const prevLocation = useOnboardingStore.getState().location;
        useOnboardingStore.getState().setLocation({
          displayAddress: home.currentLocation.displayName,
          latitude: prevLocation?.latitude ?? null,
          longitude: prevLocation?.longitude ?? null,
          source: prevLocation?.source ?? 'search',
        });
        useOnboardingStore.getState().setCurrentLocationId(home.currentLocation.locationId);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [language]);

  const month = useMemo(() => new Date().getMonth() + 1, []);
  const locationLabel = location ? formatShortAddress(location.displayAddress) : t.home.locationPlaceholder;
  // Figma's guide card spans the full content width (screen width minus the
  // shared 16pt side padding) rather than a fixed pixel size, so it fills the
  // screen proportionally on any device instead of just the 375pt reference.
  const guideCardWidth = windowWidth - SCREEN_PADDING * 2;

  const handleGuideScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / (guideCardWidth + GUIDE_CARD_GAP));
    setGuidePage(page);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable style={styles.locationRow} hitSlop={8} onPress={() => router.push('/address')}>
            <CustomText style={styles.locationText} numberOfLines={1}>
              {locationLabel}
            </CustomText>
            <ArrowDropDownIcon />
          </Pressable>

          <View style={[styles.languageToggle, language === 'EN' && styles.languageToggleEnglish]}>
            <LanguageOption
              label={t.home.languageKo}
              active={language === 'KO'}
              onPress={() => setPendingLanguage('KO')}
            />
            <LanguageOption
              label={t.home.languageEn}
              active={language === 'EN'}
              onPress={() => setPendingLanguage('EN')}
            />
          </View>
        </View>

        <Pressable style={styles.searchBar} onPress={() => router.push('/place-search')}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={14}
            weight="regular"
            tintColor={Palette.grey400}
          />
          <CustomText style={styles.searchPlaceholder}>{t.home.searchPlaceholder}</CustomText>
        </Pressable>

        <View style={[styles.section, styles.featuredSectionTop]}>
          <View style={styles.sectionHeaderRow}>
            {language === 'EN' ? (
              <View style={styles.featuredTitleBlock}>
                <CustomText style={styles.sectionTitleLine1}>Don&apos;t miss these!</CustomText>
                <CustomText style={styles.sectionTitle}>
                  {'In Korea this '}
                  <CustomText style={styles.sectionTitleAccentLarge}>{EN_MONTH_NAMES[month - 1]}</CustomText>
                  {'?'}
                </CustomText>
              </View>
            ) : (
              <View style={styles.featuredTitleBlock}>
                <CustomText style={styles.sectionTitleLine1} numberOfLines={1}>
                  <CustomText style={styles.sectionTitleAccent}>{t.home.featuredTitlePrefix}</CustomText>
                  {t.home.featuredTitleConnector}
                </CustomText>
                <CustomText style={styles.sectionTitle}>
                  <CustomText style={styles.sectionTitleAccentLarge}>{month}</CustomText>
                  {t.home.featuredTitleSuffix}
                </CustomText>
              </View>
            )}
            <SeeAllLink label={t.home.seeAll} onPress={() => router.push('/events')} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {FEATURED_EVENT_CATEGORIES.map((id) => (
              <PillChip
                key={id}
                label={t.home.categories[id]}
                selected={category === id}
                onPress={() => setCategory(id)}
              />
            ))}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventRow}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} onPress={() => router.push({ pathname: '/places/[placeId]', params: { placeId: event.id } })} />
            ))}
          </ScrollView>
        </View>

        <View style={[styles.section, styles.guideSection]}>
          <View style={styles.sectionHeaderRow}>
            <CustomText style={styles.sectionTitle}>{t.home.guidesSectionTitle}</CustomText>
            <SeeAllLink label={t.home.seeAll} onPress={() => router.push('/guides')} />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={guideCardWidth + GUIDE_CARD_GAP}
            decelerationRate="fast"
            onMomentumScrollEnd={handleGuideScroll}
            contentContainerStyle={styles.guideRow}>
            {guides.map((guide) => (
              <GuideCard
                key={guide.id}
                guide={guide}
                width={guideCardWidth}
                onPress={() =>
                  guide.id === 'ktx-easy-booking'
                    ? router.push('/guides/ktx')
                    : router.push({ pathname: '/guides/[guideId]', params: { guideId: guide.id } })
                }
              />
            ))}
          </ScrollView>

          {guides.length > 1 && (
            <View style={styles.dotsRow}>
              {guides.map((guide, index) => (
                <View
                  key={guide.id}
                  style={[styles.dot, index === guidePage ? styles.dotActive : styles.dotInactive]}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNavBar active="home" />

      {pendingLanguage && (
        <LanguageSwitchModal
          visible
          currentLanguage={language}
          targetLanguage={pendingLanguage}
          loading={isChangingLanguage}
          onCancel={() => setPendingLanguage(null)}
          onConfirm={async () => {
            // Guards against duplicate PATCH /users/me/language calls if the
            // user taps "변경하기" again before the first one resolves — the
            // button had no loading/disabled state, so on a slow connection
            // repeated taps looked like the toggle just wasn't responding.
            if (isChangingLanguage) return;
            if (isDevMockSession) {
              applyLanguageChange({
                language: pendingLanguage,
                nextStep: 'COMPLETED',
                updatedAt: new Date().toISOString(),
              });
              setPendingLanguage(null);
              return;
            }
            setIsChangingLanguage(true);
            try {
              const result = await updateMyLanguage(pendingLanguage);
              applyLanguageChange(result);
              setPendingLanguage(null);
            } catch (error) {
              Alert.alert('오류', error instanceof Error ? error.message : '언어 설정에 실패했습니다.');
            } finally {
              setIsChangingLanguage(false);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}

function SeeAllLink({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable style={styles.seeAllRow} onPress={onPress}>
      <CustomText style={styles.seeAllText}>{label}</CustomText>
      <ArrowForwardIosIcon color={Palette.grey500} />
    </Pressable>
  );
}

// Figma: active language sits in a gradient pill (154deg, primaryLight -> primary);
// the inactive language is plain text with no background.
function LanguageOption({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  if (active) {
    return (
      <LinearGradient
        colors={[Palette.primaryLight, Palette.primary]}
        start={{ x: 0.28, y: 0.05 }}
        end={{ x: 0.72, y: 0.95 }}
        style={styles.languageActivePill}>
        <CustomText style={styles.languageTextActive}>{label}</CustomText>
      </LinearGradient>
    );
  }

  return (
    <Pressable hitSlop={10} onPress={onPress}>
      <CustomText style={styles.languageTextInactive}>{label}</CustomText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop:24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  locationText: {
    flexShrink: 1,
    fontFamily: FontFamily.inter.medium,
    fontSize: 16,
    color: Palette.text,
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Palette.grey150,
    backgroundColor: '#ffffff',
    paddingLeft: 4,
    paddingRight: 12,
    paddingVertical: 4,
  },
  languageToggleEnglish: {
    paddingLeft: 12,
    paddingRight: 4,
  },
  languageActivePill: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageTextActive: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 13,
    color: '#ffffff',
  },
  languageTextInactive: {
    fontFamily: FontFamily.inter.medium,
    fontSize: 13,
    color: Palette.grey600,
  },
  searchBar: {
    marginHorizontal: 16,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: Palette.grey100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  searchPlaceholder: {
    flex: 1,
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    color: Palette.grey400,
  },
  section: {
    gap: 16,
  },
  featuredSectionTop: {
    paddingTop: 16,
  },
  guideSection: {
    paddingTop: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  featuredTitleBlock: {
    flexShrink: 1,
    minWidth: 0,
    gap: 8,
  },
  sectionTitleAccent: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    color: Palette.primary,
  },
  sectionTitleLine1: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    color: Palette.text,
  },
  sectionTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: Palette.text,
  },
  sectionTitleAccentLarge: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: Palette.primary,
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    color: Palette.grey500,
  },
  chipRow: {
    gap: 8,
    paddingHorizontal: 16,
  },
  eventRow: {
    gap: 12,
    paddingHorizontal: 16,
  },
  guideRow: {
    gap: GUIDE_CARD_GAP,
    paddingHorizontal: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 7,
    borderRadius: 100,
  },
  dotActive: {
    width: 18,
    backgroundColor: Palette.grey500,
  },
  dotInactive: {
    width: 7,
    backgroundColor: Palette.grey300,
  },
});
