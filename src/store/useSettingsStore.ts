import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from './storage';
import i18n, { AppLanguage } from '../i18n';

interface SettingsState {
  language: AppLanguage;
  onboardingCompleted: boolean;
  notificationsEnabled: boolean;
  /** Eksplicitna saglasnost za sinhronizaciju ka serveru (FZ-10). */
  syncConsent: boolean;
  hydrated: boolean;

  setLanguage: (lang: AppLanguage) => void;
  completeOnboarding: () => void;
  setNotificationsEnabled: (v: boolean) => void;
  setSyncConsent: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      language: (i18n.language as AppLanguage) ?? 'sr-Latn',
      onboardingCompleted: false,
      notificationsEnabled: false,
      syncConsent: false,
      hydrated: false,

      setLanguage: lang => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },
      completeOnboarding: () => set({ onboardingCompleted: true }),
      setNotificationsEnabled: v => set({ notificationsEnabled: v }),
      setSyncConsent: v => set({ syncConsent: v }),
    }),
    {
      name: 'uputime.settings',
      storage: zustandStorage,
      partialize: state => ({
        language: state.language,
        onboardingCompleted: state.onboardingCompleted,
        notificationsEnabled: state.notificationsEnabled,
        syncConsent: state.syncConsent,
      }),
      onRehydrateStorage: () => state => {
        if (state?.language) {
          i18n.changeLanguage(state.language);
        }
        useSettingsStore.setState({ hydrated: true });
      },
    },
  ),
);
