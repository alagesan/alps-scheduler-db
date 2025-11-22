package com.alps.scheduler.batch.scheduler;

import com.alps.scheduler.batch.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;

@Slf4j
@Component
@RequiredArgsConstructor
public class DailyScheduler {

    private final EmailService emailService;

    /**
     * Runs at 7:00 AM IST (1:30 AM UTC)
     * Cron: second minute hour day month day-of-week
     */
    @Scheduled(cron = "0 30 1 * * ?", zone = "UTC")
    public void sendMorningSchedule() {
        log.info("Starting morning schedule job at 7:00 AM IST");
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        emailService.sendDailyScheduleEmail(today, "7:00 AM IST");
        log.info("Morning schedule job completed");
    }

    /**
     * Runs at 7:00 PM IST (1:30 PM UTC)
     * Cron: second minute hour day month day-of-week
     */
    @Scheduled(cron = "0 30 13 * * ?", zone = "UTC")
    public void sendEveningSchedule() {
        log.info("Starting evening schedule job at 7:00 PM IST");
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        emailService.sendDailyScheduleEmail(today, "7:00 PM IST");
        log.info("Evening schedule job completed");
    }
}
