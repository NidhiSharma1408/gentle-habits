import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, ChevronRight } from 'lucide-react';
import { useHabitsStore } from '../../store/habitsStore';
import styles from './Habits.module.css';

const SCHEDULE_LABELS = {
  morning: '🌅 Morning',
  afternoon: '☀️ Afternoon',
  evening: '🌙 Evening',
};

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export default function Habits() {
  const navigate = useNavigate();
  const habits = useHabitsStore((s) => s.habits);

  return (
    <motion.div
      className={styles.page}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.2 }}
    >
      <header className={styles.header}>
        <h1 className={styles.title}>All Habits</h1>
        <button
          className={styles.addBtn}
          onClick={() => navigate('/habits/new')}
          aria-label="Add new habit"
        >
          <Plus size={22} />
        </button>
      </header>

      {habits.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyEmoji}>🌱</span>
          <p className={styles.emptyText}>
            No habits yet. Tap + to add your first one — start with something tiny.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {habits.map((habit) => (
            <motion.button
              key={habit.id}
              className={styles.item}
              onClick={() => navigate(`/habits/${habit.id}`)}
              whileTap={{ scale: 0.98 }}
            >
              <span className={styles.itemIcon}>{habit.icon}</span>
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>{habit.name}</div>
                <div className={styles.itemSchedule}>
                  {habit.schedule ? SCHEDULE_LABELS[habit.schedule] : '🕐 Anytime'}
                </div>
              </div>
              <ChevronRight size={18} className={styles.chevron} />
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
