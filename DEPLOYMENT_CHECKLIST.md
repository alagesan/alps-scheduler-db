# ALPS Scheduler - Deployment Checklist

Use this checklist to ensure successful deployment of the ALPS Scheduler system.

## Pre-Deployment

### Environment Setup
- [ ] Docker installed and running
- [ ] Docker Compose installed
- [ ] Sufficient disk space (min 2GB)
- [ ] Network connectivity available
- [ ] Ports 3000, 8080, 8081 are available

### Configuration
- [ ] `.env` file created from `.env.example`
- [ ] Email credentials added to `.env`
- [ ] Gmail App Password generated (if using Gmail)
- [ ] `Scheduler-Master.csv` file present in project root
- [ ] CSV file has correct format and data

## Deployment Steps

### 1. Initial Setup
```bash
- [ ] cd /home/alpandy/al/ai-experiment/projects/alps-scheduler
- [ ] cp .env.example .env
- [ ] nano .env  # Add credentials
- [ ] ls Scheduler-Master.csv  # Verify file exists
```

### 2. Build and Start
```bash
- [ ] ./start.sh
# OR
- [ ] docker-compose up --build -d
```

### 3. Verify Containers
```bash
- [ ] docker ps  # Should show 3 running containers
- [ ] docker logs alps-scheduler-api
- [ ] docker logs alps-scheduler-batch
- [ ] docker logs alps-scheduler-pwa
```

Expected output:
```
alps-scheduler-api      running
alps-scheduler-batch    running
alps-scheduler-pwa      running
```

## Post-Deployment Testing

### API Testing
- [ ] Open http://localhost:8080/api/tasks/today
- [ ] Verify JSON response with tasks
- [ ] Open http://localhost:8080/api/tasks/departments
- [ ] Verify department list returned

### PWA Testing
- [ ] Open http://localhost:3000
- [ ] Verify page loads without errors
- [ ] Check browser console (F12) - no errors
- [ ] Select "Daily" view - tasks appear
- [ ] Select "Weekly" view - 7 days shown
- [ ] Select "Monthly" view - month tasks shown
- [ ] Change date picker - tasks update
- [ ] Select department filter - tasks filter correctly
- [ ] Click "Refresh" button - data reloads

### Email Testing (Wait for Scheduled Time)
- [ ] Wait for 7:00 AM IST or 7:00 PM IST
- [ ] Check email at internal@alpsresidencymadurai.in
- [ ] Verify email received
- [ ] Verify today's tasks section present
- [ ] Verify weekly schedule section present
- [ ] Check formatting is correct

### CSV Hot-Reload Testing
- [ ] Edit Scheduler-Master.csv
- [ ] Add a new test task
- [ ] Save the file
- [ ] Wait 2 seconds
- [ ] Refresh PWA (http://localhost:3000)
- [ ] Verify new task appears
- [ ] Remove test task
- [ ] Save again
- [ ] Verify task disappears

### Mobile Responsive Testing
- [ ] Open PWA on mobile device or browser dev tools
- [ ] Switch to mobile view (F12 → Toggle device toolbar)
- [ ] Verify layout adjusts correctly
- [ ] Test all controls work on mobile
- [ ] Verify touch interactions work

## Monitoring

### Check Logs
```bash
- [ ] docker-compose logs -f api-app
- [ ] docker-compose logs -f batch-app
- [ ] docker-compose logs -f pwa-app
```

Look for:
- [ ] "Loaded X tasks from CSV" messages
- [ ] No error stack traces
- [ ] Scheduled job execution logs (at 7 AM/PM)

### Health Checks
```bash
- [ ] docker inspect alps-scheduler-api | grep -A 10 Health
```

Should show: "Status": "healthy"

### Resource Usage
```bash
- [ ] docker stats
```

Verify:
- [ ] CPU usage < 10% when idle
- [ ] Memory usage reasonable (< 500MB per container)

## Troubleshooting

### Containers Not Starting
```bash
- [ ] docker-compose down
- [ ] docker-compose up --build
- [ ] Check error messages
```

### Email Not Sending
- [ ] Verify .env has correct credentials
- [ ] Check batch-app logs: `docker logs alps-scheduler-batch`
- [ ] Verify SMTP settings in .env
- [ ] Test SMTP credentials separately
- [ ] Check firewall settings (port 587)

### PWA Not Loading
- [ ] Check if API is accessible: http://localhost:8080/api/tasks/today
- [ ] Verify CORS is enabled in API
- [ ] Check browser console for errors
- [ ] Clear browser cache
- [ ] Try different browser

### CSV Changes Not Reflecting
- [ ] Wait 2-3 seconds after saving
- [ ] Check logs for "CSV file modified" message
- [ ] Verify file permissions
- [ ] Restart containers if needed

### Port Conflicts
```bash
- [ ] lsof -i :3000  # Check what's using port 3000
- [ ] lsof -i :8080  # Check what's using port 8080
- [ ] lsof -i :8081  # Check what's using port 8081
```

Solution: Stop conflicting services or change ports in docker-compose.yml

## Production Readiness

### Security
- [ ] `.env` file not committed to git (check .gitignore)
- [ ] Email credentials are secure
- [ ] CORS configured correctly
- [ ] No sensitive data in logs

### Backup
- [ ] Scheduler-Master.csv backed up
- [ ] .env file backed up securely
- [ ] Documentation available

### Documentation
- [ ] README.md reviewed
- [ ] QUICK_START.md available
- [ ] Team trained on usage

### Maintenance
- [ ] Schedule regular CSV backups
- [ ] Monitor disk space
- [ ] Monitor email delivery
- [ ] Plan for updates

## Go-Live Checklist

### Final Verification
- [ ] All tests passing
- [ ] No errors in logs
- [ ] Email sending successfully
- [ ] PWA accessible
- [ ] Mobile responsive
- [ ] CSV hot-reload working

### Communication
- [ ] Team notified of go-live
- [ ] Email recipient confirmed
- [ ] Support contact information shared
- [ ] Documentation distributed

### Monitoring Plan
- [ ] Daily log review scheduled
- [ ] Email delivery monitoring set up
- [ ] Weekly CSV backup scheduled
- [ ] Incident response plan ready

## Rollback Plan

If issues occur:
```bash
- [ ] docker-compose down
- [ ] Restore previous CSV backup
- [ ] Restore previous .env
- [ ] docker-compose up -d
- [ ] Verify system works
```

## Success Criteria

System is successfully deployed when:
- ✅ All 3 containers running
- ✅ PWA accessible at http://localhost:3000
- ✅ API responding at http://localhost:8080
- ✅ Emails sending at 7 AM and 7 PM IST
- ✅ CSV hot-reload working
- ✅ No errors in logs
- ✅ Team can access and use system

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Sign-off**: _______________
