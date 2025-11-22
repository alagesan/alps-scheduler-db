# ALPS DB Based Scheduler - Deployment Checklist

Use this checklist to ensure successful deployment of the ALPS DB Based Scheduler system.

## Pre-Deployment

### Environment Setup
- [ ] Docker installed and running
- [ ] Docker Compose installed
- [ ] Sufficient disk space (min 2GB)
- [ ] Network connectivity available
- [ ] Ports 3000, 8080, 8081 are available

### Google Sheets Configuration
- [ ] Google Cloud project created
- [ ] Google Sheets API enabled
- [ ] Service Account created
- [ ] `credentials.json` downloaded
- [ ] Google Sheet created with `Tasks-Master` tab
- [ ] Google Sheet shared with service account email
- [ ] Spreadsheet ID noted (from URL)
- [ ] (Optional) Named Ranges created: `Departments`, `Frequencies`

### Application Configuration
- [ ] `.env` file created from `.env.example`
- [ ] `GOOGLE_SHEETS_SPREADSHEET_ID` set in `.env`
- [ ] `GOOGLE_SHEETS_SHEET_NAME` set (default: Tasks-Master)
- [ ] Email credentials added to `.env`
- [ ] Gmail App Password generated (if using Gmail)
- [ ] `credentials.json` placed in project root

---

## Deployment Steps

### 1. Initial Setup
```bash
- [ ] cd /path/to/alps-scheduler-db
- [ ] cp .env.example .env
- [ ] nano .env  # Add Google Sheets and email credentials
- [ ] ls credentials.json  # Verify credentials file exists
```

### 2. Build and Start
```bash
- [ ] docker compose up --build -d
```

### 3. Verify Containers
```bash
- [ ] docker ps  # Should show 3 running containers
- [ ] docker logs alps-db-scheduler-api
- [ ] docker logs alps-db-scheduler-batch
- [ ] docker logs alps-db-scheduler-pwa
```

Expected output:
```
alps-db-scheduler-api      running
alps-db-scheduler-batch    running
alps-db-scheduler-pwa      running
```

---

## Post-Deployment Testing

### API Testing
- [ ] Open http://localhost:8080 (API Test Page)
- [ ] Test Schedule Endpoints:
  - [ ] GET /api/schedule/today - returns tasks
  - [ ] GET /api/schedule/week - returns weekly tasks
- [ ] Test Master Endpoints:
  - [ ] GET /api/master/tasks - returns all tasks from Google Sheets
  - [ ] GET /api/master/departments - returns department list
  - [ ] GET /api/master/frequencies - returns frequency list

### PWA Testing
- [ ] Open http://localhost:3000
- [ ] Verify page loads without errors
- [ ] Check browser console (F12) - no errors
- [ ] Test **Today** tab - today's tasks appear
- [ ] Test **Week** tab - weekly tasks shown
- [ ] Test **Search** tab - date picker works
- [ ] Test department filter - tasks filter correctly
- [ ] Verify task count updates correctly

### Batch App Testing
- [ ] Open http://localhost:8081 (Batch Control Panel)
- [ ] Test "Send Email for Today" button
- [ ] Open http://localhost:8081/master.html (Task Master Management)
- [ ] Verify tasks load from Google Sheets
- [ ] Test Add Task - new row appears in Google Sheets
- [ ] Test Edit Task - changes reflect in Google Sheets
- [ ] Test Delete Task - row removed from Google Sheets

### Email Testing
- [ ] Wait for 7:00 AM IST or 7:00 PM IST (or trigger manually)
- [ ] Check recipient inbox
- [ ] Verify email received
- [ ] Verify today's tasks section present
- [ ] Verify weekly schedule section present
- [ ] Check formatting is correct

### Google Sheets Sync Testing
- [ ] Add a task via http://localhost:8081/master.html
- [ ] Verify it appears in Google Sheet
- [ ] Edit a task in Google Sheet directly
- [ ] Refresh PWA - verify change appears
- [ ] Delete a task via UI
- [ ] Verify row removed from Google Sheet

### Mobile Responsive Testing
- [ ] Open PWA on mobile device or browser dev tools
- [ ] Switch to mobile view (F12 → Toggle device toolbar)
- [ ] Verify layout adjusts correctly
- [ ] Test all navigation tabs work on mobile
- [ ] Verify touch interactions work

---

## Monitoring

### Check Logs
```bash
- [ ] docker compose logs -f api-app
- [ ] docker compose logs -f batch-app
- [ ] docker compose logs -f pwa-app
```

Look for:
- [ ] "Loaded X tasks from Google Sheets" messages
- [ ] No error stack traces
- [ ] Scheduled job execution logs (at 7 AM/PM)

### Health Checks
```bash
- [ ] curl http://localhost:8080/api/schedule/today
```

Should return JSON array of tasks.

### Resource Usage
```bash
- [ ] docker stats
```

Verify:
- [ ] CPU usage < 10% when idle
- [ ] Memory usage reasonable (< 500MB per container)

---

## Troubleshooting

### Containers Not Starting
```bash
- [ ] docker compose down
- [ ] docker compose up --build
- [ ] Check error messages
```

### Google Sheets API Error
- [ ] Verify `credentials.json` exists in project root
- [ ] Check service account email has access to spreadsheet
- [ ] Ensure spreadsheet is native Google Sheet (not uploaded Excel)
- [ ] Verify spreadsheet ID in `.env` is correct
- [ ] Check DNS resolution: `docker exec alps-db-scheduler-api ping sheets.googleapis.com`

### Email Not Sending
- [ ] Verify .env has correct credentials
- [ ] Check batch-app logs: `docker logs alps-db-scheduler-batch`
- [ ] Verify SMTP settings in .env
- [ ] Test SMTP credentials separately
- [ ] Check firewall settings (port 587)

### PWA Not Loading Tasks
- [ ] Check if API is accessible: http://localhost:8080/api/schedule/today
- [ ] Verify CORS is enabled in API
- [ ] Check browser console for errors
- [ ] Clear browser cache
- [ ] Try different browser

### Port Conflicts
```bash
- [ ] lsof -i :3000  # Check what's using port 3000
- [ ] lsof -i :8080  # Check what's using port 8080
- [ ] lsof -i :8081  # Check what's using port 8081
```

Solution: Stop conflicting services or change ports in docker-compose.yml

---

## Production Readiness

### Security
- [ ] `.env` file not committed to git (check .gitignore)
- [ ] `credentials.json` not committed to git
- [ ] Email credentials are secure
- [ ] Google Sheet has restricted access
- [ ] CORS configured correctly
- [ ] No sensitive data in logs

### Backup
- [ ] Google Sheet has version history enabled
- [ ] `.env` file backed up securely
- [ ] `credentials.json` backed up securely
- [ ] Documentation available

### Documentation
- [ ] README.md reviewed
- [ ] QUICK_START.md available
- [ ] Team trained on usage
- [ ] Task Master Management UI explained

### Maintenance
- [ ] Monitor email delivery
- [ ] Plan for updates
- [ ] Google API quota monitoring

---

## Go-Live Checklist

### Final Verification
- [ ] All tests passing
- [ ] No errors in logs
- [ ] Email sending successfully
- [ ] PWA accessible
- [ ] Mobile responsive
- [ ] Google Sheets sync working
- [ ] Task Master CRUD working

### Communication
- [ ] Team notified of go-live
- [ ] Email recipient confirmed
- [ ] Support contact information shared
- [ ] Documentation distributed

### Monitoring Plan
- [ ] Daily log review scheduled
- [ ] Email delivery monitoring set up
- [ ] Incident response plan ready

---

## Rollback Plan

If issues occur:
```bash
- [ ] docker compose down
- [ ] Restore previous .env
- [ ] docker compose up -d
- [ ] Verify system works
```

Note: Data is stored in Google Sheets, so no data backup/restore needed.

---

## Success Criteria

System is successfully deployed when:
- All 3 containers running
- PWA accessible at http://localhost:3000
- API responding at http://localhost:8080
- Batch Control Panel at http://localhost:8081
- Task Master Management at http://localhost:8081/master.html
- Emails sending at 7 AM and 7 PM IST
- Google Sheets sync working (real-time CRUD)
- No errors in logs
- Team can access and use system

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Sign-off**: _______________
