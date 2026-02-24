import { motion } from 'framer-motion';
import styles from './ProgressBar.module.css';

export default function ProgressBar({ value = 0, label }) {
  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <motion.div
        className={styles.fill}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ type: 'spring', damping: 20, stiffness: 120 }}
      />
    </div>
  );
}
