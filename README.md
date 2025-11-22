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
│  (Port 8081)    │       │  (Port 8080)    │
│ • Email Jobs    │       │ • Schedule APIs │
│ • Task CRUD UI  │       │ • Master APIs   │
└─────────────────┘       └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │   PWA App       │
                          │  (Port 3000)    │
                          │ • Today/Week/   │
                          │   Search views  │
                          └─────────────────┘
```

## Features

### PWA Application (http://localhost:3000)
- Modern Material-inspired design
- Three navigation tabs: **Today**, **Week**, **Search**
- Department filter
- Task count summary
- Color-coded frequency badges
- Mobile responsive

### API Application (http://localhost:8080)
- **Schedule Endpoints** (`/api/schedule/*`) - Get tasks by date/week/month/etc.
- **Master Endpoints** (`/api/master/*`) - CRUD operations on task definitions
- Named Ranges support for controlled dropdowns
- Interactive API test page

### Batch Application (http://localhost:8081)
- Scheduled emails at 7 AM and 7 PM IST
- Manual email trigger
- Task Master Management UI for CRUD operations
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

6. **Access the applications**
   - PWA: http://localhost:3000
   - API: http://localhost:8080
   - Batch: http://localhost:8081
   - Task Master: http://localhost:8081/master.html

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
curl -X POST http://localhost:8080/api/master/tasks \
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
curl -X PUT http://localhost:8080/api/master/tasks/5 \
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

| Service | Container Name | Port | Purpose |
|---------|---------------|------|---------|
| api-app | alps-db-scheduler-api | 8080 | REST API |
| batch-app | alps-db-scheduler-batch | 8081 | Email scheduler + Task Management UI |
| pwa-app | alps-db-scheduler-pwa | 3000 | Web interface |

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
- Check API health: http://localhost:8080/api/schedule/today
- Check browser console for CORS errors
- Clear browser cache

### Port Conflicts
If ports are in use, modify `docker-compose.yml`:
```yaml
ports:
  - "3001:80"    # Change PWA port
  - "8082:8080"  # Change API port
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
├── pwa-app/                # React PWA
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── services/api.js
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
