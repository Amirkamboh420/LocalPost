"use client";

import { create } from "zustand";
import type {
  User,
  Account,
  Post,
  AppNotification,
  ViewKey,
} from "@/lib/types";

interface AppState {
  // auth
  user: User | null;
  authLoading: boolean;
  setAuthLoading: (v: boolean) => void;
  setUser: (u: User | null) => void;

  // navigation
  view: ViewKey;
  setView: (v: ViewKey) => void;

  // composer
  composerOpen: boolean;
  editingPostId: string | null;
  openComposer: (postId?: string) => void;
  closeComposer: () => void;

  // post detail
  detailPostId: string | null;
  openDetail: (id: string) => void;
  closeDetail: () => void;

  // command palette + shortcuts
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (v: boolean) => void;
  shortcutsOpen: boolean;
  setShortcutsOpen: (v: boolean) => void;

  // landing auth modal
  authModal: "login" | "signup" | "forgot" | null;
  setAuthModal: (m: "login" | "signup" | "forgot" | null) => void;

  // mobile sidebar
  mobileNavOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;

  // data cache
  posts: Post[];
  accounts: Account[];
  notifications: AppNotification[];
  setPosts: (p: Post[]) => void;
  setAccounts: (a: Account[]) => void;
  setNotifications: (n: AppNotification[]) => void;
  upsertPost: (p: Post) => void;
  removePost: (id: string) => void;
  markNotificationsRead: () => void;
}

export const useApp = create<AppState>((set) => ({
  user: null,
  authLoading: true,
  setAuthLoading: (v) => set({ authLoading: v }),
  setUser: (u) => set({ user: u }),

  view: "dashboard",
  setView: (v) => set({ view: v }),

  composerOpen: false,
  editingPostId: null,
  openComposer: (postId) =>
    set({ composerOpen: true, editingPostId: postId ?? null }),
  closeComposer: () => set({ composerOpen: false, editingPostId: null }),

  detailPostId: null,
  openDetail: (id) => set({ detailPostId: id }),
  closeDetail: () => set({ detailPostId: null }),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
  shortcutsOpen: false,
  setShortcutsOpen: (v) => set({ shortcutsOpen: v }),

  authModal: null,
  setAuthModal: (m) => set({ authModal: m }),

  mobileNavOpen: false,
  setMobileNavOpen: (v) => set({ mobileNavOpen: v }),

  posts: [],
  accounts: [],
  notifications: [],
  setPosts: (p) => set({ posts: p }),
  setAccounts: (a) => set({ accounts: a }),
  setNotifications: (n) => set({ notifications: n }),
  upsertPost: (p) =>
    set((s) => {
      const idx = s.posts.findIndex((x) => x.id === p.id);
      if (idx >= 0) {
        const next = [...s.posts];
        next[idx] = p;
        return { posts: next };
      }
      return { posts: [p, ...s.posts] };
    }),
  removePost: (id) =>
    set((s) => ({ posts: s.posts.filter((p) => p.id !== id) })),
  markNotificationsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),
}));
