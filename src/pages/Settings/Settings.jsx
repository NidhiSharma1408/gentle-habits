import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../store/settingsStore';
import Toggle from '../../components/ui/Toggle/Toggle';
import Button from '../../components/ui/Button/Button';
import styles from './Settings.module.css';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

const AI_PROVIDERS = [
  { value: 'claude', label: 'Claude (Anthropic)' },
  { value: 'gemini', label: 'Gemini (Google)' },
];

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const setEnergyLevel = useSettingsStore((s) => s.setEnergyLevel);
  const aiProvider = useSettingsStore((s) => s.aiProvider);
  const setAiProvider = useSettingsStore((s) => s.setAiProvider);
  const claudeApiKey = useSettingsStore((s) => s.claudeApiKey);
  const setClaudeApiKey = useSettingsStore((s) => s.setClaudeApiKey);
  const geminiApiKey = useSettingsStore((s) => s.geminiApiKey);
  const setGeminiApiKey = useSettingsStore((s) => s.setGeminiApiKey);
  const [showKey, setShowKey] = useState(false);

  const activeKey = aiProvider === 'gemini' ? geminiApiKey : claudeApiKey;
  const setActiveKey = aiProvider === 'gemini' ? setGeminiApiKey : setClaudeApiKey;
  const keyPlaceholder = aiProvider === 'gemini' ? 'AIza...' : 'sk-ant-...';
  const providerName = aiProvider === 'gemini' ? 'Google' : 'Anthropic';

  const resetAll = () => {
    if (window.confirm('This will clear all habits, progress, and settings. Are you sure?')) {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('gentle_habits__'))
        .forEach((k) => localStorage.removeItem(k));
      window.location.reload();
    }
  };

  return (
    <motion.div
      className={styles.page}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.2 }}
    >
      <h1 className={styles.title}>Settings</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Appearance</h2>
        <Toggle
          label={theme === 'dark' ? '🌙 Dark mode on' : '☀️ Light mode on'}
          checked={theme === 'dark'}
          onChange={toggleTheme}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Energy level</h2>
        <p className={styles.desc}>Update how you are feeling right now:</p>
        <div className={styles.energyBtns}>
          <button className={styles.energyBtn} onClick={() => setEnergyLevel('full')}>
            ✨ Full
          </button>
          <button className={styles.energyBtn} onClick={() => setEnergyLevel('low')}>
            🌿 Low
          </button>
          <button className={styles.energyBtn} onClick={() => setEnergyLevel('survival')}>
            🫧 Survival
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>AI Steps</h2>
        <p className={styles.desc}>
          Choose your AI provider and add an API key to generate habit steps.
        </p>

        <label className={styles.fieldLabel}>Provider</label>
        <div className={styles.providerRow}>
          {AI_PROVIDERS.map((p) => (
            <button
              key={p.value}
              className={`${styles.providerBtn} ${aiProvider === p.value ? styles.providerSelected : ''}`}
              onClick={() => setAiProvider(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <label className={styles.fieldLabel}>API key</label>
        <div className={styles.apiKeyRow}>
          <input
            className={styles.apiKeyInput}
            type={showKey ? 'text' : 'password'}
            value={activeKey}
            onChange={(e) => setActiveKey(e.target.value)}
            placeholder={keyPlaceholder}
            autoComplete="off"
          />
          <button
            className={styles.apiKeyToggle}
            onClick={() => setShowKey(!showKey)}
            aria-label={showKey ? 'Hide API key' : 'Show API key'}
          >
            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className={styles.desc}>
          Your key is stored locally and never sent to any server except {providerName}.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Data</h2>
        <Button variant="danger" size="sm" onClick={resetAll}>
          <Trash2 size={15} /> Reset all data
        </Button>
        <p className={styles.desc}>This cannot be undone. Prebuilt habits will return.</p>
      </section>

      <p className={styles.version}>Gentle Habits v1.0.0</p>
    </motion.div>
  );
}
