import { Linking, Platform } from 'react-native';

/**
 * Eksterni navigacioni deep-linkovi (FZ-07).
 * Otvara native mapu (Apple Maps na iOS, Google Maps na Android) i pokreće rutu,
 * ili poziva instituciju.
 */

export async function openDirections(
  latitude: number,
  longitude: number,
  label?: string,
): Promise<void> {
  const enc = encodeURIComponent(label ?? '');
  const url = Platform.select({
    ios: `maps://?daddr=${latitude},${longitude}&q=${enc}`,
    android: `google.navigation:q=${latitude},${longitude}`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
  })!;

  const fallback = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  try {
    const supported = await Linking.canOpenURL(url);
    await Linking.openURL(supported ? url : fallback);
  } catch {
    Linking.openURL(fallback).catch(() => {});
  }
}

export function callPhone(phone: string): void {
  const url = `tel:${phone.replace(/\s+/g, '')}`;
  Linking.openURL(url).catch(() => {});
}

export function openWebsite(url: string): void {
  const full = url.startsWith('http') ? url : `https://${url}`;
  Linking.openURL(full).catch(() => {});
}
