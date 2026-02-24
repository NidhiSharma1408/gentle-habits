import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell/AppShell';
import Home from './pages/Home/Home';
import Habits from './pages/Habits/Habits';
import HabitDetail from './pages/HabitDetail/HabitDetail';
import HabitForm from './pages/HabitForm/HabitForm';
import Settings from './pages/Settings/Settings';
import { useTheme } from './hooks/useTheme';
import { useProgressStore } from './store/progressStore';

export default function App() {
  useTheme();
  const pruneProgress = useProgressStore((s) => s.pruneProgress);

  useEffect(() => {
    pruneProgress();
  }, [pruneProgress]);

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/habits/new" element={<HabitForm />} />
        <Route path="/habits/:id" element={<HabitDetail />} />
        <Route path="/habits/:id/edit" element={<HabitForm />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AppShell>
  );
}
