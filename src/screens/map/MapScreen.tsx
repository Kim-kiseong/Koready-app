import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNavBar from '@/components/BottomNavBar';
import CustomText from '@/components/CustomText';
import KoreaMap from '@/components/KoreaMap';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

const BASE_WIDTH = 375;

export default function MapScreen() {
  const { width } = useWindowDimensions();
  const screenScale = width / BASE_WIDTH;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 * screenScale}]}
        showsVerticalScrollIndicator={false}
      >
        <CustomText style={styles.title}>대한민국 지도</CustomText>

        <View style={[styles.instructionCard, { width: width - 48, marginTop: 28 * screenScale }]}>
          <CustomText style={styles.instructionText}>원하는 지역을 선택해 추천 여행지를 둘러보세요.</CustomText>
        </View>

        <KoreaMap width={width} />
      </ScrollView>

      <BottomNavBar active="map" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    marginTop: 18,
    color: Palette.text,
    fontSize: 18,
    lineHeight: 25,
    textAlign: 'center',
    fontFamily: FontFamily.pretendard.semiBold,
  },
  instructionCard: {
    paddingVertical:16,
    borderRadius: 12,
    backgroundColor: Palette.grey100,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  instructionText: {
    color: Palette.grey600,
    fontSize: 14,
    lineHeight: 19.6,
    textAlign: 'center',
    marginLeft:16,
    fontFamily: FontFamily.pretendard.regular,
  },
});
