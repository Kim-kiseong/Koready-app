import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import RichText from '@/components/RichText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type StepBlockProps = {
  number: number;
  title: string;
  /** Supports `**bold**` markers for inline emphasis, matching the Figma copy. */
  description?: string;
  /** Override for descriptions that need custom JSX — takes precedence over `description`. */
  descriptionNode?: ReactNode;
};

// The circled-number + title + description row repeated at the top of almost
// every guide content block (subway, taxi, KTX step list, ...).
export default function StepBlock({ number, title, description, descriptionNode }: StepBlockProps) {
  return (
    <View style={styles.row}>
      <View style={styles.badge}>
        <CustomText style={styles.badgeText}>{number}</CustomText>
      </View>
      <View style={styles.textGroup}>
        <CustomText style={styles.title}>{title}</CustomText>
        {descriptionNode ?? (description ? renderDescription(description) : null)}
      </View>
    </View>
  );
}

function renderDescription(description: string) {
  if (!description.includes('\n')) {
    return <RichText text={description} style={styles.description} emphasisStyle={styles.descriptionEmphasis} />;
  }

  const lines = description.split('\n');
  return (
    <View style={styles.descriptionGroup}>
      {lines.map((line, index) => (
        <RichText key={`${index}-${line}`} text={line} style={styles.description} emphasisStyle={styles.descriptionEmphasis} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: Palette.grey100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    color: Palette.grey600,
  },
  textGroup: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  title: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    color: Palette.text,
    marginTop: 4,
  },
  description: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 19.5,
    color: Palette.grey600,
  },
  descriptionGroup: {
    gap: 2,
  },
  descriptionEmphasis: {
    fontFamily: FontFamily.pretendard.semiBold,
    color: Palette.grey700,
  },
});
