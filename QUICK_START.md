# Quick Start Guide - ALPS DB Based Scheduler

## Get Up and Running in 10 Minutes

### Prerequisites

1. **Docker Desktop** - Installed and running
2. **Google Cloud Service Account** - For Google Sheets API access
3. **Gmail Account** - For sending scheduled emails

---

### Step 1: Configure Google Sheets (5 minutes)

1. **Create a Google Sheet** with your task data
   - Sheet name: `Tasks-Master`
   - Columns: Activity, Dept, Frequency, NoOfTimes, Specific Dates, Comments

2. **Enable Google Sheets API**:
   - Go to: https://console.cloud.google.com/
   - Create a new project or select existing
   - Enable "Google Sheets API"
   - Create a Service Account and download `credentials.json`

3. **Share your Google Sheet** with the service account email (found in credentials.json)

4. **Copy credentials.json** to project root:
   ```bash
   cp ~/Downloads/credentials.json ./credentials.json
   ```

---

### Step 2: Configure Environment (2 minutes)

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

Update the following in `.env`:
```
# Google Sheets Configuration
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id-from-url
GOOGLE_SHEETS_SHEET_NAME=Tasks-Master

# Email Configuration
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_RECIPIENT=recipient@example.com
```

**Get Gmail App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Generate new app password for "Mail"
3. Copy the 16-character password to `.env`

---

### Step 3: Build and Run (3 minutes)

```bash
# Build and start all containers
docker compose up --build -d
```

Wait for all containers to start (check with `docker ps`).

---

### Step 4: Access the Application

Open your browser at **http://localhost:3000**

Use the dropdown menu (☰) in the top-left corner to navigate:

| Menu Item | Description |
|-----------|-------------|
| **Home** | PWA Task Viewer (Today/Week/Search) |
| **Batch Control** | Manual email trigger |
| **Manage Task Master** | Add/Edit/Delete tasks |
| **Test API** | Interactive API testing |

---

## That's It!

The system is now:
- Sending emails at 7 AM and 7 PM IST
- Serving all features at http://localhost:3000
- Providing REST API via reverse proxy
- Reading task data from Google Sheets in real-time

---

## Quick Testing

### Test API
```bash
curl http://localhost:3000/api/schedule/today
```

### Test Master Data
```bash
curl http://localhost:3000/api/master/tasks
```

### Manually Send Email
1. Open http://localhost:3000
2. Click menu (☰) → **Batch Control**
3. Click "Send Email for Today"

---

## Managing Tasks

### View/Edit Tasks
1. Open http://localhost:3000
2. Click menu (☰) → **Manage Task Master**
3. View all tasks from Google Sheets
4. Add, Edit, or Delete tasks directly

### Named Ranges (Optional)
For controlled dropdown values, create Named Ranges in Google Sheets:
- `Departments` - List of valid departments
- `Frequencies` - List of valid frequencies (Daily, Weekly, Monthly, etc.)

---

## Stop the Application

```bash
docker compose down
```

---

## Common Issues

**Google Sheets API Error?**
- Verify `credentials.json` is in project root
- Check service account has access to the spreadsheet
- Ensure spreadsheet is a native Google Sheet (not uploaded Excel)

**Email not working?**
- Double-check .env file has correct credentials
- Make sure you're using App Password, not your regular password
- Check logs: `docker logs alps-db-scheduler-batch`

**PWA not showing tasks?**
- Check if API is running: http://localhost:3000/api/schedule/today
- Open browser console (F12) to see errors
- Check nginx logs: `docker logs alps-db-scheduler-pwa`

**Port already in use?**
- Edit `docker-compose.yml` and change port 3000 (all access goes through here)

---

## Need Help?

See the full README.md for detailed documentation.
