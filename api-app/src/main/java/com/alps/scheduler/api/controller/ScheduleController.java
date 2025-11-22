package com.alps.scheduler.api.controller;

import com.alps.scheduler.api.model.Task;
import com.alps.scheduler.api.service.TaskSchedulerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Controller for retrieving scheduled tasks based on dates/periods.
 * All endpoints return tasks that are scheduled to occur on specific dates.
 */
@Slf4j
@RestController
@RequestMapping("/api/schedule")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ScheduleController {

    private final TaskSchedulerService taskSchedulerService;

    /**
     * Get scheduled tasks for today
     * GET /api/schedule/today
     */
    @GetMapping("/today")
    public ResponseEntity<List<Task>> getTasksForToday() {
        LocalDate today = LocalDate.now();
        log.info("Fetching scheduled tasks for today: {}", today);
        List<Task> tasks = taskSchedulerService.getTasksForDate(today);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get scheduled tasks for a specific date
     * GET /api/schedule/date/2025-11-18
     */
    @GetMapping("/date/{date}")
    public ResponseEntity<List<Task>> getTasksByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        log.info("Fetching scheduled tasks for date: {}", date);
        List<Task> tasks = taskSchedulerService.getTasksForDate(date);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get scheduled tasks for current week
     * GET /api/schedule/week
     */
    @GetMapping("/week")
    public ResponseEntity<Map<LocalDate, List<Task>>> getTasksForCurrentWeek() {
        LocalDate today = LocalDate.now();
        log.info("Fetching scheduled tasks for current week");
        Map<LocalDate, List<Task>> tasks = taskSchedulerService.getTasksForCurrentWeek(today);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get scheduled tasks for a specific week
     * GET /api/schedule/week/2025-11-18
     */
    @GetMapping("/week/{date}")
    public ResponseEntity<Map<LocalDate, List<Task>>> getTasksForWeek(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        log.info("Fetching scheduled tasks for week of: {}", date);
        Map<LocalDate, List<Task>> tasks = taskSchedulerService.getTasksForCurrentWeek(date);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get scheduled tasks for a month
     * GET /api/schedule/month/2025/11
     */
    @GetMapping("/month/{year}/{month}")
    public ResponseEntity<Map<LocalDate, List<Task>>> getTasksForMonth(
            @PathVariable int year,
            @PathVariable int month) {
        log.info("Fetching scheduled tasks for month: {}-{}", year, month);
        Map<LocalDate, List<Task>> tasks = taskSchedulerService.getTasksForMonth(year, month);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get scheduled tasks for a quarter
     * GET /api/schedule/quarter/2025/1
     */
    @GetMapping("/quarter/{year}/{quarter}")
    public ResponseEntity<Map<LocalDate, List<Task>>> getTasksForQuarter(
            @PathVariable int year,
            @PathVariable int quarter) {
        log.info("Fetching scheduled tasks for quarter: {} Q{}", year, quarter);
        Map<LocalDate, List<Task>> tasks = taskSchedulerService.getTasksForQuarter(year, quarter);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get scheduled tasks for a half-year
     * GET /api/schedule/half-year/2025/1
     */
    @GetMapping("/half-year/{year}/{half}")
    public ResponseEntity<Map<LocalDate, List<Task>>> getTasksForHalfYear(
            @PathVariable int year,
            @PathVariable int half) {
        log.info("Fetching scheduled tasks for half-year: {} H{}", year, half);
        Map<LocalDate, List<Task>> tasks = taskSchedulerService.getTasksForHalfYear(year, half);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get scheduled tasks for a year
     * GET /api/schedule/year/2025
     */
    @GetMapping("/year/{year}")
    public ResponseEntity<Map<LocalDate, List<Task>>> getTasksForYear(@PathVariable int year) {
        log.info("Fetching scheduled tasks for year: {}", year);
        Map<LocalDate, List<Task>> tasks = taskSchedulerService.getTasksForYear(year);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get scheduled tasks for a date range
     * GET /api/schedule/range?start=2025-11-01&end=2025-11-30
     */
    @GetMapping("/range")
    public ResponseEntity<Map<LocalDate, List<Task>>> getTasksForDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        log.info("Fetching scheduled tasks for range: {} to {}", start, end);
        Map<LocalDate, List<Task>> tasks = taskSchedulerService.getTasksForDateRange(start, end);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get scheduled tasks for today filtered by department
     * GET /api/schedule/today/department/MEP
     */
    @GetMapping("/today/department/{department}")
    public ResponseEntity<List<Task>> getTodayTasksByDepartment(@PathVariable String department) {
        LocalDate today = LocalDate.now();
        log.info("Fetching scheduled tasks for today for department: {}", department);
        List<Task> allTasks = taskSchedulerService.getTasksForDate(today);
        List<Task> filteredTasks = allTasks.stream()
                .filter(t -> t.getDepartment().equalsIgnoreCase(department))
                .toList();
        return ResponseEntity.ok(filteredTasks);
    }
}
