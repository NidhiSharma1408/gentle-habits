import { useState, useCallback, useRef, useEffect } from 'react';

// --- TTS (text-to-speech) ---
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

// --- Clap detection config ---
const CLAP_THRESHOLD = 0.35;       // Amplitude spike to count as a clap (0-1)
const DOUBLE_CLAP_WINDOW = 600;    // Max ms between two claps
const CLAP_COOLDOWN = 800;         // Ignore claps for this long after detecting a double-clap
const REPEAT_TIMEOUT = 45000;      // Re-read step after 45s of no action

export function useVoiceCoach({ steps, completedSteps, onToggle, isComplete }) {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(null);

  const activeRef = useRef(false);
  const currentStepIdxRef = useRef(null);

  // Audio refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  // Clap detection refs
  const lastClapTimeRef = useRef(0);
  const cooldownUntilRef = useRef(0);
  const repeatTimerRef = useRef(null);
  const isSpeakingRef = useRef(false);

  // Find next incomplete step
  const getNextIncompleteIdx = useCallback((fromIdx = -1) => {
    if (!steps) return null;
    for (let i = fromIdx + 1; i < steps.length; i++) {
      if (!completedSteps.includes(steps[i].id)) return i;
    }
    return null;
  }, [steps, completedSteps]);

  const clearRepeatTimer = useCallback(() => {
    if (repeatTimerRef.current) {
      clearTimeout(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
  }, []);

  const startRepeatTimer = useCallback((stepIdx) => {
    clearRepeatTimer();
    repeatTimerRef.current = setTimeout(() => {
      if (activeRef.current && !isSpeakingRef.current) {
        speakStep(stepIdx);
      }
    }, REPEAT_TIMEOUT);
  }, [clearRepeatTimer]);

  // --- Audio setup ---
  const stopAudio = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  const handleDoubleClap = useCallback(async (stepIdx) => {
    if (!activeRef.current || isSpeakingRef.current) return;

    // Mark step done
    onToggle(steps[stepIdx].id);

    isSpeakingRef.current = true;
    setIsSpeaking(true);
    clearRepeatTimer();
    await speak('Nice!');
    isSpeakingRef.current = false;
    setIsSpeaking(false);

    if (!activeRef.current) return;

    // Move to next
    const nextIdx = getNextIncompleteIdx(stepIdx);
    if (nextIdx !== null) {
      speakStep(nextIdx);
    } else {
      isSpeakingRef.current = true;
      setIsSpeaking(true);
      await speak('All done. Amazing work today!');
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      stopCoach();
    }
  }, [steps, onToggle, getNextIncompleteIdx, clearRepeatTimer]);

  const startListening = useCallback((stepIdx) => {
    if (!activeRef.current) return;

    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.fftSize);
    setIsListening(true);
    startRepeatTimer(stepIdx);

    const detect = () => {
      if (!activeRef.current) return;

      analyser.getByteTimeDomainData(dataArray);

      // Calculate peak amplitude (0–1)
      let peak = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const val = Math.abs(dataArray[i] - 128) / 128;
        if (val > peak) peak = val;
      }

      const now = Date.now();

      // Skip during cooldown or while speaking
      if (now < cooldownUntilRef.current || isSpeakingRef.current) {
        rafRef.current = requestAnimationFrame(detect);
        return;
      }

      if (peak > CLAP_THRESHOLD) {
        const timeSinceLastClap = now - lastClapTimeRef.current;

        if (timeSinceLastClap < DOUBLE_CLAP_WINDOW && timeSinceLastClap > 100) {
          // Double clap detected!
          lastClapTimeRef.current = 0;
          cooldownUntilRef.current = now + CLAP_COOLDOWN;
          clearRepeatTimer();
          handleDoubleClap(currentStepIdxRef.current);
        } else {
          // First clap — wait for second
          lastClapTimeRef.current = now;
        }
      }

      rafRef.current = requestAnimationFrame(detect);
    };

    rafRef.current = requestAnimationFrame(detect);
  }, [startRepeatTimer, clearRepeatTimer, handleDoubleClap]);

  const speakStep = useCallback(async (stepIdx) => {
    if (!activeRef.current || !steps?.[stepIdx]) return;

    setCurrentStepIdx(stepIdx);
    currentStepIdxRef.current = stepIdx;

    isSpeakingRef.current = true;
    setIsSpeaking(true);
    setIsListening(false);

    // Cancel any ongoing detection loop during speech
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const stepNum = stepIdx + 1;
    const totalSteps = steps.length;
    await speak(`Step ${stepNum} of ${totalSteps}. ${steps[stepIdx].text}`);

    isSpeakingRef.current = false;
    setIsSpeaking(false);

    if (!activeRef.current) return;

    // Reset clap state and start listening
    lastClapTimeRef.current = 0;
    cooldownUntilRef.current = Date.now() + 500; // Brief cooldown after speech
    startListening(stepIdx);
  }, [steps, startListening]);

  const stopCoach = useCallback(() => {
    activeRef.current = false;
    setIsActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setCurrentStepIdx(null);
    currentStepIdxRef.current = null;
    isSpeakingRef.current = false;
    lastClapTimeRef.current = 0;
    cooldownUntilRef.current = 0;
    clearRepeatTimer();
    stopSpeaking();
    stopAudio();
  }, [clearRepeatTimer, stopAudio]);

  const startCoach = useCallback(async () => {
    if (isComplete) return;

    // Request mic access
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      alert('Microphone access is needed for voice coach.');
      return;
    }

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    streamRef.current = stream;

    activeRef.current = true;
    setIsActive(true);

    const firstIdx = getNextIncompleteIdx(-1);
    if (firstIdx === null) {
      await speak('All steps are already complete!');
      stopCoach();
      return;
    }

    isSpeakingRef.current = true;
    setIsSpeaking(true);
    await speak(`Let's go. I'll read each step. Double clap when you're done.`);
    isSpeakingRef.current = false;
    setIsSpeaking(false);

    if (activeRef.current) {
      speakStep(firstIdx);
    }
  }, [isComplete, getNextIncompleteIdx, speakStep, stopCoach]);

  const toggle = useCallback(() => {
    if (isActive) {
      stopCoach();
    } else {
      startCoach();
    }
  }, [isActive, startCoach, stopCoach]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      activeRef.current = false;
      stopSpeaking();
      stopAudio();
      clearRepeatTimer();
    };
  }, [stopAudio, clearRepeatTimer]);

  // Stop if habit completes externally
  useEffect(() => {
    if (isComplete && isActive) {
      stopCoach();
    }
  }, [isComplete, isActive, stopCoach]);

  const isSupported =
    typeof window !== 'undefined' &&
    ('speechSynthesis' in window) &&
    ('mediaDevices' in navigator);

  return {
    isActive,
    isListening,
    isSpeaking,
    currentStepIdx,
    isSupported,
    toggle,
    start: startCoach,
    stop: stopCoach,
  };
}
