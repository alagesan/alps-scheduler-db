# Quick Start Guide

## Get Up and Running in 5 Minutes

### Step 1: Configure Email (2 minutes)

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your email credentials
nano .env
```

Add your Gmail credentials:
```
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

**Get Gmail App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Generate new app password for "Mail"
3. Copy the 16-character password to `.env`

### Step 2: Build and Run (3 minutes)

```bash
# Build and start all containers
docker-compose up --build
```

Wait for the message: `Started ApiApplication` and `Started BatchApplication`

### Step 3: Access the Application

Open your browser and go to:
- **PWA Interface**: http://localhost:3000
- **API Test**: http://localhost:8080/api/tasks/today

## That's It!

The system is now:
- ✅ Sending emails at 7 AM and 7 PM IST
- ✅ Serving the PWA at http://localhost:3000
- ✅ Providing REST API at http://localhost:8080/api
- ✅ Auto-reloading when you update Scheduler-Master.csv

## Testing Email Immediately

To test email without waiting for scheduled time, you can trigger it manually:

1. Access the batch container:
```bash
docker exec -it alps-scheduler-batch sh
```

2. Or simply wait for the next scheduled time (7 AM or 7 PM IST)

## Updating Tasks

Simply edit `Scheduler-Master.csv` and save. Changes will be picked up automatically within 1-2 seconds!

## Stop the Application

```bash
docker-compose down
```

## Common Issues

**Email not working?**
- Double-check .env file has correct credentials
- Make sure you're using App Password, not your regular password
- Check logs: `docker logs alps-scheduler-batch`

**PWA not showing tasks?**
- Check if API is running: http://localhost:8080/api/tasks/today
- Open browser console (F12) to see errors

**Port already in use?**
- Edit `docker-compose.yml` and change port numbers (3000, 8080, 8081)

## Need Help?

See the full README.md for detailed documentation.
