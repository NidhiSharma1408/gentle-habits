import { getCurrentTimeBlock } from './habitHelpers';

const MICRO_ACTIONS = {
  survival: [
    'Drink a glass of water.',
    'Take 3 slow, deep breaths.',
    'Sit up or change your position.',
    'Look out a window for 30 seconds.',
    'Put your hand on your chest and feel your heartbeat.',
  ],
  low: [
    'Walk 100 steps — inside is fine.',
    'Open a window and let in some air.',
    'Eat something small, even a cracker.',
    'Text one person just to say hi.',
    'Stretch your arms above your head.',
  ],
  full: [
    'Do one habit you have been putting off.',
    'Write down one thing on your mind.',
    'Do 5 minutes of something you enjoy.',
    'Tidy one small corner of your space.',
  ],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getSuggestion({ habits, today, energyLevel, currentBlock }) {
  if (energyLevel === 'survival') {
    return { type: 'micro', text: pickRandom(MICRO_ACTIONS.survival) };
  }

  const isIncomplete = (habit) => {
    const progress = today?.completedHabits?.[habit.id];
    return !progress?.completedAt;
  };

  const getFirstIncompleteStep = (habit) => {
    const progress = today?.completedHabits?.[habit.id];
    const steps = progress?.usedAltMode ? habit.altSteps : habit.steps;
    const completedIds = progress?.completedSteps ?? [];
    return steps?.find((s) => !completedIds.includes(s.id));
  };

  const scheduledNow = habits.filter(
    (h) => h.schedule === currentBlock && isIncomplete(h)
  );

  if (scheduledNow.length > 0) {
    const habit = scheduledNow[0];
    const stepItem = getFirstIncompleteStep(habit);
    return {
      type: 'habit',
      text: stepItem ? stepItem.text : `Start "${habit.name}"`,
      habit,
      stepText: stepItem?.text,
    };
  }

  const anyIncomplete = habits.filter(isIncomplete);

  if (anyIncomplete.length > 0) {
    const habit = pickRandom(anyIncomplete);
    const stepItem = getFirstIncompleteStep(habit);
    return {
      type: 'habit',
      text: stepItem ? stepItem.text : `Try "${habit.name}"`,
      habit,
      stepText: stepItem?.text,
    };
  }

  return {
    type: 'done',
    text: 'You have done everything for today. Rest is also productive.',
  };
}
