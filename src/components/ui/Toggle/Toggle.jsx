import styles from './Toggle.module.css';

export default function Toggle({ checked, onChange, label }) {
  return (
    <label className={styles.wrapper}>
      <span className={styles.labelText}>{label}</span>
      <div
        className={`${styles.track} ${checked ? styles.on : ''}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onChange(!checked);
          }
        }}
      >
        <div className={styles.thumb} />
      </div>
    </label>
  );
}
