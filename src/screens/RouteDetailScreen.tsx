import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchMockRouteDetail, type BuddyRoute, type RouteSegment, type RouteTip, type TransportMode } from '@/api/route';
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
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useLanguageStore } from '@/store/language-store';
import { formatTransportModeLabel } from '@/utils/transport-labels';

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

const HANDLE_OVERLAP = 180;
const ITEM_GAP = 16; // 카드-카드 사이 간격 (선이 이 구간까지 이어져야 함)

function formatTemplate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.split(`{${key}}`).join(value),
    template,
  );
}

function formatRouteDurationText(
  minutes: number,
  formats: {
    minuteOnly: string;
    hourOnly: string;
    hourMinute: string;
  },
) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours <= 0) {
    return formatTemplate(formats.minuteOnly, { minutes: String(mins) });
  }

  if (mins <= 0) {
    return formatTemplate(formats.hourOnly, { hours: String(hours) });
  }

  return formatTemplate(formats.hourMinute, { hours: String(hours), minutes: String(mins) });
}

function formatSummaryTimeLabel(
  minutes: number,
  formats: {
    minuteOnly: string;
    hourOnly: string;
    hourMinute: string;
  },
  language: 'KO' | 'EN',
) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (language !== 'EN' || hours <= 0 || mins <= 0) {
    return formatRouteDurationText(minutes, formats);
  }

  return `About ${hours} hr\n${mins} min`;
}

function formatSummaryDayTripLabel(label: string, language: 'KO' | 'EN') {
  if (language === 'EN' && label === 'Overnight Stay') {
    return 'Overnight\nStay';
  }

  return label;
}

export default function RouteDetailScreen() {
  const router = useRouter();
  const { routeId, placeName, placeAddress } = useLocalSearchParams<{
    routeId: string;
    placeName?: string;
    placeAddress?: string;
  }>();
  const [route, setRoute] = useState<BuddyRoute | null>(null);
  const language = useLanguageStore((state) => state.language);
  const isEnglish = language === 'EN';
  const t = useTranslation();
  const routeCopy = t.placeDetail.routeTab;
  const destination = useMemo(() => {
    if (typeof placeName === 'string' && typeof placeAddress === 'string') {
      return {
        name: placeName,
        address: placeAddress,
      };
    }

    if (typeof placeName === 'string') {
      return {
        name: placeName,
        address: placeName,
      };
    }

    return {
      name: isEnglish ? 'Destination' : '목적지',
      address: isEnglish ? 'Destination' : '목적지',
    };
  }, [isEnglish, placeAddress, placeName]);

  const handleKtxCtaPress = useCallback(() => {
    Alert.alert(
      isEnglish ? 'Coming soon' : '준비 중',
      isEnglish
        ? 'KTX booking information will be connected in a future step.'
        : 'KTX 예매 안내는 추후 연결될 예정입니다.',
    );
  }, [isEnglish]);

  const [mapAreaHeight, setMapAreaHeight] = useState(0);
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (!routeId) return;
    let active = true;
    fetchMockRouteDetail(routeId, destination).then((value) => {
      if (active) setRoute(value);
    });
    return () => {
      active = false;
    };
  }, [destination, language, routeId]);

  const snapPoints = useMemo(() => {
    if (!mapAreaHeight) return ['50%', '100%'];
    return [Math.max(mapAreaHeight - HANDLE_OVERLAP, 0), '100%'];
  }, [mapAreaHeight]);

  const handleMapAreaLayout = useCallback((e: { nativeEvent: { layout: { height: number } } }) => {
    setMapAreaHeight(e.nativeEvent.layout.height);
  }, []);

  const summaryTimeLabel = route
    ? formatSummaryTimeLabel(route.summary.estimatedOneWayMinutes, routeCopy.timeFormats, language)
    : '';
  const dayTripLabel = route
    ? route.summary.dayTripStatus === 'DAY_TRIP_AVAILABLE'
      ? routeCopy.dayTripValues.available
      : routeCopy.dayTripValues.unavailable
    : '';
  const summaryDayTripLabel = formatSummaryDayTripLabel(dayTripLabel, language);

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
        <Pressable hitSlop={12} onPress={() => goBackOrRoot(router)}>
          <CustomText style={styles.back}>‹</CustomText>
        </Pressable>
        <CustomText style={styles.headerTitle}>{isEnglish ? 'Detailed Route' : '상세 이동 경로'}</CustomText>
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
              <SummaryItem label={routeCopy.summaryLabels.transport} value={route.summary.recommendedTransportText} />
              <SummaryItem label={routeCopy.summaryLabels.time} value={summaryTimeLabel} />
              <SummaryItem label={routeCopy.statLabels.dayTrip} value={summaryDayTripLabel} highlight />
            </View>

            {route.summary.horiTips?.[0] ? <TipCard tip={route.summary.horiTips[0]} /> : null}

            <View style={[styles.timeline, route.summary.horiTips?.[0] && styles.timelineAttached]}>
              {route.segments.map((segment) => {
                const tip = segment.horiTips?.[0];
                return (
                  <TimelineItem
                    key={segment.order}
                    segment={segment}
                    tip={tip}
                    onCtaPress={handleKtxCtaPress}
                    language={language}
                    timeFormats={routeCopy.timeFormats}
                    isEnglish={isEnglish}
                  />
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

            <CustomText style={styles.sectionTitle}>{routeCopy.fareTitle}</CustomText>
            <View style={styles.fareCard}>
              <View style={styles.fareRow}>
                <CustomText style={styles.fareLabel}>{routeCopy.fareOneWay}</CustomText>
                <CustomText style={styles.fareValue}>
                  {routeCopy.farePrefix}{' '}
                  {isEnglish
                    ? `₩${route.summary.fare.oneWayEstimated.toLocaleString('en-US')}`
                    : `${route.summary.fare.oneWayEstimated.toLocaleString('ko-KR')}원`}
                </CustomText>
              </View>
              <View style={[styles.fareRow, styles.fareRowSpaced]}>
                <CustomText style={styles.fareLabel}>{routeCopy.fareRoundTrip}</CustomText>
                <CustomText style={styles.fareValue}>
                  {routeCopy.farePrefix}{' '}
                  {isEnglish
                    ? `₩${route.summary.fare.roundTripEstimated.toLocaleString('en-US')}`
                    : `${route.summary.fare.roundTripEstimated.toLocaleString('ko-KR')}원`}
                </CustomText>
              </View>
              <View style={styles.fareDivider} />
              <CustomText style={styles.disclaimer}>{route.summary.fare.disclaimer}</CustomText>
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

function TipCard({ tip }: { tip: RouteTip }) {
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

function SegmentTipContent({ tip }: { tip: RouteTip }) {
  return (
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
  );
}

function SegmentCardBody({
  segment,
  onCtaPress,
  language,
  timeFormats,
  isEnglish,
}: {
  segment: RouteSegment;
  onCtaPress: () => void;
  language: 'KO' | 'EN';
  timeFormats: {
    minuteOnly: string;
    hourOnly: string;
    hourMinute: string;
  };
  isEnglish: boolean;
}) {
  return (
    <>
      <CustomText style={styles.segmentTitle}>{segment.startName} → {segment.endName}</CustomText>
      <View style={styles.segmentMetaRow}>
        <RouteMetaIcon type={segment.mode} />
        <CustomText style={styles.segmentMeta}>{formatTransportModeLabel(segment.mode, language)}</CustomText>
        <RouteMetaClock />
        <CustomText style={styles.segmentMeta}>{formatRouteDurationText(segment.durationMinutes, timeFormats)}</CustomText>
      </View>
      {segment.instruction ? (
        <>
          <View style={styles.segmentDivider} />
          <CustomText style={styles.segmentInstruction}>{segment.instruction}</CustomText>
        </>
      ) : null}
      {segment.mode === 'KTX' ? (
        <Pressable style={styles.ctaButton} onPress={onCtaPress}>
          <CustomText style={styles.ctaButtonText}>{isEnglish ? 'How to Book KTX' : 'KTX 예매하는 법 확인하기'}</CustomText>
        </Pressable>
      ) : null}
    </>
  );
}

/**
 * 타임라인의 한 항목(팁 유무와 무관하게 공용).
 *
 * 구조:
 * - 바깥 wrapper(position:relative, paddingBottom: 다음 카드와의 간격)의
 *   전체 높이 = 콘텐츠 높이 + 간격(paddingBottom) 이 자동으로 계산됨.
 * - 레일(선+마커)은 그 wrapper 안에서 position:absolute, top:0, bottom:0 으로
 *   깔리기 때문에 "콘텐츠 높이 + 간격"을 통째로 채움 → 다음 마커까지 항상 이어짐.
 * - 이 방식은 flex stretch 계산에 전혀 의존하지 않아서, 카드/팁 내용이
 *   길어지거나 짧아져도 선이 끊기지 않음.
 */
function TimelineItem({
  segment,
  tip,
  onCtaPress,
  language,
  timeFormats,
  isEnglish,
}: {
  segment: RouteSegment;
  tip?: RouteTip;
  onCtaPress: () => void;
  language: 'KO' | 'EN';
  timeFormats: {
    minuteOnly: string;
    hourOnly: string;
    hourMinute: string;
  };
  isEnglish: boolean;
}) {
  const Icon = SEGMENT_ICON[segment.mode].Icon;

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineRail}>
        <View style={styles.railLine} />
        <View style={[styles.segmentMarker, SEGMENT_MARKER_STYLE[segment.mode]]}>
          <Icon width={SEGMENT_ICON[segment.mode].width} height={SEGMENT_ICON[segment.mode].height} />
        </View>
      </View>

      <View style={styles.timelineContent}>
        {tip ? <SegmentTipContent tip={tip} /> : null}
        <View style={styles.segmentCard}>
          <SegmentCardBody
            segment={segment}
            onCtaPress={onCtaPress}
            language={language}
            timeFormats={timeFormats}
            isEnglish={isEnglish}
          />
        </View>
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
  mapArea: { position: 'absolute', top: 0, left: 0, right: 0 },

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

  summaryBox: { marginTop: 24, marginHorizontal: 16, backgroundColor: '#F6F9FB', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
  summaryLabel: { fontFamily: FontFamily.pretendard.regular, fontSize: 13, lineHeight: 18.2, color: '#4E5968', textAlign: 'center' },
  summaryValue: { marginTop: 6, fontFamily: FontFamily.pretendard.bold, fontSize: 14, lineHeight: 19.6, color: '#1C1C1A', textAlign: 'center' },
  summaryHighlight: { color: '#399589' },

  tipWrapSummary: { marginHorizontal: 16, marginTop: 44, marginBottom: 24, position: 'relative' },
  tipWrapSegment: { marginTop: 34, marginBottom: 8, position: 'relative' },
  tipMascotSummary: { position: 'absolute', left: -10, top: -38, width: 77, height: 80, zIndex: 2 },
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

  timeline: { marginTop: 18, paddingHorizontal: 16 },
  timelineAttached: { marginTop: 0 },

  timelineItem: { position: 'relative', paddingBottom: ITEM_GAP },
  timelineItemLast: { paddingBottom: 0 },

  timelineRail: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 42,
    alignItems: 'center',
  },

  railLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 20,
    width: 2,
    backgroundColor: '#E8EEF2',
  },
  segmentMarker: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderWidth: 1 },

  timelineContent: { marginLeft: 52 },

  segmentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },

  destinationRow: { flexDirection: 'row', paddingHorizontal: 16, alignItems: 'flex-start', marginTop: 0 },
  destinationRail: { width: 42, alignItems: 'center', justifyContent: 'flex-start' },
  destinationMarkerWrap: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginTop: -6 },
  destinationRailLine: { width: 2, height: 12, backgroundColor: '#E8EEF2' },
  destinationCard: { flex: 1, marginLeft: 10, marginBottom: 14, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  destinationTitle: { fontFamily: FontFamily.pretendard.semiBold, fontSize: 16, lineHeight: 26, color: Palette.text },
  destinationAddress: { marginTop: 6, fontFamily: FontFamily.pretendard.regular, fontSize: 13, lineHeight: 20, color: '#6B7684' },
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
