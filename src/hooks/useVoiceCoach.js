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

  // Find next incomplete step
  const getNextIncompleteIdx = useCallback((fromIdx = -1) => {
    if (!steps) return null;
    for (let i = fromIdx + 1; i < steps.length; i++) {
      if (!completedSteps.includes(steps[i].id)) return i;
    }
    return null;
  }, [steps, completedSteps]);

  // Speak a step and then listen for response
  const speakAndListen = useCallback(async (stepIdx) => {
    if (!activeRef.current || !steps?.[stepIdx]) return;

    setCurrentStepIdx(stepIdx);
    setIsSpeaking(true);

    const stepNum = stepIdx + 1;
    const totalSteps = steps.length;
    await speak(`Step ${stepNum} of ${totalSteps}. ${steps[stepIdx].text}`);

    setIsSpeaking(false);

    if (!activeRef.current) return;

    // Start listening
    startListening(stepIdx);
  }, [steps]);

  const startListening = useCallback((stepIdx) => {
    if (!activeRef.current) return;
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognitionRef.current = recognition;
    setIsListening(true);

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      setIsListening(false);

      if (!activeRef.current) return;

      // Check if user said "done"
      if (DONE_PHRASES.some((p) => transcript.includes(p))) {
        // Mark step complete
        onToggle(steps[stepIdx].id);
        await speak('Done! Nice work.');

        if (!activeRef.current) return;

        // Move to next step
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
          await speak('No more steps. You can say done to complete the remaining ones.');
          stop();
        }
      } else if (STOP_PHRASES.some((p) => transcript.includes(p))) {
        await speak('Voice coach paused. Tap the mic to resume.');
        stop();
      } else {
        // Didn't understand — re-read and listen again
        if (!activeRef.current) return;
        await speak('Say done when you finish this step, or skip to move on.');
        if (activeRef.current) startListening(stepIdx);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (!activeRef.current) return;
      // On timeout/no-speech, just restart listening
      if (event.error === 'no-speech' || event.error === 'aborted') {
        if (activeRef.current) startListening(stepIdx);
      }
    };

    recognition.onend = () => {
      // If still active but onresult didn't fire, restart
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch {
      // Already started or not supported
    }
  }, [steps, onToggle, getNextIncompleteIdx, speakAndListen]);

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
  }, [isComplete, getNextIncompleteIdx, speakAndListen]);

  const stop = useCallback(() => {
    activeRef.current = false;
    setIsActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setCurrentStepIdx(null);
    stopSpeaking();
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
  }, []);

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
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

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
