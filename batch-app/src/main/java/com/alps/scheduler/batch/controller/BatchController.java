package com.alps.scheduler.batch.controller;

import com.alps.scheduler.batch.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/batch")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class BatchController {

    private final EmailService emailService;

    /**
     * Trigger email sending manually
     * POST /api/batch/send-email
     */
    @PostMapping("/send-email")
    public ResponseEntity<Map<String, String>> sendEmailManually(
            @RequestParam(required = false) String scheduleTime) {

        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        String time = scheduleTime != null ? scheduleTime : "Manual Trigger";

        log.info("Manual email trigger requested for date: {} at {}", today, time);

        try {
            emailService.sendDailyScheduleEmail(today, time);

            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Email sent successfully");
            response.put("date", today.toString());
            response.put("scheduleTime", time);
            response.put("recipient", "internal@alpsresidencymadurai.in");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to send email: {}", e.getMessage(), e);

            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to send email: " + e.getMessage());

            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Send email for a specific date
     * POST /api/batch/send-email/date/{date}
     */
    @PostMapping("/send-email/date/{date}")
    public ResponseEntity<Map<String, String>> sendEmailForDate(
            @PathVariable String date,
            @RequestParam(required = false) String scheduleTime) {

        try {
            LocalDate targetDate = LocalDate.parse(date);
            String time = scheduleTime != null ? scheduleTime : "Manual Trigger";

            log.info("Manual email trigger requested for specific date: {} at {}", targetDate, time);

            emailService.sendDailyScheduleEmail(targetDate, time);

            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Email sent successfully");
            response.put("date", targetDate.toString());
            response.put("scheduleTime", time);
            response.put("recipient", "internal@alpsresidencymadurai.in");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to send email: {}", e.getMessage(), e);

            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to send email: " + e.getMessage());

            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get batch job status and next scheduled run
     * GET /api/batch/status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getBatchStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "running");
        response.put("scheduledTimes", new String[]{"7:00 AM IST", "7:00 PM IST"});
        response.put("timezone", "Asia/Kolkata (IST)");
        response.put("recipient", "internal@alpsresidencymadurai.in");
        response.put("currentDate", LocalDate.now(ZoneId.of("Asia/Kolkata")).toString());

        return ResponseEntity.ok(response);
    }
}
