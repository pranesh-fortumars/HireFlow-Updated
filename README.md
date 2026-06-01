# HireFlow Glass 🌟

HireFlow is a next-generation Applicant Tracking System (ATS) and Recruitment Management Platform featuring a premium, glassmorphism-inspired UI. It provides comprehensive role-based access for HR Executives, Interviewers, and System Administrators.

## ✨ Key Features

- **Triple-Tier Role Architecture**: Dedicated, secure views and dashboards specifically tailored for Admin, HR, and Interviewers.
- **Real-Time Data Sync**: Powered by Firebase Firestore, ensuring that schedules, notifications, and candidate tracking statuses update instantaneously across devices.
- **Advanced Candidate Profile Hub**: A 4-tab workflow (Overview, Documents, Interviews, Timeline) mapping the full recruitment lifecycle.
- **Automated Interview Coordination**: Integrated Google Meet tracking, automated email triggers, and robust "Domain Knowledge" evaluation rubrics for structured interviewer feedback.
- **Executive Analytics Engine**: Rich `Recharts`-powered dashboard calculating funnel dropout rates, role distribution, and conversion matrices.
- **Global Notification Center**: Framer Motion-powered real-time alert system.
- **Audit Trails**: Security-first tracking of all critical system modifications by user and timestamp.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Storage, Authentication)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix Primitives)
- **Data Visualization**: [Recharts](https://recharts.org/)

## 🚀 Getting Started

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Setup (Firebase)
By default, the application runs a `MOCK_MODE` fallback in `src/lib/store.ts` for instant UI testing without backend config.
To connect real data, ensure your `src/lib/firebase.ts` contains your valid config, update your Firestore Security Rules, and change `MOCK_MODE` to `false`.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:9002](http://localhost:9002) in your browser.

## 🧪 Testing Accounts (Mock Mode)

When Firebase Auth is bypassed in testing, you can use these mock emails to test role routing (Password: `123456`):
- **Admin**: `admin@company.com`
- **HR Executive**: `hr@company.com`
- **Interviewer**: `interviewer@company.com`

## 📦 Building for Production

Compile an optimized production build:
```bash
npm run build
npm start
```
*(Ensure all background dev servers are stopped before running build on Windows)*
