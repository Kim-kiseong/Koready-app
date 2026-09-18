export const FontFamily = {
  pretendard: {
    thin: 'Pretendard-Thin',
    light: 'Pretendard-Light',
    regular: 'Pretendard-Regular',
    medium: 'Pretendard-Medium',
    semiBold: 'Pretendard-SemiBold',
    bold: 'Pretendard-Bold',
    black: 'Pretendard-Black',
  },
  montserrat: {
    extraBold: 'Montserrat-ExtraBold',
  },
  inter: {
    medium: 'Inter-Medium',
  },
} as const;

export const WEB_PRETENDARD_FAMILY = 'KoreadyPretendard';

export const PRETENDARD_WEIGHTS: Record<string, '100' | '300' | '400' | '500' | '600' | '700' | '900'> = {
  [FontFamily.pretendard.thin]: '100',
  [FontFamily.pretendard.light]: '300',
  [FontFamily.pretendard.regular]: '400',
  [FontFamily.pretendard.medium]: '500',
  [FontFamily.pretendard.semiBold]: '600',
  [FontFamily.pretendard.bold]: '700',
  [FontFamily.pretendard.black]: '900',
};
