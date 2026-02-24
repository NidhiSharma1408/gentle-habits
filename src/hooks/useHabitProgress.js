import { useProgressStore } from '../store/progressStore';
import { useHabitsStore } from '../store/habitsStore';

export function useHabitProgress(habitId) {
  const habit = useHabitsStore((s) => s.getHabit(habitId));
  const today = useProgressStore((s) => s.getToday());
  const checkStep = useProgressStore((s) => s.checkStep);
  const uncheckStep = useProgressStore((s) => s.uncheckStep);
  const setAltModeAction = useProgressStore((s) => s.setAltMode);
  const markHabitComplete = useProgressStore((s) => s.markHabitComplete);

  const habitProgress = today.completedHabits[habitId] ?? {
    completedSteps: [],
    usedAltMode: false,
    completedAt: null,
  };

  const activeSteps = habitProgress.usedAltMode ? habit?.altSteps : habit?.steps;
  const completedCount = habitProgress.completedSteps.length;
  const totalCount = activeSteps?.length ?? 0;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isComplete = habitProgress.completedAt !== null;

  const toggleStep = (stepId) => {
    if (habitProgress.completedSteps.includes(stepId)) {
      uncheckStep(habitId, stepId);
    } else {
      checkStep(habitId, stepId);
      if (completedCount + 1 === totalCount) {
        markHabitComplete(habitId);
      }
    }
  };

  const setAltMode = (val) => setAltModeAction(habitId, val);

  return {
    habit,
    habitProgress,
    activeSteps,
    completedCount,
    totalCount,
    percentage,
    isComplete,
    toggleStep,
    setAltMode,
  };
}
