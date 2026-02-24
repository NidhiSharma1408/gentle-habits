import { useSettingsStore } from '../../../store/settingsStore';
import EnergyCheckIn from '../../widgets/EnergyCheckIn/EnergyCheckIn';
import BottomNav from '../BottomNav/BottomNav';
import styles from './AppShell.module.css';

export default function AppShell({ children }) {
  const needsCheckIn = useSettingsStore((s) => s.needsEnergyCheckIn());

  return (
    <div className={styles.shell}>
      {needsCheckIn && <EnergyCheckIn />}
      <main className={styles.main}>{children}</main>
      <BottomNav />
    </div>
  );
}
