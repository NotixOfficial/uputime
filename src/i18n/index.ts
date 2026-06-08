import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { sr } from './locales/sr';
import { en } from './locales/en';
import { transliterateResource } from './translit';

export type AppLanguage = 'sr-Latn' | 'sr-Cyrl' | 'en';

export const LANGUAGES: { code: AppLanguage; labelKey: string }[] = [
  { code: 'sr-Latn', labelKey: 'language.srLatn' },
  { code: 'sr-Cyrl', labelKey: 'language.srCyrl' },
  { code: 'en', labelKey: 'language.en' },
];

/** Ćirilični resurs se generiše iz latiničnog izvora (vidi translit.ts). */
const srCyrl = transliterateResource(sr);
// Nazivi jezika se prikazuju u sopstvenom pismu (ne transliterujemo ih).
srCyrl.language.srLatn = sr.language.srLatn; // "Srpski (latinica)"
srCyrl.language.en = sr.language.en; // "English"
// Pozajmljenica "Email" ima ustaljen ćirilični oblik.
srCyrl.auth.email = 'Имејл';

const resources = {
  'sr-Latn': { translation: sr },
  'sr-Cyrl': { translation: srCyrl },
  en: { translation: en },
};

/** Pokušaj detekcije jezika uređaja; fallback na srpski (latinica). */
function detectInitialLanguage(): AppLanguage {
  try {
    // Lazy require da init ne padne ako native modul još nije linkovan.
    const RNLocalize = require('react-native-localize');
    const locales = RNLocalize.getLocales?.() ?? [];
    const code: string = locales[0]?.languageCode ?? 'sr';
    const script: string | undefined = locales[0]?.scriptCode;
    if (code === 'sr') {
      return script === 'Cyrl' ? 'sr-Cyrl' : 'sr-Latn';
    }
    if (code === 'en') return 'en';
  } catch {
    // ignore, koristi default
  }
  return 'sr-Latn';
}

i18n.use(initReactI18next).init({
  resources,
  lng: detectInitialLanguage(),
  fallbackLng: 'sr-Latn',
  interpolation: { escapeValue: false },
  returnNull: false,
  compatibilityJSON: 'v4',
});

export default i18n;
