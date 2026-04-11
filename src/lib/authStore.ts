import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/auth";
import { tokenStorage } from "@/lib/auth";
import { api } from "@/lib/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      login: async (usernameOrEmail, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post("/auth/login", {
            username_or_email: usernameOrEmail,
            password,
          });
          tokenStorage.set(data.access_token);
          set({
            user: {
              id: data.user_id,
              username: data.username,
              email: null,
              public_id: "",
            },
            isAuthenticated: true,
          });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { detail?: string } } })
              ?.response?.data?.detail ?? "Login failed";
          set({ error: message });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (username, password, email) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post("/auth/register", {
            username,
            password,
            ...(email ? { email } : {}),
          });
          tokenStorage.set(data.access_token);
          set({
            user: {
              id: data.user_id,
              username: data.username,
              email: email ?? null,
              public_id: "",
            },
            isAuthenticated: true,
          });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { detail?: string } } })
              ?.response?.data?.detail ?? "Registration failed";
          set({ error: message });
          throw err;
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
        set({ user: null, isAuthenticated: false, error: null });
      },

      checkAuth: async () => {
        const token = tokenStorage.get();
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }
        try {
          const { data } = await api.get("/auth/me");
          set({
            user: {
              id: data.user_id,
              username: data.username,
              email: data.email ?? null,
              public_id: data.public_id,
            },
            isAuthenticated: true,
          });
        } catch {
          tokenStorage.clear();
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "mohab-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
