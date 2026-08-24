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
import { useTranslation } from '@/i18n/useTranslation';
import { useLanguageStore } from '@/store/language-store';

type Props = {
  placeId: string;
  destination: { name: string; address: string };
  onViewDetail: (routeId: string) => void;
};

function formatTemplate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.split(`{${key}}`).join(value),
    template,
  );
}

function formatTransportSummary(text: string) {
  return text
    .split(/[,\n]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' + ');
}

function formatFareValue(amount: number, language: 'KO' | 'EN') {
  const formatted = amount.toLocaleString(language === 'EN' ? 'en-US' : 'ko-KR');
  return language === 'EN' ? `₩${formatted}` : `${formatted}원`;
}

function formatOneWayTime(
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

function getDifficultyLabel(
  difficulty: BuddyRoute['summary']['difficulty'],
  labels: {
    easy: string;
    normal: string;
    hard: string;
  },
) {
  if (difficulty === 'EASY') return labels.easy;
  if (difficulty === 'HARD') return labels.hard;
  return labels.normal;
}

function getDayTripLabel(
  dayTripStatus: BuddyRoute['summary']['dayTripStatus'],
  labels: {
    available: string;
    unavailable: string;
  },
) {
  if (dayTripStatus === 'DAY_TRIP_AVAILABLE') return labels.available;
  return labels.unavailable;
}

export default function BuddyRouteTab({ placeId, destination, onViewDetail }: Props) {
  const [route, setRoute] = useState<BuddyRoute | null>(null);
  const [hasError, setHasError] = useState(false);
  const t = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const routeCopy = t.placeDetail.routeTab;

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

  useEffect(() => loadRoute(), [placeId, destination.name, destination.address, language]);

  if (!route && !hasError) {
    return (
      <View style={styles.state}>
        <ActivityIndicator color={Palette.primary} />
        <CustomText style={styles.stateText}>{routeCopy.loading}</CustomText>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.state}>
        <CustomText style={styles.stateText}>{routeCopy.error}</CustomText>
        <Pressable style={styles.retryButton} onPress={loadRoute}>
          <CustomText style={styles.retryText}>{routeCopy.retry}</CustomText>
        </Pressable>
      </View>
    );
  }

  const { origin, destination: routeDestination, summary } = route!;
  const sectionTitle = formatTemplate(routeCopy.routeBetween, {
    origin: origin.name,
    destination: routeDestination.name,
  });
  const statCards = [
    {
      label: routeCopy.statLabels.estimatedTime,
      value: formatOneWayTime(summary.estimatedOneWayMinutes, routeCopy.timeFormats),
      Icon: Schedule,
      iconWidth: 50,
      iconHeight: 50,
      backgroundColor: '#F4FFF8',
      borderColor: '#D4F7E4',
    },
    {
      label: routeCopy.statLabels.transport,
      value: formatTransportSummary(summary.recommendedTransportText),
      Icon: Directions_subway,
      iconWidth: 42,
      iconHeight: 50,
      backgroundColor: '#FFF7ED',
      borderColor: '#FFE8C8',
    },
    {
      label: routeCopy.statLabels.difficulty,
      value: getDifficultyLabel(summary.difficulty, routeCopy.difficultyValues),
      Icon: Footprint,
      iconWidth: 50,
      iconHeight: 55,
      backgroundColor: '#F1F7FF',
      borderColor: '#DBEAFF',
    },
    {
      label: routeCopy.statLabels.dayTrip,
      value: getDayTripLabel(summary.dayTripStatus, routeCopy.dayTripValues),
      Icon: Trip,
      iconWidth: 50,
      iconHeight: 47,
      backgroundColor: '#FAF5FF',
      borderColor: '#F3E6FF',
    },
  ] as const;

  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>{routeCopy.title}</CustomText>
      <CustomText style={styles.subtitle}>{routeCopy.subtitle}</CustomText>

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

      <CustomText style={styles.sectionTitle}>{sectionTitle}</CustomText>
      <View style={styles.grid}>
        {statCards.map((card) => {
          const Icon = card.Icon;
          const isTransportLabel = card.label === routeCopy.statLabels.transport;
          return (
            <View
              key={card.label}
              style={[styles.statCard, { backgroundColor: card.backgroundColor, borderColor: card.borderColor }]}
            >
              <View style={styles.iconWrap}>
                <Icon width={card.iconWidth} height={card.iconHeight} />
              </View>
              <View style={styles.statTextGroup}>
                <CustomText
                  numberOfLines={1}
                  adjustsFontSizeToFit={isTransportLabel}
                  minimumFontScale={0.88}
                  style={[styles.statLabel, isTransportLabel && styles.statLabelTransport]}
                >
                  {card.label}
                </CustomText>
                <CustomText style={styles.statValue}>{card.value}</CustomText>
              </View>
            </View>
          );
        })}
      </View>

      <CustomText style={styles.sectionTitle}>{routeCopy.fareTitle}</CustomText>
      <View style={styles.fareCard}>
        <View style={styles.fareRow}>
          <CustomText style={styles.fareLabel}>{routeCopy.fareOneWay}</CustomText>
          <CustomText style={styles.fareValue}>
            {routeCopy.farePrefix} {formatFareValue(summary.fare.oneWayEstimated, language)}
          </CustomText>
        </View>
        <View style={styles.fareRow}>
          <CustomText style={styles.fareLabel}>{routeCopy.fareRoundTrip}</CustomText>
          <CustomText style={styles.fareValue}>
            {routeCopy.farePrefix} {formatFareValue(summary.fare.roundTripEstimated, language)}
          </CustomText>
        </View>
        <View style={styles.fareDivider} />
        <CustomText style={styles.disclaimer}>{routeCopy.fareDisclaimer}</CustomText>
      </View>

      <Pressable style={styles.detailButton} onPress={() => onViewDetail(route!.routeId)}>
        <CustomText style={styles.detailButtonText}>{routeCopy.detailButton}</CustomText>
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
  statLabelTransport: { marginRight: 4 },
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
