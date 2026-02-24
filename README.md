# Gentle Habits

A compassionate habit tracker built for people with executive dysfunction, ADHD, depression, or anyone who needs a little extra gentleness in their day.

## Philosophy

Most habit trackers are built around streaks, scores, and shame. Gentle Habits is different. It meets you where you are — whether you have full energy today or you're just surviving. Every step you complete matters. Rest counts too.

Key principles:
- **No streaks, no shame** — progress resets each day without judgment
- **Energy-aware** — check in with how you're feeling; the app adapts its suggestions accordingly
- **Alt mode** — every habit has a gentler version for low-energy or survival days
- **One step at a time** — breaking habits into tiny, specific steps makes starting easier
- **"What next?"** — a suggestion engine that meets you where you are in the day

## Features

- 8 prebuilt habits (Take a Bath, Brush Teeth, Drink Water, Eat a Meal, Get Dressed, Go Outside, Tidy One Spot, Wind Down for Sleep)
- Daily energy check-in with three modes: Full Energy, Low Energy, Survival Mode
- Step-by-step habit completion with animated progress
- Alternate "easy mode" steps for each habit
- "What next?" suggestion widget that considers your energy level and time of day
- Dark mode with automatic persistence across refreshes
- Full custom habit creation and editing
- "I rested today — that counts too" button
- Data persistence via localStorage, with automatic 30-day pruning

## Tech Stack

- **React 19** — UI framework
- **CSS Modules** — scoped component styles
- **Zustand** — state management with localStorage persistence
- **Framer Motion** — animations (fade, spring, stagger)
- **React Router v6** — client-side routing
- **Lucide React** — icons
- **Day.js** — date formatting
- **esbuild** — fast bundler

## Setup

```bash
# Build for production
npm run build

# The output is in dist/
# Open dist/index.html in a browser (or serve it with any static server)
```

For local development, the dev server serves the `dist/` directory:

```bash
npm run dev
# Open http://localhost:3000
```

> **Note:** This project uses a custom build setup with esbuild. The standard `npm install` will not work in environments without registry access. The shims for Zustand, Framer Motion, Lucide React, Day.js, and React Router are included in `node_modules/` as lightweight custom implementations.

## Project Structure

```
src/
├── components/
│   ├── habits/       # HabitCard, HabitStepList
│   ├── layout/       # AppShell, BottomNav
│   ├── ui/           # Button, Badge, Modal, ProgressBar, Toggle
│   └── widgets/      # DayLog, EnergyCheckIn, WhatNext
├── data/             # prebuiltHabits.js
├── hooks/            # useHabitProgress, useTheme, useWhatNext, useLocalStorage
├── pages/            # Home, HabitDetail, Habits, HabitForm, Settings
├── store/            # habitsStore, progressStore, settingsStore
├── styles/           # global.css, theme.css, typography.css
└── utils/            # habitHelpers.js, suggestions.js
```

## Accessibility

- All interactive elements meet the 44×44px minimum touch target size
- Full keyboard navigation with `:focus-visible` outlines
- ARIA roles: `dialog`, `switch`, `checkbox`, `progressbar`
- Screen reader labels on all icon-only buttons
- Focus trap in the Energy Check-In modal

## License

MIT
