import { StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type BulletListColumn = {
  label: string;
  dotColor: string;
  items: string[];
};

export type BulletListProps = {
  columns: BulletListColumn[];
};

// Side-by-side labeled bullet columns — e.g. KTX Step 3's "서울 대표 출발역 /
// 대표 도착역" station lists, each item prefixed with a small colored dot.
export default function BulletList({ columns }: BulletListProps) {
  return (
    <View style={styles.card}>
      <View style={styles.columns}>
        {columns.map((column) => (
          <View key={column.label} style={styles.column}>
            <CustomText style={styles.label}>{column.label}</CustomText>
            <View style={styles.items}>
              {column.items.map((item) => (
                <View key={item} style={styles.itemRow}>
                  <View style={[styles.dot, { backgroundColor: column.dotColor }]} />
                  <CustomText style={styles.itemText}>{item}</CustomText>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: Palette.grey200,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  columns: {
    flexDirection: 'row',
    gap: 18,
  },
  column: {
    flex: 1,
    gap: 14,
  },
  label: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    color: Palette.grey600,
  },
  items: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  itemText: {
    flex: 1,
    flexShrink: 1,
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.text,
  },
});
