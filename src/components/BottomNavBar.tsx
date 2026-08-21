import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';

export type NavTab = 'home' | 'map' | 'picks' | 'saved' | 'my';

export type BottomNavBarProps = {
  active: NavTab;
};

type TabConfig = {
  id: NavTab;
  label: string;
  href: Href;
  icon: SymbolViewProps['name'];
};

export default function BottomNavBar({ active }: BottomNavBarProps) {
  const router = useRouter();
  const t = useTranslation();

  const sideTabs: TabConfig[] = [
    { id: 'home', label: t.nav.home, href: '/home', icon: { ios: 'house', android: 'home', web: 'home' } },
    { id: 'map', label: t.nav.map, href: '/map', icon: { ios: 'map', android: 'map', web: 'map' } },
    {
      id: 'saved',
      label: t.nav.saved,
      href: '/saved',
      icon: { ios: 'heart', android: 'favorite', web: 'favorite' },
    },
    {
      id: 'my',
      label: t.nav.profile,
      href: '/my',
      icon: { ios: 'person', android: 'person', web: 'person' },
    },
  ];

  const centerTab: TabConfig = {
    id: 'picks',
    label: t.nav.picks,
    href: '/picks',
    icon: { ios: 'safari', android: 'explore', web: 'explore' },
  };

  const handlePress = (tab: TabConfig) => {
    if (tab.id === active) return;
    router.push(tab.href);
  };

  // Side tabs render in two groups so the center FAB can sit between them.
  const leftTabs = sideTabs.slice(0, 2);
  const rightTabs = sideTabs.slice(2);

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={styles.bar}>
        {leftTabs.map((tab) => (
          <SideTab key={tab.id} tab={tab} isActive={tab.id === active} onPress={handlePress} />
        ))}

        <Pressable style={styles.centerButton} onPress={() => handlePress(centerTab)}>
          <SymbolView name={centerTab.icon} size={18} weight="regular" tintColor="#ffffff" />
          <CustomText numberOfLines={1} ellipsizeMode="tail" style={styles.centerLabel}>
            {centerTab.label}
          </CustomText>
        </Pressable>

        {rightTabs.map((tab) => (
          <SideTab key={tab.id} tab={tab} isActive={tab.id === active} onPress={handlePress} />
        ))}
      </View>
    </SafeAreaView>
  );
}

function SideTab({
  tab,
  isActive,
  onPress,
}: {
  tab: TabConfig;
  isActive: boolean;
  onPress: (tab: TabConfig) => void;
}) {
  const color = isActive ? Palette.grey700 : Palette.grey400;
  const fontFamily = isActive ? FontFamily.pretendard.bold : FontFamily.pretendard.medium;

  return (
    <Pressable style={styles.sideTab} onPress={() => onPress(tab)}>
      <SymbolView name={tab.icon} size={18} weight={isActive ? 'semibold' : 'regular'} tintColor={color} />
      <CustomText numberOfLines={1} ellipsizeMode="tail" style={[styles.sideLabel, { color, fontFamily }]}>
        {tab.label}
      </CustomText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#ffffff',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.grey200,
    backgroundColor: '#ffffff',
  },
  sideTab: {
    width: 44,
    alignItems: 'center',
    gap: 3,
  },
  sideLabel: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 11,
    lineHeight: 15.4,
    textAlign: 'center',
  },
  centerButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    marginTop: -26,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  centerLabel: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 11,
    lineHeight: 15.4,
    color: '#ffffff',
    textAlign: 'center',
  },
});
