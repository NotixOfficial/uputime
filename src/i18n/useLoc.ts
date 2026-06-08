import { useTranslation } from 'react-i18next';
import { transliterate } from './translit';

// Lokalizuje seed sadržaj: u ćirilici transliteruje, inače vraća original.
// Ne koristi za URL-ove i domene (mup.gov.rs ostaje latinica).
export function useLoc(): (s?: string) => string {
  const { i18n } = useTranslation();
  const cyr = i18n.language === 'sr-Cyrl';
  return (s?: string) => (cyr && s ? transliterate(s) : s ?? '');
}
