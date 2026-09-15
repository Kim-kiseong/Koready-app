import { Platform, StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type ReservationPreviewCardProps = {
  title: string;
  subtitle: string;
  rows: { label: string; value: string }[];
  buttonLabel: string;
};

// Small reservation mockup shown above the date/time/person cards in the
// restaurant reservation guide.
export default function ReservationPreviewCard({ title, subtitle, rows, buttonLabel }: ReservationPreviewCardProps) {
  return (
    <View style={styles.outer}>
      <View style={styles.shadowWrap}>
        <View style={styles.card}>
          <View style={styles.header}>
            <CustomText style={styles.headerTitle} numberOfLines={1}>
              {title}
            </CustomText>
            <CustomText style={styles.headerSubtitle} numberOfLines={2}>
              {subtitle}
            </CustomText>
          </View>

          <View style={styles.body}>
            {rows.map((row, index) => {
              const isLast = index === rows.length - 1;

              return (
                <View key={row.label} style={[styles.row, !isLast ? styles.rowDivider : null]}>
                  <CustomText style={styles.rowLabel} numberOfLines={1}>
                    {row.label}
                  </CustomText>
                  <CustomText style={styles.rowValue} numberOfLines={1}>
                    {row.value}
                  </CustomText>
                </View>
              );
            })}

            <View style={styles.button}>
              <CustomText style={styles.buttonText} numberOfLines={1}>
                {buttonLabel}
              </CustomText>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    minHeight: 228.67,
    backgroundColor: '#F6F9FB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EEF2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  shadowWrap: {
    width: 175.2,
    borderRadius: 16,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 18px 34px rgba(122, 135, 148, 0.28)' } as object)
      : {
          shadowColor: '#7A8794',
          shadowOpacity: 0.28,
          shadowRadius: 34,
          shadowOffset: {
            width: 0,
            height: 18,
          },
        }),
    elevation: 12,
  },
  card: {
    width: 175.2,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#4FAE98',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 2,
  },
  headerTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 10,
    lineHeight: 14,
    color: '#ffffff',
  },
  headerSubtitle: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 9,
    lineHeight: 12.6,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  body: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 8,
  },
  rowDivider: {
    borderBottomWidth: 0.8,
    borderBottomColor: '#F3F4F6',
  },
  rowLabel: {
    flex: 1,
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 9,
    lineHeight: 12.6,
    color: Palette.grey500,
    marginRight: 12,
  },
  rowValue: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 9,
    lineHeight: 12.6,
    color: Palette.text,
  },
  button: {
    marginTop: 4,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: '#4FAE98',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: FontFamily.pretendard.bold,
    fontSize: 10,
    lineHeight: 14,
    color: '#ffffff',
  },
});
