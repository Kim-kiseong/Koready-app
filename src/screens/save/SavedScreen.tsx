import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  fetchSavedPlaces,
  unsavePlace,
} from '@/api/saved-place';
import type { LanguageCode, SavedPlaceItem } from '@/api/types';
import BottomNavBar from '@/components/BottomNavBar';
import CustomText from '@/components/CustomText';
import HeartIcon from '@/components/HeartIcon';
import DetailTag from '@/components/place-detail/DetailTag';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { toDisplayText, toStableListKey } from '@/utils/list-item';

type SavedSortOrder = 'SAVED_AT' | 'DEADLINE';

type SavedSortOption = {
  value: SavedSortOrder;
  label: string;
};

const TRAVEL_STYLE_LABELS: Record<LanguageCode, Record<string, string>> = {
  KO: {
    LOCAL_FOOD: '로컬 맛집',
    LOCAL_FESTIVAL: '지역 축제',
    TRADITIONAL_MARKET: '전통시장',
    CULTURE_EXPERIENCE: '문화 체험',
    NATURE: '자연 명소',
    EXHIBITION_MUSEUM: '전시/미술관',
    DRAMA_LOCATION: '드라마 촬영지',
  },
  EN: {
    LOCAL_FOOD: 'Local Food',
    LOCAL_FESTIVAL: 'Local Festival',
    TRADITIONAL_MARKET: 'Traditional Market',
    CULTURE_EXPERIENCE: 'Cultural Experience',
    NATURE: 'Nature',
    EXHIBITION_MUSEUM: 'Exhibitions & Museums',
    DRAMA_LOCATION: 'Drama Filming Sites',
  },
};

const SAVED_PLACE_TITLES_EN_BY_ID: Record<number, string> = {
  1101: '[Gimcheon] Gimbap Festival',
  1102: '[Jeonju] Ipap Tree Festival',
  1103: '[Damyang] Bamboo Festival',
  1104: 'Jikjisa Temple',
  1105: 'Samyeongdaesa Park',
  1106: 'Gimcheon Municipal Museum',
};

const TITLE_TRANSLATION_ENTRIES: Array<[string, string]> = [
  ['[담양] 대나무 축제', '[Damyang] Bamboo Festival'],
  ['[전주] 이팝나무 축제', '[Jeonju] Ipap Tree Festival'],
  ['N서울타워(남산타워)', 'N Seoul Tower (Namsan Tower)'],
  ['가회민화박물관', 'Gahoe Minhwa Museum'],
  ['가회민화', 'Gahoe Minhwa'],
  ['광장시장', 'Gwangjang Market'],
  ['광장', 'Gwangjang'],
  ['경복궁', 'Gyeongbokgung Palace'],
  ['국립중앙박물관', 'National Museum of Korea'],
  ['국립현대미술관 과천', 'National Museum of Modern and Contemporary Art, Gwacheon'],
  ['광명동굴', 'Gwangmyeong Cave'],
  ['서울 봄꽃축제', 'Seoul Spring Flower Festival'],
  ['서울식물원', 'Seoul Botanic Park'],
  ['서울숲', 'Seoul Forest'],
  ['성수동 서울숲', 'Seongsu-dong Seoul Forest'],
  ['예술의 전당', 'Seoul Arts Center'],
  ['한국민속촌', 'Korean Folk Village'],
  ['수원화성', 'Suwon Hwaseong Fortress'],
  ['양평 두물머리', 'Yangpyeong Dumulmeori'],
  ['파주 임진각', 'Paju Imjingak'],
  ['루덴시아', 'Ludensia'],
  ['공주 공산성', 'Gongju Gongsanseong Fortress'],
  ['부여 궁남지', 'Buyeo Gungnamji Pond'],
  ['전주 한옥마을', 'Jeonju Hanok Village'],
  ['목포 해상케이블카', 'Mokpo Marine Cable Car'],
  ['담양 죽녹원', 'Damyang Bamboo Garden'],
  ['광주 국립아시아문화전당', 'Gwangju Asia Culture Center'],
  ['순천만 국가정원', 'Suncheon Bay National Garden'],
  ['광양 매화마을', 'Gwangyang Plum Village'],
  ['보성 녹차밭', 'Boseong Green Tea Fields'],
  ['설악산 국립공원', 'Seoraksan National Park'],
  ['강릉 경포해변', 'Gangneung Gyeongpo Beach'],
  ['안목해변 커피거리', 'Anmok Beach Coffee Street'],
  ['속초 관광수산시장', 'Sokcho Tourist & Fish Market'],
  ['정동심곡 바다부채길', 'Jeongdong-Simgok Sea Trail'],
  ['대관령 양떼 목장', 'Daegwallyeong Sheep Ranch'],
  ['영월 청령포', 'Yeongwol Cheongnyeongpo'],
  ['춘천 유포리 막국수', 'Chuncheon Yupori Makguksu'],
  ['원주 반계리 은행나무', 'Wonju Bangye-ri Ginkgo Tree'],
  ['경주 첨성대', 'Cheomseongdae'],
  ['경주 석굴암', 'Seokguram'],
  ['부산 광안대교', 'Gwangandaegyo Bridge'],
  ['대구 서문시장', 'Daegu Seomun Market'],
  ['울산 태화강 국가정원', 'Ulsan Taehwa River National Garden'],
  ['안동 하회마을', 'Andong Hahoe Village'],
  ['통영 동피랑 벽화마을', 'Tongyeong Dongpirang Mural Village'],
  ['김천 김밥축제', 'Gimcheon Gimbap Festival'],
  ['영양 자작나무숲', 'Yeongyang Birch Forest'],
  ['하동 술상 전어마을', 'Hadong Sulsang Jeoneo Village'],
  ['함양 대봉스카이랜드', 'Hamyang Daebong Sky Land'],
  ['상주 카페 골감', 'Sangju Cafe Golgam'],
  ['한라산', 'Hallasan'],
  ['성산일출봉', 'Seongsan Ilchulbong'],
  ['우도', 'Udo'],
  ['숙성도 제주본점', 'Suksungdo Jeju Main Branch'],
  ['아베베베이커리', 'Abebe Bakery'],
  ['협재 해수욕장', 'Hyeopjae Beach'],
  ['카멜리아힐', 'Camellia Hill'],
  ['제주올레길', 'Jeju Olle Trail'],
  ['천지연폭포', 'Cheonjiyeon Waterfall'],
  ['장인의 집', 'House of Artisans'],
  ['직지사', 'Jikjisa Temple'],
  ['사명대사공원', 'Samyeongdaesa Park'],
  ['김천시립박물관', 'Gimcheon Municipal Museum'],
  ['남양주 봉선사', 'Namyangju Bongseonsa Temple'],
  ['남원 명문 제과', 'Namwon Myeongmun Bakery'],
  ['대관령 양떼 목장', 'Daegwallyeong Sheep Ranch'],
  ['대구 서문시장', 'Daegu Seomun Market'],
  ['무주 구천동계곡', 'Muju Gucheon-dong Valley'],
  ['벗골도토리막국수', 'Beotgol Acorn Makguksu'],
  ['빵과당신', 'Bread and You'],
  ['사명대사공원', 'Samyeongdaesa Park'],
  ['수락 휴', 'Surak Hyu'],
  ['양평 두물머리', 'Yangpyeong Dumulmeori'],
  ['연천 오일장', 'Yeoncheon Oil Market'],
  ['영광 법성포 굴비거리', 'Yeonggwang Beopseongpo Gulbi Street'],
  ['영동 와인터널', 'Yeongdong Wine Tunnel'],
  ['옥천 강대박', 'Okcheon Gangdaebak'],
  ['온양온천', 'Onyang Hot Springs'],
  ['원조민속순대타운', 'Wonjo Sundae Town'],
  ['천안 독립기념관', 'Cheonan Independence Hall'],
  ['충주 아쿠아리움', 'Chungju Aquarium'],
  ['화천 산천어 축제', 'Hwacheon Sancheoneo Festival'],
];

const TAG_TRANSLATION_ENTRIES: Array<[string, string]> = [
  ['가족', 'Family'],
  ['가을', 'Autumn'],
  ['간식', 'Snack'],
  ['감성', 'Seasonal'],
  ['강변', 'Riverside'],
  ['건축', 'Architecture'],
  ['겨울', 'Winter'],
  ['계곡', 'Valley'],
  ['고기', 'Meat'],
  ['골목', 'Alley'],
  ['공연', 'Performance'],
  ['공원', 'Nature'],
  ['관광', 'Sightseeing'],
  ['국립공원', 'National Park'],
  ['굴비', 'Yellow Croaker'],
  ['궁궐', 'Palace'],
  ['기념관', 'Memorial Hall'],
  ['꽃', 'Flowers'],
  ['녹차', 'Green Tea'],
  ['대나무', 'Bamboo'],
  ['도심', 'Urban'],
  ['동굴', 'Cave'],
  ['드라마 촬영지', 'Drama Filming Sites'],
  ['드라이브', 'Drive'],
  ['디저트', 'Dessert'],
  ['랜드마크', 'Landmark'],
  ['로컬', 'Local'],
  ['로컬맛집', 'Local Food'],
  ['로컬 맛집', 'Local Food'],
  ['막국수', 'Makguksu'],
  ['매화', 'Plum Blossom'],
  ['먹거리', 'Food'],
  ['면요리', 'Noodles'],
  ['명소', 'Spot'],
  ['모노레일', 'Monorail'],
  ['목장', 'Ranch'],
  ['문화', 'Culture'],
  ['문화 체험', 'Cultural Experience'],
  ['문화체험', 'Cultural Experience'],
  ['미술관', 'Art'],
  ['미식', 'Gourmet'],
  ['바다', 'Ocean'],
  ['박물관', 'Learning'],
  ['베이커리', 'Bakery'],
  ['벽화', 'Mural'],
  ['봄', 'Spring'],
  ['분식', 'Korean Snack'],
  ['빵', 'Bread'],
  ['사진', 'Photography'],
  ['재미', 'Fun'],
  ['사찰', 'Temple'],
  ['산', 'Mountain'],
  ['산책', 'Walking'],
  ['섬', 'Island'],
  ['성곽', 'Fortress'],
  ['세계유산', 'World Heritage'],
  ['순대', 'Sundae'],
  ['숲', 'Forest'],
  ['습지', 'Wetland'],
  ['시장', 'Market'],
  ['시즌추천', 'Seasonal Pick'],
  ['식사', 'Meal'],
  ['아쿠아리움', 'Aquarium'],
  ['야경', 'Night View'],
  ['언덕', 'Hill'],
  ['여행', 'Travel'],
  ['역사', 'History'],
  ['연못', 'Pond'],
  ['예술', 'Art'],
  ['온천', 'Hot Spring'],
  ['와인', 'Wine'],
  ['유산', 'Heritage'],
  ['유적', 'Heritage Site'],
  ['음식', 'Food'],
  ['일몰', 'Sunset'],
  ['일출', 'Sunrise'],
  ['자연', 'Nature'],
  ['자연 명소', 'Nature'],
  ['자연명소', 'Nature'],
  ['전망', 'View'],
  ['전시 / 미술관', 'Exhibitions & Museums'],
  ['전시/미술관', 'Exhibitions & Museums'],
  ['전시', 'Exhibition'],
  ['전통', 'Tradition'],
  ['전통마을', 'Traditional Village'],
  ['전통시장', 'Traditional Market'],
  ['절경', 'Scenic View'],
  ['정원', 'Garden'],
  ['지역 축제', 'Local Festival'],
  ['지역축제', 'Local Festival'],
  ['체험', 'Experience'],
  ['축제', 'Festival'],
  ['카페', 'Cafe'],
  ['케이블카', 'Cable Car'],
  ['테마파크', 'Theme Park'],
  ['트레킹', 'Trekking'],
  ['평화', 'Peace'],
  ['폭포', 'Waterfall'],
  ['풍경', 'Scenery'],
  ['한상', 'Table Set'],
  ['한옥', 'Hanok'],
  ['해변', 'Beach'],
  ['해산물', 'Seafood'],
  ['해안', 'Coast'],
  ['휴식', 'Relaxation'],
  ['휴양', 'Leisure'],
  ['힐링', 'Healing'],
];

function createLocalizedLabelMap(entries: Array<[string, string]>) {
  const ko: Record<string, string> = {};
  const en: Record<string, string> = {};

  for (const [korean, english] of entries) {
    ko[korean] = korean;
    ko[english] = korean;
    en[korean] = english;
    en[english] = english;
  }

  return {
    KO: ko,
    EN: en,
  } satisfies Record<LanguageCode, Record<string, string>>;
}

const TITLE_TRANSLATIONS = createLocalizedLabelMap(TITLE_TRANSLATION_ENTRIES);
const TAG_TRANSLATIONS = createLocalizedLabelMap(TAG_TRANSLATION_ENTRIES);

const TITLE_PHRASE_MAP: Record<LanguageCode, Array<[RegExp, string]>> = {
  EN: [
    [/가회민화박물관/g, 'Gahoe Minhwa Museum'],
    [/가회민화/g, 'Gahoe Minhwa'],
    [/광장시장/g, 'Gwangjang Market'],
    [/광장/g, 'Gwangjang'],
    [/경복궁/g, 'Gyeongbokgung Palace'],
    [/국립현대미술관 과천/g, 'National Museum of Modern and Contemporary Art, Gwacheon'],
    [/서울식물원/g, 'Seoul Botanic Park'],
    [/서울숲/g, 'Seoul Forest'],
    [/성수동/g, 'Seongsu-dong'],
    [/예술의 전당/g, 'Seoul Arts Center'],
    [/광명동굴/g, 'Gwangmyeong Cave'],
    [/임진각/g, 'Imjingak'],
    [/봉선사/g, 'Bongseonsa Temple'],
    [/독립기념관/g, 'Independence Hall of Korea'],
    [/하회마을/g, 'Hahoe Village'],
    [/동피랑 벽화마을/g, 'Dongpirang Mural Village'],
    [/광안대교/g, 'Gwangandaegyo Bridge'],
    [/서문시장/g, 'Seomun Market'],
    [/태화강 국가정원/g, 'Taehwa River National Garden'],
    [/구천동계곡/g, 'Gucheon-dong Valley'],
    [/산천어 축제/g, 'Sancheoneo Festival'],
    [/제주본점/g, 'Jeju Main Branch'],
    [/해상케이블카/g, 'Marine Cable Car'],
    [/국가정원/g, 'National Garden'],
    [/한옥마을/g, 'Hanok Village'],
    [/국립중앙박물관/g, 'National Museum of Korea'],
    [/국립아시아문화전당/g, 'Asia Culture Center'],
    [/민속촌/g, 'Folk Village'],
    [/한옥마을/g, 'Hanok Village'],
    [/이팝나무/g, 'Ipap Tree'],
    [/대나무/g, 'Bamboo'],
    [/김밥/g, 'Gimbap'],
    [/박물관/g, 'Museum'],
    [/시장/g, 'Market'],
    [/공원/g, 'Park'],
    [/마을/g, 'Village'],
    [/해수욕장/g, 'Beach'],
    [/폭포/g, 'Waterfall'],
    [/온천/g, 'Hot Spring'],
    [/아쿠아리움/g, 'Aquarium'],
    [/케이블카/g, 'Cable Car'],
    [/정원/g, 'Garden'],
    [/숲/g, 'Forest'],
    [/길/g, 'Trail'],
    [/산/g, 'Mountain'],
    [/사찰/g, 'Temple'],
  ],
  KO: [
    [/Gahoe Minhwa Museum/g, '가회민화박물관'],
    [/Gahoe Minhwa/g, '가회민화'],
    [/Gwangjang Market/g, '광장시장'],
    [/Gwangjang/g, '광장'],
    [/Gyeongbokgung Palace/g, '경복궁'],
    [/National Museum of Modern and Contemporary Art, Gwacheon/g, '국립현대미술관 과천'],
    [/Seoul Botanic Park/g, '서울식물원'],
    [/Seoul Forest/g, '서울숲'],
    [/Seongsu-dong/g, '성수동'],
    [/Seoul Arts Center/g, '예술의 전당'],
    [/Gwangmyeong Cave/g, '광명동굴'],
    [/Imjingak/g, '임진각'],
    [/Bongseonsa Temple/g, '봉선사'],
    [/Independence Hall of Korea/g, '독립기념관'],
    [/Hahoe Village/g, '하회마을'],
    [/Dongpirang Mural Village/g, '동피랑 벽화마을'],
    [/Gwangandaegyo Bridge/g, '광안대교'],
    [/Seomun Market/g, '서문시장'],
    [/Taehwa River National Garden/g, '태화강 국가정원'],
    [/Gucheon-dong Valley/g, '구천동계곡'],
    [/Sancheoneo Festival/g, '산천어 축제'],
    [/Jeju Main Branch/g, '제주본점'],
    [/Marine Cable Car/g, '해상케이블카'],
    [/National Garden/g, '국가정원'],
    [/Hanok Village/g, '한옥마을'],
    [/National Museum of Korea/g, '국립중앙박물관'],
    [/Asia Culture Center/g, '국립아시아문화전당'],
    [/Folk Village/g, '민속촌'],
    [/Hanok Village/g, '한옥마을'],
    [/Ipap Tree/g, '이팝나무'],
    [/Bamboo/g, '대나무'],
    [/Gimbap/g, '김밥'],
    [/Museum/g, '박물관'],
    [/Market/g, '시장'],
    [/Park/g, '공원'],
    [/Village/g, '마을'],
    [/Beach/g, '해수욕장'],
    [/Waterfall/g, '폭포'],
    [/Hot Spring/g, '온천'],
    [/Aquarium/g, '아쿠아리움'],
    [/Cable Car/g, '케이블카'],
    [/Garden/g, '정원'],
    [/Forest/g, '숲'],
    [/Trail/g, '길'],
    [/Mountain/g, '산'],
    [/Temple/g, '사찰'],
  ],
};

export default function SavedScreen() {
  const router = useRouter();
  const t = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const hasAuthHydrated = useAuthStore((state) => state.hasHydrated);

  const [sortOrder, setSortOrder] = useState<SavedSortOrder>('SAVED_AT');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSortSheetVisible, setIsSortSheetVisible] = useState(false);
  const [savedPlacesSnapshot, setSavedPlacesSnapshot] = useState<SavedPlaceItem[]>([]);

  const loadSavedPlaces = useCallback(
    async (nextCursor: string | null = null, isMore = false) => {
      if (!hasAuthHydrated) {
        return;
      }

      if (isMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const result = await fetchSavedPlaces(nextCursor, 20);
        setSavedPlacesSnapshot((current) => {
          const nextItems = isMore ? [...current, ...result.items] : [...result.items];
          const deduped = new Map<number, SavedPlaceItem>();

          for (const item of nextItems) {
            deduped.set(item.placeId, item);
          }

          return [...deduped.values()];
        });
        setCursor(result.nextCursor);
        setHasMore(result.hasMore);
      } finally {
        if (isMore) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [hasAuthHydrated],
  );

  useEffect(() => {
    if (!hasAuthHydrated) {
      return;
    }

    setSavedPlacesSnapshot([]);
    setCursor(null);
    setHasMore(false);

    const timeout = setTimeout(() => {
      void loadSavedPlaces(null, false);
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  }, [language, hasAuthHydrated, loadSavedPlaces]);

  const savedPlaces = useMemo(() => {
    const items = savedPlacesSnapshot.filter((item) => item.saved !== false);

    return items.sort((left, right) => {
      if (sortOrder === 'DEADLINE') {
        const leftDeadline = left.festivalOccurrence?.endDate;
        const rightDeadline = right.festivalOccurrence?.endDate;

        if (leftDeadline && rightDeadline && leftDeadline !== rightDeadline) {
          return leftDeadline.localeCompare(rightDeadline);
        }

        if (leftDeadline && !rightDeadline) {
          return -1;
        }

        if (!leftDeadline && rightDeadline) {
          return 1;
        }
      }

      const savedDiff = Date.parse(right.savedAt) - Date.parse(left.savedAt);
      if (savedDiff !== 0) {
        return savedDiff;
      }

      return right.placeId - left.placeId;
    });
  }, [savedPlacesSnapshot, sortOrder]);

  const sortOptions = [
    { value: 'SAVED_AT', label: t.saved.sortOptions.savedAt },
    { value: 'DEADLINE', label: t.saved.sortOptions.deadline },
  ] satisfies SavedSortOption[];

  const currentSortLabel =
    sortOptions.find((option) => option.value === sortOrder)?.label ?? t.saved.sortOptions.savedAt;
  const sortChevronName = isSortSheetVisible
    ? ({ ios: 'chevron.up', android: 'arrow_drop_up', web: 'arrow_drop_up' } as const)
    : ({ ios: 'chevron.down', android: 'arrow_drop_down', web: 'arrow_drop_down' } as const);

  const handleToggleSave = (place: SavedPlaceItem) => {
    setSavedPlacesSnapshot((current) =>
      current.filter((item) => item.placeId !== place.placeId),
    );
    void unsavePlace(place.placeId).catch(() => {});
  };

  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore) {
      return;
    }

    void loadSavedPlaces(cursor, true);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <CustomText style={styles.headerTitle}>{t.saved.title}</CustomText>

        <View style={styles.sortControl}>
          <Pressable style={styles.sortButton} onPress={() => setIsSortSheetVisible(true)}>
            <CustomText style={styles.sortButtonText}>{currentSortLabel}</CustomText>
            <SymbolView name={sortChevronName} size={12} weight="regular" tintColor={Palette.grey500} />
          </Pressable>
        </View>
      </View>

      {isLoading && savedPlaces.length === 0 ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={Palette.primary} />
          <CustomText style={styles.loadingText}>{t.saved.loading}</CustomText>
        </View>
      ) : savedPlaces.length === 0 ? (
        <View style={styles.emptyState}>
          <CustomText style={styles.emptyTitle}>{t.saved.emptyTitle}</CustomText>
          <CustomText style={styles.emptyDescription}>{t.saved.emptyDescription}</CustomText>
        </View>
      ) : (
        <FlatList
          data={savedPlaces}
          keyExtractor={(item) => String(item.placeId)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => setIsSortSheetVisible(false)}
          renderItem={({ item }) => (
            <SavedPlaceCard
              place={item}
              language={language}
              onPress={() =>
                router.push({
                  pathname: '/places/[placeId]',
                  params: { placeId: String(item.placeId) },
                })
              }
              onToggleSave={() => handleToggleSave(item)}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.35}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={Palette.primary} />
              </View>
            ) : (
              <View style={styles.footerSpacer} />
            )
          }
        />
      )}

      <BottomNavBar active="saved" />

      <SortSheet
        visible={isSortSheetVisible}
        value={sortOrder}
        options={sortOptions}
        onClose={() => setIsSortSheetVisible(false)}
        onSelect={(nextOrder) => {
          setSortOrder(nextOrder);
          setIsSortSheetVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

function SavedPlaceCard({
  place,
  language,
  onPress,
  onToggleSave,
}: {
  place: SavedPlaceItem;
  language: LanguageCode;
  onPress: () => void;
  onToggleSave: () => void;
}) {
  const subtitleText = formatSavedPlaceSubtitle(place, language);
  const heartIcon = <HeartIcon filled color={Palette.red300} size={20} />;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        {place.imageUrl && (
          <Image source={{ uri: place.imageUrl }} style={styles.image} contentFit="cover" />
        )}
        {place.festivalOccurrence ? (
          <View style={styles.dDayBadge}>
            <CustomText style={styles.dDayText}>{getDDayLabel(place)}</CustomText>
          </View>
        ) : null}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTextGroup}>
            <CustomText style={styles.travelStyle}>
              {formatTravelStyle(place.travelStyle, language)}
            </CustomText>
            <CustomText numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
              {formatSavedPlaceTitle(place, language)}
            </CustomText>
            {subtitleText ? (
              <CustomText numberOfLines={1} ellipsizeMode="tail" style={styles.subtitle}>
                {subtitleText}
              </CustomText>
            ) : null}
          </View>

          <Pressable
            hitSlop={10}
            style={styles.heartButton}
            onPress={(event) => {
              event.stopPropagation();
              onToggleSave();
            }}>
            {heartIcon}
          </Pressable>
        </View>

        <View style={styles.tagRow}>
          {place.tags
            .map((tag) => formatSavedTag(tag, language))
            .filter((tag) => !isHiddenSavedTag(tag))
            .slice(0, 3)
            .map((tag, index) => (
              <DetailTag key={toStableListKey(tag, index)} label={toDisplayText(tag)} />
            ))}
        </View>
      </View>
    </Pressable>
  );
}

function SortSheet({
  visible,
  value,
  options,
  onSelect,
  onClose,
}: {
  visible: boolean;
  value: SavedSortOrder;
  options: SavedSortOption[];
  onSelect: (value: SavedSortOrder) => void;
  onClose: () => void;
}) {
  const t = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.sheetHandleArea}>
            <View style={styles.sheetHandle} />
          </View>

          <View style={styles.sheetContent}>
            <CustomText style={styles.sheetTitle}>{t.saved.sortTitle}</CustomText>

            <View style={styles.sheetOptions}>
              {options.map((option) => {
                const selected = option.value === value;
                return (
                  <Pressable key={option.value} style={styles.sheetOptionRow} onPress={() => onSelect(option.value)}>
                    <CustomText style={selected ? styles.sheetOptionSelected : styles.sheetOption}>
                      {option.label}
                    </CustomText>
                    {selected && (
                      <SymbolView
                        name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                        size={18}
                        weight="semibold"
                        tintColor={Palette.text}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function formatSavedPlaceTitle(place: SavedPlaceItem, language: LanguageCode) {
  if (language === 'EN') {
    return normalizeTitle(translateKoreanTitleToEnglish(place.title), 'EN');
  }

  return normalizeTitle(translateEnglishTitleToKorean(place.title), 'KO');
}

function formatSavedPlaceSubtitle(place: SavedPlaceItem, language: LanguageCode) {
  if (language === 'EN') {
    if (place.festivalOccurrence) {
      return formatEnglishDateRange(place.festivalOccurrence.startDate, place.festivalOccurrence.endDate);
    }

    if (place.scheduleText) {
      return formatEnglishScheduleText(place.scheduleText);
    }

    return null;
  }

  if (place.festivalOccurrence) {
    return formatKoreanDateRange(place.festivalOccurrence.startDate, place.festivalOccurrence.endDate);
  }

  if (place.scheduleText) {
    return formatKoreanScheduleText(place.scheduleText);
  }

  return null;
}

function formatTravelStyle(value: string, language: LanguageCode) {
  return TRAVEL_STYLE_LABELS[language][value] ?? value;
}

function formatSavedTag(value: string, language: LanguageCode) {
  const normalized = value.trim().replace(/^#+\s*/, '');
  return TAG_TRANSLATIONS[language][normalized] ?? normalized;
}

function isHiddenSavedTag(value: string) {
  const normalized = value.trim().replace(/^#+\s*/, '').replace(/[\s_]+/g, '').toLowerCase();
  return normalized === '지역축제' || normalized === 'localfestival';
}

function translateKoreanTitleToEnglish(title: string) {
  return applyPhraseMap(translateLeadingTitlePrefix(title, 'EN'), TITLE_PHRASE_MAP.EN)
    .replace(/^\[([^\]]+)\]/, (_match, region: string) => `[${translateRegionName(region)}]`)
    .replace(/사명대사/g, 'Samyeongdaesa')
    .replace(/직지사/g, 'Jikjisa');
}

function translateEnglishTitleToKorean(title: string) {
  return applyPhraseMap(translateLeadingTitlePrefix(title, 'KO'), TITLE_PHRASE_MAP.KO)
    .replace(/^\[([^\]]+)\]/, (_match, region: string) => `[${translateRegionNameToKorean(region)}]`)
    .replace(/Samyeongdaesa/g, '사명대사')
    .replace(/Jikjisa/g, '직지사');
}

function normalizeTitle(title: string, language: LanguageCode) {
  return applyPhraseMap(title, TITLE_PHRASE_MAP[language])
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([)\]])/g, '$1')
    .replace(/([(\[])\s+/g, '$1')
    .trim();
}

function applyPhraseMap(title: string, replacements: Array<[RegExp, string]>) {
  return [...replacements]
    .sort((left, right) => right[0].source.length - left[0].source.length)
    .reduce((nextTitle, [pattern, replacement]) => nextTitle.replace(pattern, replacement), title);
}

const EN_TO_KO_TITLE_PREFIXES: Array<[string, string]> = [
  ['Daegwallyeong', '대관령'],
  ['Gimcheon', '김천'],
  ['Gyeonggi', '경기도'],
  ['Gangwon', '강원도'],
  ['Chungcheong', '충청도'],
  ['Gyeongsang', '경상도'],
  ['Jeolla', '전라도'],
  ['Seoul', '서울'],
  ['Jeju', '제주도'],
  ['Jeonju', '전주'],
  ['Damyang', '담양'],
  ['Gwangju', '광주'],
  ['Suncheon', '순천'],
  ['Gwangyang', '광양'],
  ['Boseong', '보성'],
  ['Gangneung', '강릉'],
  ['Sokcho', '속초'],
  ['Chuncheon', '춘천'],
  ['Wonju', '원주'],
  ['Yeongwol', '영월'],
  ['Gyeongju', '경주'],
  ['Busan', '부산'],
  ['Daegu', '대구'],
  ['Ulsan', '울산'],
  ['Andong', '안동'],
  ['Tongyeong', '통영'],
  ['Yeongyang', '영양'],
  ['Hadong', '하동'],
  ['Hamyang', '함양'],
  ['Sangju', '상주'],
  ['Namyangju', '남양주'],
  ['Namwon', '남원'],
  ['Muju', '무주'],
  ['Yeonggwang', '영광'],
  ['Yeongdong', '영동'],
  ['Okcheon', '옥천'],
  ['Cheonan', '천안'],
  ['Chungju', '충주'],
  ['Boryeong', '보령'],
  ['Nonsan', '논산'],
  ['Gwangmyeong', '광명'],
  ['Paju', '파주'],
  ['Suwon', '수원'],
  ['Yangpyeong', '양평'],
  ['Mokpo', '목포'],
];

const KO_TO_EN_TITLE_PREFIXES: Array<[string, string]> = EN_TO_KO_TITLE_PREFIXES.map(([english, korean]) => [
  korean,
  english,
]);

function translateLeadingTitlePrefix(title: string, language: LanguageCode) {
  const prefixes = language === 'EN' ? KO_TO_EN_TITLE_PREFIXES : EN_TO_KO_TITLE_PREFIXES;

  for (const [source, replacement] of prefixes) {
    if (
      title === source ||
      title.startsWith(`${source} `) ||
      title.startsWith(`${source}(`) ||
      title.startsWith(`${source}[`) ||
      title.startsWith(`${source}-`)
    ) {
      return `${replacement}${title.slice(source.length)}`;
    }
  }

  return title;
}

function preserveParentheticalSegments(sourceTitle: string, translatedTitle: string) {
  const sourceSegments = sourceTitle.match(/\([^()]*\)/g);
  if (!sourceSegments?.length) {
    return translatedTitle;
  }

  let segmentIndex = 0;
  return translatedTitle.replace(/\([^()]*\)/g, (translatedSegment) => {
    const sourceSegment = sourceSegments[segmentIndex];
    segmentIndex += 1;
    return sourceSegment ?? translatedSegment;
  });
}

function translateRegionName(value: string) {
  const regionMap: Record<string, string> = {
    서울: 'Seoul',
    경기도: 'Gyeonggi',
    강원도: 'Gangwon',
    충청도: 'Chungcheong',
    전라도: 'Jeolla',
    경상도: 'Gyeongsang',
    제주도: 'Jeju',
    전주: 'Jeonju',
    담양: 'Damyang',
    김천: 'Gimcheon',
  };

  return regionMap[value] ?? value;
}

function translateRegionNameToKorean(value: string) {
  const regionMap: Record<string, string> = {
    Seoul: '서울',
    Gyeonggi: '경기도',
    Gangwon: '강원도',
    Chungcheong: '충청도',
    Jeolla: '전라도',
    Gyeongsang: '경상도',
    Jeju: '제주도',
    Jeonju: '전주',
    Damyang: '담양',
    Gimcheon: '김천',
  };

  return regionMap[value] ?? value;
}

function formatEnglishDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'UTC',
  });

  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const startParts = formatter.formatToParts(start);
  const endParts = formatter.formatToParts(end);

  const formatParts = (parts: Intl.DateTimeFormatPart[]) => {
    const month = parts.find((part) => part.type === 'month')?.value ?? '';
    const day = parts.find((part) => part.type === 'day')?.value ?? '';
    const weekday = parts.find((part) => part.type === 'weekday')?.value ?? '';
    return `${month} ${day} (${weekday})`.trim();
  };

  return `${formatParts(startParts)} - ${formatParts(endParts)}`;
}

function formatKoreanDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'UTC',
  });

  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const formatParts = (date: Date) => {
    const parts = formatter.formatToParts(date);
    const month = parts.find((part) => part.type === 'month')?.value ?? '';
    const day = parts.find((part) => part.type === 'day')?.value ?? '';
    const weekday = parts.find((part) => part.type === 'weekday')?.value ?? '';
    return `${month}.${day}(${weekday})`.trim();
  };

  return `${formatParts(start)} - ${formatParts(end)}`;
}

function formatEnglishScheduleText(scheduleText: string) {
  const parts = splitScheduleParts(scheduleText);
  if (parts.length !== 2) {
    return scheduleText;
  }

  const start = formatEnglishTime(parts[0]);
  const end = formatEnglishTime(parts[1]);
  if (start === null || end === null) {
    return scheduleText;
  }

  return `${start} - ${end}`;
}

function formatKoreanScheduleText(scheduleText: string) {
  const parts = splitScheduleParts(scheduleText);
  if (parts.length !== 2) {
    return scheduleText;
  }

  const start = formatKoreanTime(parts[0]);
  const end = formatKoreanTime(parts[1]);
  if (start === null || end === null) {
    return scheduleText;
  }

  return `${start} ~ ${end}`;
}

function splitScheduleParts(scheduleText: string) {
  return scheduleText.includes('~')
    ? scheduleText.split('~').map((part) => part.trim())
    : scheduleText.split('-').map((part) => part.trim());
}

function formatEnglishTime(value: string) {
  const minutes = parseTimeToMinutes(value);
  if (minutes === null) {
    return null;
  }

  const date = new Date(Date.UTC(2026, 0, 1, Math.floor(minutes / 60), minutes % 60));
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }).format(date).replace(/\u202f/g, ' ');
}

function formatKoreanTime(value: string) {
  const minutes = parseTimeToMinutes(value);
  if (minutes === null) {
    return null;
  }

  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

function parseTimeToMinutes(value: string) {
  const trimmed = value.trim();
  const twentyFourHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourHourMatch) {
    return Number(twentyFourHourMatch[1]) * 60 + Number(twentyFourHourMatch[2]);
  }

  const twelveHourMatch = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1]) % 12;
    const minutes = Number(twelveHourMatch[2] ?? '00');
    if (twelveHourMatch[3].toUpperCase() === 'PM') {
      hours += 12;
    }
    return hours * 60 + minutes;
  }

  return null;
}

function getDDayLabel(place: SavedPlaceItem) {
  if (!place.festivalOccurrence) {
    return '';
  }

  const startDate = new Date(`${place.festivalOccurrence.startDate}T00:00:00`);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.ceil((startDate.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays >= 0) {
    return `D-${diffDays}`;
  }

  return `D+${Math.abs(diffDays)}`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 18,
    overflow: 'visible',
  },
  headerTitle: {
    alignSelf: 'center',
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: Palette.text,
  },
  sortControl: {
    alignSelf: 'flex-end',
    position: 'relative',
    overflow: 'visible',
    zIndex: 20,
    elevation: 20,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: '#ffffff',
  },
  sortButtonText: {
    fontFamily: FontFamily.pretendard.medium,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey600,
  },
  sortMenu: {
    position: 'absolute',
    top: 36,
    right: 0,
    width: 76,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: Palette.white,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 5, height: 5 },
    elevation: 100,
    zIndex: 100,
  },
  sortMenuItem: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  sortMenuItemTop: {
    paddingTop: 8,
    paddingBottom: 6,
  },
  sortMenuItemBottom: {
    paddingTop: 6,
    paddingBottom: 8,
  },
  sortMenuText: {
    fontFamily: FontFamily.pretendard.medium,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey600,
  },
  sortMenuTextSelected: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey700,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 140,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F5',
    backgroundColor: '#ffffff',
  },
  imageWrap: {
    width: 107,
    height: 107,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Palette.grey200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dDayBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(28,28,26,0.55)',
  },
  dDayText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 12,
    lineHeight: 16.8,
    color: '#ffffff',
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
    paddingRight: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTextGroup: {
    flex: 1,
    gap: 4,
  },
  travelStyle: {
    fontFamily: FontFamily.pretendard.medium,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.primary,
  },
  title: {
    fontFamily: FontFamily.pretendard.bold,
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.text,
  },
  subtitle: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey600,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 0,
  },
  heartButton: {
    padding: 0,
    marginTop: 0,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    color: Palette.grey600,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: FontFamily.pretendard.bold,
    fontSize: 20,
    lineHeight: 28,
    color: Palette.text,
    textAlign: 'center',
  },
  emptyDescription: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    lineHeight: 20,
    color: Palette.grey600,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 16,
  },
  footerSpacer: {
    height: 12,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28,28,26,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 16,
  },
  sheetHandleArea: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  sheetHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E8EB',
  },
  sheetContent: {
    gap: 24,
  },
  sheetTitle: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19.6,
    color: Palette.grey600,
  },
  sheetOptions: {
    gap: 24,
  },
  sheetOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 24,
  },
  sheetOption: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22.4,
    color: Palette.text,
  },
  sheetOptionSelected: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.text,
  },
});
