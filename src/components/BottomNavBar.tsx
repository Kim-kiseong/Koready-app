import { LinearGradient } from 'expo-linear-gradient';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';

export type NavTab = 'home' | 'map' | 'picks' | 'saved' | 'my';

export type BottomNavBarProps = {
  active: NavTab;
};

type NavIconProps = { color: string };

type TabConfig = {
  id: NavTab;
  label: string;
  href: Href;
  Icon: ComponentType<NavIconProps>;
};

export default function BottomNavBar({ active }: BottomNavBarProps) {
  const router = useRouter();
  const t = useTranslation();

  const sideTabs: TabConfig[] = [
    { id: 'home', label: t.nav.home, href: '/home', Icon: HomeIcon },
    { id: 'map', label: t.nav.map, href: '/map', Icon: MapIcon },
    { id: 'saved', label: t.nav.saved, href: '/saved', Icon: HeartIcon },
    { id: 'my', label: t.nav.my, href: '/my', Icon: PersonIcon },
  ];

  const centerTab: TabConfig = {
    id: 'picks',
    label: t.nav.picks,
    href: '/picks',
    Icon: CompassIcon,
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

        <Pressable style={styles.centerButtonWrap} onPress={() => handlePress(centerTab)}>
          <LinearGradient
            colors={[Palette.primaryLight, Palette.primaryDark]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.centerButton}
          >
            <CompassIcon color="#ffffff" />
            <CustomText style={styles.centerLabel}>{centerTab.label}</CustomText>
          </LinearGradient>
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
  const Icon = tab.Icon;

  return (
    <Pressable style={styles.sideTab} onPress={() => onPress(tab)}>
      <Icon color={color} />
      <CustomText style={[styles.sideLabel, { color, fontFamily }]} numberOfLines={1}>
        {tab.label}
      </CustomText>
    </Pressable>
  );
}

function HomeIcon({ color }: NavIconProps) {
  return (
    <Svg width={19} height={20} viewBox="0 0 18.6 19.6" fill="none">
      <Path
        d="M12.1335 18.8V11.2208C12.1335 10.9696 12.034 10.7286 11.8569 10.5509C11.6798 10.3733 11.4396 10.2735 11.1891 10.2735H7.41132C7.16084 10.2735 6.92062 10.3733 6.7435 10.5509C6.56638 10.7286 6.46688 10.9696 6.46688 11.2208V18.8"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M0.8 8.37866C0.799934 8.10303 0.859815 7.83071 0.975466 7.58069C1.09112 7.33066 1.25975 7.10896 1.46961 6.93104L8.08072 1.24762C8.42165 0.958583 8.85361 0.8 9.3 0.8C9.74639 0.8 10.1783 0.958583 10.5193 1.24762L17.1304 6.93104C17.3402 7.10896 17.5089 7.33066 17.6245 7.58069C17.7402 7.83071 17.8001 8.10303 17.8 8.37866V16.9052C17.8 17.4077 17.601 17.8897 17.2468 18.245C16.8925 18.6004 16.4121 18.8 15.9111 18.8H2.68889C2.18792 18.8 1.70748 18.6004 1.35324 18.245C0.999007 17.8897 0.8 17.4077 0.8 16.9052V8.37866Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MapIcon({ color }: NavIconProps) {
  return (
    <Svg width={19} height={19} viewBox="0 0 19.6 19.1289" fill="none">
      <Path
        d="M11.906 3.11699C12.1836 3.25571 12.4897 3.32793 12.8 3.32793C13.1103 3.32793 13.4164 3.25571 13.694 3.11699L17.353 1.28699C17.5056 1.21075 17.6751 1.1748 17.8455 1.18256C18.0159 1.19032 18.1814 1.24153 18.3265 1.33132C18.4715 1.42112 18.5911 1.54651 18.674 1.69557C18.7569 1.84464 18.8002 2.01243 18.8 2.18299V14.947C18.7999 15.1327 18.7481 15.3146 18.6504 15.4725C18.5528 15.6304 18.4131 15.758 18.247 15.841L13.694 18.118C13.4164 18.2567 13.1103 18.3289 12.8 18.3289C12.4897 18.3289 12.1836 18.2567 11.906 18.118L7.694 16.012C7.4164 15.8733 7.11033 15.8011 6.8 15.8011C6.48967 15.8011 6.1836 15.8733 5.906 16.012L2.247 17.842C2.09435 17.9183 1.92473 17.9542 1.75426 17.9464C1.58379 17.9386 1.41816 17.8873 1.27312 17.7974C1.12808 17.7075 1.00846 17.582 0.92565 17.4328C0.842836 17.2836 0.799582 17.1156 0.800003 16.945V4.18199C0.800102 3.99633 0.851886 3.81436 0.949555 3.65647C1.04722 3.49857 1.18692 3.37098 1.353 3.28799L5.906 1.01099C6.1836 0.872275 6.48967 0.800059 6.8 0.800059C7.11033 0.800059 7.4164 0.872275 7.694 1.01099L11.906 3.11699Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12.8 3.32801V18.328" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6.79989 0.8V15.8" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function HeartIcon({ color }: NavIconProps) {
  return (
    <Svg width={19} height={18} viewBox="0 0 19.6 17.6" fill="none">
      <Path
        d="M9.8 3.96182C7.8 -0.743972 0.8 -0.242716 0.8 5.77235C0.8 11.7874 9.8 16.8 9.8 16.8C9.8 16.8 18.8 11.7874 18.8 5.77235C18.8 -0.242716 11.8 -0.743972 9.8 3.96182Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PersonIcon({ color }: NavIconProps) {
  return (
    <Svg width={16} height={20} viewBox="0 0 16.0004 19.6" fill="none">
      <Path
        d="M8.00018 7.99999C9.98841 7.99999 11.6002 6.38822 11.6002 4.4C11.6002 2.41177 9.98841 0.8 8.00018 0.8C6.01196 0.8 4.40018 2.41177 4.40018 4.4C4.40018 6.38822 6.01196 7.99999 8.00018 7.99999Z"
        stroke={color}
        strokeWidth={1.6}
      />
      <Path
        d="M15.2002 14.75C15.2002 16.9865 15.2002 18.8 8.00018 18.8C0.800181 18.8 0.800181 16.9865 0.800181 14.75C0.800181 12.5135 4.02398 10.7 8.00018 10.7C11.9764 10.7 15.2002 12.5135 15.2002 14.75Z"
        stroke={color}
        strokeWidth={1.6}
      />
    </Svg>
  );
}

function CompassIcon({ color }: NavIconProps) {
  return (
    <Svg width={18} height={18} viewBox="0 0 9.90402 9.90402" fill="none">
      <Path
        d="M9.38967 0.0268543L3.89592 2.22435C3.51861 2.37524 3.17589 2.60121 2.88855 2.88855C2.60121 3.17589 2.37524 3.51861 2.22435 3.89592L0.0268543 9.38967C-0.00042375 9.45782 -0.00710096 9.53247 0.00764964 9.60438C0.0224002 9.67629 0.0579305 9.74228 0.109835 9.79419C0.16174 9.84609 0.227737 9.88162 0.299644 9.89637C0.371551 9.91112 0.446207 9.90445 0.514355 9.87717L6.00811 7.67967C6.38541 7.52878 6.72813 7.30281 7.01547 7.01547C7.30281 6.72813 7.52878 6.38541 7.67967 6.00811L9.87717 0.514355C9.90445 0.446207 9.91112 0.371551 9.89637 0.299644C9.88162 0.227737 9.84609 0.16174 9.79419 0.109835C9.74228 0.0579305 9.67629 0.0224002 9.60438 0.00764964C9.53247 -0.00710096 9.45782 -0.00042375 9.38967 0.0268543ZM4.95201 6.07701C4.72951 6.07701 4.512 6.01103 4.327 5.88741C4.14199 5.7638 3.9978 5.5881 3.91265 5.38253C3.8275 5.17696 3.80522 4.95076 3.84863 4.73253C3.89204 4.51431 3.99918 4.31385 4.15652 4.15652C4.31385 3.99918 4.51431 3.89204 4.73253 3.84863C4.95076 3.80522 5.17696 3.8275 5.38253 3.91265C5.5881 3.9978 5.7638 4.14199 5.88741 4.327C6.01103 4.512 6.07701 4.72951 6.07701 4.95201C6.07701 5.25038 5.95848 5.53653 5.74751 5.74751C5.53653 5.95848 5.25038 6.07701 4.95201 6.07701Z"
        fill={color}
      />
    </Svg>
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
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.grey200,
    backgroundColor: '#ffffff',
  },
  sideTab: {
    minWidth: 32,
    alignItems: 'center',
    gap: 2,
  },
  sideLabel: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 12,
  },
  centerButtonWrap: {
    width: 64,
    height: 64,
    marginTop: -24,
    borderRadius: 32,
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  centerLabel: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 12,
    color: '#ffffff',
  },
});
