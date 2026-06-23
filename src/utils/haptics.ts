import { Vibration, Platform } from 'react-native';

/**
 * Suptilan taktilni feedback. Bez dodatne biblioteke koristimo ugrađeni Vibration API.
 * iOS na Vibration ignoriše trajanje i okida jak motor, pa tamo radije ćutimo —
 * (može se kasnije zameniti pravom haptics bibliotekom). Android dobija kratak puls.
 */
function buzz(pattern: number | number[]) {
  if (Platform.OS === 'android') {
    Vibration.vibrate(pattern);
  }
}

export const haptics = {
  /** Lagani tap — potvrda akcije. */
  light: () => buzz(10),
  /** Uspeh — kratak dvostruki puls. */
  success: () => buzz([0, 12, 60, 12]),
  /** Greška — duži, izraženiji puls. */
  error: () => buzz([0, 24, 40, 24]),
};
