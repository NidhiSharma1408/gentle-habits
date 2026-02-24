import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { prebuiltHabits } from '../data/prebuiltHabits';
import { STORAGE_KEYS } from '../constants';

export const useHabitsStore = create(
  persist(
    (set, get) => ({
      habits: prebuiltHabits,

      addHabit: (habitData) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              ...habitData,
              id: crypto.randomUUID(),
              isCustom: true,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      editHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        })),

      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        })),

      addStep: (habitId, stepText, isAlt = false) =>
        set((state) => {
          const key = isAlt ? 'altSteps' : 'steps';
          return {
            habits: state.habits.map((h) => {
              if (h.id !== habitId) return h;
              const steps = h[key];
              return {
                ...h,
                [key]: [...steps, { id: crypto.randomUUID(), text: stepText, order: steps.length }],
              };
            }),
          };
        }),

      editStep: (habitId, stepId, text, isAlt = false) =>
        set((state) => {
          const key = isAlt ? 'altSteps' : 'steps';
          return {
            habits: state.habits.map((h) => {
              if (h.id !== habitId) return h;
              return {
                ...h,
                [key]: h[key].map((s) => (s.id === stepId ? { ...s, text } : s)),
              };
            }),
          };
        }),

      deleteStep: (habitId, stepId, isAlt = false) =>
        set((state) => {
          const key = isAlt ? 'altSteps' : 'steps';
          return {
            habits: state.habits.map((h) => {
              if (h.id !== habitId) return h;
              return {
                ...h,
                [key]: h[key]
                  .filter((s) => s.id !== stepId)
                  .map((s, i) => ({ ...s, order: i })),
              };
            }),
          };
        }),

      reorderSteps: (habitId, newOrder, isAlt = false) =>
        set((state) => {
          const key = isAlt ? 'altSteps' : 'steps';
          return {
            habits: state.habits.map((h) => {
              if (h.id !== habitId) return h;
              return {
                ...h,
                [key]: newOrder.map((s, i) => ({ ...s, order: i })),
              };
            }),
          };
        }),

      getHabit: (id) => get().habits.find((h) => h.id === id),
    }),
    { name: STORAGE_KEYS.HABITS }
  )
);
