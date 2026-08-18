import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type ChecklistCardProps = {
  title: string;
  description?: string;
  items: string[];
};

// Plain white bordered card: title + optional description + a checkmark list.
// Same idea as HoriTipCard's checklist but without the mascot (bus's "미리
// 예약하고 싶다면" box).
export default function ChecklistCard({ title, description, items }: ChecklistCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <CustomText style={styles.title}>{title}</CustomText>
        {description ? <CustomText style={styles.description}>{description}</CustomText> : null}
      </View>
      <View style={styles.items}>
        {items.map((item) => (
          <View key={item} style={styles.itemRow}>
            <SymbolView
              name={{ ios: 'checkmark', android: 'check', web: 'check' }}
              size={13}
              weight="semibold"
              tintColor={Palette.grey700}
            />
            <CustomText style={styles.itemText}>{item}</CustomText>
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
    gap: 14,
  },
  header: {
    gap: 4,
  },
  title: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    color: Palette.text,
  },
  description: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 19.5,
    color: Palette.grey600,
  },
  items: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 12,
    color: Palette.grey700,
  },
});
