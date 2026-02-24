import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import styles from './HabitStepList.module.css';

export default function HabitStepList({ steps, completedSteps, onToggle }) {
  return (
    <ol className={styles.list}>
      <AnimatePresence>
        {steps.map((step, i) => {
          const done = completedSteps.includes(step.id);
          return (
            <motion.li
              key={step.id}
              className={`${styles.step} ${done ? styles.done : ''}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onToggle(step.id)}
              role="checkbox"
              aria-checked={done}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggle(step.id);
                }
              }}
            >
              <motion.span
                className={`${styles.checkbox} ${done ? styles.checked : ''}`}
                animate={{ scale: done ? [1.3, 1] : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 16 }}
              >
                {done && <Check size={12} strokeWidth={3} />}
              </motion.span>
              <span className={styles.text}>{step.text}</span>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ol>
  );
}
