package com.alps.scheduler.api.service;

import com.alps.scheduler.api.model.Task;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskSchedulerService {

    private final GoogleSheetsService googleSheetsService;

    /**
     * Get tasks for a specific date
     */
    public List<Task> getTasksForDate(LocalDate date) {
        List<Task> allTasks = googleSheetsService.getAllTasks();
        return allTasks.stream()
                .filter(task -> isTaskScheduledForDate(task, date))
                .collect(Collectors.toList());
    }

    /**
     * Get tasks for a date range
     */
    public Map<LocalDate, List<Task>> getTasksForDateRange(LocalDate startDate, LocalDate endDate) {
        Map<LocalDate, List<Task>> tasksByDate = new TreeMap<>();

        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            List<Task> tasksForDate = getTasksForDate(currentDate);
            if (!tasksForDate.isEmpty()) {
                tasksByDate.put(currentDate, tasksForDate);
            }
            currentDate = currentDate.plusDays(1);
        }

        return tasksByDate;
    }

    /**
     * Get tasks for the current week (Sunday to Saturday)
     */
    public Map<LocalDate, List<Task>> getTasksForCurrentWeek(LocalDate date) {
        // Week starts on Sunday
        LocalDate startOfWeek = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));
        LocalDate endOfWeek = startOfWeek.plusDays(6);
        return getTasksForDateRange(startOfWeek, endOfWeek);
    }

    /**
     * Get tasks for a month
     */
    public Map<LocalDate, List<Task>> getTasksForMonth(int year, int month) {
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.with(TemporalAdjusters.lastDayOfMonth());
        return getTasksForDateRange(startOfMonth, endOfMonth);
    }

    /**
     * Get tasks for a quarter
     */
    public Map<LocalDate, List<Task>> getTasksForQuarter(int year, int quarter) {
        int startMonth = (quarter - 1) * 3 + 1;
        LocalDate startOfQuarter = LocalDate.of(year, startMonth, 1);
        LocalDate endOfQuarter = startOfQuarter.plusMonths(3).minusDays(1);
        return getTasksForDateRange(startOfQuarter, endOfQuarter);
    }

    /**
     * Get tasks for a half-year
     */
    public Map<LocalDate, List<Task>> getTasksForHalfYear(int year, int half) {
        int startMonth = (half == 1) ? 1 : 7;
        LocalDate startOfHalf = LocalDate.of(year, startMonth, 1);
        LocalDate endOfHalf = startOfHalf.plusMonths(6).minusDays(1);
        return getTasksForDateRange(startOfHalf, endOfHalf);
    }

    /**
     * Get tasks for a year
     */
    public Map<LocalDate, List<Task>> getTasksForYear(int year) {
        LocalDate startOfYear = LocalDate.of(year, 1, 1);
        LocalDate endOfYear = LocalDate.of(year, 12, 31);
        return getTasksForDateRange(startOfYear, endOfYear);
    }

    /**
     * Get tasks by department
     */
    public List<Task> getTasksByDepartment(String department) {
        return googleSheetsService.getTasksByDepartment(department);
    }

    /**
     * Get all departments from Named Range
     */
    public List<String> getAllDepartments() {
        return googleSheetsService.getAllDepartments();
    }

    /**
     * Get all frequencies from Named Range
     */
    public List<String> getAllFrequencies() {
        return googleSheetsService.getAllFrequencies();
    }

    /**
     * Get all tasks
     */
    public List<Task> getAllTasks() {
        return googleSheetsService.getAllTasks();
    }

    /**
     * Create a new task
     */
    public Task createTask(Task task) {
        return googleSheetsService.createTask(task);
    }

    /**
     * Update an existing task
     */
    public Task updateTask(int rowNumber, Task task) {
        return googleSheetsService.updateTask(rowNumber, task);
    }

    /**
     * Delete a task
     */
    public void deleteTask(int rowNumber) {
        googleSheetsService.deleteTask(rowNumber);
    }

    /**
     * Get task by row number
     */
    public Optional<Task> getTaskByRowNumber(int rowNumber) {
        return googleSheetsService.getTaskByRowNumber(rowNumber);
    }

    /**
     * Check if a task is scheduled for a specific date
     */
    private boolean isTaskScheduledForDate(Task task, LocalDate date) {
        // Priority 1: Check specific dates
        if (task.getSpecificDates() != null && !task.getSpecificDates().isEmpty()) {
            if (matchesSpecificDate(task.getSpecificDates(), date)) {
                return true;
            }
            // If specific date is set but doesn't match, don't check frequency
            return false;
        }

        // Priority 2: Check frequency-based scheduling
        return matchesFrequency(task, date);
    }

    /**
     * Match specific dates
     */
    private boolean matchesSpecificDate(String specificDates, LocalDate date) {
        String normalized = specificDates.trim().toLowerCase();

        // Parse date formats like "October 1", "December 1"
        DateTimeFormatter monthDayFormatter = DateTimeFormatter.ofPattern("MMMM d", Locale.ENGLISH);
        try {
            MonthDay specificMonthDay = MonthDay.parse(normalized, monthDayFormatter);
            MonthDay currentMonthDay = MonthDay.from(date);
            return specificMonthDay.equals(currentMonthDay);
        } catch (Exception e) {
            // Not a standard date format, might be handled in comments
            return false;
        }
    }

    /**
     * Match frequency-based scheduling
     */
    private boolean matchesFrequency(Task task, LocalDate date) {
        String frequency = task.getFrequency();
        String comments = task.getComments() != null ? task.getComments().toLowerCase() : "";

        if (frequency == null || frequency.isEmpty()) {
            return false;
        }

        switch (frequency.toUpperCase()) {
            case "DAILY":
                return matchesDailySchedule(comments, date);

            case "WEEKLY":
                return matchesWeeklySchedule(task, comments, date);

            case "MONTHLY":
                return matchesMonthlySchedule(comments, date);

            case "QUARTERLY":
                return matchesQuarterlySchedule(date);

            case "HALF-YEARLY":
                return matchesHalfYearlySchedule(comments, date);

            case "YEARLY":
                return matchesYearlySchedule(task.getSpecificDates(), date);

            default:
                log.warn("Unknown frequency: {}", frequency);
                return false;
        }
    }

    private boolean matchesDailySchedule(String comments, LocalDate date) {
        if (comments.isEmpty()) {
            return true; // Every day
        }

        // Check for specific days like "Every Monday and Thursday"
        if (comments.contains("monday") && comments.contains("thursday")) {
            DayOfWeek day = date.getDayOfWeek();
            return day == DayOfWeek.MONDAY || day == DayOfWeek.THURSDAY;
        }

        // Check for "Every Wednesday"
        if (comments.contains("wednesday")) {
            return date.getDayOfWeek() == DayOfWeek.WEDNESDAY;
        }

        return true; // Default to every day
    }

    private boolean matchesWeeklySchedule(Task task, String comments, LocalDate date) {
        // Week starts on Sunday
        DayOfWeek dayOfWeek = date.getDayOfWeek();

        // Handle "Sunday and Wednesday" pattern
        if (comments.contains("sun") && comments.contains("wed")) {
            return dayOfWeek == DayOfWeek.SUNDAY || dayOfWeek == DayOfWeek.WEDNESDAY;
        }

        // Handle "every Sunday" pattern
        if (comments.contains("sunday")) {
            return dayOfWeek == DayOfWeek.SUNDAY;
        }

        // Default: first day of week (Sunday)
        return dayOfWeek == DayOfWeek.SUNDAY;
    }

    private boolean matchesMonthlySchedule(String comments, LocalDate date) {
        // Check for "First day of every month"
        if (comments.contains("first day")) {
            return date.getDayOfMonth() == 1;
        }

        // Default: first day of month
        return date.getDayOfMonth() == 1;
    }

    private boolean matchesQuarterlySchedule(LocalDate date) {
        // First day of quarters: Jan 1, Apr 1, Jul 1, Oct 1
        int month = date.getMonthValue();
        int day = date.getDayOfMonth();

        return day == 1 && (month == 1 || month == 4 || month == 7 || month == 10);
    }

    private boolean matchesHalfYearlySchedule(String comments, LocalDate date) {
        // Check for "In January and June"
        if (comments.contains("january") && comments.contains("june")) {
            Month month = date.getMonth();
            int day = date.getDayOfMonth();
            return day == 1 && (month == Month.JANUARY || month == Month.JUNE);
        }

        // Default: January 1 and July 1
        int month = date.getMonthValue();
        int day = date.getDayOfMonth();
        return day == 1 && (month == 1 || month == 7);
    }

    private boolean matchesYearlySchedule(String specificDates, LocalDate date) {
        // Yearly tasks should have specific dates set
        return matchesSpecificDate(specificDates, date);
    }

    /**
     * Group tasks by department
     */
    public Map<String, List<Task>> groupTasksByDepartment(List<Task> tasks) {
        return tasks.stream()
                .collect(Collectors.groupingBy(
                        Task::getDepartment,
                        TreeMap::new,
                        Collectors.toList()
                ));
    }
}
