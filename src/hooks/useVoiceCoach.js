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
  const gotResultRef = useRef(false);
  const currentStepIdxRef = useRef(null);

  // Find next incomplete step
  const getNextIncompleteIdx = useCallback((fromIdx = -1) => {
    if (!steps) return null;
    for (let i = fromIdx + 1; i < steps.length; i++) {
      if (!completedSteps.includes(steps[i].id)) return i;
    }
    return null;
  }, [steps, completedSteps]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
  }, []);

  const startListening = useCallback((stepIdx) => {
    if (!activeRef.current) return;

    // Clean up any existing recognition
    stopRecognition();

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognitionRef.current = recognition;
    gotResultRef.current = false;
    currentStepIdxRef.current = stepIdx;
    setIsListening(true);

    recognition.onresult = (event) => {
      // Check the latest result
      const lastResult = event.results[event.results.length - 1];
      if (!lastResult.isFinal) return;

      gotResultRef.current = true;
      const transcript = lastResult[0].transcript.toLowerCase().trim();

      if (!activeRef.current) return;

      // Stop recognition before processing to avoid overlaps
      stopRecognition();
      setIsListening(false);

      handleTranscript(transcript, stepIdx);
    };

    recognition.onerror = (event) => {
      // no-speech and aborted are normal — just restart
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return; // onend will handle restart
      }
      // For other errors, log and restart
      console.warn('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
      // If we didn't get a result and we're still active, restart listening
      if (activeRef.current && !gotResultRef.current) {
        setTimeout(() => {
          if (activeRef.current) {
            startListening(currentStepIdxRef.current);
          }
        }, 100);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn('Failed to start recognition:', e);
      // Retry after a short delay
      setTimeout(() => {
        if (activeRef.current) startListening(stepIdx);
      }, 500);
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
      // Didn't understand — just keep listening, don't interrupt
      if (activeRef.current) {
        startListening(stepIdx);
      }
    }
  }, [steps, onToggle, getNextIncompleteIdx, startListening]);

  // Speak a step and then listen for response
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

    startListening(stepIdx);
  }, [steps, stopRecognition, startListening]);

  const stop = useCallback(() => {
    activeRef.current = false;
    setIsActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setCurrentStepIdx(null);
    currentStepIdxRef.current = null;
    stopSpeaking();
    stopRecognition();
  }, [stopRecognition]);

  const start = useCallback(async () => {
    if (isComplete) return;

    activeRef.current = true;
    setIsActive(true);

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
