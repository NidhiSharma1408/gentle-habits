import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../../../store/settingsStore';
import Button from '../../ui/Button/Button';
import styles from './EnergyCheckIn.module.css';

const OPTIONS = [
  { value: 'full', emoji: '✨', label: 'Full energy', desc: 'Ready for everything' },
  { value: 'low', emoji: '🌿', label: 'Low energy', desc: 'Easy versions welcome' },
  { value: 'survival', emoji: '🫧', label: 'Survival mode', desc: 'Just the tiniest steps' },
];

export default function EnergyCheckIn() {
  const setEnergyLevel = useSettingsStore((s) => s.setEnergyLevel);
  const [selected, setSelected] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (dismissed) return;
    const el = cardRef.current;
    if (!el) return;

    const focusable = el.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (first) first.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { setDismissed(true); return; }
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dismissed]);

  const confirm = () => {
    if (selected) setEnergyLevel(selected);
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="energy-checkin-title"
      >
        <motion.div
          ref={cardRef}
          className={styles.card}
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        >
          <h2 id="energy-checkin-title" className={styles.title}>How are you feeling today?</h2>
          <p className={styles.subtitle}>
            No wrong answers — this just helps us suggest the right steps for you.
          </p>
          <div className={styles.options}>
            {OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.option} ${selected === opt.value ? styles.selected : ''}`}
                onClick={() => setSelected(opt.value)}
                aria-pressed={selected === opt.value}
              >
                <span className={styles.emoji}>{opt.emoji}</span>
                <div>
                  <div className={styles.optLabel}>{opt.label}</div>
                  <div className={styles.optDesc}>{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
          <div className={styles.actions}>
            <Button variant="primary" fullWidth onClick={confirm} disabled={!selected}>
              Let's go
            </Button>
            <button className={styles.skip} onClick={() => setDismissed(true)}>
              Skip for now
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
