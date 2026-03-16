import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import dayjs from 'dayjs';
import { STORAGE_KEYS } from '../constants';

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      energyLevel: null,
      lastEnergyCheckIn: null,
      aiProvider: 'claude', // 'claude' | 'gemini'
      claudeApiKey: '',
      geminiApiKey: '',

      setTheme: (theme) => set({ theme }),

      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      setEnergyLevel: (energyLevel) =>
        set({ energyLevel, lastEnergyCheckIn: dayjs().format('YYYY-MM-DD') }),

      setAiProvider: (aiProvider) => set({ aiProvider }),
      setClaudeApiKey: (claudeApiKey) => set({ claudeApiKey }),
      setGeminiApiKey: (geminiApiKey) => set({ geminiApiKey }),

      getActiveApiKey: () => {
        const { aiProvider, claudeApiKey, geminiApiKey } = get();
        return aiProvider === 'gemini' ? geminiApiKey : claudeApiKey;
      },

      needsEnergyCheckIn: () => {
        const { lastEnergyCheckIn } = get();
        return lastEnergyCheckIn !== dayjs().format('YYYY-MM-DD');
      },
    }),
    { name: STORAGE_KEYS.SETTINGS }
  )
);
