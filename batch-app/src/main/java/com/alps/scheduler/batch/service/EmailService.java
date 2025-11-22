package com.alps.scheduler.batch.service;

import com.alps.scheduler.batch.model.Task;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final TaskSchedulerService taskSchedulerService;

    @Value("${scheduler.email.to:reservations@alpsresidencymadurai.in}")
    private String toEmail;

    @Value("${scheduler.email.from:scheduler@alpsresidency.com}")
    private String fromEmail;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public void sendDailyScheduleEmail(LocalDate date, String scheduleTime) {
        try {
            // Get today's tasks
            List<Task> todayTasks = taskSchedulerService.getTasksForDate(date);
            Map<String, List<Task>> todayTasksByDept = taskSchedulerService.groupTasksByDepartment(todayTasks);

            // Get week's tasks
            Map<LocalDate, List<Task>> weekTasksMap = taskSchedulerService.getTasksForCurrentWeek(date);

            // Prepare email content
            Context context = new Context();
            context.setVariable("todayFormatted", formatDate(date));
            context.setVariable("scheduleTime", scheduleTime);
            context.setVariable("todayTasksByDept", todayTasksByDept);
            context.setVariable("weekTasks", formatWeekTasks(weekTasksMap));
            context.setVariable("weekRange", getWeekRange(date));
            context.setVariable("nextScheduleMessage", getNextScheduleMessage(scheduleTime));

            String htmlContent = templateEngine.process("daily-schedule-email", context);

            // Send email
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Use configured username if available, otherwise use fromEmail
            String actualFromEmail = (mailUsername != null && !mailUsername.isEmpty()) ? mailUsername : fromEmail;

            helper.setFrom(actualFromEmail);
            helper.setTo(toEmail);
            helper.setSubject(String.format("ALPS Residency - Daily Task Schedule for %s (%s)",
                    formatDate(date), scheduleTime));
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Daily schedule email sent successfully to {} for date {} at {}",
                    toEmail, date, scheduleTime);

        } catch (MessagingException e) {
            log.error("Failed to send email: {}", e.getMessage(), e);
        }
    }

    private String formatDate(LocalDate date) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy", Locale.ENGLISH);
        return date.format(formatter);
    }

    private Map<String, List<Task>> formatWeekTasks(Map<LocalDate, List<Task>> weekTasksMap) {
        Map<String, List<Task>> formattedMap = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMM d", Locale.ENGLISH);

        weekTasksMap.forEach((date, tasks) -> {
            String formattedDate = date.format(formatter);
            formattedMap.put(formattedDate, tasks);
        });

        return formattedMap;
    }

    private String getWeekRange(LocalDate date) {
        LocalDate startOfWeek = date.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.SUNDAY));
        LocalDate endOfWeek = startOfWeek.plusDays(6);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH);
        return String.format("%s - %s", startOfWeek.format(formatter), endOfWeek.format(formatter));
    }

    private String getNextScheduleMessage(String currentSchedule) {
        if (currentSchedule.contains("7:00 AM")) {
            return "Next reminder will be sent at 7:00 PM IST";
        } else {
            return "Next reminder will be sent tomorrow at 7:00 AM IST";
        }
    }
}
