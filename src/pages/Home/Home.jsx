import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useHabitsStore } from '../../store/habitsStore';
import { groupHabitsBySchedule } from '../../utils/habitHelpers';
import HabitCard from '../../components/habits/HabitCard/HabitCard';
import Badge from '../../components/ui/Badge/Badge';
import WhatNext from '../../components/widgets/WhatNext/WhatNext';
import DayLog from '../../components/widgets/DayLog/DayLog';
import { useSettingsStore } from '../../store/settingsStore';
import styles from './Home.module.css';

const SLOT_LABELS = {
  morning: '🌅 Morning',
  afternoon: '☀️ Afternoon',
  evening: '🌙 Evening',
  anytime: '🕐 Anytime',
};

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export default function Home() {
  const habits = useHabitsStore((s) => s.habits);
  const energyLevel = useSettingsStore((s) => s.energyLevel);
  const grouped = groupHabitsBySchedule(habits);

  return (
    <motion.div
      className={styles.page}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.2 }}
    >
      <header className={styles.header}>
        <div>
          <h1 className={styles.date}>{dayjs().format('dddd, MMM D')}</h1>
          <p className={styles.greeting}>Take it one step at a time.</p>
        </div>
        <Badge energyLevel={energyLevel} />
      </header>

      <WhatNext />

      {Object.entries(grouped).map(([slot, slotHabits]) =>
        slotHabits.length === 0 ? null : (
          <section key={slot} className={styles.section}>
            <h2 className={styles.slotLabel}>{SLOT_LABELS[slot]}</h2>
            <div className={styles.cards}>
              {slotHabits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} />
              ))}
            </div>
          </section>
        )
      )}

      <DayLog />
    </motion.div>
  );
}
