# 🔥 Streak App

A clean, minimal streak maintenance web application for tracking habits and challenges.

## 🌐 Live Demo

**[https://jeevan-9985.github.io/Streak/](https://jeevan-9985.github.io/Streak/)**

## Features

- ✅ User authentication (email + password)
- ✅ Create and manage streaks (habits/challenges)
- ✅ Manual "Mark Done" button for daily completion
- ✅ Automatic streak calculation based on consecutive days
- ✅ Undo today's completion
- ✅ Streak resets when a day is missed
- ✅ Light & Dark mode
- ✅ Mobile responsive design
- ✅ Toast notifications for feedback

## Tech Stack

- React + Vite
- Tailwind CSS
- Firebase (Authentication & Firestore)
- React Router
- React Hot Toast

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Jeevan-9985/Streak.git
cd Streak
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

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

## Deployment

The app is configured for automatic deployment to GitHub Pages. To deploy:

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

## How Streaks Work

A streak is NOT a counter - it's derived from completed dates:

- Each streak stores an array of completed dates (YYYY-MM-DD format)
- Current streak is calculated by checking consecutive days ending today
- Missing a day resets the streak to 0
- Users must manually click "Mark Done" to complete today
- Double completion for the same date is prevented
- Undo removes today from completed dates and recalculates the streak
- All date handling uses local time (no UTC bugs)

## License

MIT
