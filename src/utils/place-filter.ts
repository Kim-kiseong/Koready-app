import type { TravelStyleId } from '@/api/onboarding';

export type PlaceDateFilterPreset = 'ALL' | 'THIS_WEEK' | 'THIS_MONTH' | 'NEXT_MONTH';

export type PlaceDateQuery = {
  dateFrom?: string;
  dateTo?: string;
};

export type PlaceDateRange = {
  startDate: string | null;
  endDate: string | null;
};

export type PlaceFilterSelection = {
  travelStyles: TravelStyleId[];
  datePreset: PlaceDateFilterPreset;
  dateRange: PlaceDateRange;
};

export const DEFAULT_PLACE_FILTER_SELECTION: PlaceFilterSelection = {
  travelStyles: [],
  datePreset: 'ALL',
  dateRange: {
    startDate: null,
    endDate: null,
  },
};

export function formatPlaceFilterDateButtonLabel(selection: PlaceFilterSelection) {
  if (selection.dateRange.startDate && selection.dateRange.endDate) {
    return formatPlaceDateRangeLabel(selection.dateRange.startDate, selection.dateRange.endDate);
  }

  return '날짜 선택';
}

export function formatPlaceDateRangeLabel(startDate: string, endDate: string) {
  if (startDate === endDate) {
    return formatPlaceDateLabel(startDate);
  }

  return `${formatPlaceDateLabel(startDate)} ~ ${formatPlaceDateLabel(endDate)}`;
}

export function formatPlaceDateLabel(value: string) {
  const [year, month, day] = value.split('-').map((part) => Number(part));
  return `${year}.${padNumber(month)}.${padNumber(day)}`;
}

export function resolvePlaceDateQuery(selection: PlaceFilterSelection): PlaceDateQuery {
  if (selection.dateRange.startDate && selection.dateRange.endDate) {
    return {
      dateFrom: selection.dateRange.startDate,
      dateTo: selection.dateRange.endDate,
    };
  }

  if (selection.datePreset === 'ALL') {
    return {};
  }

  return resolvePresetDateRange(selection.datePreset, new Date());
}

function resolvePresetDateRange(preset: Exclude<PlaceDateFilterPreset, 'ALL'>, referenceDate: Date) {
  switch (preset) {
    case 'THIS_WEEK':
      return getWeekRange(referenceDate);
    case 'THIS_MONTH':
      return getMonthRange(referenceDate, 0);
    case 'NEXT_MONTH':
      return getMonthRange(referenceDate, 1);
  }
}

function getWeekRange(referenceDate: Date) {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    dateFrom: toDateKey(start),
    dateTo: toDateKey(end),
  };
}

function getMonthRange(referenceDate: Date, monthOffset: number) {
  const monthDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + monthOffset, 1);
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

  return {
    dateFrom: toDateKey(start),
    dateTo: toDateKey(end),
  };
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

function padNumber(value: number) {
  return String(value).padStart(2, '0');
}
