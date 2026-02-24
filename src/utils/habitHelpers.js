import dayjs from 'dayjs';

export function getHabitProgress(habit, habitProgress) {
  if (!habit || !habitProgress) return 0;
  const steps = habitProgress.usedAltMode ? habit.altSteps : habit.steps;
  if (!steps?.length) return 0;
  return Math.round((habitProgress.completedSteps.length / steps.length) * 100);
}

export function groupHabitsBySchedule(habits) {
  return {
    morning: habits.filter((h) => h.schedule === 'morning'),
    afternoon: habits.filter((h) => h.schedule === 'afternoon'),
    evening: habits.filter((h) => h.schedule === 'evening'),
    anytime: habits.filter((h) => h.schedule === null),
  };
}

export function getCurrentTimeBlock() {
  const hour = dayjs().hour();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function countCompletedHabits(habits, todayProgress) {
  return habits.filter(
    (h) => todayProgress?.completedHabits?.[h.id]?.completedAt
  ).length;
}

export function habitIsStarted(habitId, todayProgress) {
  return (todayProgress?.completedHabits?.[habitId]?.completedSteps?.length ?? 0) > 0;
}
