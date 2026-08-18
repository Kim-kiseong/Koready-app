import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type HoriTipCardProps = {
  title?: string;
  body?: string;
  checklist?: string[];
};

// Shared "Hori Tip" callout — mascot badge overlapping a mint tip card. Mirrors
// the pattern already in RouteDetailScreen's TipCard/SegmentTipContent, pulled
// out here since every guide detail screen repeats it with static copy.
export default function HoriTipCard({ title = 'Hori Tip', body, checklist }: HoriTipCardProps) {
  return (
    <View style={styles.wrap}>
      <Image
        source={require('@/assets/images/horitipIcon.png')}
        style={styles.mascot}
        contentFit="contain"
      />
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.icon}>
            <CustomText style={styles.iconText}>i</CustomText>
          </View>
          <CustomText style={styles.title}>{title}</CustomText>
        </View>

        {body ? <CustomText style={styles.body}>{body}</CustomText> : null}

        {checklist?.length ? (
          <View style={styles.checklist}>
            {checklist.map((line) => (
              <View key={line} style={styles.checklistRow}>
                <CustomText style={styles.checkMark}>✓</CustomText>
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
    left: -1,
    top: -38,
    width: 59,
    height: 44,
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
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontFamily: FontFamily.pretendard.bold,
    fontSize: 16,
    color: '#ffffff',
    marginTop: -1,
  },
  title: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    color: Palette.text,
  },
  body: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    lineHeight: 22.4,
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
  checkMark: {
    fontSize: 13,
    color: Palette.primary,
  },
  checklistText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    color: Palette.grey700,
  },
});
