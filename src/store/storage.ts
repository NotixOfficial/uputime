import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/**
 * Persistencija stanja (offline-first, NFR dostupnost).
 * Ne-osetljivi podaci (postupci, napredak, podsetnici bez brojeva) -> AsyncStorage.
 * Osetljivi podaci (brojevi dokumenata) -> Keychain (FZ-10).
 */

export const zustandStorage = createJSONStorage(() => AsyncStorage);

/* ─────────────── Keychain za osetljive podatke (FZ-10) ─────────────── */

const SENSITIVE_SERVICE = 'me.uputi.sensitive';

type SensitiveMap = Record<string, string>;

async function readSensitiveMap(): Promise<SensitiveMap> {
  try {
    const Keychain = require('react-native-keychain');
    const creds = await Keychain.getGenericPassword({ service: SENSITIVE_SERVICE });
    if (creds && creds.password) {
      return JSON.parse(creds.password) as SensitiveMap;
    }
  } catch {
    // Keychain nedostupan (npr. modul nije linkovan) , degradiramo gracefully.
  }
  return {};
}

async function writeSensitiveMap(map: SensitiveMap): Promise<void> {
  try {
    const Keychain = require('react-native-keychain');
    await Keychain.setGenericPassword('uputime', JSON.stringify(map), {
      service: SENSITIVE_SERVICE,
    });
  } catch {
    // ignore
  }
}

export const SecureStore = {
  async set(key: string, value: string): Promise<void> {
    const map = await readSensitiveMap();
    map[key] = value;
    await writeSensitiveMap(map);
  },
  async get(key: string): Promise<string | undefined> {
    const map = await readSensitiveMap();
    return map[key];
  },
  async remove(key: string): Promise<void> {
    const map = await readSensitiveMap();
    delete map[key];
    await writeSensitiveMap(map);
  },
  async clear(): Promise<void> {
    await writeSensitiveMap({});
  },
};

export async function clearAllLocalData(): Promise<void> {
  await AsyncStorage.clear();
  await SecureStore.clear();
}
