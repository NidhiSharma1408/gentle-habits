import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useHabitsStore } from '../../store/habitsStore';
import Button from '../../components/ui/Button/Button';
import styles from './HabitForm.module.css';

const SCHEDULES = [
  { value: 'morning', label: '🌅 Morning' },
  { value: 'afternoon', label: '☀️ Afternoon' },
  { value: 'evening', label: '🌙 Evening' },
  { value: null, label: '🕐 Anytime' },
];

const ICONS = ['🛁', '🦷', '💧', '🍽️', '👕', '🌿', '🧹', '🌙', '📖', '🏃', '🧘', '✍️', '💊', '🎵', '🌸', '☕'];

const emptyStep = (order) => ({ id: crypto.randomUUID(), text: '', order });

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export default function HabitForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const getHabit = useHabitsStore((s) => s.getHabit);
  const addHabit = useHabitsStore((s) => s.addHabit);
  const editHabit = useHabitsStore((s) => s.editHabit);
  const deleteHabit = useHabitsStore((s) => s.deleteHabit);

  const existing = id ? getHabit(id) : null;

  const [name, setName] = useState(existing?.name ?? '');
  const [icon, setIcon] = useState(existing?.icon ?? '📋');
  const [schedule, setSchedule] = useState(existing?.schedule ?? null);
  const [steps, setSteps] = useState(
    existing?.steps?.length ? existing.steps : [emptyStep(0)]
  );
  const [altSteps, setAltSteps] = useState(
    existing?.altSteps?.length ? existing.altSteps : [emptyStep(0)]
  );
  const [altLabel, setAltLabel] = useState(existing?.altLabel ?? '');

  const isValid = name.trim() && steps.some((s) => s.text.trim());

  const save = () => {
    const payload = {
      name: name.trim(),
      icon,
      schedule,
      steps: steps.filter((s) => s.text.trim()).map((s, i) => ({ ...s, order: i })),
      altSteps: altSteps.filter((s) => s.text.trim()).map((s, i) => ({ ...s, order: i })),
      altLabel: altLabel.trim(),
    };
    if (existing) {
      editHabit(id, payload);
    } else {
      addHabit(payload);
    }
    navigate('/habits');
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${existing.name}"? This cannot be undone.`)) {
      deleteHabit(id);
      navigate('/habits');
    }
  };

  const updateStep = (list, setList, idx, text) =>
    setList(list.map((s, i) => (i === idx ? { ...s, text } : s)));

  const addStepItem = (list, setList) =>
    setList([...list, emptyStep(list.length)]);

  const removeStep = (list, setList, idx) =>
    setList(list.filter((_, i) => i !== idx));

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
        <h1 className={styles.title}>{existing ? 'Edit Habit' : 'New Habit'}</h1>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Icon</label>
        <div className={styles.iconPicker}>
          {ICONS.map((em) => (
            <button
              key={em}
              className={`${styles.iconBtn} ${icon === em ? styles.iconSelected : ''}`}
              onClick={() => setIcon(em)}
              aria-label={`Select ${em} icon`}
            >
              {em}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label} htmlFor="habit-name">Habit name</label>
        <input
          id="habit-name"
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Take a shower"
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Schedule</label>
        <div className={styles.scheduleRow}>
          {SCHEDULES.map((s) => (
            <button
              key={String(s.value)}
              className={`${styles.schedBtn} ${schedule === s.value ? styles.schedSelected : ''}`}
              onClick={() => setSchedule(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Full-energy steps</h2>
        {steps.map((step, idx) => (
          <div key={step.id} className={styles.stepRow}>
            <input
              className={styles.input}
              value={step.text}
              onChange={(e) => updateStep(steps, setSteps, idx, e.target.value)}
              placeholder={`Step ${idx + 1}`}
            />
            {steps.length > 1 && (
              <button
                className={styles.removeBtn}
                onClick={() => removeStep(steps, setSteps, idx)}
                aria-label="Remove step"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={() => addStepItem(steps, setSteps)}>
          <Plus size={15} /> Add step
        </Button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Easy version <span className={styles.optional}>(optional)</span>
        </h2>
        <label className={styles.label} htmlFor="alt-label">Short label</label>
        <input
          id="alt-label"
          className={styles.input}
          value={altLabel}
          onChange={(e) => setAltLabel(e.target.value)}
          placeholder="e.g. Wet towel wipe-down"
        />
        {altSteps.map((step, idx) => (
          <div key={step.id} className={styles.stepRow}>
            <input
              className={styles.input}
              value={step.text}
              onChange={(e) => updateStep(altSteps, setAltSteps, idx, e.target.value)}
              placeholder={`Alt step ${idx + 1}`}
            />
            {altSteps.length > 1 && (
              <button
                className={styles.removeBtn}
                onClick={() => removeStep(altSteps, setAltSteps, idx)}
                aria-label="Remove alt step"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={() => addStepItem(altSteps, setAltSteps)}>
          <Plus size={15} /> Add alt step
        </Button>
      </div>

      {existing && (
        <div className={styles.deleteSection}>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 size={15} /> Delete this habit
          </Button>
        </div>
      )}

      <div className={styles.footer}>
        <Button variant="primary" fullWidth onClick={save} disabled={!isValid}>
          {existing ? 'Save changes' : 'Create habit'}
        </Button>
      </div>
    </motion.div>
  );
}
