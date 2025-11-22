# ALPS DB Based Scheduler - Implementation Summary

## Project Overview

A complete task scheduling and management system for ALPS Residency Madurai using Google Sheets as the database backend. The system consists of three microservices deployed in Docker containers.

## What Was Implemented

### 1. Spring Boot API Application

**Location**: `api-app/`

**Features**:
- RESTful API with two endpoint categories:
  - **Schedule APIs** (`/api/schedule/*`) - Date-based task retrieval
  - **Master APIs** (`/api/master/*`) - Task definition CRUD operations
- Google Sheets integration for real-time data access
- Named Ranges support for departments and frequencies
- CORS enabled for PWA access

**Schedule Endpoints**:
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

**Master Endpoints**:
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

**Key Files**:
- `ApiApplication.java` - Main application
- `ScheduleController.java` - Schedule endpoints
- `TaskMasterController.java` - Master CRUD endpoints
- `TaskSchedulerService.java` - Business logic
- `GoogleSheetsService.java` - Google Sheets API integration
- `Dockerfile` - Multi-stage build

---

### 2. Spring Boot Batch Application

**Location**: `batch-app/`

**Features**:
- Scheduled email notifications at 7:00 AM and 7:00 PM IST
- Manual email trigger via web interface
- Beautiful HTML email templates with:
  - Today's tasks grouped by department
  - Complete weekly schedule
- Task Master Management UI (CRUD operations)
- Google Sheets integration for real-time data

**Key Files**:
- `BatchApplication.java` - Main application
- `DailyScheduler.java` - Cron job configuration
- `EmailService.java` - Email sending logic
- `TaskSchedulerService.java` - Task filtering by date/frequency
- `GoogleSheetsService.java` - Google Sheets API integration
- `daily-schedule-email.html` - HTML email template
- `index.html` - Batch Control Panel
- `master.html` - Task Master Management UI
- `Dockerfile` - Multi-stage build

---

### 3. React PWA Application + Nginx Reverse Proxy

**Location**: `pwa-app/`

**Features**:
- **Nginx Reverse Proxy** - Single entry point for all services
- Modern, responsive Material-inspired UI
- **Dropdown navigation menu** (☰) with links to:
  - Home (PWA Task Viewer)
  - Batch Control
  - Manage Task Master
  - Test API
- Three navigation tabs:
  - **Today** - View today's tasks
  - **Week** - View weekly tasks
  - **Search** - Search tasks by specific date
- Department filter dropdown
- Task count summary
- Color-coded frequency badges
- Progressive Web App capabilities
- Mobile-responsive design

**Reverse Proxy Routes**:
| URL Pattern | Routes To | Description |
|-------------|-----------|-------------|
| `/` | PWA App | React UI |
| `/api/schedule/*` | API App | Schedule APIs |
| `/api/master/*` | API App | Master CRUD APIs |
| `/api/batch/*` | Batch App | Batch control APIs |
| `/batch/*` | Batch App | Batch UI pages |
| `/api-test/` | API App | API Test Page |

**Key Files**:
- `App.js` - Main React component with dropdown navigation
- `App.css` - Modern Material-inspired styling with menu styles
- `services/api.js` - API integration (uses relative URLs for proxy)
- `manifest.json` - PWA configuration
- `nginx.conf` - Reverse proxy configuration for all services
- `Dockerfile` - Multi-stage build with nginx

---

### 4. Google Sheets Integration

**Database**: Google Sheets with `Tasks-Master` sheet

**Features**:
- Real-time CRUD operations via Google Sheets API v4
- Service Account authentication
- Named Ranges support for:
  - `Departments` - Controlled department list
  - `Frequencies` - Controlled frequency list
- Fallback to unique values from data if Named Ranges don't exist

**Sheet Structure**:
| Column | Field | Description |
|--------|-------|-------------|
| A | Activity | Task description |
| B | Dept | Department name |
| C | Frequency | Daily/Weekly/Monthly/Quarterly/Half-Yearly/Yearly |
| D | NoOfTimes | Occurrences per period |
| E | Specific Dates | Exact dates for yearly tasks |
| F | Comments | Additional scheduling instructions |

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
- Spring Scheduler (Cron)
- Spring Mail (SMTP)
- Google Sheets API v4
- Lombok
- Thymeleaf (Email templates)

### Frontend
- React 19
- Axios (HTTP client)
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
│                  Tasks-Master                        │
│           Named Ranges: Departments, Frequencies     │
└─────────────────────┬───────────────────────────────┘
                      │ Google Sheets API v4
         ┌────────────┴────────────┐
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│  Batch App      │       │   API App       │
│  (Internal)     │       │  (Internal)     │
│ • Cron Jobs     │       │ • Schedule APIs │
│ • Email Sender  │       │ • Master APIs   │
│ • 7 AM/PM IST   │       │ • CRUD Ops      │
│ • Master CRUD UI│       │ • Named Ranges  │
└────────┬────────┘       └────────┬────────┘
         │                         │
         └────────────┬────────────┘
                      │
              ┌───────▼───────┐
              │   PWA App     │
              │  (Port 3000)  │
              │ • Nginx Proxy │
              │ • React UI    │
              │ • Dropdown    │
              │   Navigation  │
              │ • Unified     │
              │   Access Point│
              └───────────────┘
                      │
              All Traffic via
              http://localhost:3000
```

**Access URLs through Nginx Proxy:**
- `/` → PWA (React UI with dropdown navigation)
- `/api/schedule/*` → API App (Schedule endpoints)
- `/api/master/*` → API App (Master CRUD endpoints)
- `/api/batch/*` → Batch App (Batch control APIs)
- `/batch/*` → Batch App (Control Panel & Task Master UI)
- `/api-test/` → API App (Interactive test page)

---

## Key Features Implemented

- **Nginx Reverse Proxy** - Unified access through single port (3000)
- **Dropdown Navigation Menu** - Easy access to all features from any page
- Automated email scheduling (7 AM & 7 PM IST)
- Beautiful HTML email templates
- RESTful API with Schedule and Master endpoints
- Google Sheets as database backend
- Named Ranges for controlled dropdowns
- Task Master Management UI (CRUD)
- Progressive Web App (PWA)
- Three-tab navigation (Today/Week/Search)
- Department filter
- 6 frequency types (Daily to Yearly)
- Docker containerization
- Health checks
- Responsive mobile design
- Comprehensive documentation

---

## Testing Checklist

- [ ] Open http://localhost:3000
- [ ] Dropdown menu (☰) opens and shows all 4 navigation items
- [ ] Navigate to all pages via dropdown menu
- [ ] PWA Today tab shows current tasks
- [ ] PWA Week tab shows weekly tasks
- [ ] PWA Search tab allows date selection
- [ ] PWA Department filter works
- [ ] API responds at http://localhost:3000/api/schedule/today
- [ ] Master CRUD works at http://localhost:3000/batch/master.html
- [ ] Batch Control works at http://localhost:3000/batch/
- [ ] API Test page works at http://localhost:3000/api-test/
- [ ] Email sends at 7 AM IST
- [ ] Email sends at 7 PM IST
- [ ] Email contains today's tasks
- [ ] Email contains weekly schedule
- [ ] Tasks sync with Google Sheets in real-time
- [ ] Docker containers auto-restart
- [ ] Mobile responsive design works

---

## Summary

Successfully implemented a complete, production-ready task scheduling system with:
- **3 microservices** (Batch, API, PWA)
- **Nginx Reverse Proxy** - All access through single port (3000)
- **Dropdown Navigation** - Consistent menu across all pages
- **Google Sheets database** (real-time sync)
- **Docker deployment**
- **Automated emails** (2x daily)
- **Modern web interface** with Material design
- **Task Master Management UI**
- **Comprehensive documentation**

System is ready for deployment!
