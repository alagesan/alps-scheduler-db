# ALPS Residency Task Scheduler

A comprehensive task scheduling and management system for ALPS Residency Madurai that sends automated email reminders twice daily and provides a Progressive Web App (PWA) interface for viewing and managing tasks.

## Features

### Batch Application (Spring Boot)
- Automated email reminders sent at **7:00 AM IST** and **7:00 PM IST**
- Email includes:
  - Tasks scheduled for the current day (grouped by department)
  - Complete weekly schedule
- Supports multiple scheduling frequencies:
  - Daily
  - Weekly
  - Monthly
  - Quarterly
  - Half-Yearly
  - Yearly
- Hot-reload CSV file without application restart
- Sends emails to: internal@alpsresidencymadurai.in

### REST API Application (Spring Boot)
- RESTful endpoints for task retrieval
- Filter tasks by:
  - Date
  - Week
  - Month
  - Quarter
  - Half-Year
  - Year
  - Department
- Hot-reload CSV file support
- CORS enabled for PWA access

### PWA Application (React)
- Modern, responsive user interface
- View tasks by:
  - Daily
  - Weekly
  - Monthly
  - Quarterly
  - Half-Yearly
  - Yearly
- Filter by department
- Date picker for custom date selection
- Offline-capable Progressive Web App
- Mobile-friendly design

## Tech Stack

- **Backend**: Spring Boot 3.2.0 (Java 17)
- **Frontend**: React 18 (Create React App)
- **Containerization**: Docker & Docker Compose
- **Data Source**: CSV file (Scheduler-Master.csv)
- **Email**: Spring Boot Mail (SMTP)

## Project Structure

```
alps-scheduler/
├── batch-app/              # Spring Boot Batch Application
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
├── api-app/                # Spring Boot REST API
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
├── pwa-app/                # React PWA
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── Scheduler-Master.csv    # Task data source
├── docker-compose.yml      # Docker orchestration
├── .env.example            # Environment variables template
└── README.md
```

## Prerequisites

- Docker and Docker Compose installed
- For email functionality: Gmail account with App Password (or other SMTP server)

## Setup Instructions

### 1. Clone/Navigate to Project Directory

```bash
cd /home/alpandy/al/ai-experiment/projects/alps-scheduler
```

### 2. Configure Email Settings

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and add your email credentials:

```env
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

**To generate a Gmail App Password:**
1. Go to your Google Account settings
2. Navigate to Security > 2-Step Verification
3. Scroll to "App passwords"
4. Generate a new app password for "Mail"
5. Use this password in the .env file

### 3. Ensure CSV File is Present

The `Scheduler-Master.csv` file should be in the project root directory. This file contains all task scheduling information.

### 4. Build and Run with Docker Compose

```bash
docker-compose up --build
```

This will:
- Build all three applications
- Start the containers
- Mount the CSV file as a shared volume
- Set up networking between containers

## Accessing the Applications

Once running, access the applications at:

- **PWA (Frontend)**: http://localhost:3000
- **REST API**: http://localhost:8080/api
- **Batch App**: http://localhost:8081 (background service)

## API Endpoints

### Task Endpoints

- `GET /api/tasks/today` - Get tasks for today
- `GET /api/tasks/date/{date}` - Get tasks for specific date (format: YYYY-MM-DD)
- `GET /api/tasks/week` - Get tasks for current week
- `GET /api/tasks/week/{date}` - Get tasks for week containing the date
- `GET /api/tasks/month/{year}/{month}` - Get tasks for specific month
- `GET /api/tasks/quarter/{year}/{quarter}` - Get tasks for quarter (1-4)
- `GET /api/tasks/half-year/{year}/{half}` - Get tasks for half-year (1-2)
- `GET /api/tasks/year/{year}` - Get tasks for entire year
- `GET /api/tasks/range?start={date}&end={date}` - Get tasks for date range
- `GET /api/tasks/department/{department}` - Get all tasks for a department
- `GET /api/tasks/departments` - Get list of all departments

## Updating Tasks (CSV Hot-Reload)

To update tasks without restarting the applications:

1. Edit the `Scheduler-Master.csv` file
2. Save the file
3. Wait 1-2 seconds for automatic reload
4. Both API and Batch applications will pick up the changes automatically

## CSV File Format

The `Scheduler-Master.csv` file has the following columns:

- **Activity**: Task name/description
- **Dept**: Department responsible (MEP, HouseKeeping, FrontOffice, FnB, Gardening)
- **Frequency**: How often (Daily, Weekly, Monthly, Quarterly, Half-Yearly, Yearly)
- **NoOfTimes**: Number of times per period (e.g., 2 for twice per week)
- **Specific Dates**: Exact dates for yearly tasks (e.g., "October 1")
- **Comments**: Additional scheduling notes (e.g., "First day of every month")

## Scheduled Email Jobs

The batch application runs two scheduled jobs:

- **Morning Job**: 7:00 AM IST (1:30 AM UTC)
- **Evening Job**: 7:00 PM IST (1:30 PM UTC)

Each email includes:
1. Tasks for the current day (grouped by department)
2. Complete task schedule for the entire week

## Stopping the Applications

```bash
docker-compose down
```

To remove volumes as well:

```bash
docker-compose down -v
```

## Development

### Running Individual Applications Locally

**API Application:**
```bash
cd api-app
mvn spring-boot:run
```

**Batch Application:**
```bash
cd batch-app
mvn spring-boot:run
```

**PWA Application:**
```bash
cd pwa-app
npm install
npm start
```

## Troubleshooting

### Email Not Sending
- Verify `.env` file has correct credentials
- Check if 2-Step Verification is enabled for Gmail
- Ensure App Password is generated (not regular password)
- Check batch-app logs: `docker logs alps-scheduler-batch`

### CSV Changes Not Reflecting
- Wait 1-2 seconds after saving
- Check application logs for reload messages
- Verify file path in docker-compose.yml

### PWA Not Loading Tasks
- Ensure API is running: http://localhost:8080/api/tasks/today
- Check browser console for errors
- Verify CORS is enabled in API

### Port Conflicts
If ports 3000, 8080, or 8081 are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "3001:80"    # Change 3000 to 3001
```

## Departments

The system supports the following departments:
- MEP (Mechanical, Electrical, Plumbing)
- HouseKeeping
- FrontOffice
- FnB (Food & Beverage)
- Gardening

## License

Proprietary - ALPS Residency Madurai

## Support

For issues or questions, contact the IT team at ALPS Residency Madurai.
