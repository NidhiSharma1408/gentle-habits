import { motion, AnimatePresence } from 'framer-motion';
import { useProgressStore } from '../../../store/progressStore';
import styles from './DayLog.module.css';

export default function DayLog() {
  const today = useProgressStore((s) => s.getToday());
  const logRest = useProgressStore((s) => s.logRest);

  return (
    <div className={styles.wrapper}>
      <AnimatePresence mode="wait">
        {today.restedToday ? (
          <motion.p
            key="affirm"
            className={styles.affirmation}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            Rest logged. Rest is healing. You did something today. 🌿
          </motion.p>
        ) : (
          <motion.button
            key="btn"
            className={styles.restBtn}
            onClick={logRest}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            🛋️ I rested today — that counts too
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
