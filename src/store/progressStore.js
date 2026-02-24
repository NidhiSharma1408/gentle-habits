import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import dayjs from 'dayjs';
import { STORAGE_KEYS } from '../constants';

const todayKey = () => dayjs().format('YYYY-MM-DD');

const emptyDayProgress = () => ({
  date: todayKey(),
  completedHabits: {},
  energyLevel: null,
  restedToday: false,
});

const pruneOldData = (progress) => {
  const cutoff = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
  return Object.fromEntries(Object.entries(progress).filter(([date]) => date >= cutoff));
};

export const useProgressStore = create(
  persist(
    (set, get) => ({
      progress: {},

      getToday: () => {
        const key = todayKey();
        return get().progress[key] ?? emptyDayProgress();
      },

      ensureToday: () => {
        const key = todayKey();
        if (!get().progress[key]) {
          set((state) => ({
            progress: { ...state.progress, [key]: emptyDayProgress() },
          }));
        }
      },

      checkStep: (habitId, stepId) => {
        const key = todayKey();
        set((state) => {
          const today = state.progress[key] ?? emptyDayProgress();
          const habit = today.completedHabits[habitId] ?? {
            completedSteps: [],
            usedAltMode: false,
            completedAt: null,
          };
          const completedSteps = habit.completedSteps.includes(stepId)
            ? habit.completedSteps
            : [...habit.completedSteps, stepId];
          return {
            progress: {
              ...state.progress,
              [key]: {
                ...today,
                completedHabits: {
                  ...today.completedHabits,
                  [habitId]: { ...habit, completedSteps },
                },
              },
            },
          };
        });
      },

      uncheckStep: (habitId, stepId) => {
        const key = todayKey();
        set((state) => {
          const today = state.progress[key] ?? emptyDayProgress();
          const habit = today.completedHabits[habitId];
          if (!habit) return state;
          return {
            progress: {
              ...state.progress,
              [key]: {
                ...today,
                completedHabits: {
                  ...today.completedHabits,
                  [habitId]: {
                    ...habit,
                    completedSteps: habit.completedSteps.filter((id) => id !== stepId),
                    completedAt: null,
                  },
                },
              },
            },
          };
        });
      },

      setAltMode: (habitId, usedAltMode) => {
        const key = todayKey();
        set((state) => {
          const today = state.progress[key] ?? emptyDayProgress();
          const habit = today.completedHabits[habitId] ?? {
            completedSteps: [],
            usedAltMode: false,
            completedAt: null,
          };
          return {
            progress: {
              ...state.progress,
              [key]: {
                ...today,
                completedHabits: {
                  ...today.completedHabits,
                  [habitId]: { ...habit, usedAltMode, completedSteps: [] },
                },
              },
            },
          };
        });
      },

      markHabitComplete: (habitId) => {
        const key = todayKey();
        set((state) => {
          const today = state.progress[key] ?? emptyDayProgress();
          const habit = today.completedHabits[habitId] ?? {
            completedSteps: [],
            usedAltMode: false,
            completedAt: null,
          };
          return {
            progress: {
              ...state.progress,
              [key]: {
                ...today,
                completedHabits: {
                  ...today.completedHabits,
                  [habitId]: { ...habit, completedAt: new Date().toISOString() },
                },
              },
            },
          };
        });
      },

      logRest: () => {
        const key = todayKey();
        set((state) => ({
          progress: {
            ...state.progress,
            [key]: { ...(state.progress[key] ?? emptyDayProgress()), restedToday: true },
          },
        }));
      },

      resetDay: () => {
        const key = todayKey();
        set((state) => ({
          progress: { ...state.progress, [key]: emptyDayProgress() },
        }));
      },

      pruneProgress: () =>
        set((state) => ({ progress: pruneOldData(state.progress) })),
    }),
    { name: STORAGE_KEYS.PROGRESS }
  )
);
