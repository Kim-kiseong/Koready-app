import { Pressable, StyleSheet, View } from 'react-native';

import type { PlaceDetailTab } from '@/api/place';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';

type Props = {
  activeTab: PlaceDetailTab;
  tabs?: PlaceDetailTab[];
  onChange: (tab: PlaceDetailTab) => void;
};

const DEFAULT_TABS: PlaceDetailTab[] = ['DESCRIPTION', 'ROUTE', 'MATES'];

export default function PlaceDetailTabs({ activeTab, tabs = DEFAULT_TABS, onChange }: Props) {
  const t = useTranslation();
  const labels: Record<PlaceDetailTab, string> = {
    DESCRIPTION: t.placeDetail.tabs.description,
    ROUTE: t.placeDetail.tabs.route,
    MATES: t.placeDetail.tabs.mates,
  };

  const visibleTabs = tabs.length > 0 ? tabs : DEFAULT_TABS;

  return <View style={styles.wrapper}>{visibleTabs.map((tab) => {
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
