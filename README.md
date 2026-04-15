# CS4135 Group Project — Frontend

## Overview

This repository contains the **React frontend** for the **SkillSwap platform**, a skill-sharing system where users can act as both students and tutors. The frontend communicates with the [CS4135Backend](https://github.com/beck2745/CS4135Backend) via RESTful APIs and provides distinct dashboards for Students, Tutors, and Admins.

---

## Tech Stack

- **React 19** (via Vite)
- **Vite 7** — dev server and build tooling
- **Axios** — HTTP client for API communication
- **Recharts** — charting library used in the Admin dashboard
- **ESLint** — linting with React-specific rules

---

## Project Structure

```
CS4135GroupProjectFrontEnd/
└── group-app/
    ├── src/
    │   ├── api/            # Axios API modules per domain
    │   ├── components/     # Reusable UI components
    │   ├── context/        # Auth context (AuthContext, AuthProvider, useAuth)
    │   ├── data/           # Static/mock data
    │   ├── pages/          # Page-level components and routing
    │   ├── styles/         # Global and component styles
    │   └── test/           # Frontend tests
    ├── public/
    ├── index.html
    ├── vite.config.js
    └── package.json
```

### API Modules (`src/api/`)

| File              | Responsibility                                 |
| ----------------- | ---------------------------------------------- |
| `authAPI.js`      | Login and registration                         |
| `userAPI.js`      | General user profile operations                |
| `studentAPI.js`   | Student profile management                     |
| `tutorAPI.js`     | Tutor profile and skill management             |
| `bookingAPI.js`   | Session booking CRUD                           |
| `messagingAPI.js` | Message threads and sending/receiving messages |
| `reviewAPI.js`    | Tutor reviews and ratings                      |
| `adminAPI.js`     | Admin reporting and moderation                 |
| `baseURL.js`      | Shared Axios base URL configuration            |

### Pages (`src/pages/`)

| Page                  | Role                                                |
| --------------------- | --------------------------------------------------- |
| `LoginPage.jsx`       | Unauthenticated entry point — login form            |
| `RegisterPage.jsx`    | New user registration                               |
| `DashboardLayout.jsx` | Shared shell/nav wrapper for authenticated users    |
| `StudentProfile.jsx`  | Student home — view and edit student profile        |
| `TutorProfile.jsx`    | Tutor home — view and edit tutor profile and skills |
| `SearchPage.jsx`      | Student view — search and filter tutors by skill    |
| `BookingSession.jsx`  | Student view — book a session with a tutor          |
| `StudentBookings.jsx` | Student view — manage existing bookings             |
| `TutorBookings.jsx`   | Tutor view — review and respond to booking requests |
| `TutorSchedule.jsx`   | Tutor view — manage availability/schedule           |
| `MessageInbox.jsx`    | Shared — message inbox                              |
| `MessagingPage.jsx`   | Shared — full messaging thread view                 |
| `AdminDashboard.jsx`  | Admin view — reports, moderation, audit logs        |

### Components (`src/components/`)

| Component                    | Purpose                                    |
| ---------------------------- | ------------------------------------------ |
| `ReportsPanel.jsx`           | Admin list of submitted reports            |
| `ReportModal.jsx`            | Modal for reviewing a single report        |
| `ReportedContentPreview.jsx` | Preview of reported content                |
| `BlockedContentPanel.jsx`    | Admin panel for blocked content management |
| `ReportCharts.jsx`           | Charts visualising report statistics       |

---

## Features

### Authentication & Roles

- Login and registration with JWT-based sessions
- Role-based routing: **Student**, **Tutor**, and **Admin** each land on their own dashboard
- Auth state managed globally via React Context (`AuthProvider`)

### Student Features

- View and edit student profile
- Search and filter tutors by skill
- Book a session with a tutor
- View and manage bookings (cancel, track status)
- Message tutors directly

### Tutor Features

- View and edit tutor profile and listed skills
- Review incoming booking requests (approve / reject / complete)
- Manage schedule and availability
- Message students directly

### Admin Features

- View and action user-submitted reports
- Block / unblock reported content
- Visualise report trends via charts

---

## Getting Started

### Prerequisites

- Node.js 18+
- The [CS4135Backend](https://github.com/beck2745/CS4135Backend) running locally on port `8080`

### Install and Run

```bash
git clone https://github.com/Maeve-Bray/CS4135GroupProjectFrontEnd.git
cd CS4135GroupProjectFrontEnd/group-app
npm install
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Build for Production

```bash
npm run dev
```



---

## Backend

This frontend is connected to the **SkillSwap backend**. See the [CS4135Backend README](https://github.com/beck2745/CS4135Backend) for setup instructions. The backend exposes REST APIs for identity, booking, messaging, tutor profiles, and admin services.
