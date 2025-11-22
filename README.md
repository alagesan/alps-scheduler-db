# ALPS DB Based Scheduler

A comprehensive task scheduling and management system for ALPS Residency Madurai, using **Google Sheets as the database backend**.

## Overview

This system provides:
- **Automated email notifications** at 7 AM and 7 PM IST with daily and weekly task schedules
- **REST API** for retrieving scheduled tasks and managing task definitions
- **Progressive Web App (PWA)** for viewing tasks on any device
- **Task Master Management UI** for CRUD operations on task definitions
- **Google Sheets integration** for real-time data synchronization

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
│ • Email Jobs    │       │ • Schedule APIs │
│ • Task CRUD UI  │       │ • Master APIs   │
└────────┬────────┘       └────────┬────────┘
         │                         │
         └────────────┬────────────┘
                      │
              ┌───────▼───────┐
              │   PWA App     │
              │  (Port 3000)  │
              │ • Nginx Proxy │
              │ • React UI    │
              │ • Unified     │
              │   Access Point│
              └───────────────┘
```

### Reverse Proxy Configuration

All traffic is routed through the PWA app (port 3000) using Nginx reverse proxy:

| URL Pattern | Routes To | Description |
|-------------|-----------|-------------|
| `/` | PWA App | Task Viewer (React) |
| `/api/schedule/*` | API App | Schedule APIs |
| `/api/master/*` | API App | Master CRUD APIs |
| `/api/batch/*` | Batch App | Batch control APIs |
| `/batch/*` | Batch App | Batch Control Panel & Task Master UI |
| `/api-test/` | API App | API Test Page |

## Features

### Unified Access (http://localhost:3000)

All applications are accessible through a single entry point with a dropdown navigation menu:

| Menu Item | URL | Description |
|-----------|-----|-------------|
| Home | http://localhost:3000 | PWA Task Viewer |
| Batch Control | http://localhost:3000/batch/ | Email scheduling control panel |
| Manage Task Master | http://localhost:3000/batch/master.html | Task CRUD operations |
| Test API | http://localhost:3000/api-test/ | Interactive API testing |

### PWA Application (Home)
- Modern Material-inspired design
- Three navigation tabs: **Today**, **Week**, **Search**
- Department filter
- Task count summary
- Color-coded frequency badges
- Mobile responsive
- Dropdown navigation menu for accessing all features

### API Application
- **Schedule Endpoints** (`/api/schedule/*`) - Get tasks by date/week/month/etc.
- **Master Endpoints** (`/api/master/*`) - CRUD operations on task definitions
- Named Ranges support for controlled dropdowns
- Interactive API test page at `/api-test/`

### Batch Application
- Scheduled emails at 7 AM and 7 PM IST
- Manual email trigger via `/batch/`
- Task Master Management UI at `/batch/master.html`
- Beautiful HTML email templates

## Quick Start

### Prerequisites
- Docker Desktop
- Google Cloud Service Account with Sheets API access
- Gmail account for sending emails

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/alagesan/alps-scheduler-db.git
   cd alps-scheduler-db
   ```

2. **Configure Google Sheets**
   - Create a Google Sheet with `Tasks-Master` tab
   - Enable Google Sheets API in Google Cloud Console
   - Create Service Account and download `credentials.json`
   - Share the Google Sheet with the service account email

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

   Required settings in `.env`:
   ```
   GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
   GOOGLE_SHEETS_SHEET_NAME=Tasks-Master
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   MAIL_RECIPIENT=recipient@example.com
   ```

4. **Place credentials**
   ```bash
   cp ~/Downloads/credentials.json ./credentials.json
   ```

5. **Build and run**
   ```bash
   docker compose up --build -d
   ```

6. **Access the application**
   - Open http://localhost:3000
   - Use the dropdown menu (☰) to navigate between:
     - Home (PWA Task Viewer)
     - Batch Control (Email scheduling)
     - Manage Task Master (CRUD operations)
     - Test API (Interactive API testing)

## API Reference

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

### Example: Create a New Task

```bash
curl -X POST http://localhost:3000/api/master/tasks \
  -H "Content-Type: application/json" \
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
  -d '{
    "activity": "Updated Task",
    "department": "MEP",
    "frequency": "Daily",
    "noOfTimes": 1,
    "specificDates": "",
    "comments": ""
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

### Named Ranges (Optional)

Create Named Ranges for controlled dropdown values:
- `Departments` - List of valid department names
- `Frequencies` - List of valid frequencies (Daily, Weekly, Monthly, Quarterly, Half-Yearly, Yearly)

If Named Ranges don't exist, the system will extract unique values from the task data.

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

- **Backend**: Java 17, Spring Boot 3.2.0, Google Sheets API v4
- **Frontend**: React 19, Axios, date-fns
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
│   │       │   ├── ScheduleController.java
│   │       │   └── TaskMasterController.java
│   │       ├── service/
│   │       │   ├── TaskSchedulerService.java
│   │       │   └── GoogleSheetsService.java
│   │       └── model/Task.java
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
│   │           ├── templates/daily-schedule-email.html
│   │           └── static/
│   │               ├── index.html
│   │               └── master.html
│   └── Dockerfile
├── pwa-app/                # React PWA + Nginx Reverse Proxy
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── services/api.js
│   ├── nginx.conf          # Reverse proxy configuration
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

## License

MIT License

## Support

For issues and feature requests, please create an issue in the GitHub repository:
https://github.com/alagesan/alps-scheduler-db
