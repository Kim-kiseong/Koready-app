import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import type { Translations } from '@/i18n';
import { useTranslation } from '@/i18n/useTranslation';

type KoreaMapProps = {
  width: number;
};

type MapRegionKey = keyof Translations['map']['regionLabels'];

const MAP_CANVAS_BASE_WIDTH = 372;
const MAP_CANVAS_BASE_HEIGHT = 558;

// Base map silhouette built from the existing SVG region pieces.
const MAP_PIECES = [
  {
    key: 'chungnam',
    source: require('@/assets/images/korea-map/chungnam.svg'),
    left: 49.73,
    top: 163.59,
    width: 124,
    height: 109,
  },
  {
    key: 'jeju',
    source: require('@/assets/images/korea-map/jeju.svg'),
    left: 51.54,
    top: 460.28,
    width: 67,
    height: 38,
  },
  {
    key: 'gyeongnam',
    source: require('@/assets/images/korea-map/gyeongnam.svg'),
    left: 168.1,
    top: 276.94,
    width: 134,
    height: 115,
  },
  {
    key: 'gyeongbuk',
    source: require('@/assets/images/korea-map/gyeongbuk.svg'),
    left: 184.94,
    top: 153.17,
    width: 145,
    height: 159,
  },
  {
    key: 'jeonbuk',
    source: require('@/assets/images/korea-map/jeonbuk.svg'),
    left: 75.07,
    top: 253.32,
    width: 121,
    height: 86,
  },
  {
    key: 'chungbuk',
    source: require('@/assets/images/korea-map/chungbuk.svg'),
    left: 143.89,
    top: 143.99,
    width: 110,
    height: 125,
  },
  {
    key: 'gangwon',
    source: require('@/assets/images/korea-map/gangwon.svg'),
    left: 129.6,
    top: 9,
    width: 180,
    height: 158,
  },
  {
    key: 'gyeonggi',
    source: require('@/assets/images/korea-map/gyeonggi.svg'),
    left: 83,
    top: 41.97,
    width: 105,
    height: 139,
  },
  {
    key: 'jeonnam',
    source: require('@/assets/images/korea-map/jeonnam.svg'),
    left: 52.88,
    top: 319.62,
    width: 134,
    height: 120,
  },
  {
    key: 'ulsan',
    source: require('@/assets/images/korea-map/ulsan.svg'),
    left: 280.91,
    top: 294.14,
    width: 41,
    height: 40,
  },
  {
    key: 'busan',
    source: require('@/assets/images/korea-map/busan.svg'),
    left: 267.09,
    top: 327.37,
    width: 42,
    height: 37,
  },
  {
    key: 'daegu',
    source: require('@/assets/images/korea-map/daegu.svg'),
    left: 230.3,
    top: 266.15,
    width: 34,
    height: 42,
  },
  {
    key: 'daejeon',
    source: require('@/assets/images/korea-map/daejeon.svg'),
    left: 141.19,
    top: 219.28,
    width: 26,
    height: 33,
  },
  {
    key: 'incheon',
    source: require('@/assets/images/korea-map/incheon.svg'),
    left: 87.72,
    top: 106.56,
    width: 19,
    height: 27,
  },
  {
    key: 'seoul',
    source: require('@/assets/images/korea-map/seoul.svg'),
    left: 103.14,
    top: 100.68,
    width: 34,
    height: 28,
  },
  {
    key: 'gwangju',
    source: require('@/assets/images/korea-map/gwangju.svg'),
    left: 92.71,
    top: 342.07,
    width: 32,
    height: 22,
  },
  {
    key: 'sejong',
    source: require('@/assets/images/korea-map/sejong.svg'),
    left: 132.64,
    top: 195.85,
    width: 21,
    height: 33,
  },
] as const;

// Region illustration overlays from the new PNG assets.
const REGION_ARTS = [
  {
    key: 'seoul',
    source: require('@/assets/images/korea-map/seoul.png'),
    href: '/seoul',
    left: 50,
    top: 34,
    size: 90,
  },
  {
    key: 'gyeonggi',
    label: '경기도',
    source: require('@/assets/images/korea-map/gyeonggi.png'),
    href: '/gyeonggi',
    left: 150,
    top: 93,
    size: 90,
  },
  {
    key: 'chungcheong',
    label: '충청도',
    source: require('@/assets/images/korea-map/chungcheong.png'),
    href: '/chungcheong',
    left: 67,
    top: 174,
    size: 71,
  },
  {
    key: 'gangwon',
    label: '강원도',
    source: require('@/assets/images/korea-map/gangwon.png'),
    href: '/gangwon',
    left: 226,
    top: 48,
    size: 90,
  },
  {
    key: 'gyeongsang',
    label: '경상도',
    source: require('@/assets/images/korea-map/gyeongsang.png'),
    href: '/gyeongsang',
    left: 249,
    top: 187,
    size: 100,
  },
  {
    key: 'jeolla',
    label: '전라도',
    source: require('@/assets/images/korea-map/jeolla.png'),
    href: '/jeolla',
    left: 115,
    top: 259,
    size: 90,
  },
  {
    key: 'jeju',
    label: '제주도',
    source: require('@/assets/images/korea-map/jeju.png'),
    href: '/jeju',
    left: 81,
    top: 412,
    size: 90,
  },
] as const;

const GYEONGSANG_WINDOW = {
  left: 296,
  top: 230,
  size: 7.5,
} as const;

const REGION_LABELS = [
  { key: 'seoul', left: 104, top: 93 },
  { key: 'gyeonggi', left: 120, top: 135 },
  { key: 'chungcheong', left: 117, top: 206 },
  { key: 'jeolla', left: 101, top: 318 },
  { key: 'gyeongsang', left: 234, top: 259 },
  { key: 'jeju', left: 73, top: 473 },
  { key: 'gangwon', left: 201, top: 82 },
] as const;

export default function KoreaMap({ width }: KoreaMapProps) {
  const router = useRouter();
  const t = useTranslation();
  const scale = width / MAP_CANVAS_BASE_WIDTH;
  const sceneHeight = MAP_CANVAS_BASE_HEIGHT * scale;
  const regionLabels = t.map.regionLabels;

  return (
    <View style={[styles.scene, { width, height: sceneHeight }]}>
      {MAP_PIECES.map((piece) => (
        <Image
          key={piece.key}
          source={piece.source}
          style={[
            styles.piece,
            {
              left: piece.left * scale,
              top: piece.top * scale,
              width: piece.width * scale,
              height: piece.height * scale,
            },
          ]}
          contentFit="contain"
          accessibilityLabel={`${piece.key} 지도 조각`}
        />
      ))}

      <View
        pointerEvents="none"
        style={[
          styles.windowFill,
          {
            left: GYEONGSANG_WINDOW.left * scale,
            top: GYEONGSANG_WINDOW.top * scale,
            width: GYEONGSANG_WINDOW.size * scale,
            height: GYEONGSANG_WINDOW.size * scale,
          },
        ]}
      />

      {REGION_ARTS.map((region) => {
        const regionStyle = [
          styles.piece,
          {
            left: region.left * scale,
            top: region.top * scale,
            width: region.size * scale,
            height: region.size * scale,
          },
        ];

        return (
          <Pressable
            key={region.key}
            accessibilityRole="link"
            accessibilityLabel={`${regionLabels[region.key as MapRegionKey]} 상세 페이지로 이동`}
            onPress={() => router.push(region.href)}
            style={regionStyle}
          >
            <Image source={region.source} style={StyleSheet.absoluteFill} contentFit="contain" />
          </Pressable>
        );
      })}

      {REGION_LABELS.map((region) => (
        <View
          key={region.key}
          pointerEvents="none"
          style={[
            styles.regionPill,
            {
              left: region.left * scale,
              top: region.top * scale,
            },
          ]}
        >
          <CustomText style={styles.regionText}>{regionLabels[region.key as MapRegionKey]}</CustomText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    position: 'relative',
    marginTop: 12,
    marginHorizontal: -24,
  },
  piece: {
    position: 'absolute',
  },
  windowFill: {
    position: 'absolute',
    backgroundColor: '#000000',
  },
  regionPill: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: Palette.grey700,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  regionText: {
    color: Palette.white,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: FontFamily.pretendard.semiBold,
  },
});
