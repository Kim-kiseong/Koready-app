import { StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type NotificationCardProps = {
  emoji: string;
  title: string;
  timestamp: string;
  body: string;
  bodySub?: string;
};

// Dark toast/push-notification mockup (waiting-list "웨이팅 알림" preview).
export default function NotificationCard({ emoji, title, timestamp, body, bodySub }: NotificationCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <CustomText style={styles.emoji}>{emoji}</CustomText>
        </View>
        <View>
          <CustomText style={styles.title}>{title}</CustomText>
          <CustomText style={styles.timestamp}>{timestamp}</CustomText>
        </View>
      </View>
      <View>
        <CustomText style={styles.body}>{body}</CustomText>
        {bodySub ? <CustomText style={styles.bodySub}>{bodySub}</CustomText> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: Palette.grey700,
    padding: 20,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 14,
  },
  title: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 13,
    color: '#ffffff',
  },
  timestamp: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 11,
    color: Palette.grey350,
  },
  body: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 13,
    color: '#ffffff',
  },
  bodySub: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 12,
    color: Palette.grey350,
  },
});
