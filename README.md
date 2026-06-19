# Uputi Me - mobilna aplikacija

AI asistent za administrativne postupke lokalnih zajednica (grad Novi Sad).
Interakcija čovek-računar, FTN 2025/2026, **Tim 9**.

React Native (bare CLI) implementacija na osnovu specifikacije (`TIM_9.pdf`),
HCI materijala i lo-fi prototipa (`low-fidelity-ui-prototype/`).

---

## Šta aplikacija radi

Korisnik prirodnim jezikom pita o administrativnom postupku i dobija konkretne
izlaze: listu potrebnih dokumenata, mapu nadležne institucije i vođenje korak po
korak. Sve osnovne funkcije rade bez registracije i offline.

Organizacija je "hub-and-spoke" (DTI), pet tabova sa cross-tokovima:

| Tab | Funkcija |
|-----|----------|
| Pitaj | AI chat (predlozi, postupci u toku, razgovor sa strukturiranim odgovorom) |
| Dokumenti | Personalizovane čekliste i vođenje korak po korak |
| Mapa | Institucije NS, filter, radno vreme, navigacija/poziv |
| Rokovi | Podsetnici za istek dokumenata i lokalne notifikacije |
| Profil | Opciona prijava, istorija, jezik, privatnost |

## Pokrivenost funkcionalnih zahteva

| FZ | Urađeno | Gde |
|----|---------|-----|
| FZ-01 AI chat + izvor/datum | Da (mock AI*) | `screens/ask`, `services/ai.ts` |
| FZ-02 Lista dokumenata (status, rok) | Da | `screens/documents`, `store/useProgressStore` |
| FZ-03 Mapa institucija (filter) | Da | `screens/map`, `data/institutions.ts` |
| FZ-04 Korak-po-korak vođenje | Da | `ProcedureStepsScreen` |
| FZ-05 Podsetnici (30/7/1 dan) | Da | `screens/reminders`, `services/notifications.ts` |
| FZ-06 Anonimno korišćenje | Da | sve funkcije rade bez naloga |
| FZ-07 Eksterni deep-link (Maps/poziv) | Da | `services/deeplink.ts` |
| FZ-08 Istorija razgovora/postupaka | Da | `HistoryScreen` (za prijavljene) |
| FZ-09 Višejezičnost (sr-ćir/lat, en) | Da | `i18n/` (auto-transliteracija ćirilice) |
| FZ-10 Privatnost (lokalno + Keychain) | Da | `store/storage.ts` (osetljivo se čuva u Keychain) |

\* **Mock AI:** `services/ai.ts` vraća strukturiran odgovor (tekst + dokumenti +
institucija + koraci + izvor) istog oblika kao budući backend nad Claude API.
Zamena je lokalizovana na jednu funkciju (`askAI`), UI ostaje isti.

## Arhitektura

```
src/
  theme/        dizajn tokeni (boje, tipografija, spacing)
  i18n/         sr-Latn (izvor), auto-translit u sr-Cyrl, en
  data/         tipovi i seed (6 postupaka, institucije NS)
  store/        Zustand + persist (AsyncStorage), Keychain za osetljivo
  services/     ai (mock), notifications (notifee), deeplink (maps/poziv)
  components/   dizajn sistem (Text, Button, Card, ListRow, CheckRow, ...)
  navigation/   pet stack-ova, bottom tabs, cross-tokovi
  screens/      ask / documents / map / reminders / profile
```

Tehnologije: React Native 0.86, React Navigation 7 (tabs + native-stack),
Zustand, AsyncStorage, react-native-keychain, react-native-maps, @notifee,
i18next, react-native-svg, dayjs.

## Pokretanje

Preduslovi: Node 22+, Xcode (iOS), Android Studio + SDK (Android), CocoaPods.

```bash
cd UputiMe
npm install

# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

### Google Maps (Android)
Mapa na iOS-u koristi Apple Maps (bez ključa). Za Android dodaj ključ u
`android/gradle.properties`:
```
MAPS_API_KEY=tvoj_kljuc
```
(Maps SDK for Android: https://console.cloud.google.com)

## Napomena o podacima
Seed postupci, institucije, adrese i takse su ilustrativni i nisu provereni kod
nadležnih institucija.

## Sledeći koraci
- Zameniti mock `askAI` pozivom ka backendu (Claude API + RAG nad bazom NS postupaka).
- Pravi auth/sync backend (trenutno mock, lokalno).
- Proširiti pokrivenost postupaka i validirati sekundarne persone.
