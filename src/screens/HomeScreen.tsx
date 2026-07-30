import { Image } from 'expo-image';
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
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchFeaturedEvents, fetchTravelGuides, FEATURED_EVENT_CATEGORIES } from '@/api/home';
import type { FeaturedEvent, FeaturedEventCategory, GuideArticle } from '@/api/home';
import type { LanguageCode } from '@/api/types';
import { updateMyLanguage } from '@/api/user';
import BottomNavBar from '@/components/BottomNavBar';
import CustomText from '@/components/CustomText';
import EventCard from '@/components/EventCard';
import GuideCard from '@/components/GuideCard';
import LanguageSwitchModal from '@/components/LanguageSwitchModal';
import PillChip from '@/components/PillChip';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { useOnboardingStore } from '@/store/onboarding-store';

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
  const applyLanguageChange = useAuthStore((state) => state.applyLanguageChange);
  const { width: windowWidth } = useWindowDimensions();

  const [category, setCategory] = useState<FeaturedEventCategory>('POPULAR');
  const [events, setEvents] = useState<FeaturedEvent[]>([]);
  const [guides, setGuides] = useState<GuideArticle[]>([]);
  const [guidePage, setGuidePage] = useState(0);
  const [pendingLanguage, setPendingLanguage] = useState<LanguageCode | null>(null);

  useEffect(() => {
    fetchFeaturedEvents(category).then(setEvents);
  }, [category]);

  useEffect(() => {
    fetchTravelGuides().then(setGuides);
  }, []);

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
            <SymbolView
              name={{ ios: 'chevron.down', android: 'arrow_drop_down', web: 'arrow_drop_down' }}
              size={14}
              weight="regular"
              tintColor={Palette.grey400}
            />
          </Pressable>

          <View style={styles.languageToggle}>
            <Pressable
              style={styles.languageSegment}
              hitSlop={10}
              onPress={() => language !== 'KO' && setPendingLanguage('KO')}>
              {language === 'KO' && (
                <View style={[StyleSheet.absoluteFill, styles.languageSegmentActiveBg]} />
              )}
              <CustomText style={language === 'KO' ? styles.languageTextActive : styles.languageTextInactive}>
                {t.home.languageKo}
              </CustomText>
            </Pressable>
            <Pressable
              style={styles.languageSegment}
              hitSlop={10}
              onPress={() => language !== 'EN' && setPendingLanguage('EN')}>
              {language === 'EN' && (
                <View style={[StyleSheet.absoluteFill, styles.languageSegmentActiveBg]} />
              )}
              <CustomText style={language === 'EN' ? styles.languageTextActive : styles.languageTextInactive}>
                {t.home.languageEn}
              </CustomText>
            </Pressable>
          </View>
        </View>

        <View style={styles.searchBar}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={18}
            weight="regular"
            tintColor={Palette.grey400}
          />
          <CustomText style={styles.searchPlaceholder}>{t.home.searchPlaceholder}</CustomText>
          <SymbolView
            name={{ ios: 'xmark.circle.fill', android: 'close', web: 'close' }}
            size={18}
            weight="regular"
            tintColor={Palette.grey350}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <View style={styles.sectionTitleRow}>
                <CustomText style={styles.sectionTitleAccent}>{t.home.featuredTitlePrefix}</CustomText>
                <CustomText style={styles.sectionTitleLine1}>{t.home.featuredTitleConnector}</CustomText>
              </View>
              <CustomText style={styles.sectionTitle}>
                {month}
                {t.home.featuredTitleSuffix}
              </CustomText>
            </View>
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

        <View style={styles.section}>
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
              <GuideCard key={guide.id} guide={guide} width={guideCardWidth} />
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
          onCancel={() => setPendingLanguage(null)}
          onConfirm={async () => {
            try {
              const result = await updateMyLanguage(pendingLanguage);
              applyLanguageChange(result);
            } catch (error) {
              Alert.alert('오류', error instanceof Error ? error.message : '언어 설정에 실패했습니다.');
            } finally {
              setPendingLanguage(null);
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
      <SymbolView
        name={{ ios: 'chevron.right', android: 'arrow_forward_ios', web: 'arrow_forward_ios' }}
        size={12}
        weight="regular"
        tintColor={Palette.grey500}
      />
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
    gap: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 1,
  },
  locationText: {
    flexShrink: 1,
    fontFamily: FontFamily.pretendard.medium,
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
    padding: 4,
  },
  languageSegment: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageSegmentActiveBg: {
    backgroundColor: Palette.primary,
    borderRadius: 100,
  },
  languageTextActive: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 13,
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  languageTextInactive: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    color: Palette.grey600,
    paddingHorizontal: 12,
    paddingVertical: 5,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
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
    fontSize: 18,
    color: Palette.text,
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
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
