import { NavLink } from 'react-router-dom';
import { Home, List, Settings } from 'lucide-react';
import styles from './BottomNav.module.css';

const links = [
  { to: '/', icon: Home, label: 'Today' },
  { to: '/habits', icon: List, label: 'Habits' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Main navigation">
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
        >
          <Icon size={22} aria-hidden="true" />
          <span className={styles.label}>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
