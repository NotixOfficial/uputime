// Dizajn tokeni. oklch vrednosti iz prototipa pretvorene u hex (RN ne podržava oklch).
// Primarna: institucionalna navy #0b3b66. Topli akcenat samo za status/upozorenje.

export const colors = {
  // Površine i pozadina
  bg: '#f5f7f9',
  surface: '#ffffff',
  surface2: '#eef1f4',

  // Tekst
  ink: '#151b21',
  ink2: '#373e45',
  muted: '#6c7278',
  muted2: '#9fa5ac',

  // Linije
  border: '#dde2e6',
  borderStrong: '#c4cbd2',

  // Primarna (navy)
  primary: '#0b3b66',
  primaryInk: '#0a2f52',
  primarySoft: '#e3edf6',
  primarySoft2: '#c7d9ea',

  // Akcenat (samo status/upozorenje, ne kao brend-tint)
  accent: '#c26a12',
  accentInk: '#8a5200', // za tekst (>=4.5:1 na warnSoft)
  accentSoft: '#fbe9d2',

  // Status
  success: '#3d9461',
  successInk: '#2f7a4e',
  successSoft: '#daf7e3',
  danger: '#d24c49',
  dangerInk: '#b0322f',
  dangerSoft: '#ffe2de',
  warn: '#c26a12',
  warnSoft: '#fbe9d2',

  // Neutralno
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(21,27,33,0.45)',
} as const;

export type ColorToken = keyof typeof colors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 14,
  pill: 999,
} as const;

export const fontSize = {
  micro: 11,
  eyebrow: 12,
  caption: 13,
  body: 15,
  bodyLg: 16,
  subtitle: 17,
  title: 20,
  h1: 24,
  display: 27,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.55,
} as const;

// Senke: default kartice su ravne (border). Suptilna senka samo za plutajuće elemente.
export const shadow = {
  floating: {
    shadowColor: '#0b2530',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
} as const;

// Minimalna ciljna veličina dodira (WCAG 2.1 AA / Apple HIG: 44pt).
export const HIT_TARGET = 44;
