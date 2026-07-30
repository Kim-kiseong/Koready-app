import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchMockRouteDetailForDestination, type BuddyRoute, type RouteSegment, type RouteTip, type TransportMode } from '@/api/route';
import CustomText from '@/components/CustomText';
import {
  Component13,
  Component15,
  Component17,
  DestinationPin,
  Directions_bus,
  Directions_railway_2,
  Location_on,
  Near_me,
  RouteTime,
  RouteWalkDot
} from '@/components/place-detail/RouteIcons';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

const MODE_LABEL: Record<TransportMode, string> = {
  WALK: '도보',
  SUBWAY: '지하철',
  BUS: '축제 셔틀버스',
  TRAIN: '기차',
  KTX: 'KTX',
  SHUTTLE: '축제 셔틀버스',
};

const SEGMENT_ICON: Record<TransportMode, { Icon: React.ComponentType<{ width?: number; height?: number }>; width: number; height: number }> = {
  WALK: { Icon: Component13, width: 40, height: 40 },
  SUBWAY: { Icon: Component15, width: 40, height: 40 },
  BUS: { Icon: Component17, width: 40, height: 40 },
  TRAIN: { Icon: Component15, width: 40, height: 40 },
  KTX: { Icon: Component15, width: 40, height: 40 },
  SHUTTLE: { Icon: Component17, width: 40, height: 40 },
};

const SEGMENT_MARKER_STYLE: Record<TransportMode, { backgroundColor: string; borderColor: string }> = {
  WALK: { backgroundColor: '#F1F7FF', borderColor: '#D9E9FF' },
  SUBWAY: { backgroundColor: '#FAF5FF', borderColor: '#F3E6FF' },
  BUS: { backgroundColor: '#F4FFF8', borderColor: '#D4F7E4' },
  TRAIN: { backgroundColor: '#FAF5FF', borderColor: '#F3E6FF' },
  KTX: { backgroundColor: '#FAF5FF', borderColor: '#F3E6FF' },
  SHUTTLE: { backgroundColor: '#F4FFF8', borderColor: '#D4F7E4' },
};

const DAY_TRIP_TEXT = {
  DAY_TRIP_AVAILABLE: '가능',
  DAY_TRIP_HARD: '어려움',
  DAY_TRIP_UNAVAILABLE: '불가',
} as const;

const HANDLE_OVERLAP = 180;

export default function RouteDetailScreen() {
  const router = useRouter();
  const { routeId, placeName, placeAddress } = useLocalSearchParams<{ routeId: string; placeName?: string; placeAddress?: string }>();
  const [route, setRoute] = useState<BuddyRoute | null>(null);

  const [mapAreaHeight, setMapAreaHeight] = useState(0);
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (!routeId) return;
    let active = true;
    fetchMockRouteDetailForDestination(routeId, {
      name: placeName ?? '[전주] 이팝나무 축제',
      address: placeAddress ?? '전북특별자치도 전주시 완산구 일대',
    }).then((value) => {
      if (active) setRoute(value);
    });
    return () => {
      active = false;
    };
  }, [routeId, placeName, placeAddress]);

  const snapPoints = useMemo(() => {
    if (!mapAreaHeight) return ['50%', '100%'];
    return [Math.max(mapAreaHeight - HANDLE_OVERLAP, 0), '100%'];
  }, [mapAreaHeight]);

  const handleMapAreaLayout = useCallback((e: { nativeEvent: { layout: { height: number } } }) => {
    setMapAreaHeight(e.nativeEvent.layout.height);
  }, []);

  if (!route) {
    return (
      <SafeAreaView style={styles.loading} edges={['top']}>
        <ActivityIndicator color={Palette.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <CustomText style={styles.back}>‹</CustomText>
        </Pressable>
        <CustomText style={styles.headerTitle}>상세 이동 경로</CustomText>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.contentArea}>
        <View style={styles.mapArea} onLayout={handleMapAreaLayout}>
          <View style={styles.locationCard}>
            <View style={styles.locationRow}>
              <Near_me width={12} height={12} />
              <CustomText style={styles.locationText}>{route.origin.name}</CustomText>
            </View>
            <View style={styles.locationDivider} />
            <View style={styles.locationRow}>
              <Location_on width={13} height={15} />
              <CustomText style={styles.locationText}>{route.destination.name}</CustomText>
            </View>
          </View>

          <View style={styles.mapMock} />
        </View>

        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          handleIndicatorStyle={styles.sheetHandle}
          backgroundStyle={styles.bottomSheetBackground}
          style={styles.bottomSheetShadow}
        >
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
          >
            <View style={styles.summaryBox}>
              <SummaryItem label="교통수단" value={route.summary.recommendedTransportText} />
              <SummaryItem label="예상 시간" value={route.summary.estimatedOneWayTimeText} />
              <SummaryItem label="당일치기" value={DAY_TRIP_TEXT[route.summary.dayTripStatus]} highlight />
            </View>

            {route.summary.horiTips?.[0] ? <TipCard tip={route.summary.horiTips[0]} variant="summary" /> : null}

            <View style={[styles.timeline, route.summary.horiTips?.[0] && styles.timelineAttached]}>
              {route.segments.map((segment) => {
                const tip = segment.horiTips?.[0];
                return (
                  <View key={segment.order}>
                    {tip ? <TipCard tip={tip} variant="segment" mode={segment.mode} /> : null}
                    {/* 팁이 붙은 세그먼트는 아이콘만 숨기고, 폭/들여쓰기는 그대로 유지해서
                        호리팁 박스와 같은 가로 크기를 갖게 함 */}
                    <SegmentCard segment={segment} hideIcon={!!tip} />
                  </View>
                );
              })}
            </View>

            <View style={styles.destinationRow}>
              <View style={styles.destinationRail}>
                <View style={styles.destinationRailLine} />
                <View style={styles.destinationMarkerWrap}>
                  <DestinationPin />
                </View>
              </View>
              <View style={styles.destinationCard}>
                <CustomText style={styles.destinationTitle}>{route.destination.name}</CustomText>
                <CustomText style={styles.destinationAddress}>{route.destination.address}</CustomText>
              </View>
            </View>

            <CustomText style={styles.sectionTitle}>예상 교통비</CustomText>
            <View style={styles.fareCard}>
              <View style={styles.fareRow}>
                <CustomText style={styles.fareLabel}>KTX 편도</CustomText>
                <CustomText style={styles.fareValue}>약 {route.summary.fare.oneWayEstimated.toLocaleString('ko-KR')}원</CustomText>
              </View>
              <View style={[styles.fareRow, styles.fareRowSpaced]}>
                <CustomText style={styles.fareLabel}>KTX 왕복</CustomText>
                <CustomText style={styles.fareValue}>약 {route.summary.fare.roundTripEstimated.toLocaleString('ko-KR')}원</CustomText>
              </View>
              <View style={styles.fareDivider} />
              <CustomText style={styles.disclaimer}>* 전체 경비 기준으로 작성</CustomText>
            </View>
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </SafeAreaView>
  );
}

function SummaryItem({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.summaryItem}>
      <CustomText style={styles.summaryLabel}>{label}</CustomText>
      <CustomText style={[styles.summaryValue, highlight && styles.summaryHighlight]}>{value}</CustomText>
    </View>
  );
}

function TipCard({
  tip,
  variant,
  mode,
}: {
  tip: RouteTip;
  variant: 'summary' | 'segment';
  mode?: TransportMode;
}) {
  const isSegmentTip = variant === 'segment';

  if (isSegmentTip) {
    // 세그먼트에 해당하는 실제 교통수단 아이콘/색상을 그대로 사용
    // (하드코딩된 회색 철도 아이콘 대신, 그 세그먼트의 진짜 아이콘을 재사용)
    const IconComp = mode ? SEGMENT_ICON[mode].Icon : Directions_railway_2;
    const iconSize = mode ? SEGMENT_ICON[mode] : { width: 11, height: 16 };
    const markerStyle = mode ? SEGMENT_MARKER_STYLE[mode] : undefined;

    return (
      <View style={styles.segmentTipRow}>
        <View style={styles.segmentTipRail}>
          <View style={[styles.segmentTipMarker, markerStyle]}>
            <IconComp width={iconSize.width} height={iconSize.height} />
          </View>
          <View style={styles.segmentTipLine} />
        </View>

        <View style={styles.segmentTipContent}>
          <View style={styles.tipWrapSegment}>
            <Image
              source={require('../../assets/images/horitipIcon.png')}
              style={styles.tipMascotSegment}
              contentFit="contain"
            />
            <View style={styles.tipCardSegment}>
              <View style={styles.tipHeaderSegment}>
                <View style={styles.tipIcon}>
                  <CustomText style={styles.tipIconText}>i</CustomText>
                </View>
                <CustomText style={styles.tipTitle}>{tip.title}</CustomText>
              </View>
              <CustomText style={styles.tipBodySegment}>{tip.body}</CustomText>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tipWrapSummary}>
      <Image
        source={require('../../assets/images/horitipIcon.png')}
        style={styles.tipMascotSummary}
        contentFit="contain"
      />
      <View style={styles.tipCardSummary}>
        <View style={styles.tipHeaderSummary}>
          <View style={styles.tipIcon}>
            <CustomText style={styles.tipIconText}>i</CustomText>
          </View>
          <CustomText style={styles.tipTitle}>{tip.title}</CustomText>
        </View>
        <CustomText style={styles.tipBodySummary}>{tip.body}</CustomText>
      </View>
    </View>
  );
}

function SegmentCard({ segment, hideIcon = false }: { segment: RouteSegment; hideIcon?: boolean }) {
  const Icon = SEGMENT_ICON[segment.mode].Icon;

  return (
    <View style={styles.segmentRow}>
      <View style={styles.segmentRail}>
        {/* 바로 위에 호리팁이 있으면 팁이 이미 아이콘을 보여주므로 여기서는 숨기되,
            레일 폭(42)은 그대로 유지해서 카드가 호리팁 박스와 같은 위치/너비로 정렬되게 함 */}
        {!hideIcon && (
          <View style={[styles.segmentMarker, SEGMENT_MARKER_STYLE[segment.mode]]}>
            <Icon width={SEGMENT_ICON[segment.mode].width} height={SEGMENT_ICON[segment.mode].height} />
          </View>
        )}
        <View style={styles.segmentLine} />
      </View>

      <View style={styles.segmentCard}>
        <CustomText style={styles.segmentTitle}>{segment.startName} → {segment.endName}</CustomText>
        <View style={styles.segmentMetaRow}>
          <RouteMetaIcon type={segment.mode} />
          <CustomText style={styles.segmentMeta}>{MODE_LABEL[segment.mode]}</CustomText>
          <RouteMetaClock />
          <CustomText style={styles.segmentMeta}>약 {segment.durationMinutes}분</CustomText>
        </View>
        {segment.instruction ? (
          <>
            <View style={styles.segmentDivider} />
            <CustomText style={styles.segmentInstruction}>{segment.instruction}</CustomText>
          </>
        ) : null}
        {segment.mode === 'KTX' ? (
          <Pressable style={styles.ctaButton}>
            <CustomText style={styles.ctaButtonText}>KTX 예매하는 법 확인하기</CustomText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function RouteMetaIcon({ type }: { type: TransportMode }) {
  if (type === 'WALK') return <RouteWalkDot width={20} height={20} />;
  if (type === 'BUS' || type === 'SHUTTLE') return <Directions_bus />;
  return <Directions_railway_2 width={11} height={16} />;
}

function RouteMetaClock() {
  return <RouteTime width={20} height={20} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  back: { fontFamily: FontFamily.pretendard.regular, fontSize: 36, lineHeight: 36, color: Palette.text },
  headerTitle: { fontFamily: FontFamily.pretendard.semiBold, fontSize: 18, color: Palette.text },
  headerSpacer: { width: 40 },

  contentArea: { flex: 1, position: 'relative' },
  mapArea: { position: 'absolute', top: 0, left: 0, right: 0},

  locationCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#F6F9FB',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  locationText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    lineHeight: 19.6,
    color: '#1C1C1A',
  },
  locationDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8EEF2',
    marginVertical: 12,
    marginHorizontal: 16,
  },
  mapMock: { height: 372, backgroundColor: '#EAF1F7' },

  bottomSheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  bottomSheetShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  sheetHandle: { width: 118, height: 8, backgroundColor: '#E5E7EB' },
  sheetContent: { paddingBottom: 36 },

  summaryBox: { marginTop: 24,marginHorizontal: 16, backgroundColor: '#F6F9FB', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
  summaryLabel: { fontFamily: FontFamily.pretendard.regular, fontSize: 13, lineHeight: 18.2, color: '#4E5968', textAlign: 'center' },
  summaryValue: { marginTop: 6, fontFamily: FontFamily.pretendard.bold, fontSize: 14, lineHeight: 19.6, color: '#1C1C1A', textAlign: 'center' },
  summaryHighlight: { color: '#399589' },

  tipWrapSummary: { marginHorizontal: 16, marginTop: 36, marginBottom: 24, position: 'relative' },
  // marginTop: 0 유지 - wrapper 자체는 tipCardSegment 바로 위에서 시작
  tipWrapSegment: { marginTop: 24, marginBottom: 8, position: 'relative' },
  tipMascotSummary: { position: 'absolute', left: -10, top: -38, width: 77, height: 80, zIndex: 2 },
  // 마스코트가 그린박스(marginTop:10) 위쪽에 자연스럽게 겹치도록 오프셋 축소 (-36 → -20)
  tipMascotSegment: { position: 'absolute', left: -10, top: -46, width: 77, height: 80, zIndex: 3 },
  tipCardSummary: {
    marginTop: 18,
    padding: 16,
    paddingTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C9F0D8',
    backgroundColor: '#F1FFF6',
  },
  tipCardSegment: {
    marginTop: 10,
    padding: 16,
    paddingTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C9F0D8',
    backgroundColor: '#F1FFF6',
  },
  tipHeaderSummary: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipHeaderSegment: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#79CEB2', alignItems: 'center', justifyContent: 'center' },
  tipIconText: { fontFamily: FontFamily.pretendard.bold, fontSize: 16, color: '#FFFFFF', marginTop: -1 },
  tipTitle: { fontFamily: FontFamily.pretendard.semiBold, fontSize: 16, color: '#1C1C1A' },
  tipBodySummary: { marginTop: 8, fontFamily: FontFamily.pretendard.regular, fontSize: 13, lineHeight: 22, color: '#4E5968' },
  tipBodySegment: { marginTop: 8, fontFamily: FontFamily.pretendard.regular, fontSize: 13, lineHeight: 22, color: '#4E5968' },

  segmentTipRow: { flexDirection: 'row', marginTop: 8, marginBottom: 0 },
  segmentTipRail: { width: 42, alignItems: 'center', justifyContent: 'flex-start' },
  segmentTipMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5D9FF',
    backgroundColor: '#F7F0FF',
  },
  segmentTipLine: { width: 2, flex: 1, backgroundColor: '#E5E7EB' },
  segmentTipContent: { flex: 1, marginLeft: 10 },

  timeline: { marginTop: 18, paddingHorizontal: 16 },
  timelineAttached: { marginTop: 0 },

  segmentRow: { flexDirection: 'row' },
  segmentRail: { width: 42, alignItems: 'center' },
  segmentMarker: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderWidth: 1 },

  destinationRow: { flexDirection: 'row', paddingHorizontal: 16, alignItems: 'flex-start', marginTop: -2 },
  destinationRail: { width: 42, alignItems: 'center', justifyContent: 'flex-start' },
  destinationMarkerWrap: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginTop: -6 },
  destinationRailLine: { width: 2, height: 12, backgroundColor: '#E5E7EB' },
  destinationCard: { flex: 1, marginLeft: 10, marginBottom: 14, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  destinationTitle: { fontFamily: FontFamily.pretendard.semiBold, fontSize: 16, lineHeight: 26, color: Palette.text },
  destinationAddress: { marginTop: 6, fontFamily: FontFamily.pretendard.regular, fontSize: 13, lineHeight: 20, color: '#6B7684' },
  segmentLine: { width: 2, flex: 1, backgroundColor: '#E5E7EB' },
  segmentCard: { flex: 1, marginLeft: 10, marginBottom: 14, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  segmentTitle: { fontFamily: FontFamily.pretendard.semiBold, fontSize: 16, lineHeight: 24, color: Palette.text },
  segmentMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  segmentMeta: { fontFamily: FontFamily.pretendard.regular, fontSize: 14, color: '#6B7684' },
  segmentDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB', marginTop: 12, marginBottom: 12 },
  segmentInstruction: { fontFamily: FontFamily.pretendard.regular, fontSize: 13, lineHeight: 21, color: '#4E5968' },
  ctaButton: { alignSelf: 'flex-start', marginTop: 14, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, backgroundColor: '#59C0A7' },
  ctaButtonText: { fontFamily: FontFamily.pretendard.medium, fontSize: 14, color: '#FFFFFF' },
  sectionTitle: { marginTop: 10, marginHorizontal: 16, marginBottom: 12, fontFamily: FontFamily.pretendard.semiBold, fontSize: 18, color: Palette.text },
  fareCard: { marginHorizontal: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#F6F9FB' },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fareRowSpaced: { marginTop: 12 },
  fareLabel: { fontFamily: FontFamily.pretendard.regular, fontSize: 14, color: '#4E5968' },
  fareValue: { fontFamily: FontFamily.pretendard.semiBold, fontSize: 14, color: Palette.text },
  fareDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E8EEF2', marginTop: 12, marginBottom: 12 },
  disclaimer: { fontFamily: FontFamily.pretendard.regular, fontSize: 13, lineHeight: 20.8, color: '#6B7684' },
});
