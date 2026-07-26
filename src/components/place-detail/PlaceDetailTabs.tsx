import { Pressable, StyleSheet, View } from 'react-native';

import type { PlaceDetailTab } from '@/api/place';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';

type Props = { activeTab: PlaceDetailTab; onChange: (tab: PlaceDetailTab) => void };
const TABS: PlaceDetailTab[] = ['DESCRIPTION', 'ROUTE', 'MATE'];

export default function PlaceDetailTabs({ activeTab, onChange }: Props) {
  const t = useTranslation();
  const labels: Record<PlaceDetailTab, string> = {
    DESCRIPTION: t.placeDetail.tabs.description,
    ROUTE: t.placeDetail.tabs.route,
    MATE: t.placeDetail.tabs.mate,
  };
  return <View style={styles.wrapper}>{TABS.map((tab) => {
    const active = tab === activeTab;
    return <Pressable key={tab} style={styles.tab} onPress={() => onChange(tab)}><CustomText style={[styles.label, active ? styles.activeLabel : styles.inactiveLabel]}>{labels[tab]}</CustomText><View style={[styles.line, active && styles.activeLine]} /></Pressable>;
  })}</View>;
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', marginTop: 24, borderBottomWidth: 1, borderBottomColor: Palette.grey200 },
  tab: { flex: 1, alignItems: 'center' },
  label: { marginBottom: 10, fontSize: 14, lineHeight: 20 },
  activeLabel: { fontFamily: FontFamily.pretendard.bold, color: Palette.text },
  inactiveLabel: { fontFamily: FontFamily.pretendard.medium, color: Palette.grey500 },
  line: { width: '100%', height: 2, backgroundColor: 'transparent' },
  activeLine: { backgroundColor: Palette.text },
});
