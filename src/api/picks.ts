export type PicksScope = 'NEARBY' | 'NATIONWIDE';

export type PicksCard = {
  id: string;
  title: string;
  location: string;
  imageKey: 'GYEONGJU_HERITAGE';
};

const MOCK_PICKS: Record<PicksScope, PicksCard[]> = {
  NATIONWIDE: [
    {
      id: 'gyeongju-heritage',
      title: '경주 문화유산 나들이',
      location: '경상북도 경주시',
      imageKey: 'GYEONGJU_HERITAGE',
    },
  ],
  NEARBY: [],
};

// TODO: replace with client.get('/recommendations/places', { params: { scope } })
// once the personalized-recommendation endpoint exists.
export async function fetchPicksCards(scope: PicksScope): Promise<PicksCard[]> {
  return MOCK_PICKS[scope];
}
