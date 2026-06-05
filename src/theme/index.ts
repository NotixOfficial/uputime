export * from './tokens';

import { colors } from './tokens';

/**
 * Jedinstvena tema. Aplikacija je trenutno light-only (kao prototip);
 * struktura je spremna za dark temu u kasnijoj iteraciji.
 */
export const theme = {
  colors,
  dark: false,
} as const;

export type AppTheme = typeof theme;
