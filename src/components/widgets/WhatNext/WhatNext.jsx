import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useWhatNext } from '../../../hooks/useWhatNext';
import Button from '../../ui/Button/Button';
import styles from './WhatNext.module.css';

export default function WhatNext() {
  const navigate = useNavigate();
  const suggestion = useWhatNext();
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.wrapper}>
      <Button
        variant="soft"
        size="sm"
        className={styles.trigger}
        onClick={() => setVisible((v) => !v)}
      >
        <Sparkles size={15} />
        What should I do next?
      </Button>
      <AnimatePresence>
        {visible && (
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <p className={styles.text}>{suggestion.text}</p>
            {suggestion.habit && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/habits/${suggestion.habit.id}`)}
              >
                Start this →
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
