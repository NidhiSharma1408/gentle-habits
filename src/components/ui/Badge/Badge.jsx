import styles from './Badge.module.css';

const BADGES = {
  full: { label: '✨ Full Energy', cls: styles.full },
  low: { label: '🌿 Low Energy', cls: styles.low },
  survival: { label: '🫧 Survival Mode', cls: styles.survival },
};

export default function Badge({ energyLevel }) {
  const badge = BADGES[energyLevel];
  if (!badge) return null;
  return <span className={`${styles.badge} ${badge.cls}`}>{badge.label}</span>;
}
