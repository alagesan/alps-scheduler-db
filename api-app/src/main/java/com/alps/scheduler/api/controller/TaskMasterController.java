package com.alps.scheduler.api.controller;

import com.alps.scheduler.api.model.Task;
import com.alps.scheduler.api.service.TaskSchedulerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Controller for managing Task Master data (CRUD operations).
 * This manages the task definitions in the Tasks-Master sheet.
 */
@Slf4j
@RestController
@RequestMapping("/api/master")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TaskMasterController {

    private final TaskSchedulerService taskSchedulerService;

    /**
     * Get all task master records
     * GET /api/master/tasks
     */
    @GetMapping("/tasks")
    public ResponseEntity<List<Task>> getAllTasks() {
        log.info("Fetching all task master records");
        List<Task> tasks = taskSchedulerService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get a task master record by row number
     * GET /api/master/tasks/5
     */
    @GetMapping("/tasks/{rowNumber}")
    public ResponseEntity<Task> getTaskByRowNumber(@PathVariable int rowNumber) {
        log.info("Fetching task master record at row: {}", rowNumber);
        Optional<Task> task = taskSchedulerService.getTaskByRowNumber(rowNumber);
        return task.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new task master record
     * POST /api/master/tasks
     */
    @PostMapping("/tasks")
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        log.info("Creating new task master record: {}", task.getActivity());
        Task createdTask = taskSchedulerService.createTask(task);
        return ResponseEntity.ok(createdTask);
    }

    /**
     * Update an existing task master record
     * PUT /api/master/tasks/5
     */
    @PutMapping("/tasks/{rowNumber}")
    public ResponseEntity<Task> updateTask(
            @PathVariable int rowNumber,
            @RequestBody Task task) {
        log.info("Updating task master record at row {}: {}", rowNumber, task.getActivity());
        Task updatedTask = taskSchedulerService.updateTask(rowNumber, task);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * Delete a task master record
     * DELETE /api/master/tasks/5
     */
    @DeleteMapping("/tasks/{rowNumber}")
    public ResponseEntity<Void> deleteTask(@PathVariable int rowNumber) {
        log.info("Deleting task master record at row: {}", rowNumber);
        taskSchedulerService.deleteTask(rowNumber);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all unique departments from task master
     * GET /api/master/departments
     */
    @GetMapping("/departments")
    public ResponseEntity<List<String>> getAllDepartments() {
        log.info("Fetching all departments from task master");
        List<String> departments = taskSchedulerService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }

    /**
     * Get all task master records for a specific department
     * GET /api/master/tasks/department/MEP
     */
    @GetMapping("/tasks/department/{department}")
    public ResponseEntity<List<Task>> getTasksByDepartment(@PathVariable String department) {
        log.info("Fetching task master records for department: {}", department);
        List<Task> tasks = taskSchedulerService.getTasksByDepartment(department);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get all frequencies from Named Range
     * GET /api/master/frequencies
     */
    @GetMapping("/frequencies")
    public ResponseEntity<List<String>> getAllFrequencies() {
        log.info("Fetching all frequencies from Named Range");
        List<String> frequencies = taskSchedulerService.getAllFrequencies();
        return ResponseEntity.ok(frequencies);
    }

    /**
     * Get task master records by frequency
     * GET /api/master/tasks/frequency/Daily
     */
    @GetMapping("/tasks/frequency/{frequency}")
    public ResponseEntity<List<Task>> getTasksByFrequency(@PathVariable String frequency) {
        log.info("Fetching task master records for frequency: {}", frequency);
        List<Task> allTasks = taskSchedulerService.getAllTasks();
        List<Task> filteredTasks = allTasks.stream()
                .filter(t -> t.getFrequency().equalsIgnoreCase(frequency))
                .toList();
        return ResponseEntity.ok(filteredTasks);
    }
}
