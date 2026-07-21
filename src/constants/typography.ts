// src/constants/typography.ts

/**
 * KOREADY Typography System
 * Based on Figma Design Token
 */

export const FontFamily = {
  regular: "Pretendard-Regular",
  medium: "Pretendard-Medium",
  semiBold: "Pretendard-SemiBold",
  bold: "Pretendard-Bold",
};

export const Typography = {
  /* =========================
 * Legacy aliases
 * ========================= */

heading: {
  fontSize: 20,
  lineHeight: 28,
  letterSpacing: -0.4,
  fontFamily: FontFamily.semiBold,
},

bodyLarge: {
  fontSize: 16,
  lineHeight: 22,
  letterSpacing: -0.32,
  fontFamily: FontFamily.medium,
},

body: {
  fontSize: 16,
  lineHeight: 22,
  letterSpacing: -0.32,
  fontFamily: FontFamily.regular,
},

caption: {
  fontSize: 14,
  lineHeight: 20,
  letterSpacing: -0.28,
  fontFamily: FontFamily.regular,
},

label: {
  fontSize: 12,
  lineHeight: 17,
  letterSpacing: -0.24,
  fontFamily: FontFamily.medium,
},

tabActive: {
  fontSize: 14,
  lineHeight: 20,
  letterSpacing: -0.28,
  fontFamily: FontFamily.bold,
},

tabInactive: {
  fontSize: 14,
  lineHeight: 20,
  letterSpacing: -0.28,
  fontFamily: FontFamily.medium,
},
  /* =========================
   * 30 Bold
   * ========================= */
  text30Bold: {
    fontSize: 30,
    lineHeight: 42,
    letterSpacing: -0.6,
    fontFamily: FontFamily.bold,
  },

  /* =========================
   * 24 SemiBold
   * ========================= */
  text24SemiBold: {
    fontSize: 24,
    lineHeight: 34,
    letterSpacing: -0.48,
    fontFamily: FontFamily.semiBold,
  },

  /* =========================
   * 20 SemiBold
   * (김천 김밥축제)
   * ========================= */
  text20SemiBold: {
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.4,
    fontFamily: FontFamily.semiBold,
  },

  /* =========================
   * 18 Medium
   * ========================= */
  text18Medium: {
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: -0.36,
    fontFamily: FontFamily.medium,
  },

  /* =========================
   * 16 Medium
   * ========================= */
  text16Medium: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.32,
    fontFamily: FontFamily.medium,
  },

  /* =========================
   * 16 Regular
   * ========================= */
  text16Regular: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.32,
    fontFamily: FontFamily.regular,
  },

  /* =========================
   * 14 Bold
   * Tab Active
   * ========================= */
  text14Bold: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.28,
    fontFamily: FontFamily.bold,
  },

  /* =========================
   * 14 Medium
   * ========================= */
  text14Medium: {
    fontSize: 14,
    lineHeight: 19.6,
    letterSpacing: -0.28,
    fontFamily: FontFamily.medium,
  },

  /* =========================
   * 14 Regular
   * ========================= */
  text14Regular: {
    fontSize: 14,
    lineHeight: 19.6,
    letterSpacing: -0.28,
    fontFamily: FontFamily.regular,
  },

  /* =========================
   * 12 Medium
   * Tag
   * ========================= */
  text12Medium: {
    fontSize: 12,
    lineHeight: 16.8,
    letterSpacing: -0.24,
    fontFamily: FontFamily.medium,
  },

  /* =========================
   * 12 Regular
   * ========================= */
  text12Regular: {
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: -0.24,
    fontFamily: FontFamily.regular,
  },

  text16Bold: {
  fontSize: 16,
  lineHeight: 22.4,
  letterSpacing: -0.32,
  fontFamily: FontFamily.bold,
},
};


export default Typography;

