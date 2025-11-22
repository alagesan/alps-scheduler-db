# ALPS DB Based Scheduler

A comprehensive task scheduling and management system for ALPS Residency Madurai, using **Google Sheets as the database backend**.

## Overview

This system provides:
- **Automated email notifications** at 7 AM and 7 PM IST with daily and weekly task schedules
- **REST API** for retrieving scheduled tasks and managing task definitions
- **Progressive Web App (PWA)** for viewing tasks on any device
- **Task Master Management UI** for CRUD operations on task definitions
- **User Management** with role-based access control (Admin/Staff)
- **Google OAuth Authentication** with JWT-based API security
- **Google Sheets integration** for real-time data synchronization

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
│ • Email Jobs    │       │ • Schedule APIs │
│ • Batch APIs    │       │ • Master APIs   │
│                 │       │ • User APIs     │
│                 │       │ • Auth APIs     │
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
```

### Reverse Proxy Configuration

All traffic is routed through the PWA app (port 3000) using Nginx reverse proxy:

| URL Pattern | Routes To | Description |
|-------------|-----------|-------------|
| `/` | PWA App | React SPA (all UI pages) |
| `/api/auth/*` | API App | Authentication APIs |
| `/api/schedule/*` | API App | Schedule APIs |
| `/api/master/*` | API App | Master CRUD APIs |
| `/api/users/*` | API App | User Management APIs |
| `/api/batch/*` | Batch App | Batch control APIs |

All admin UI pages (Task Master, Users, Batch Control, API Test) are now part of the React SPA and use client-side routing.

## Features

### Unified React SPA (http://localhost:3000)

All pages are part of a single React application with client-side routing:

| Menu Item | URL | Access | Description |
|-----------|-----|--------|-------------|
| Home | http://localhost:3000/ | All Users | Task Viewer with Today/Week/Search tabs |
| Batch Control | http://localhost:3000/batch | Admin Only | Email scheduling control panel |
| Manage Task Master | http://localhost:3000/master | Admin Only | Task CRUD with filters & search |
| Manage Users | http://localhost:3000/users | Admin Only | User management with filters & search |
| Test API | http://localhost:3000/api-test | Admin Only | Interactive API testing

### Authentication & Authorization
- **Google OAuth 2.0** - Sign in with Google account
- **JWT-based API Security** - All API calls authenticated with JWT tokens
- **Role-based Access Control** - Admin and Staff roles
- **User Management** - Add, edit, enable/disable users via Google Sheets
- **Session Management** - Automatic redirect to login on token expiry

### Home Page (Task Viewer)
- **Google Sign-In** - Authenticate with your Google account
- Modern Material-inspired design
- Three navigation tabs: **Today**, **Week**, **Search**
- Department filter dropdown
- Task count summary
- Color-coded frequency badges
- Mobile responsive
- **Role-based navigation** - Admin sees all menu items, Staff sees only Home

### Task Master Management (`/master`)
- Full CRUD operations for task definitions
- **Filter by Department** - Dropdown with all departments
- **Filter by Frequency** - Dropdown with all frequencies
- **Search** - Search by activity name or comments
- **Stats Bar** - Shows total tasks, departments count, and filtered count
- Modal forms for add/edit operations

### User Management (`/users`)
- Full CRUD operations for user accounts
- **Filter by Status** - Enabled/Disabled dropdown
- **Filter by Role** - Admin/Staff dropdown
- **Search** - Search by email address
- **Stats Bar** - Shows total users, enabled count, admin count, and filtered count
- Modal forms for add/edit operations

### Batch Control (`/batch`)
- View batch job status
- Send email for today's tasks
- Send email for specific date with custom schedule time
- Response display for API calls

### API Test Page (`/api-test`)
- Interactive testing for all API endpoints
- Organized by category: Schedule, Master, User endpoints
- Expandable endpoint cards with parameter inputs
- Response time display and formatted JSON output

### API Application (Backend)
- **Auth Endpoints** (`/api/auth/*`) - Google OAuth token verification, JWT issuance
- **Schedule Endpoints** (`/api/schedule/*`) - Get tasks by date/week/month/etc.
- **Master Endpoints** (`/api/master/*`) - CRUD operations on task definitions
- **User Endpoints** (`/api/users/*`) - User management (Admin only)
- Named Ranges support for controlled dropdowns
- **Spring Security** with JWT authentication

### Batch Application (Backend)
- Scheduled emails at 7 AM and 7 PM IST
- Manual email trigger via API
- Beautiful HTML email templates

## Quick Start

### Prerequisites
- Docker Desktop
- Google Cloud Service Account with Sheets API access
- Google Cloud OAuth 2.0 Client ID (for user authentication)
- Gmail account for sending emails

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/alagesan/alps-scheduler-db.git
   cd alps-scheduler-db
   ```

2. **Configure Google Sheets**
   - Create a Google Sheet with `Tasks-Master` and `Users` tabs
   - Enable Google Sheets API in Google Cloud Console
   - Create Service Account and download `credentials.json`
   - Share the Google Sheet with the service account email

3. **Configure Google OAuth** (for user authentication)
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Create OAuth 2.0 Client ID (Web application)
   - Add authorized JavaScript origins: `http://localhost:3000`
   - Add authorized redirect URIs: `http://localhost:3000`
   - Copy the Client ID for `.env` configuration

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

   Required settings in `.env`:
   ```
   # Google Sheets
   GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
   GOOGLE_SHEETS_SHEET_NAME=Tasks-Master

   # Email
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   MAIL_RECIPIENT=recipient@example.com

   # Google OAuth (for user authentication)
   GOOGLE_OAUTH_CLIENT_ID=your-oauth-client-id.apps.googleusercontent.com

   # JWT Configuration
   JWT_SECRET=YourSecureRandomStringAtLeast256BitsLong
   JWT_EXPIRATION=86400000
   ```

6. **Place credentials**
   ```bash
   cp ~/Downloads/credentials.json ./credentials.json
   ```

7. **Add initial admin user**
   - In Google Sheets, go to the `Users` tab
   - Add a row with columns: Email, Status, Role
   - Example: `admin@gmail.com | Enabled | Admin`

8. **Build and run**
   ```bash
   docker compose up --build -d
   ```

9. **Access the application**
   - Open http://localhost:3000
   - Sign in with your Google account (must be in Users sheet with Enabled status)
   - Use the dropdown menu (☰) to navigate between pages:
     - **Home** (`/`) - Task viewer with Today/Week/Search tabs
     - **Batch Control** (`/batch`) - Email scheduling (Admin only)
     - **Manage Task Master** (`/master`) - Task CRUD with filters (Admin only)
     - **Manage Users** (`/users`) - User management with filters (Admin only)
     - **Test API** (`/api-test`) - Interactive API testing (Admin only)

## API Reference

> **Note**: All API endpoints (except `/api/auth/*`) require JWT authentication. Include the header:
> `Authorization: Bearer <jwt_token>`

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/google` | Verify Google ID token and get JWT |

**Request body for `/api/auth/google`:**
```json
{
  "credential": "google-id-token-from-oauth"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "email": "user@gmail.com",
  "role": "Admin",
  "status": "Enabled"
}
```

### Schedule Endpoints (Task Retrieval)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/schedule/today` | Today's scheduled tasks |
| GET | `/api/schedule/date/{date}` | Tasks for specific date (YYYY-MM-DD) |
| GET | `/api/schedule/week` | Current week's tasks |
| GET | `/api/schedule/week/{date}` | Week tasks starting from date |
| GET | `/api/schedule/month/{year}/{month}` | Monthly tasks |
| GET | `/api/schedule/quarter/{year}/{quarter}` | Quarterly tasks (1-4) |
| GET | `/api/schedule/half-year/{year}/{half}` | Half-yearly tasks (1-2) |
| GET | `/api/schedule/year/{year}` | Yearly tasks |
| GET | `/api/schedule/range?start=&end=` | Tasks in date range |
| GET | `/api/schedule/today/department/{dept}` | Today's tasks by department |

### Master Endpoints (CRUD Operations)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/master/tasks` | All task definitions |
| GET | `/api/master/tasks/{rowNumber}` | Single task by row |
| POST | `/api/master/tasks` | Create new task |
| PUT | `/api/master/tasks/{rowNumber}` | Update existing task |
| DELETE | `/api/master/tasks/{rowNumber}` | Delete task |
| GET | `/api/master/departments` | All departments (from Named Range) |
| GET | `/api/master/frequencies` | All frequencies (from Named Range) |
| GET | `/api/master/tasks/department/{dept}` | Tasks by department |
| GET | `/api/master/tasks/frequency/{freq}` | Tasks by frequency |

### User Endpoints (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | All users |
| GET | `/api/users/{rowNumber}` | Single user by row |
| GET | `/api/users/email/{email}` | User by email |
| GET | `/api/users/status/{status}` | Users by status |
| GET | `/api/users/role/{role}` | Users by role |
| GET | `/api/users/statuses` | All statuses (from Named Range) |
| GET | `/api/users/roles` | All roles (from Named Range) |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/{rowNumber}` | Update user |
| DELETE | `/api/users/{rowNumber}` | Delete user |

### Example: Create a New Task

```bash
curl -X POST http://localhost:3000/api/master/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "activity": "New Task",
    "department": "MEP",
    "frequency": "Weekly",
    "noOfTimes": 1,
    "specificDates": "",
    "comments": "Every Sunday"
  }'
```

### Example: Update a Task

```bash
curl -X PUT http://localhost:3000/api/master/tasks/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "activity": "Updated Task",
    "department": "MEP",
    "frequency": "Daily",
    "noOfTimes": 1,
    "specificDates": "",
    "comments": ""
  }'
```

### Example: Create a New User (Admin Only)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "email": "newuser@gmail.com",
    "status": "Enabled",
    "role": "Staff"
  }'
```

## Google Sheet Structure

The `Tasks-Master` sheet should have the following columns:

| Column | Field | Description | Example |
|--------|-------|-------------|---------|
| A | Activity | Task description | "Swimming Pool AM" |
| B | Dept | Department | "MEP", "HouseKeeping" |
| C | Frequency | Schedule frequency | "Daily", "Weekly", "Monthly" |
| D | NoOfTimes | Occurrences per period | 1, 2 |
| E | Specific Dates | For yearly tasks | "October 1" |
| F | Comments | Additional notes | "Every Monday and Thursday" |

### Users Sheet Structure

The `Users` sheet should have the following columns:

| Column | Field | Description | Example |
|--------|-------|-------------|---------|
| A | Email | User's Google email | "admin@gmail.com" |
| B | Status | Account status | "Enabled", "Disabled" |
| C | Role | User role | "Admin", "Staff" |

### Named Ranges

Create Named Ranges for controlled dropdown values:

**For Tasks:**
- `Departments` - List of valid department names
- `Frequencies` - List of valid frequencies (Daily, Weekly, Monthly, Quarterly, Half-Yearly, Yearly)

**For Users:**
- `Roles` - List of valid roles (Admin, Staff)
- `UserStatuses` - List of valid statuses (Enabled, Disabled)

If Named Ranges don't exist, the system will extract unique values from the data.

## Task Frequencies

| Frequency | Schedule Logic |
|-----------|---------------|
| Daily | Every day, or specific days via comments |
| Weekly | Specific weekdays (e.g., "Sunday and Wednesday") |
| Monthly | First day of every month |
| Quarterly | Jan 1, Apr 1, Jul 1, Oct 1 |
| Half-Yearly | Jan 1 and Jul 1 |
| Yearly | Specific dates (from "Specific Dates" column) |

## Docker Services

| Service | Container Name | Internal Port | Purpose |
|---------|---------------|---------------|---------|
| api-app | alps-db-scheduler-api | 8080 | REST API (proxied via `/api/*`) |
| batch-app | alps-db-scheduler-batch | 8081 | Email scheduler (proxied via `/batch/*`, `/api/batch/*`) |
| pwa-app | alps-db-scheduler-pwa | 3000 | Nginx reverse proxy + React UI (main entry point) |

**Note**: All services are accessed through port 3000 via the Nginx reverse proxy in the PWA container.

## Commands

```bash
# Start all services
docker compose up -d

# Rebuild and start
docker compose up --build -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# View specific service logs
docker logs alps-db-scheduler-api
docker logs alps-db-scheduler-batch
docker logs alps-db-scheduler-pwa
```

## Technology Stack

- **Backend**: Java 17, Spring Boot 3.2.0, Spring Security, Google Sheets API v4
- **Authentication**: Google OAuth 2.0, JWT (jjwt library)
- **Frontend**: React 19, @react-oauth/google, Axios, date-fns
- **Infrastructure**: Docker, Docker Compose, Nginx
- **Email**: Spring Mail, Thymeleaf templates

## Troubleshooting

### Google Sheets API Error
- Verify `credentials.json` exists in project root
- Check service account has Editor access to the spreadsheet
- Ensure spreadsheet is a native Google Sheet (not uploaded Excel)
- Verify spreadsheet ID in `.env` is correct

### Email Not Sending
- Check `.env` has correct Gmail credentials
- Use App Password, not regular password
- View logs: `docker logs alps-db-scheduler-batch`

### PWA Not Loading
- Check API health: http://localhost:3000/api/schedule/today
- Check browser console for errors
- Clear browser cache
- Verify nginx proxy is running: `docker logs alps-db-scheduler-pwa`

### Authentication Issues
- **"User not found"**: Add user email to Users sheet with Status=Enabled
- **"User is disabled"**: Change user status to Enabled in Users sheet
- **"Invalid Google token"**: Verify OAuth Client ID in `.env` matches Google Cloud Console
- **403 Forbidden on APIs**: Check JWT token is valid and included in Authorization header
- **Session expired**: Re-login from home page; JWT tokens expire after 24 hours (configurable)

### Port Conflicts
If port 3000 is in use, modify `docker-compose.yml`:
```yaml
ports:
  - "3001:80"    # Change PWA port (all access goes through here)
```

## Project Structure

```
alps-scheduler-db/
├── api-app/                # Spring Boot REST API
│   ├── src/
│   │   └── main/java/.../
│   │       ├── controller/
│   │       │   ├── AuthController.java      # Google OAuth + JWT
│   │       │   ├── ScheduleController.java
│   │       │   ├── TaskMasterController.java
│   │       │   └── UserController.java      # User CRUD
│   │       ├── security/
│   │       │   ├── JwtUtil.java             # JWT generation/validation
│   │       │   ├── JwtAuthenticationFilter.java
│   │       │   └── SecurityConfig.java      # Spring Security config
│   │       ├── service/
│   │       │   ├── TaskSchedulerService.java
│   │       │   ├── GoogleSheetsService.java
│   │       │   └── UserService.java         # User management
│   │       └── model/
│   │           ├── Task.java
│   │           └── User.java
│   └── Dockerfile
├── batch-app/              # Spring Boot Batch Application
│   ├── src/
│   │   └── main/
│   │       ├── java/.../
│   │       │   ├── scheduler/DailyScheduler.java
│   │       │   ├── service/
│   │       │   │   ├── EmailService.java
│   │       │   │   └── GoogleSheetsService.java
│   │       │   └── controller/BatchController.java
│   │       └── resources/
│   │           └── templates/daily-schedule-email.html
│   └── Dockerfile
├── pwa-app/                # React SPA + Nginx Reverse Proxy
│   ├── src/
│   │   ├── App.js              # Main app with React Router
│   │   ├── App.css
│   │   ├── index.js            # BrowserRouter + GoogleOAuthProvider
│   │   ├── services/
│   │   │   └── api.js          # Axios with JWT interceptors
│   │   ├── context/
│   │   │   └── AuthContext.js  # Auth state management
│   │   ├── components/
│   │   │   ├── Login.js        # Google Sign-In component
│   │   │   └── Login.css
│   │   └── pages/              # All application pages
│   │       ├── Home.js         # Task viewer (Today/Week/Search)
│   │       ├── TaskMaster.js   # Task CRUD with filters
│   │       ├── Users.js        # User management with filters
│   │       ├── BatchControl.js # Email batch control
│   │       ├── ApiTest.js      # Interactive API testing
│   │       └── AdminPages.css  # Shared admin styles
│   ├── nginx.conf          # Reverse proxy + SPA routing
│   └── Dockerfile
├── credentials.json        # Google Service Account (not in git)
├── docker-compose.yml
├── .env                    # Environment config (not in git)
├── .env.example
├── README.md
├── QUICK_START.md
├── IMPLEMENTATION_SUMMARY.md
└── DEPLOYMENT_CHECKLIST.md
```

## Documentation

- [Quick Start Guide](QUICK_START.md) - Get running in 10 minutes
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md) - Technical details
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Production deployment guide

## Security Notes

- **Never commit** `credentials.json` or `.env` to version control
- These files are excluded via `.gitignore`
- Use environment variables for sensitive configuration
- **JWT Secret**: Use a strong, random string (at least 256 bits) for `JWT_SECRET`
- **OAuth Client ID**: Keep your Google OAuth Client ID secure
- **User Access**: Only users in the Users sheet with Status=Enabled can login
- **Role-based Access**: Admin role required for user management and task master APIs

## License

MIT License

## Support

For issues and feature requests, please create an issue in the GitHub repository:
https://github.com/alagesan/alps-scheduler-db
