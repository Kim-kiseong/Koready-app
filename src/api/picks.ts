export type PicksScope = 'NEARBY' | 'NATIONWIDE';

export type PicksCard = {
  id: string;
  title: string;
  location: string;
  imageKey: 'GYEONGJU_HERITAGE';
  tags: string[];
  description: string[];
};

export type PicksPage = {
  cards: PicksCard[];
  nextCursor: string | null;
};

export const PICKS_PAGE_SIZE = 20;

const BASE_CARD: Omit<PicksCard, 'id'> = {
  title: '경주 문화유산 나들이',
  location: '경상북도 경주시',
  imageKey: 'GYEONGJU_HERITAGE',
  tags: ['역', '카페 거리', '인생샷 명소'],
  description: [
    '서울을 떠나 한국의 살아있는 박물관, 경주의 유구한 역사와 매력적인 로컬 거리를 탐험해 보세요.',
    '대릉원 고분군을 거닐며 과거로 시간 여행을 떠나고, 힙한 황리단길에서 나만의 숨은 카페를 찾아보세요.',
    '유네스코 세계문화유산과 활기찬 전통시장이 어우러진 경주는 학생 예산으로도 충분히 완벽한 여행지입니다.',
  ],
};

// TODO: this generates a repeating mock feed until the personalized-recommendation
// endpoint exists. Every card reuses BASE_CARD's content with a unique id so the
// pagination/stack logic in PicksScreen can be exercised end to end.
const MOCK_TOTAL: Record<PicksScope, number> = {
  NATIONWIDE: 54,
  NEARBY: 0,
};

function buildMockCard(scope: PicksScope, index: number): PicksCard {
  return { id: `${scope.toLowerCase()}-${index}`, ...BASE_CARD };
}

// TODO: replace with client.get('/recommendations/places', { params: { scope, cursor, size: PICKS_PAGE_SIZE } })
// once the personalized-recommendation endpoint exists.
export async function fetchPicksCards(scope: PicksScope, cursor: string | null = null): Promise<PicksPage> {
  const total = MOCK_TOTAL[scope];
  const start = cursor ? Number(cursor) : 0;
  const end = Math.min(start + PICKS_PAGE_SIZE, total);

  const cards = Array.from({ length: end - start }, (_, i) => buildMockCard(scope, start + i));
  const nextCursor = end < total ? String(end) : null;

  return { cards, nextCursor };
}
