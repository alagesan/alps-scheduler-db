# ALPS DB Based Scheduler - Implementation Summary

## Project Overview

A complete task scheduling and management system for ALPS Residency Madurai using Google Sheets as the database backend. The system consists of three microservices deployed in Docker containers.

## What Was Implemented

### 1. Spring Boot API Application

**Location**: `api-app/`

**Features**:
- RESTful API with four endpoint categories:
  - **Auth APIs** (`/api/auth/*`) - Google OAuth token verification, JWT issuance
  - **Schedule APIs** (`/api/schedule/*`) - Date-based task retrieval
  - **Master APIs** (`/api/master/*`) - Task definition CRUD operations
  - **User APIs** (`/api/users/*`) - User management CRUD operations
- Google Sheets integration for real-time data access
- Named Ranges support for departments, frequencies, roles, and statuses
- Spring Security with JWT authentication
- Role-based access control (Admin/Staff)
- CORS enabled for PWA access

**Auth Endpoints**:
```
POST /api/auth/google                - Verify Google ID token and get JWT
```

**Schedule Endpoints** (JWT required):
```
GET /api/schedule/today              - Today's tasks
GET /api/schedule/date/{date}        - Tasks for specific date
GET /api/schedule/week               - Current week's tasks
GET /api/schedule/week/{date}        - Week tasks from date
GET /api/schedule/month/{year}/{month}
GET /api/schedule/quarter/{year}/{quarter}
GET /api/schedule/half-year/{year}/{half}
GET /api/schedule/year/{year}
GET /api/schedule/range?start=&end=
GET /api/schedule/today/department/{dept}
```

**Master Endpoints** (JWT required):
```
GET    /api/master/tasks             - All task definitions
GET    /api/master/tasks/{rowNumber} - Single task by row
POST   /api/master/tasks             - Create new task
PUT    /api/master/tasks/{rowNumber} - Update task
DELETE /api/master/tasks/{rowNumber} - Delete task
GET    /api/master/departments       - All departments (from Named Range)
GET    /api/master/frequencies       - All frequencies (from Named Range)
GET    /api/master/tasks/department/{dept}
GET    /api/master/tasks/frequency/{freq}
```

**User Endpoints** (JWT required, Admin only):
```
GET    /api/users                    - All users
GET    /api/users/{rowNumber}        - Single user by row
GET    /api/users/email/{email}      - User by email
POST   /api/users                    - Create new user
PUT    /api/users/{rowNumber}        - Update user
DELETE /api/users/{rowNumber}        - Delete user
GET    /api/users/statuses           - All statuses (from Named Range)
GET    /api/users/roles              - All roles (from Named Range)
GET    /api/users/status/{status}    - Users by status
GET    /api/users/role/{role}        - Users by role
```

**Key Files**:
- `ApiApplication.java` - Main application
- `AuthController.java` - Google OAuth + JWT endpoints
- `ScheduleController.java` - Schedule endpoints
- `TaskMasterController.java` - Master CRUD endpoints
- `UserController.java` - User management endpoints
- `TaskSchedulerService.java` - Business logic
- `GoogleSheetsService.java` - Google Sheets API integration
- `UserService.java` - User management logic
- `JwtUtil.java` - JWT generation/validation
- `JwtAuthenticationFilter.java` - JWT request filter
- `SecurityConfig.java` - Spring Security configuration
- `Dockerfile` - Multi-stage build

---

### 2. Spring Boot Batch Application

**Location**: `batch-app/`

**Features**:
- Scheduled email notifications at 7:00 AM and 7:00 PM IST
- Manual email trigger via API
- Beautiful HTML email templates with:
  - Today's tasks grouped by department
  - Complete weekly schedule
- Google Sheets integration for real-time data

**Key Files**:
- `BatchApplication.java` - Main application
- `DailyScheduler.java` - Cron job configuration
- `EmailService.java` - Email sending logic
- `TaskSchedulerService.java` - Task filtering by date/frequency
- `GoogleSheetsService.java` - Google Sheets API integration
- `BatchController.java` - Batch control APIs
- `daily-schedule-email.html` - HTML email template
- `Dockerfile` - Multi-stage build

---

### 3. React PWA Application + Nginx Reverse Proxy

**Location**: `pwa-app/`

**Features**:
- **Nginx Reverse Proxy** - Single entry point for all services
- **Google OAuth Authentication** - Sign in with Google
- **JWT-based API Security** - All API calls authenticated
- **Role-based Access Control** - Admin and Staff roles
- Modern, responsive Material-inspired UI
- **Dropdown navigation menu** (☰) with links to:
  - Home (PWA Task Viewer) - All users
  - Batch Control - Admin only
  - Manage Task Master - Admin only (with filters & search)
  - Manage Users - Admin only (with filters & search)
  - Test API - Admin only
- **React Router** for client-side navigation
- Three navigation tabs on Home:
  - **Today** - View today's tasks
  - **Week** - View weekly tasks
  - **Search** - Search tasks by specific date
- Department filter dropdown
- Task count summary
- Color-coded frequency badges
- Progressive Web App capabilities
- Mobile-responsive design

**Page Components**:
| Page | Route | Access | Features |
|------|-------|--------|----------|
| Home | `/` | All Users | Today/Week/Search tabs, department filter |
| Batch Control | `/batch` | Admin | Send emails, view status |
| Task Master | `/master` | Admin | CRUD with department/frequency filters, search, stats |
| Users | `/users` | Admin | CRUD with status/role filters, email search, stats |
| API Test | `/api-test` | Admin | Interactive API testing |

**Reverse Proxy Routes**:
| URL Pattern | Routes To | Description |
|-------------|-----------|-------------|
| `/` | React SPA | All UI pages (client-side routing) |
| `/api/auth/*` | API App | Authentication APIs |
| `/api/schedule/*` | API App | Schedule APIs |
| `/api/master/*` | API App | Master CRUD APIs |
| `/api/users/*` | API App | User Management APIs |
| `/api/batch/*` | Batch App | Batch control APIs |

**Key Files**:
- `App.js` - Main React component with React Router
- `App.css` - Modern Material-inspired styling
- `index.js` - BrowserRouter + GoogleOAuthProvider setup
- `services/api.js` - Axios with JWT interceptors
- `context/AuthContext.js` - Authentication state management
- `components/Login.js` - Google Sign-In component
- `pages/Home.js` - Task viewer (Today/Week/Search)
- `pages/TaskMaster.js` - Task CRUD with filters & stats
- `pages/Users.js` - User management with filters & stats
- `pages/BatchControl.js` - Email batch control
- `pages/ApiTest.js` - Interactive API testing
- `pages/AdminPages.css` - Shared admin page styles
- `manifest.json` - PWA configuration
- `nginx.conf` - Reverse proxy + SPA routing
- `Dockerfile` - Multi-stage build with nginx

---

### 4. Google Sheets Integration

**Database**: Google Sheets with `Tasks-Master` and `Users` sheets

**Features**:
- Real-time CRUD operations via Google Sheets API v4
- Service Account authentication
- Named Ranges support for:
  - `Departments` - Controlled department list
  - `Frequencies` - Controlled frequency list
  - `Roles` - User roles (Admin, Staff)
  - `UserStatuses` - User statuses (Enabled, Disabled)
- Fallback to unique values from data if Named Ranges don't exist

**Tasks-Master Sheet Structure**:
| Column | Field | Description |
|--------|-------|-------------|
| A | Activity | Task description |
| B | Dept | Department name |
| C | Frequency | Daily/Weekly/Monthly/Quarterly/Half-Yearly/Yearly |
| D | NoOfTimes | Occurrences per period |
| E | Specific Dates | Exact dates for yearly tasks |
| F | Comments | Additional scheduling instructions |

**Users Sheet Structure**:
| Column | Field | Description |
|--------|-------|-------------|
| A | Email | User's Google email |
| B | Status | Enabled/Disabled |
| C | Role | Admin/Staff |

---

### 5. Task Scheduling Logic

Implemented comprehensive scheduling logic for all frequency types:

**Daily Tasks**:
- Every day
- Specific days (e.g., "Every Monday and Thursday")

**Weekly Tasks**:
- Specific weekdays (e.g., "Sunday and Wednesday")
- Week starts on Sunday

**Monthly Tasks**:
- First day of every month
- Custom monthly patterns

**Quarterly Tasks**:
- Jan 1, Apr 1, Jul 1, Oct 1

**Half-Yearly Tasks**:
- January 1 and June 1 (or July 1)
- Customizable via comments

**Yearly Tasks**:
- Specific dates (e.g., "October 1", "December 1")

---

### 6. Docker Deployment

**Files**:
- `docker-compose.yml` - Orchestrates all 3 services
- `batch-app/Dockerfile` - Batch app containerization
- `api-app/Dockerfile` - API app containerization
- `pwa-app/Dockerfile` - PWA with nginx
- `.env` - Configuration (Google Sheets, Email)
- `credentials.json` - Google Service Account credentials

**Container Names**:
- `alps-db-scheduler-api` - API service
- `alps-db-scheduler-batch` - Batch service
- `alps-db-scheduler-pwa` - PWA service

**Port Mappings**:
- PWA: 3000 → 80 (main entry point, all traffic routed through here)
- API: Internal only (accessed via nginx proxy)
- Batch: Internal only (accessed via nginx proxy)

**Features**:
- **Nginx reverse proxy** for unified access through port 3000
- DNS configuration for Google API access (8.8.8.8, 8.8.4.4)
- Credentials mounted as read-only volume
- Network configuration for inter-service communication
- Health checks for API
- Auto-restart policies

---

## Technology Stack

### Backend
- Java 17
- Spring Boot 3.2.0
- Spring Security with JWT (jjwt library)
- Spring Scheduler (Cron)
- Spring Mail (SMTP)
- Google Sheets API v4
- Google OAuth 2.0 token verification
- Lombok
- Thymeleaf (Email templates)

### Frontend
- React 19
- React Router DOM v7
- @react-oauth/google (Google Sign-In)
- Axios (HTTP client with JWT interceptors)
- date-fns (Date utilities)
- PWA features (Service Worker, Manifest)

### DevOps
- Docker (Multi-stage builds)
- Docker Compose
- Nginx (Production web server)
- Maven (Java builds)
- npm (Node builds)

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              Google Sheets (Database)                │
│         Tasks-Master  |  Users                       │
│   Named Ranges: Departments, Frequencies, Roles,     │
│                 UserStatuses                         │
└─────────────────────┬───────────────────────────────┘
                      │ Google Sheets API v4
         ┌────────────┴────────────┐
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│  Batch App      │       │   API App       │
│  (Internal)     │       │  (Internal)     │
│ • Cron Jobs     │       │ • Auth APIs     │
│ • Email Sender  │       │ • Schedule APIs │
│ • 7 AM/PM IST   │       │ • Master APIs   │
│ • Batch APIs    │       │ • User APIs     │
│                 │       │ • JWT Security  │
└────────┬────────┘       └────────┬────────┘
         │                         │
         └────────────┬────────────┘
                      │
              ┌───────▼───────┐
              │   PWA App     │
              │  (Port 3000)  │
              │ • Nginx Proxy │
              │ • React SPA   │
              │ • All Admin UI│
              │ • Google OAuth│
              │ • Role-based  │
              │   Access      │
              └───────────────┘
                      │
              All Traffic via
              http://localhost:3000
```

**Access URLs through Nginx Proxy:**
- `/` → React SPA (Home - Task Viewer)
- `/batch` → React SPA (Batch Control - Admin only)
- `/master` → React SPA (Task Master with filters - Admin only)
- `/users` → React SPA (User Management with filters - Admin only)
- `/api-test` → React SPA (API Test Page - Admin only)
- `/api/auth/*` → API App (Authentication endpoints)
- `/api/schedule/*` → API App (Schedule endpoints)
- `/api/master/*` → API App (Master CRUD endpoints)
- `/api/users/*` → API App (User management endpoints)
- `/api/batch/*` → Batch App (Batch control APIs)

---

## Key Features Implemented

- **Google OAuth Authentication** - Secure sign-in with Google accounts
- **JWT-based API Security** - All API calls authenticated with JWT tokens
- **Role-based Access Control** - Admin and Staff roles with different permissions
- **User Management** - Full CRUD with filters (status, role) and email search
- **Unified React SPA** - All admin pages in single React application
- **React Router** - Client-side navigation for smooth user experience
- **Nginx Reverse Proxy** - Unified access through single port (3000)
- **Dropdown Navigation Menu** - Easy access to all features from any page
- Automated email scheduling (7 AM & 7 PM IST)
- Beautiful HTML email templates
- RESTful API with Auth, Schedule, Master, and User endpoints
- Google Sheets as database backend (Tasks-Master + Users sheets)
- Named Ranges for controlled dropdowns (departments, frequencies, roles, statuses)
- Task Master Management UI with filters (department, frequency) and search
- Progressive Web App (PWA)
- Three-tab navigation (Today/Week/Search)
- Department filter
- Stats bars on admin pages showing counts
- 6 frequency types (Daily to Yearly)
- Docker containerization
- Health checks
- Responsive mobile design
- Comprehensive documentation

---

## Testing Checklist

- [ ] Open http://localhost:3000
- [ ] Google Sign-In button appears
- [ ] Sign in with enabled Admin user
- [ ] Dropdown menu (☰) opens and shows all 5 navigation items (Admin)
- [ ] Navigate to all pages via dropdown menu
- [ ] PWA Today tab shows current tasks
- [ ] PWA Week tab shows weekly tasks
- [ ] PWA Search tab allows date selection
- [ ] PWA Department filter works
- [ ] Task Master page loads with filters and stats at `/master`
- [ ] Task Master filters (department, frequency) work
- [ ] Task Master search works
- [ ] Task Master CRUD operations work
- [ ] Users page loads with filters and stats at `/users`
- [ ] Users filters (status, role) work
- [ ] Users email search works
- [ ] Users CRUD operations work
- [ ] Batch Control works at `/batch`
- [ ] API Test page works at `/api-test`
- [ ] JWT token auto-included in API requests
- [ ] Email sends at 7 AM IST
- [ ] Email sends at 7 PM IST
- [ ] Email contains today's tasks
- [ ] Email contains weekly schedule
- [ ] Tasks and Users sync with Google Sheets in real-time
- [ ] Staff user only sees Home menu item
- [ ] Docker containers auto-restart
- [ ] Mobile responsive design works

---

## Summary

Successfully implemented a complete, production-ready task scheduling system with:
- **3 microservices** (Batch, API, PWA)
- **Google OAuth Authentication** - Secure login with Google accounts
- **JWT-based API Security** - All endpoints protected
- **Role-based Access Control** - Admin and Staff roles
- **Unified React SPA** - All admin pages in single application
- **React Router** - Client-side navigation
- **Nginx Reverse Proxy** - All access through single port (3000)
- **Dropdown Navigation** - Consistent menu across all pages
- **Google Sheets database** (real-time sync for tasks and users)
- **Docker deployment**
- **Automated emails** (2x daily)
- **Modern web interface** with Material design
- **Task Master Management** with filters, search, and stats
- **User Management** with filters, search, and stats
- **Comprehensive documentation**

System is ready for deployment!
