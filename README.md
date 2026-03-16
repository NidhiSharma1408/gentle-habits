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

### AI-Powered Step Generation

Gentle Habits integrates with the Claude API to help you break habits into manageable micro-steps:

- **Generate steps** — when creating a new habit, describe your context (e.g. "I have ADHD and need very small steps") and AI generates 4-8 detailed micro-steps plus a simplified easy version
- **Update steps** — refine existing steps with natural language feedback (e.g. "make the steps shorter" or "add a step for setting out clothes")
- **Prompt modal** — a dedicated window where you can explain how detailed or specific you want the steps to be
- **Easy version included** — AI also generates 2-3 simplified alt-steps for low-energy days

To use AI features, add your Claude API key in Settings > AI Steps.

## Tech Stack

- **React 18** — UI framework
- **Vite 5** — build tool and dev server
- **CSS Modules** — scoped component styles
- **Zustand** — state management with localStorage persistence
- **Framer Motion** — animations (fade, spring, stagger)
- **React Router v6** — client-side routing
- **Lucide React** — icons
- **Day.js** — date formatting
- **Claude API** — AI-powered habit step generation

## Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# Open http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

> **Note:** The dev server includes a proxy for the Claude API (`/api/claude` -> `api.anthropic.com`) to handle CORS. For production deployment, you'll need a backend proxy or serverless function to forward API requests.

## Project Structure

```
src/
├── components/
│   ├── habits/       # HabitCard, HabitStepList, AIPromptModal
│   ├── layout/       # AppShell, BottomNav
│   ├── ui/           # Button, Badge, Modal, ProgressBar, Toggle
│   └── widgets/      # DayLog, EnergyCheckIn, WhatNext
├── data/             # prebuiltHabits.js
├── hooks/            # useHabitProgress, useTheme, useWhatNext, useLocalStorage
├── pages/            # Home, HabitDetail, Habits, HabitForm, Settings
├── services/         # claudeApi.js (AI step generation)
├── store/            # habitsStore, progressStore, settingsStore
├── styles/           # global.css, theme.css, typography.css
└── utils/            # habitHelpers.js, suggestions.js
```

## Accessibility

- All interactive elements meet the 44x44px minimum touch target size
- Full keyboard navigation with `:focus-visible` outlines
- ARIA roles: `dialog`, `switch`, `checkbox`, `progressbar`
- Screen reader labels on all icon-only buttons
- Focus trap in the Energy Check-In modal

## License

MIT
