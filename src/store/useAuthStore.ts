import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from './storage';
import { nowISO } from '../utils/date';

// Mock auth. Registracija je opciona, ne blokira app. Kasnije ide na backend.

export interface AuthUser {
  name: string;
  email: string;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;

  signIn: (email: string, _password: string) => Promise<void>;
  register: (name: string, email: string, _password: string) => Promise<void>;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      isAuthenticated: false,

      signIn: async (email, _password) => {
        const name = email.split('@')[0] || 'Korisnik';
        set({ user: { name, email, createdAt: nowISO() }, isAuthenticated: true });
      },

      register: async (name, email, _password) => {
        set({ user: { name, email, createdAt: nowISO() }, isAuthenticated: true });
      },

      signOut: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'uputime.auth',
      storage: zustandStorage,
      partialize: state => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
