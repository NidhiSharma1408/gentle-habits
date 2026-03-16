import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, VolumeX } from 'lucide-react';
import { useVoiceCoach } from '../../../hooks/useVoiceCoach';
import styles from './VoiceCoach.module.css';

export default function VoiceCoach({ steps, completedSteps, onToggle, isComplete }) {
  const {
    isActive,
    isListening,
    isSpeaking,
    currentStepIdx,
    isSupported,
    toggle,
  } = useVoiceCoach({ steps, completedSteps, onToggle, isComplete });

  if (!isSupported) return null;

  const currentStep = currentStepIdx !== null ? steps[currentStepIdx] : null;

  return (
    <div className={styles.wrapper}>
      <AnimatePresence>
        {isActive && currentStep && (
          <motion.div
            className={styles.status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className={styles.stepInfo}>
              <span className={styles.stepNum}>Step {currentStepIdx + 1}</span>
              <span className={styles.stepText}>{currentStep.text}</span>
            </div>
            <div className={styles.stateLabel}>
              {isSpeaking && (
                <span className={styles.speaking}>
                  <Volume2 size={14} /> Speaking...
                </span>
              )}
              {isListening && (
                <span className={styles.listening}>
                  <span className={styles.pulse} />
                  Listening — say "done"
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        className={`${styles.micBtn} ${isActive ? styles.micBtnActive : ''}`}
        onClick={toggle}
        aria-label={isActive ? 'Stop voice coach' : 'Start voice coach'}
        disabled={isComplete}
      >
        {isActive ? <VolumeX size={24} /> : <Mic size={24} />}
      </button>

      {!isActive && !isComplete && (
        <p className={styles.hint}>Tap to start voice coach</p>
      )}
    </div>
  );
}
