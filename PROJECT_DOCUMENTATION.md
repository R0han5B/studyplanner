# AI Study Planner, Productivity Coach, and Career Development Platform

A production-ready SaaS application similar to Notion, Linear, or Stripe dashboards.

## 🚀 Features

### Core Modules

1. **AI Study Planner** - AI-powered study scheduling with calendar integration
2. **Task Manager** - Drag-and-drop task management with filtering
3. **Productivity Tracker** - Pomodoro timer and focus session tracking
4. **AI Insights** - AI-powered recommendations and learning analysis
5. **Analytics Dashboard** - Comprehensive charts and progress tracking
6. **Settings** - User profile, theme, and preferences management

### UI/UX Features

- ✅ Modern SaaS-style dashboard design
- ✅ Dark/Light mode with system preference
- ✅ Smooth Framer Motion animations
- ✅ Responsive layout with collapsible sidebar
- ✅ Card-based UI with professional spacing
- ✅ Loading skeletons and error states
- ✅ Toast notifications

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main application page
│   ├── layout.tsx            # Root layout with theme provider
│   ├── globals.css           # Global styles and CSS variables
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   ├── logout/route.ts
│       │   └── me/route.ts
│       ├── tasks/route.ts
│       ├── schedule/route.ts
│       ├── productivity/route.ts
│       ├── analytics/route.ts
│       └── ai/insights/route.ts
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   └── Navbar.tsx        # Top navigation bar
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── TaskManagerPage.tsx
│   │   ├── StudyPlannerPage.tsx
│   │   ├── ProductivityPage.tsx
│   │   ├── AIInsightsPage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   └── SettingsPage.tsx
│   └── ui/                   # Shadcn UI components
├── lib/
│   ├── auth.ts               # JWT authentication utilities
│   ├── api.ts                # API client utilities
│   ├── db.ts                 # Prisma client
│   └── utils.ts              # Utility functions
├── store/
│   └── useStore.ts           # Zustand global state
└── hooks/
    ├── use-mobile.ts
    └── use-toast.ts

prisma/
└── schema.prisma             # Database schema
```

## 🛠 Tech Stack

### Frontend
- **Next.js 16** with App Router
- **React 19** with TypeScript
- **TailwindCSS** for styling
- **Shadcn UI** components
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Zustand** for state management
- **dnd-kit** for drag-and-drop

### Backend
- **Next.js API Routes**
- **Prisma ORM** with SQLite (easily switchable to PostgreSQL)
- **JWT** authentication with jose library
- **bcryptjs** for password hashing

### AI Integration
- **z-ai-web-dev-sdk** for AI-powered insights

## 🗄 Database Schema

### Users
- id, email, password, name, avatar
- role, refreshToken, timezone, theme
- Relations: tasks, studySessions, productivityLogs, skills, schedules

### Tasks
- id, title, description, status, priority
- dueDate, completedAt, subject, tags
- order, estimatedMinutes, actualMinutes

### Study Sessions
- id, subject, topic, startTime, endTime
- duration, focusScore, notes, productivity

### Productivity Logs
- id, date, studyHours, tasksCompleted
- focusScore, pomodoroSessions, peakHours, mood

### Skills
- id, name, category, level, progress, targetLevel

### Schedules
- id, title, subject, startDate, endDate
- hoursPerDay, difficulty, priority, scheduleData

### Focus Sessions
- id, type, duration, startedAt, endedAt
- completed, interrupted, task

## 🔐 Authentication Flow

1. **Registration**: POST `/api/auth/register`
   - Validates email and password
   - Creates user with hashed password
   - Returns JWT tokens in HTTP-only cookies

2. **Login**: POST `/api/auth/login`
   - Validates credentials
   - Returns JWT access token (15 min) and refresh token (7 days)
   - Stores tokens in HTTP-only cookies

3. **Token Refresh**: Automatic via middleware
   - Access token expires in 15 minutes
   - Refresh token generates new access token

4. **Logout**: POST `/api/auth/logout`
   - Clears tokens from cookies and database

## 🎨 Theme System

The application supports dark/light mode:
- System preference detection
- Manual toggle in sidebar
- Persisted in localStorage via Zustand

## 📱 API Endpoints

### Authentication
```
POST /api/auth/register - Create new account
POST /api/auth/login - Authenticate user
POST /api/auth/logout - Sign out user
GET  /api/auth/me - Get current user
```

### Tasks
```
GET  /api/tasks - Get all tasks (with filters)
POST /api/tasks - Create task
PUT  /api/tasks/[id] - Update task
DELETE /api/tasks/[id] - Delete task
```

### Schedule
```
GET  /api/schedule - Get all schedules
POST /api/schedule - Generate AI schedule
```

### Productivity
```
GET  /api/productivity - Get productivity stats
POST /api/productivity - Log productivity data
```

### Analytics
```
GET  /api/analytics - Get analytics overview
```

### AI Insights
```
POST /api/ai/insights - Generate AI recommendations
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Bun (recommended) or npm

### Installation

```bash
# Install dependencies
bun install

# Set up database
bunx prisma db push

# Run development server
bun run dev
```

### Environment Variables

Create a `.env` file:
```env
DATABASE_URL="file:./db/custom.db"
JWT_SECRET="your-super-secret-key-change-in-production"
```

### Demo Account
- Email: `demo@studyai.com`
- Password: `demo12345`

## 🎯 Key Features Implemented

### Dashboard
- Welcome banner with personalized greeting
- Stats cards (study hours, tasks, streak, focus score)
- Weekly activity chart
- Subject progress bars
- Recent activity timeline
- Upcoming tasks
- AI recommendations

### Study Planner
- Interactive calendar
- AI schedule generation
- Session management
- Subject filtering
- Time-based scheduling

### Task Manager
- Drag-and-drop reordering
- Status filtering (pending, in-progress, completed)
- Priority levels with color coding
- Due date tracking with overdue detection
- Task creation dialog

### Productivity Tracker
- Pomodoro timer (25/5/15 minute cycles)
- Circular progress indicator
- Session counter
- Weekly activity heatmap
- Quick action buttons

### AI Insights
- Personalized learning recommendations
- Learning style analysis
- Subject-specific suggestions
- AI chat interface

### Analytics Dashboard
- Study hours trends
- Subject distribution pie chart
- Skill radar chart
- Completion rate tracking
- Weekly insights

### Settings
- Profile management
- Notification preferences
- Theme selection
- Pomodoro settings
- Study goals configuration

## 🔧 Configuration

### Customizing Timer Settings
Edit the `TIMER_SETTINGS` constant in `ProductivityPage.tsx`:
```typescript
const TIMER_SETTINGS = {
  work: 25 * 60,      // Focus duration
  shortBreak: 5 * 60, // Short break
  longBreak: 15 * 60, // Long break after 4 sessions
};
```

### Adding New Subjects
Update the `subjects` array in `StudyPlannerPage.tsx`:
```typescript
const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'];
```

## 🚀 Deployment

### Build for Production
```bash
bun run build
```

### Docker Support
Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
