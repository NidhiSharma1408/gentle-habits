import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { useHabitProgress } from '../../hooks/useHabitProgress';
import HabitStepList from '../../components/habits/HabitStepList/HabitStepList';
import ProgressBar from '../../components/ui/ProgressBar/ProgressBar';
import Toggle from '../../components/ui/Toggle/Toggle';
import { useSettingsStore } from '../../store/settingsStore';
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
        <button
          onClick={() => navigate(`/habits/${id}/edit`)}
          className={styles.edit}
          aria-label="Edit habit"
        >
          <Edit2 size={18} />
        </button>
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
    </motion.div>
  );
}
