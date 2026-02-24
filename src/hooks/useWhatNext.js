import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useHabitsStore } from '../store/habitsStore';
import { useProgressStore } from '../store/progressStore';
import { useSettingsStore } from '../store/settingsStore';
import { getSuggestion } from '../utils/suggestions';

export function useWhatNext() {
  const habits = useHabitsStore((s) => s.habits);
  const today = useProgressStore((s) => s.getToday());
  const energyLevel = useSettingsStore((s) => s.energyLevel);

  const suggestion = useMemo(() => {
    const hour = dayjs().hour();
    const currentBlock = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    return getSuggestion({ habits, today, energyLevel, currentBlock });
  }, [habits, today, energyLevel]);

  return suggestion;
}
