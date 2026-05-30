// ==========================================
// 全局状态管理 - Zustand Store
// ==========================================

import { create } from "zustand";
import type {
  DialogueLine,
  CharacterType,
  InteractionMode,
  SceneType,
  ChatResponse,
  BondMoment,
  RelationStats,
} from "@/types";

interface AppState {
  // 用户状态
  userId: string | null;
  nickname: string;
  isLoggedIn: boolean;
  setUser: (id: string, nickname: string) => void;
  logout: () => void;

  // 交互模式
  mode: InteractionMode;
  setMode: (mode: InteractionMode) => void;

  // 场景
  scene: SceneType;
  sceneDescription: string;
  mood: string;
  setScene: (scene: SceneType, description?: string, mood?: string) => void;

  // 对话
  dialogues: DialogueLine[];
  addDialogue: (dialogue: DialogueLine) => void;
  appendDialogues: (dialogues: DialogueLine[]) => void;
  clearDialogues: () => void;

  // 内心OS
  innerOS: { tianxiwei?: string; liyitong?: string };
  setInnerOS: (os: { tianxiwei?: string; liyitong?: string }) => void;

  // 弹幕
  danmakus: Array<{ id: string; text: string; author: string }>;
  addDanmaku: (text: string, author?: string) => void;

  // 加载状态
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // 羁绊之书
  bondMoments: BondMoment[];
  addBondMoment: (moment: BondMoment) => void;

  // 关系数值
  stats: RelationStats;
  updateStats: (stats: Partial<RelationStats>) => void;

  // 特效
  isRaining: boolean;
  setRaining: (raining: boolean) => void;

  // 主题
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;

  // 雨声
  rainAudioPlaying: boolean;
  setRainAudioPlaying: (playing: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  userId: null,
  nickname: "小唐",
  isLoggedIn: false,
  setUser: (id, nickname) => set({ userId: id, nickname, isLoggedIn: true }),
  logout: () => set({ userId: null, isLoggedIn: false, nickname: "小唐" }),

  mode: "observe",
  setMode: (mode) => set({ mode }),

  scene: "home",
  sceneDescription: "温馨的小家",
  mood: "温馨",
  setScene: (scene, description, mood) =>
    set({ scene, sceneDescription: description, mood }),

  dialogues: [],
  addDialogue: (dialogue) =>
    set((state) => ({ dialogues: [...state.dialogues, dialogue] })),
  appendDialogues: (dialogues) =>
    set((state) => ({ dialogues: [...state.dialogues, ...dialogues] })),
  clearDialogues: () => set({ dialogues: [] }),

  innerOS: {},
  setInnerOS: (os) => set({ innerOS: os }),

  danmakus: [],
  addDanmaku: (text, author = "小唐") =>
    set((state) => ({
      danmakus: [...state.danmakus, { id: `dm_${Date.now()}`, text, author }],
    })),

  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  bondMoments: [],
  addBondMoment: (moment) =>
    set((state) => ({ bondMoments: [moment, ...state.bondMoments] })),

  stats: { sweetness: 50, jealousy: 0, assistCount: 0, totalInteractions: 0 },
  updateStats: (partial) =>
    set((state) => ({
      stats: { ...state.stats, ...partial },
    })),

  isRaining: false,
  setRaining: (raining) => set({ isRaining: raining }),

  isDarkMode: false,
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.isDarkMode;
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", next);
      }
      return { isDarkMode: next };
    }),
  setDarkMode: (dark) => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", dark);
    }
    set({ isDarkMode: dark });
  },

  rainAudioPlaying: false,
  setRainAudioPlaying: (playing) => set({ rainAudioPlaying: playing }),
}));
