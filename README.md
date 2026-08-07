# TypeMaster — Modern Typing Learning Website

A premium, fully responsive typing practice & learning platform built with **Next.js 16 + React 19 + TypeScript + Tailwind CSS v4**.

Inspired by Monkeytype and TypeRacer, with structured learning paths, advanced statistics, glassmorphism UI, dark/light mode, and more.

## Features Implemented

### Core
- **Home** – Hero, feature grid, live stats preview, CTA
- **Expert Mode** – Timed tests (15/30/60/120s), live WPM/Accuracy/Time/Mistakes
- **Full stats on finish** – WPM, CPM, Accuracy, Correct/Wrong Words, Mistakes, Characters, Backspaces
- **Practice** – Linked from Learn lessons
- **Learn** – 10 structured lesson cards (Home Row → Code)
- **Dashboard** – Total tests, practice time, avg/highest WPM, accuracy, XP, level, streak, achievements, recent tests
- **Leaderboard** – Ranked list with Daily/Weekly/Monthly/All-Time filters (mock data)
- **Profile** – Avatar, bio, country, stats, achievements, recent tests
- **Settings** – Theme (light/dark/system), font size/family, cursor style, punctuation/numbers toggles, sound settings
- **Login** – Demo login (Google/GitHub placeholders + guest)

### UI / UX
- Glassmorphism cards & panels
- Dark / Light / System theme with persistent store
- Responsive navbar (desktop + mobile)
- Modern mono typography for typing area
- Letter-by-letter highlighting (correct / incorrect / current caret)
- Restart, Next Test, Save, Share buttons

### Architecture
- Zustand stores (`useSettingsStore`, `useUserStore`) with localStorage persistence
- Clean component structure (`components/ui`, `components/typing`, `components/layout`)
- Typed with TypeScript
- Utility helpers for WPM/CPM/Accuracy

## Getting Started

```bash
cd typing-master
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home
│   ├── expert/page.tsx
│   ├── learn/page.tsx
│   ├── practice/page.tsx
│   ├── dashboard/page.tsx
│   ├── leaderboard/page.tsx
│   ├── profile/page.tsx
│   ├── settings/page.tsx
│   ├── login/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── layout/Navbar.tsx
│   ├── typing/TypingTest.tsx  # Core engine
│   └── ui/button.tsx
├── store/
│   ├── useSettingsStore.ts
│   └── useUserStore.ts
├── lib/
│   ├── utils.ts
│   └── words.ts
└── types/index.ts
```

## Extending (Recommended Next Steps)

1. **Backend** – Add Supabase or Firebase for real auth, database, and storage.
2. **Multiplayer** – Socket.IO rooms + live progress bars.
3. **Charts** – Recharts for weekly/monthly progress on Dashboard.
4. **Certificates** – jsPDF for milestone certificates.
5. **PWA** – next-pwa + offline word lists.
6. **AI Lessons** – Generate personalized drills.
7. **Keyboard Heatmap** – Track per-key accuracy.
8. **Framer Motion** – Re-add for polished page transitions & confetti on personal bests.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Zustand
- Lucide React
- clsx + tailwind-merge

---

Built as a production-ready foundation. Happy typing! ⌨️
