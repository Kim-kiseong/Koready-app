import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { fetchBuddyRoute, type BuddyRoute } from '@/api/route';
import CustomText from '@/components/CustomText';
import {
  Directions_subway,
  Footprint,
  Location_on,
  Near_me,
  Schedule,
  Trip,
} from '@/components/place-detail/RouteIcons';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

type Props = {
  placeId: string;
  destination: { name: string; address: string };
  onViewDetail: (routeId: string) => void;
};

const STAT_CARDS = [
  {
    label: '예상 이동 시간',
    Icon: Schedule,
    iconWidth: 50,
    iconHeight: 50,
    backgroundColor: '#F4FFF8',
    borderColor: '#D4F7E4',
  },
  {
    label: '추천 교통수단',
    Icon: Directions_subway,
    iconWidth: 42,
    iconHeight: 50,
    backgroundColor: '#FFF7ED',
    borderColor: '#FFE8C8',
  },
  {
    label: '이동 난이도',
    Icon: Footprint,
    iconWidth: 50,
    iconHeight: 55,
    backgroundColor: '#F1F7FF',
    borderColor: '#DBEAFF', 
  },
  {
    label: '여행 판단',
    Icon: Trip,
    iconWidth: 50,
    iconHeight: 47,
    backgroundColor: '#FAF5FF',
    borderColor: '#F3E6FF',
  },
] as const;

export default function BuddyRouteTab({ placeId, destination, onViewDetail }: Props) {
  const [route, setRoute] = useState<BuddyRoute | null>(null);
  const [hasError, setHasError] = useState(false);

  const loadRoute = () => {
    let cancelled = false;
    setHasError(false);
    setRoute(null);

    fetchBuddyRoute(placeId, destination)
      .then((value) => {
        if (!cancelled) {
          setRoute(value);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHasError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  };

  useEffect(() => loadRoute(), [placeId, destination.name, destination.address]);

  if (!route && !hasError) {
    return (
      <View style={styles.state}>
        <ActivityIndicator color={Palette.primary} />
        <CustomText style={styles.stateText}>이동 경로를 불러오는 중이에요.</CustomText>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.state}>
        <CustomText style={styles.stateText}>이동 경로를 불러오지 못했어요.</CustomText>
        <Pressable style={styles.retryButton} onPress={loadRoute}>
          <CustomText style={styles.retryText}>다시 시도</CustomText>
        </Pressable>
      </View>
    );
  }

  const { origin, destination: routeDestination, summary } = route!;
  const statValues = [
    summary.estimatedOneWayTimeText,
    summary.recommendedTransportText,
    '보통',
    summary.dayTripStatus === 'DAY_TRIP_AVAILABLE' ? '가능' : summary.dayTripStatus === 'DAY_TRIP_HARD' ? '어려움' : '불가',
  ];

  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>Buddy Route</CustomText>
      <CustomText style={styles.subtitle}>추천 여행지까지 가는 방법을 확인해보세요.</CustomText>

      <View style={styles.locationCard}>
        <View style={styles.locationRow}>
          <Near_me />
          <CustomText style={styles.locationText}>{origin.name}</CustomText>
        </View>
        <View style={styles.divider} />
        <View style={styles.locationRow}>
          <Location_on />
          <CustomText style={styles.locationText}>{routeDestination.name}</CustomText>
        </View>
      </View>

      <CustomText style={styles.sectionTitle}>{origin.name}에서 {routeDestination.name}까지</CustomText>
      <View style={styles.grid}>
        {STAT_CARDS.map((card, index) => {
          const Icon = card.Icon;
          return (
            <View
              key={card.label}
              style={[styles.statCard, { backgroundColor: card.backgroundColor, borderColor: card.borderColor }]}
            >
              <View style={styles.statTextGroup}>
                <CustomText style={styles.statLabel}>{card.label}</CustomText>
                <CustomText style={styles.statValue}>{statValues[index]}</CustomText>
              </View>
              <View style={styles.iconWrap}>
                <Icon width={card.iconWidth} height={card.iconHeight} />
              </View>
            </View>
          );
        })}
      </View>

      <CustomText style={styles.sectionTitle}>예상 교통비</CustomText>
      <View style={styles.fareCard}>
        <View style={styles.fareRow}>
          <CustomText style={styles.fareLabel}>KTX 편도</CustomText>
          <CustomText style={styles.fareValue}>약 {summary.fare.oneWayEstimated.toLocaleString('ko-KR')}원</CustomText>
        </View>
        <View style={styles.fareRow}>
          <CustomText style={styles.fareLabel}>KTX 왕복</CustomText>
          <CustomText style={styles.fareValue}>약 {summary.fare.roundTripEstimated.toLocaleString('ko-KR')}원</CustomText>
        </View>
        <View style={styles.fareDivider} />
        <CustomText style={styles.disclaimer}>* 전체 경비 기준으로 작성</CustomText>
      </View>

      <Pressable style={styles.detailButton} onPress={() => onViewDetail(route!.routeId)}>
        <CustomText style={styles.detailButtonText}>자세한 경로 보기  →</CustomText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 24},
  title: { fontFamily: FontFamily.pretendard.semiBold, fontSize: 18, color: Palette.text, paddingBottom: 4 },
  subtitle: { marginTop: 6, fontFamily: FontFamily.pretendard.regular, fontSize: 14, color: Palette.grey600},
  locationCard: { marginTop: 16, paddingHorizontal: 16, backgroundColor: Palette.grey100, borderRadius: 12 },
  locationRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, marginTop:4 },
  locationText: { marginLeft: 8, fontFamily: FontFamily.pretendard.medium, fontSize: 14, color: Palette.text },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Palette.grey200, marginVertical:2 },
  sectionTitle: { marginTop: 32, marginBottom: 16, fontFamily: FontFamily.pretendard.semiBold, fontSize: 18, color: Palette.text, lineHeight: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    width: '48%',
    minHeight: 86,
    marginBottom: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  statTextGroup: { flex: 1, paddingRight: 12 },
  statLabel: { fontSize: 13, color: Palette.grey600, fontFamily: FontFamily.pretendard.regular },
  statValue: { marginTop: 6, fontFamily: FontFamily.pretendard.semiBold, fontSize: 16, lineHeight: 21, color: Palette.text },
  iconWrap: { position: 'absolute', right: -4, bottom: -4, width: 56, height: 56, alignItems: 'flex-end', justifyContent: 'flex-end', opacity: 0.9 },
  fareCard: { backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 16, borderWidth: 1, borderColor: Palette.grey200, borderRadius: 12 },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 },
  fareLabel: { fontSize: 13, color: Palette.grey600 },
  fareValue: { fontFamily: FontFamily.pretendard.semiBold, fontSize: 14, color: Palette.text },
  fareDivider: { height: StyleSheet.hairlineWidth, marginTop: 2, marginBottom: 12, backgroundColor: Palette.grey200 },
  disclaimer: { fontSize: 13, color: Palette.grey500 },
  detailButton: { marginTop: 24, alignItems: 'center', borderRadius: 12, paddingVertical: 17, backgroundColor: Palette.primary },
  detailButtonText: { fontFamily: FontFamily.pretendard.semiBold, fontSize: 18, color: '#FFFFFF' },
  state: { alignItems: 'center', gap: 12, paddingVertical: 52 },
  stateText: { fontFamily: FontFamily.pretendard.medium, fontSize: 14, color: Palette.grey600 },
  retryButton: { borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10, backgroundColor: Palette.primary },
  retryText: { fontFamily: FontFamily.pretendard.semiBold, fontSize: 13, color: '#FFFFFF' },
});
