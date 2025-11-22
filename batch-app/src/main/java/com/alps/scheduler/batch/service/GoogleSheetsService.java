package com.alps.scheduler.batch.service;

import com.alps.scheduler.batch.model.Task;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.SheetsScopes;
import com.google.api.services.sheets.v4.model.ValueRange;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class GoogleSheetsService {

    private static final String APPLICATION_NAME = "Alps Scheduler Batch";
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    @Value("${google.sheets.spreadsheet-id}")
    private String spreadsheetId;

    @Value("${google.sheets.credentials-path}")
    private String credentialsPath;

    @Value("${google.sheets.sheet-name:Sheet1}")
    private String sheetName;

    private Sheets sheetsService;

    @PostConstruct
    public void init() throws GeneralSecurityException, IOException {
        GoogleCredentials credentials = GoogleCredentials
                .fromStream(new FileInputStream(credentialsPath))
                .createScoped(Collections.singleton(SheetsScopes.SPREADSHEETS_READONLY));

        sheetsService = new Sheets.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JSON_FACTORY,
                new HttpCredentialsAdapter(credentials))
                .setApplicationName(APPLICATION_NAME)
                .build();

        log.info("Google Sheets service initialized for spreadsheet: {}", spreadsheetId);
    }

    /**
     * Get all tasks from the Google Sheet
     */
    public List<Task> getAllTasks() {
        try {
            String range = sheetName + "!A2:F"; // Skip header row
            ValueRange response = sheetsService.spreadsheets().values()
                    .get(spreadsheetId, range)
                    .execute();

            List<List<Object>> values = response.getValues();
            if (values == null || values.isEmpty()) {
                log.info("No tasks found in the spreadsheet");
                return new ArrayList<>();
            }

            List<Task> tasks = new ArrayList<>();
            for (List<Object> row : values) {
                Task task = mapRowToTask(row);
                if (task != null) {
                    tasks.add(task);
                }
            }

            log.info("Loaded {} tasks from Google Sheets", tasks.size());
            return tasks;

        } catch (IOException e) {
            log.error("Error reading from Google Sheets", e);
            throw new RuntimeException("Failed to read tasks from Google Sheets", e);
        }
    }

    /**
     * Get tasks by department
     */
    public List<Task> getTasksByDepartment(String department) {
        return getAllTasks().stream()
                .filter(task -> task.getDepartment().equalsIgnoreCase(department))
                .collect(Collectors.toList());
    }

    /**
     * Get all departments from Named Range "Departments"
     */
    public List<String> getAllDepartments() {
        return getValuesFromNamedRange("Departments");
    }

    /**
     * Get all frequencies from Named Range "Frequencies"
     */
    public List<String> getAllFrequencies() {
        return getValuesFromNamedRange("Frequencies");
    }

    /**
     * Get values from a Named Range in the spreadsheet
     */
    private List<String> getValuesFromNamedRange(String namedRange) {
        try {
            ValueRange response = sheetsService.spreadsheets().values()
                    .get(spreadsheetId, namedRange)
                    .execute();

            List<List<Object>> values = response.getValues();
            if (values == null || values.isEmpty()) {
                log.warn("No values found in Named Range: {}", namedRange);
                return new ArrayList<>();
            }

            List<String> result = new ArrayList<>();
            for (List<Object> row : values) {
                if (row != null && !row.isEmpty() && row.get(0) != null) {
                    String value = row.get(0).toString().trim();
                    if (!value.isEmpty()) {
                        result.add(value);
                    }
                }
            }

            log.info("Loaded {} values from Named Range '{}'", result.size(), namedRange);
            return result;

        } catch (IOException e) {
            log.error("Error reading Named Range '{}' from Google Sheets: {}", namedRange, e.getMessage());
            // Fallback to extracting from tasks if Named Range doesn't exist
            log.info("Falling back to extracting {} from task data", namedRange.toLowerCase());
            if ("Departments".equals(namedRange)) {
                return getAllTasks().stream()
                        .map(Task::getDepartment)
                        .distinct()
                        .sorted()
                        .collect(Collectors.toList());
            } else if ("Frequencies".equals(namedRange)) {
                return getAllTasks().stream()
                        .map(Task::getFrequency)
                        .distinct()
                        .sorted()
                        .collect(Collectors.toList());
            }
            return new ArrayList<>();
        }
    }

    /**
     * Map a row from the sheet to a Task object
     */
    private Task mapRowToTask(List<Object> row) {
        if (row == null || row.isEmpty()) {
            return null;
        }

        try {
            return Task.builder()
                    .activity(getStringValue(row, 0))
                    .department(getStringValue(row, 1))
                    .frequency(getStringValue(row, 2))
                    .noOfTimes(getIntValue(row, 3))
                    .specificDates(getStringValue(row, 4))
                    .comments(getStringValue(row, 5))
                    .build();
        } catch (Exception e) {
            log.warn("Error mapping row to Task: {}", e.getMessage());
            return null;
        }
    }

    private String getStringValue(List<Object> row, int index) {
        if (index >= row.size() || row.get(index) == null) {
            return "";
        }
        return row.get(index).toString().trim();
    }

    private Integer getIntValue(List<Object> row, int index) {
        String value = getStringValue(row, index);
        if (value.isEmpty()) {
            return null;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
