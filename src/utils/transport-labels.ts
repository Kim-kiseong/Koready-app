import type { TransportMode } from '@/api/route';
import type { LanguageCode } from '@/api/types';

const TRANSPORT_MODE_LABELS: Record<LanguageCode, Record<TransportMode, string>> = {
  KO: {
    WALK: '도보',
    SUBWAY: '지하철',
    BUS: '버스',
    EXPRESS_BUS: '고속버스',
    TRAIN: '기차',
    AIRPLANE: '비행기',
    FERRY: '배',
    SHUTTLE_BUS: '축제 셔틀버스',
  },
  EN: {
    WALK: 'Walk',
    SUBWAY: 'Subway',
    BUS: 'Bus',
    EXPRESS_BUS: 'Express Bus',
    TRAIN: 'Train',
    AIRPLANE: 'Plane',
    FERRY: 'Ferry',
    SHUTTLE_BUS: 'Festival Shuttle Bus',
  },
};

export function formatTransportModeLabel(
  mode: TransportMode,
  language: LanguageCode,
) {
  return TRANSPORT_MODE_LABELS[language][mode];
}

export function formatTransportModeList(
  modes: TransportMode[],
  language: LanguageCode,
  separator = ', ',
) {
  return modes.map((mode) => formatTransportModeLabel(mode, language)).join(separator);
}
