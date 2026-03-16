import { useState, useCallback, useRef, useEffect } from 'react';

const DONE_PHRASES = ['done', 'next', 'check', 'finished', 'complete', 'yes', 'okay', 'ok', 'yep', 'yup'];
const SKIP_PHRASES = ['skip', 'pass'];
const STOP_PHRASES = ['stop', 'quit', 'exit', 'cancel'];

function speak(text) {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = resolve;
    utterance.onerror = resolve;
    speechSynthesis.speak(utterance);
  });
}

function stopSpeaking() {
  speechSynthesis.cancel();
}

export function useVoiceCoach({ steps, completedSteps, onToggle, isComplete }) {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(null);
  const recognitionRef = useRef(null);
  const activeRef = useRef(false);
  const currentStepIdxRef = useRef(null);
  const restartTimerRef = useRef(null);
  const startTimeRef = useRef(null);
  const failCountRef = useRef(0);

  // Find next incomplete step
  const getNextIncompleteIdx = useCallback((fromIdx = -1) => {
    if (!steps) return null;
    for (let i = fromIdx + 1; i < steps.length; i++) {
      if (!completedSteps.includes(steps[i].id)) return i;
    }
    return null;
  }, [steps, completedSteps]);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const stopRecognition = useCallback(() => {
    clearRestartTimer();
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
  }, [clearRestartTimer]);

  const startListening = useCallback((stepIdx) => {
    if (!activeRef.current) return;

    stopRecognition();

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    // Use non-continuous mode — it's more reliable across browsers
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognitionRef.current = recognition;
    currentStepIdxRef.current = stepIdx;
    startTimeRef.current = Date.now();
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      failCountRef.current = 0; // Reset fail count on successful result
      setIsListening(false);
      recognitionRef.current = null;

      if (!activeRef.current) return;

      handleTranscript(transcript, stepIdx);
    };

    recognition.onerror = (event) => {
      console.log('Speech error:', event.error);
      // Don't set isListening false here — onend will fire after this
    };

    recognition.onend = () => {
      recognitionRef.current = null;

      if (!activeRef.current) {
        setIsListening(false);
        return;
      }

      // Check how long recognition actually ran
      const elapsed = Date.now() - (startTimeRef.current || 0);

      if (elapsed < 500) {
        // Died immediately — likely a permission/browser issue
        failCountRef.current++;
        if (failCountRef.current >= 3) {
          // Stop trying after 3 rapid failures
          console.warn('Speech recognition keeps failing. Stopping auto-restart.');
          setIsListening(false);
          return;
        }
      } else {
        // Ran for a reasonable time (just no speech detected) — reset fail count
        failCountRef.current = 0;
      }

      // Restart with increasing delay based on fail count
      const delay = Math.min(300 + failCountRef.current * 500, 2000);
      setIsListening(false);

      restartTimerRef.current = setTimeout(() => {
        restartTimerRef.current = null;
        if (activeRef.current) {
          startListening(currentStepIdxRef.current);
        }
      }, delay);
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn('Failed to start recognition:', e);
      recognitionRef.current = null;
      setIsListening(false);

      restartTimerRef.current = setTimeout(() => {
        restartTimerRef.current = null;
        if (activeRef.current) startListening(stepIdx);
      }, 1000);
    }
  }, [stopRecognition]);

  const handleTranscript = useCallback(async (transcript, stepIdx) => {
    if (!activeRef.current) return;

    if (DONE_PHRASES.some((p) => transcript.includes(p))) {
      onToggle(steps[stepIdx].id);
      await speak('Done! Nice work.');

      if (!activeRef.current) return;

      const nextIdx = getNextIncompleteIdx(stepIdx);
      if (nextIdx !== null) {
        speakAndListen(nextIdx);
      } else {
        await speak('All steps complete. You did it! Amazing work today.');
        stop();
      }
    } else if (SKIP_PHRASES.some((p) => transcript.includes(p))) {
      await speak('Skipping this step.');
      if (!activeRef.current) return;
      const nextIdx = getNextIncompleteIdx(stepIdx);
      if (nextIdx !== null) {
        speakAndListen(nextIdx);
      } else {
        await speak('No more steps to skip.');
        stop();
      }
    } else if (STOP_PHRASES.some((p) => transcript.includes(p))) {
      await speak('Voice coach paused. Tap the mic to resume.');
      stop();
    } else {
      // Didn't match a command — restart listening silently
      if (activeRef.current) {
        startListening(stepIdx);
      }
    }
  }, [steps, onToggle, getNextIncompleteIdx, startListening]);

  const speakAndListen = useCallback(async (stepIdx) => {
    if (!activeRef.current || !steps?.[stepIdx]) return;

    stopRecognition();
    setCurrentStepIdx(stepIdx);
    currentStepIdxRef.current = stepIdx;
    setIsSpeaking(true);

    const stepNum = stepIdx + 1;
    const totalSteps = steps.length;
    await speak(`Step ${stepNum} of ${totalSteps}. ${steps[stepIdx].text}`);

    setIsSpeaking(false);

    if (!activeRef.current) return;

    // Small delay before listening to avoid catching tail-end of TTS audio
    await new Promise((r) => setTimeout(r, 300));
    if (!activeRef.current) return;

    failCountRef.current = 0;
    startListening(stepIdx);
  }, [steps, stopRecognition, startListening]);

  const stop = useCallback(() => {
    activeRef.current = false;
    setIsActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setCurrentStepIdx(null);
    currentStepIdxRef.current = null;
    failCountRef.current = 0;
    stopSpeaking();
    stopRecognition();
  }, [stopRecognition]);

  const start = useCallback(async () => {
    if (isComplete) return;

    activeRef.current = true;
    setIsActive(true);
    failCountRef.current = 0;

    const firstIdx = getNextIncompleteIdx(-1);
    if (firstIdx === null) {
      await speak('All steps are already complete!');
      stop();
      return;
    }

    await speak(`Let's go. I'll read each step. Say done when you finish it.`);
    if (activeRef.current) {
      speakAndListen(firstIdx);
    }
  }, [isComplete, getNextIncompleteIdx, speakAndListen, stop]);

  const toggle = useCallback(() => {
    if (isActive) {
      stop();
    } else {
      start();
    }
  }, [isActive, start, stop]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      activeRef.current = false;
      stopSpeaking();
      stopRecognition();
    };
  }, [stopRecognition]);

  // Stop if habit completes externally
  useEffect(() => {
    if (isComplete && isActive) {
      stop();
    }
  }, [isComplete, isActive, stop]);

  const isSupported =
    typeof window !== 'undefined' &&
    ('speechSynthesis' in window) &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  return {
    isActive,
    isListening,
    isSpeaking,
    currentStepIdx,
    isSupported,
    toggle,
    start,
    stop,
  };
}
