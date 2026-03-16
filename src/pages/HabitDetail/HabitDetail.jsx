import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit2, Sparkles } from 'lucide-react';
import { useHabitProgress } from '../../hooks/useHabitProgress';
import { useHabitsStore } from '../../store/habitsStore';
import { useSettingsStore } from '../../store/settingsStore';
import { updateSteps } from '../../services/claudeApi';
import HabitStepList from '../../components/habits/HabitStepList/HabitStepList';
import ProgressBar from '../../components/ui/ProgressBar/ProgressBar';
import Toggle from '../../components/ui/Toggle/Toggle';
import Button from '../../components/ui/Button/Button';
import AIPromptModal from '../../components/habits/AIPromptModal/AIPromptModal';
import styles from './HabitDetail.module.css';

const AFFIRMATIONS = [
  'You did it. Every step matters.',
  'Done. That took real effort — well done.',
  'Habit complete. Be proud of yourself.',
  'You showed up for yourself today.',
  'One more win. You are doing great.',
];

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export default function HabitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const energyLevel = useSettingsStore((s) => s.energyLevel);
  const claudeApiKey = useSettingsStore((s) => s.claudeApiKey);
  const editHabit = useHabitsStore((s) => s.editHabit);
  const [showAIModal, setShowAIModal] = useState(false);

  const {
    habit,
    habitProgress,
    activeSteps,
    completedCount,
    totalCount,
    percentage,
    isComplete,
    toggleStep,
    setAltMode,
  } = useHabitProgress(id);

  if (!habit) {
    return <p className={styles.notFound}>Habit not found.</p>;
  }

  const showAltToggle =
    (energyLevel === 'low' || energyLevel === 'survival') && habit.altSteps?.length > 0;

  const affirmation = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];

  const handleAIUpdate = async (userContext) => {
    if (!claudeApiKey) {
      throw new Error('Please add your Claude API key in Settings first.');
    }

    const currentStepTexts = habit.steps.map((s) => s.text);
    const result = await updateSteps(claudeApiKey, {
      habitName: habit.name,
      currentSteps: currentStepTexts,
      userContext,
      schedule: habit.schedule,
    });

    const updates = {};
    if (result.steps?.length) {
      updates.steps = result.steps.map((text, i) => ({
        id: crypto.randomUUID(),
        text,
        order: i,
      }));
    }
    if (result.altSteps?.length) {
      updates.altSteps = result.altSteps.map((text, i) => ({
        id: crypto.randomUUID(),
        text,
        order: i,
      }));
    }
    if (result.altLabel) {
      updates.altLabel = result.altLabel;
    }
    editHabit(id, updates);
  };

  return (
    <motion.div
      className={styles.page}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.2 }}
    >
      <div className={styles.topBar}>
        <button onClick={() => navigate(-1)} className={styles.back} aria-label="Go back">
          <ArrowLeft size={20} />
        </button>
        <div className={styles.topActions}>
          {claudeApiKey && (
            <button
              onClick={() => setShowAIModal(true)}
              className={styles.edit}
              aria-label="Update steps with AI"
            >
              <Sparkles size={18} />
            </button>
          )}
          <button
            onClick={() => navigate(`/habits/${id}/edit`)}
            className={styles.edit}
            aria-label="Edit habit"
          >
            <Edit2 size={18} />
          </button>
        </div>
      </div>

      <div className={styles.hero}>
        <span className={styles.icon}>{habit.icon}</span>
        <h1 className={styles.name}>{habit.name}</h1>
        <p className={styles.progress}>
          {completedCount} of {totalCount} steps
        </p>
        <div className={styles.progressBar}>
          <ProgressBar value={percentage} label={`${habit.name} progress`} />
        </div>
      </div>

      {showAltToggle && (
        <div className={styles.altToggle}>
          <Toggle
            label={
              habitProgress.usedAltMode
                ? `Easy mode: ${habit.altLabel}`
                : 'Switch to easy version?'
            }
            checked={habitProgress.usedAltMode}
            onChange={setAltMode}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        {isComplete ? (
          <motion.div
            key="celebration"
            className={styles.celebration}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', damping: 18 }}
          >
            <motion.span
              className={styles.celebEmoji}
              animate={{ rotate: [0, -10, 10, -6, 6, 0] }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              🎉
            </motion.span>
            <p className={styles.celebText}>{affirmation}</p>
          </motion.div>
        ) : (
          <motion.div key="steps" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <HabitStepList
              steps={activeSteps ?? []}
              completedSteps={habitProgress.completedSteps}
              onToggle={toggleStep}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AIPromptModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onGenerate={handleAIUpdate}
        habitName={habit.name}
        isUpdate
      />
    </motion.div>
  );
}
