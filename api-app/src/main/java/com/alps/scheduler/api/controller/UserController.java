package com.alps.scheduler.api.controller;

import com.alps.scheduler.api.model.User;
import com.alps.scheduler.api.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Controller for managing User data (CRUD operations).
 * This manages the user definitions in the Scheduler-Users sheet.
 */
@Slf4j
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Get all users
     * GET /api/users
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        log.info("Fetching all users");
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Get a user by row number
     * GET /api/users/5
     */
    @GetMapping("/{rowNumber}")
    public ResponseEntity<User> getUserByRowNumber(@PathVariable int rowNumber) {
        log.info("Fetching user at row: {}", rowNumber);
        Optional<User> user = userService.getUserByRowNumber(rowNumber);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get a user by email
     * GET /api/users/email/user@example.com
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        log.info("Fetching user by email: {}", email);
        Optional<User> user = userService.getUserByEmail(email);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new user
     * POST /api/users
     */
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        log.info("Creating new user: {}", user.getEmail());
        try {
            User createdUser = userService.createUser(user);
            return ResponseEntity.ok(createdUser);
        } catch (RuntimeException e) {
            log.error("Error creating user: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Update an existing user
     * PUT /api/users/5
     */
    @PutMapping("/{rowNumber}")
    public ResponseEntity<User> updateUser(
            @PathVariable int rowNumber,
            @RequestBody User user) {
        log.info("Updating user at row {}: {}", rowNumber, user.getEmail());
        User updatedUser = userService.updateUser(rowNumber, user);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Delete a user
     * DELETE /api/users/5
     */
    @DeleteMapping("/{rowNumber}")
    public ResponseEntity<Void> deleteUser(@PathVariable int rowNumber) {
        log.info("Deleting user at row: {}", rowNumber);
        userService.deleteUser(rowNumber);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get users by status
     * GET /api/users/status/Enabled
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<User>> getUsersByStatus(@PathVariable String status) {
        log.info("Fetching users with status: {}", status);
        List<User> users = userService.getUsersByStatus(status);
        return ResponseEntity.ok(users);
    }

    /**
     * Get users by role
     * GET /api/users/role/Admin
     */
    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        log.info("Fetching users with role: {}", role);
        List<User> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    /**
     * Get all available statuses
     * GET /api/users/statuses
     */
    @GetMapping("/statuses")
    public ResponseEntity<List<String>> getAllStatuses() {
        log.info("Fetching all statuses");
        List<String> statuses = userService.getAllStatuses();
        return ResponseEntity.ok(statuses);
    }

    /**
     * Get all available roles
     * GET /api/users/roles
     */
    @GetMapping("/roles")
    public ResponseEntity<List<String>> getAllRoles() {
        log.info("Fetching all roles");
        List<String> roles = userService.getAllRoles();
        return ResponseEntity.ok(roles);
    }
}
