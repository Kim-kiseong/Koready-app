export type SavedAddressOption = {
  id: string;
  title: string;
  subtitle: string;
};

const MOCK_SAVED_ADDRESSES: SavedAddressOption[] = [
  { id: 'seoul-station', title: '서울역', subtitle: '서울 용산구 청파로 378 서울역' },
  {
    id: 'ttukseom-park',
    title: '뚝섬한강공원 배달존2',
    subtitle: '서울 광진구 강변북로 2202 뚝섬한강공원 배달존2',
  },
];

// TODO: replace with client.get('/addresses')
export async function fetchSavedAddresses(): Promise<SavedAddressOption[]> {
  return MOCK_SAVED_ADDRESSES;
}
