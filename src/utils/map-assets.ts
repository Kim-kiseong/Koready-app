import { Asset } from 'expo-asset';

export type MapArtwork = {
  key: string;
  source: number;
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
};

type RegionMapAssetGroup = {
  name: string;
  assets: number[];
};

export const JEJU_MAP_IMAGE = require('@/assets/images/jeju/jeju-frame.svg');

export const JEJU_MAP_ARTWORK: MapArtwork[] = [
  {
    key: 'colorful-dumplings',
    source: require('@/assets/images/jeju/map-icons/colorful-dumplings.png'),
    left: 22,
    top: 100,
    width: 100,
    height: 100,
    zIndex: 6,
  },
  {
    key: 'cream-donuts',
    source: require('@/assets/images/jeju/map-icons/cream-donuts.png'),
    left: 85,
    top: 58,
    width: 100,
    height: 100,
    zIndex: 7,
  },
  {
    key: 'black-pork',
    source: require('@/assets/images/jeju/map-icons/black-pork.png'),
    left: 150,
    top: 97,
    width: 100,
    height: 100,
    zIndex: 8,
  },
  {
    key: 'olle-trail',
    source: require('@/assets/images/jeju/map-icons/olle-trail.png'),
    left: 200,
    top: 36,
    width: 100,
    height: 100,
    zIndex: 9,
  },
  {
    key: 'udo',
    source: require('@/assets/images/jeju/map-icons/udo.png'),
    left: 289,
    top: 58,
    width: 100,
    height: 100,
    zIndex: 10,
  },
  {
    key: 'hyeopjae-beach',
    source: require('@/assets/images/jeju/map-icons/hyeopjae-beach.png'),
    left: -18,
    top: 150,
    width: 100,
    height: 100,
    zIndex: 4,
  },
  {
    key: 'hallasan',
    source: require('@/assets/images/jeju/map-icons/hallasan.png'),
    left: 95,
    top: 142,
    width: 100,
    height: 100,
    zIndex: 5,
  },
  {
    key: 'seongsan-ilchulbong',
    source: require('@/assets/images/jeju/map-icons/seongsan-ilchulbong.png'),
    left: 268,
    top: 120,
    width: 100,
    height: 100,
    zIndex: 6,
  },
  {
    key: 'camellia',
    source: require('@/assets/images/jeju/map-icons/camellia.png'),
    left: 50,
    top: 200,
    width: 100,
    height: 100,
    zIndex: 5,
  },
  {
    key: 'cheonjiyeon',
    source: require('@/assets/images/jeju/map-icons/cheonjiyeon.png'),
    left: 193,
    top: 175,
    width: 100,
    height: 100,
    zIndex: 7,
  },
];

const REGION_MAP_ASSET_GROUPS: RegionMapAssetGroup[] = [
  {
    name: 'seoul',
    assets: [
      require('@/assets/images/seoul/seoul-districts.svg'),
      require('@/assets/images/seoul/map-icons/seoul-world-cup-stadium.png'),
      require('@/assets/images/seoul/map-icons/gwanghwamun-gate.png'),
      require('@/assets/images/seoul/map-icons/seongsu-dong-seoul-forest.png'),
      require('@/assets/images/seoul/map-icons/seoul-forest-treehouses.png'),
      require('@/assets/images/seoul/map-icons/tteokbokki.png'),
      require('@/assets/images/seoul/map-icons/cherry-blossom-tree.png'),
      require('@/assets/images/seoul/map-icons/bodhisattva-statue.png'),
      require('@/assets/images/seoul/map-icons/n-seoul-tower.png'),
      require('@/assets/images/seoul/map-icons/opera-house.png'),
      require('@/assets/images/seoul/map-icons/korean-sundae.png'),
    ],
  },
  {
    name: 'gyeonggi',
    assets: [
      require('@/assets/images/gyeonggi/gyeonggi-frame.svg'),
      require('@/assets/images/gyeonggi/map-icons/market-stall.png'),
      require('@/assets/images/gyeonggi/map-icons/steam-locomotive.png'),
      require('@/assets/images/gyeonggi/map-icons/dotori-makguksu.png'),
      require('@/assets/images/gyeonggi/map-icons/lotus-flower.png'),
      require('@/assets/images/gyeonggi/map-icons/dumulmeori.png'),
      require('@/assets/images/gyeonggi/map-icons/gwangmyeong-cave.png'),
      require('@/assets/images/gyeonggi/map-icons/national-museum-gwacheon.png'),
      require('@/assets/images/gyeonggi/map-icons/suwon-hwaseong.png'),
      require('@/assets/images/gyeonggi/map-icons/korean-folk-village.png'),
      require('@/assets/images/gyeonggi/map-icons/european-buildings.png'),
      require('@/assets/images/gyeonggi/map-icons/salt-bread.png'),
    ],
  },
  {
    name: 'gangwon',
    assets: [
      require('@/assets/images/gangwon/gangwon-frame.svg'),
      require('@/assets/images/gangwon/map-icons/ice-festival.png'),
      require('@/assets/images/gangwon/map-icons/makguksu.png'),
      require('@/assets/images/gangwon/map-icons/ulsanbawi-rock.png'),
      require('@/assets/images/gangwon/map-icons/red-crab.png'),
      require('@/assets/images/gangwon/map-icons/gyeongpo-beach.png'),
      require('@/assets/images/gangwon/map-icons/coffee-cup.png'),
      require('@/assets/images/gangwon/map-icons/sheep-ranch.png'),
      require('@/assets/images/gangwon/map-icons/cheongnyeongpo.png'),
      require('@/assets/images/gangwon/map-icons/coastal-boardwalk.png'),
      require('@/assets/images/gangwon/map-icons/ginkgo-tree.png'),
    ],
  },
  {
    name: 'chungcheong',
    assets: [
      require('@/assets/images/chungcheong/chungcheong-frame.svg'),
      require('@/assets/images/chungcheong/map-icons/hot-spring.png'),
      require('@/assets/images/chungcheong/map-icons/stone-monument.png'),
      require('@/assets/images/chungcheong/map-icons/aquarium.png'),
      require('@/assets/images/chungcheong/map-icons/two-rocks.png'),
      require('@/assets/images/chungcheong/map-icons/fortress-gate.png'),
      require('@/assets/images/chungcheong/map-icons/pork-barbecue.png'),
      require('@/assets/images/chungcheong/map-icons/pavilion-bridge.png'),
      require('@/assets/images/chungcheong/map-icons/wine-bottle.png'),
    ],
  },
  {
    name: 'gyeongsang',
    assets: [
      require('@/assets/images/gyeongsang/gyeongsang-frame.svg'),
      require('@/assets/images/gyeongsang/map-icons/sangju-cafe.png'),
      require('@/assets/images/gyeongsang/map-icons/gimbap-festival.png'),
      require('@/assets/images/gyeongsang/map-icons/hahoe-mask.png'),
      require('@/assets/images/gyeongsang/map-icons/yeongyang-birch-forest.png'),
      require('@/assets/images/gyeongsang/map-icons/seokguram.png'),
      require('@/assets/images/gyeongsang/map-icons/gyeongju-cheomseongdae.png'),
      require('@/assets/images/gyeongsang/map-icons/hamyang-daebong.png'),
      require('@/assets/images/gyeongsang/map-icons/daegu-seomun-market.png'),
      require('@/assets/images/gyeongsang/map-icons/taehwa-river-garden.png'),
      require('@/assets/images/gyeongsang/map-icons/galam-seafood.png'),
      require('@/assets/images/gyeongsang/map-icons/dongpirang-village.png'),
      require('@/assets/images/gyeongsang/map-icons/gwangan-bridge.png'),
    ],
  },
  {
    name: 'jeolla',
    assets: [
      require('@/assets/images/jeolla/jeolla-frame.svg'),
      require('@/assets/images/jeolla/map-icons/jeonju-hanok-village.png'),
      require('@/assets/images/jeolla/map-icons/muju-gugcheon-valley.png'),
      require('@/assets/images/jeolla/map-icons/namwon-soboro.png'),
      require('@/assets/images/jeolla/map-icons/yeonggwang-gulbi-street.png'),
      require('@/assets/images/jeolla/map-icons/gochang-dolmen.png'),
      require('@/assets/images/jeolla/map-icons/gwangju-acc.png'),
      require('@/assets/images/jeolla/map-icons/damyang-juknokwon.png'),
      require('@/assets/images/jeolla/map-icons/gwangyang-maehwa.png'),
      require('@/assets/images/jeolla/map-icons/mokpo-cable-car.png'),
      require('@/assets/images/jeolla/map-icons/boseong-green-tea.png'),
      require('@/assets/images/jeolla/map-icons/suncheonman-boardwalk.png'),
    ],
  },
  {
    name: 'jeju',
    assets: [JEJU_MAP_IMAGE, ...JEJU_MAP_ARTWORK.map((artwork) => artwork.source)],
  },
];

const loadedAssetSources = new Set<number>();
const loadingAssetPromises = new Map<number, Promise<void>>();
const preloadAllMapsPromiseRef: { current: Promise<void> | null } = { current: null };
const preloadJejuPromiseRef: { current: Promise<void> | null } = { current: null };

const waitForNextFrame = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

async function loadAssetOnce(source: number) {
  if (loadedAssetSources.has(source)) {
    return;
  }

  const existingPromise = loadingAssetPromises.get(source);
  if (existingPromise) {
    await existingPromise;
    return;
  }

  const promise = Asset.loadAsync([source])
    .then(() => {
      loadedAssetSources.add(source);
    })
    .catch(() => {
      // Best-effort background cache. If one asset fails, let callers continue.
    })
    .finally(() => {
      loadingAssetPromises.delete(source);
    });

  loadingAssetPromises.set(source, promise);
  await promise;
}

async function preloadAssetGroup(assets: number[]) {
  await Promise.all(assets.map((asset) => loadAssetOnce(asset)));
}

function preloadAssetGroupsSequentially(groups: RegionMapAssetGroup[]) {
  return (async () => {
    for (const group of groups) {
      await preloadAssetGroup(group.assets);
      await waitForNextFrame();
    }
  })();
}

export function preloadRegionMapAssetsSequentially() {
  if (!preloadAllMapsPromiseRef.current) {
    preloadAllMapsPromiseRef.current = preloadAssetGroupsSequentially(REGION_MAP_ASSET_GROUPS);
  }

  return preloadAllMapsPromiseRef.current;
}

export function preloadJejuMapAssets() {
  if (!preloadJejuPromiseRef.current) {
    preloadJejuPromiseRef.current = preloadAssetGroup([
      JEJU_MAP_IMAGE,
      ...JEJU_MAP_ARTWORK.map((artwork) => artwork.source),
    ]);
  }

  return preloadJejuPromiseRef.current;
}
