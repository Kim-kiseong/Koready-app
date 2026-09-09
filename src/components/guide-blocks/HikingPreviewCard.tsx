import { Platform, StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { FontFamily } from '@/constants/typography';

export type HikingPreviewCardProps = {
  title: string;
  rows: { label: string; value: string }[];
};

export default function HikingPreviewCard({ title, rows }: HikingPreviewCardProps) {
  return (
    <View style={styles.outer}>
      <View style={styles.shadowWrap}>
        <View style={styles.card}>
          <View style={styles.header}>
            <CustomText style={styles.headerTitle} numberOfLines={1}>
              {title}
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
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    minHeight: 200,
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
    paddingHorizontal: 11.79,
    paddingVertical: 9.83,
  },
  headerTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 9.83,
    lineHeight: 13.76,
    color: '#ffffff',
  },
  body: {
    paddingHorizontal: 11.79,
    paddingTop: 9.83,
    paddingBottom: 9.83,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 7.86,
    paddingBottom: 7.86,
  },
  rowDivider: {
    borderBottomWidth: 0.79,
    borderBottomColor: '#F3F4F6',
  },
  rowLabel: {
    flex: 1,
    minWidth: 0,
    marginRight: 12,
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 8.84,
    lineHeight: 12.38,
    color: '#6B7684',
  },
  rowValue: {
    flexShrink: 0,
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 8.84,
    lineHeight: 12.38,
    color: '#1C1C1A',
  },
});
