import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProgressBar from '../../ui/ProgressBar/ProgressBar';
import Toggle from '../../ui/Toggle/Toggle';
import { useHabitProgress } from '../../../hooks/useHabitProgress';
import { useSettingsStore } from '../../../store/settingsStore';
import styles from './HabitCard.module.css';

export default function HabitCard({ habit }) {
  const navigate = useNavigate();
  const energyLevel = useSettingsStore((s) => s.energyLevel);
  const { percentage, completedCount, totalCount, isComplete, habitProgress, setAltMode } =
    useHabitProgress(habit.id);

  const showAltToggle =
    (energyLevel === 'low' || energyLevel === 'survival') && habit.altSteps?.length > 0;

  return (
    <motion.article
      className={`${styles.card} ${isComplete ? styles.complete : ''}`}
      layout
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/habits/${habit.id}`)}
    >
      <div className={styles.header}>
        <span className={styles.icon}>{habit.icon}</span>
        <div className={styles.info}>
          <h3 className={styles.name}>{habit.name}</h3>
          <p className={styles.meta}>
            {completedCount}/{totalCount} steps{isComplete ? ' · Done ✓' : ''}
          </p>
        </div>
      </div>
      <ProgressBar value={percentage} label={`${habit.name} progress`} />
      {showAltToggle && (
        <div
          className={styles.altToggle}
          onClick={(e) => e.stopPropagation()}
        >
          <Toggle
            label={habitProgress.usedAltMode ? `Using: ${habit.altLabel}` : 'Use easy version?'}
            checked={habitProgress.usedAltMode}
            onChange={setAltMode}
          />
        </div>
      )}
    </motion.article>
  );
}
