import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserInfo {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_superuser: boolean;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
  permissions: string[];
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: UserInfo, permissions: string[]) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  can: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      permissions: [],

      setTokens: (access: string, refresh: string) => {
        set({ accessToken: access, refreshToken: refresh });
      },

      setUser: (user: UserInfo, permissions: string[]) => {
        set({ user, permissions });
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          permissions: [],
        });
      },

      isAuthenticated: () => {
        const state = get();
        return !!state.accessToken && !!state.user;
      },

      can: (permission: string) => {
        const state = get();
        if (state.user?.is_superuser) return true;
        return state.permissions.includes(permission);
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
