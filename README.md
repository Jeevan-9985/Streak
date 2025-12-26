# 🔥 Streak App

A production-ready streak maintenance web application for tracking habits and challenges. Built with real-time Firebase backend, featuring analytics, calendar, and PDF exports.

## 🌐 Live Demo

**[https://jeevan-9985.github.io/Streak/](https://jeevan-9985.github.io/Streak/)**

## ✨ Features

### Core Features
- ✅ Real-time Firebase Authentication (email + password)
- ✅ Real-time Firestore database for persistent storage
- ✅ Create and manage multiple streaks (habits/challenges)
- ✅ Manual "Mark Done" button for daily completion
- ✅ Current streak calculated based on consecutive days
- ✅ Longest streak tracking (personal best)
- ✅ Undo today's completion
- ✅ Streak resets when a day is missed
- ✅ Data persists across devices and browsers

### Analytics & Heatmap
- ✅ GitHub-style 365-day activity heatmap
- ✅ Color intensity based on daily completions
- ✅ Hover tooltips showing date and count
- ✅ Comprehensive statistics dashboard
- ✅ Weekly and monthly completion tracking

### Calendar & Events
- ✅ Full monthly calendar view
- ✅ Create, edit, and delete events
- ✅ Visual completion indicators on calendar
- ✅ Upcoming events list
- ✅ Click any date to add events

### PDF Export
- ✅ Professional PDF reports with cover page
- ✅ Summary statistics
- ✅ Streak performance details
- ✅ Recent activity log
- ✅ Downloadable report

### UI/UX
- ✅ Light & Dark mode with WCAG-compliant colors
- ✅ Confetti animations on streak completion
- ✅ Mobile responsive design
- ✅ Toast notifications for feedback
- ✅ Smooth transitions and hover effects

## 🛠 Tech Stack

- **Frontend:** React 19 + Vite
- **Styling:** Tailwind CSS 4
- **Backend:** Firebase (Auth + Firestore)
- **Routing:** React Router 7
- **PDF:** jsPDF + jsPDF-AutoTable
- **Date Handling:** date-fns
- **Animations:** canvas-confetti
- **Notifications:** React Hot Toast

## 🚀 Setup

### 1. Clone the repository

```bash
git clone https://github.com/Jeevan-9985/Streak.git
cd Streak
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase (Required)

This app requires Firebase configuration. It will NOT work without proper Firebase credentials.

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password authentication in the Authentication section
3. Create a Firestore database
4. Copy `.env.example` to `.env` and fill in your Firebase credentials:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📦 Deployment

The app is configured for automatic deployment to GitHub Pages:

1. Go to your repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Add your Firebase credentials as repository secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Push to main branch or manually trigger the workflow

## 🔥 How Streaks Work

Based on research of GitHub, Duolingo, LeetCode, and GeeksForGeeks streak systems:

- Each streak stores an array of completed dates (YYYY-MM-DD format)
- Current streak is **derived** from completed dates, not stored
- Streak counts if user completed today OR yesterday (grace period)
- Missing more than one day resets the streak to 0
- Longest streak is tracked separately for personal best
- Users must manually click "Mark Done" to complete today
- Double completion for the same date is prevented
- Undo removes today from completed dates (only works for today)
- All date handling uses local time (timezone-safe)

## 📊 Data Model

```
users (managed by Firebase Auth)
  - id
  - email

streaks (Firestore collection)
  - id
  - userId
  - title
  - completedDates[]  (array of YYYY-MM-DD strings)
  - createdAt

events (Firestore collection)
  - id
  - userId
  - title
  - description
  - date
  - createdAt
```

## 🚫 What's NOT Included

- ❌ Demo Mode - Completely removed
- ❌ localStorage fallbacks - No local data storage for streaks
- ❌ Test credentials - No fake/demo accounts
- ❌ Offline-only logic - Requires real backend

## 📄 License

MIT
