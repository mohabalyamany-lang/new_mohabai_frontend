import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/auth";
import { tokenStorage } from "@/lib/auth";
import { api } from "@/lib/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/login", { username, password });
          tokenStorage.set(data.access_token);
          set({ user: data.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (username, password, email) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/register", {
            username,
            password,
            email,
          });
          tokenStorage.set(data.access_token);
          set({ user: data.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch {
          // best effort
        }
        tokenStorage.clear();
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        const token = tokenStorage.get();
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data, isAuthenticated: true });
        } catch {
          tokenStorage.clear();
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "mohab-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
