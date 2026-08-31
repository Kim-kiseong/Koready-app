import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import CustomText from '@/components/CustomText';
import RichText from '@/components/RichText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type HoriTipCardProps = {
  title?: string;
  body?: string;
  checklist?: string[];
  /**
   * 'summary' — the closing tip at the bottom of a guide (mascot peeking over
   * the top-left corner, optional checklist). Default, matches the original design.
   * 'inline' — a tip placed mid-content (KTX step 3, subway/taxi/bus guides):
   * the full-body magnifying-glass mascot sits inside the card on the right,
   * and `body` supports `**bold**` markers for inline emphasis.
   */
  variant?: 'summary' | 'inline';
};

// Shared "Hori Tip" callout — mascot badge overlapping a mint tip card. Mirrors
// the pattern already in RouteDetailScreen's TipCard/SegmentTipContent, pulled
// out here since every guide detail screen repeats it with static copy.
export default function HoriTipCard({ title = 'Hori Tip', body, checklist, variant = 'summary' }: HoriTipCardProps) {
  if (variant === 'inline') {
    return (
      <View style={styles.inlineCard}>
        <View style={styles.inlineTextGroup}>
          <View style={styles.header}>
            <InfoBadgeIcon />
            <CustomText style={styles.title}>{title}</CustomText>
          </View>

          {body ? <RichText text={body} style={styles.inlineBody} emphasisStyle={styles.inlineBodyEmphasis} /> : null}
        </View>

        <Image source={require('@/assets/images/hori-magnify.png')} style={styles.inlineMascot} contentFit="contain" />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Image
        source={require('@/assets/images/horitipIcon.png')}
        style={styles.mascot}
        contentFit="contain"
      />
      <View style={styles.card}>
        <View style={styles.header}>
          <InfoBadgeIcon />
          <CustomText style={styles.title}>{title}</CustomText>
        </View>

        {body ? <CustomText style={styles.body}>{body}</CustomText> : null}

        {checklist?.length ? (
          <View style={styles.checklist}>
            {checklist.map((line) => (
              <View key={line} style={styles.checklistRow}>
                <CheckIcon />
                <CustomText style={styles.checklistText}>{line}</CustomText>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 38,
    position: 'relative',
  },
  mascot: {
    position: 'absolute',
    left: -5,
    top: -50,
    width: 70,
    height: 70,
    zIndex: 2,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.tipBorder,
    backgroundColor: Palette.secondary,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.text,
  },
  body: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey600,
  },
  checklist: {
    gap: 10,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checklistText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey700,
  },
  // Inline variant — mascot sits inside the card, to the right.
  inlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.tipBorder,
    backgroundColor: Palette.secondary,
  },
  inlineTextGroup: {
    flex: 1,
    gap: 8,
  },
  inlineBody: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    lineHeight: 22.4,
    color: Palette.grey600,
  },
  inlineBodyEmphasis: {
    fontFamily: FontFamily.pretendard.semiBold,
    color: Palette.grey700,
  },
  inlineMascot: {
    width: 68,
    height: 76,
  },
});

function InfoBadgeIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12.7125 16.7125C12.9042 16.5208 13 16.2833 13 16V12C13 11.7167 12.9042 11.4792 12.7125 11.2875C12.5208 11.0958 12.2833 11 12 11C11.7167 11 11.4792 11.0958 11.2875 11.2875C11.0958 11.4792 11 11.7167 11 12V16C11 16.2833 11.0958 16.5208 11.2875 16.7125C11.4792 16.9042 11.7167 17 12 17C12.2833 17 12.5208 16.9042 12.7125 16.7125ZM12.7125 8.7125C12.9042 8.52083 13 8.28333 13 8C13 7.71667 12.9042 7.47917 12.7125 7.2875C12.5208 7.09583 12.2833 7 12 7C11.7167 7 11.4792 7.09583 11.2875 7.2875C11.0958 7.47917 11 7.71667 11 8C11 8.28333 11.0958 8.52083 11.2875 8.7125C11.4792 8.90417 11.7167 9 12 9C12.2833 9 12.5208 8.90417 12.7125 8.7125ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22Z"
        fill="#79CEB2"
      />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={17} height={17} viewBox="0 0 17 17" fill="none">
      <Path
        d="M11 5.5L5.5 11.5L3 8.77273"
        stroke={Palette.grey700}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
