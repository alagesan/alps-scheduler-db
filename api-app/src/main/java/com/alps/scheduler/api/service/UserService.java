package com.alps.scheduler.api.service;

import com.alps.scheduler.api.model.User;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.SheetsScopes;
import com.google.api.services.sheets.v4.model.*;
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
public class UserService {

    private static final String APPLICATION_NAME = "Alps Scheduler";
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    @Value("${google.sheets.spreadsheet-id}")
    private String spreadsheetId;

    @Value("${google.sheets.credentials-path}")
    private String credentialsPath;

    @Value("${google.sheets.users-sheet-name:Users}")
    private String usersSheetName;

    private Sheets sheetsService;

    @PostConstruct
    public void init() throws GeneralSecurityException, IOException {
        GoogleCredentials credentials = GoogleCredentials
                .fromStream(new FileInputStream(credentialsPath))
                .createScoped(Collections.singleton(SheetsScopes.SPREADSHEETS));

        sheetsService = new Sheets.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JSON_FACTORY,
                new HttpCredentialsAdapter(credentials))
                .setApplicationName(APPLICATION_NAME)
                .build();

        log.info("User Service initialized for spreadsheet: {}, sheet: {}", spreadsheetId, usersSheetName);
    }

    /**
     * Get all users from the Google Sheet
     */
    public List<User> getAllUsers() {
        try {
            String range = usersSheetName + "!A2:C"; // Skip header row
            ValueRange response = sheetsService.spreadsheets().values()
                    .get(spreadsheetId, range)
                    .execute();

            List<List<Object>> values = response.getValues();
            if (values == null || values.isEmpty()) {
                log.info("No users found in the spreadsheet");
                return new ArrayList<>();
            }

            List<User> users = new ArrayList<>();
            int rowIndex = 2; // Start from row 2 (after header)
            for (List<Object> row : values) {
                User user = mapRowToUser(row, rowIndex);
                if (user != null) {
                    users.add(user);
                }
                rowIndex++;
            }

            log.info("Loaded {} users from Google Sheets", users.size());
            return users;

        } catch (IOException e) {
            log.error("Error reading users from Google Sheets", e);
            throw new RuntimeException("Failed to read users from Google Sheets", e);
        }
    }

    /**
     * Get a user by row number
     */
    public Optional<User> getUserByRowNumber(int rowNumber) {
        try {
            String range = usersSheetName + "!A" + rowNumber + ":C" + rowNumber;
            ValueRange response = sheetsService.spreadsheets().values()
                    .get(spreadsheetId, range)
                    .execute();

            List<List<Object>> values = response.getValues();
            if (values == null || values.isEmpty()) {
                return Optional.empty();
            }

            return Optional.ofNullable(mapRowToUser(values.get(0), rowNumber));

        } catch (IOException e) {
            log.error("Error reading user from Google Sheets", e);
            throw new RuntimeException("Failed to read user from Google Sheets", e);
        }
    }

    /**
     * Get a user by email
     */
    public Optional<User> getUserByEmail(String email) {
        return getAllUsers().stream()
                .filter(user -> user.getEmail().equalsIgnoreCase(email))
                .findFirst();
    }

    /**
     * Create a new user (append to sheet)
     */
    public User createUser(User user) {
        try {
            // Check if user already exists
            if (getUserByEmail(user.getEmail()).isPresent()) {
                throw new RuntimeException("User with email " + user.getEmail() + " already exists");
            }

            List<Object> rowData = userToRow(user);
            ValueRange body = new ValueRange().setValues(Collections.singletonList(rowData));

            AppendValuesResponse response = sheetsService.spreadsheets().values()
                    .append(spreadsheetId, usersSheetName + "!A:C", body)
                    .setValueInputOption("USER_ENTERED")
                    .setInsertDataOption("INSERT_ROWS")
                    .execute();

            // Extract the row number from the updated range
            String updatedRange = response.getUpdates().getUpdatedRange();
            int rowNumber = extractRowNumber(updatedRange);
            user.setRowNumber(rowNumber);

            log.info("Created new user at row {}: {}", rowNumber, user.getEmail());
            return user;

        } catch (IOException e) {
            log.error("Error creating user in Google Sheets", e);
            throw new RuntimeException("Failed to create user in Google Sheets", e);
        }
    }

    /**
     * Update an existing user by row number
     */
    public User updateUser(int rowNumber, User user) {
        try {
            String range = usersSheetName + "!A" + rowNumber + ":C" + rowNumber;
            List<Object> rowData = userToRow(user);
            ValueRange body = new ValueRange().setValues(Collections.singletonList(rowData));

            sheetsService.spreadsheets().values()
                    .update(spreadsheetId, range, body)
                    .setValueInputOption("USER_ENTERED")
                    .execute();

            user.setRowNumber(rowNumber);
            log.info("Updated user at row {}: {}", rowNumber, user.getEmail());
            return user;

        } catch (IOException e) {
            log.error("Error updating user in Google Sheets", e);
            throw new RuntimeException("Failed to update user in Google Sheets", e);
        }
    }

    /**
     * Delete a user by row number
     */
    public void deleteUser(int rowNumber) {
        try {
            // Get the sheet ID first
            Spreadsheet spreadsheet = sheetsService.spreadsheets()
                    .get(spreadsheetId)
                    .execute();

            Integer sheetId = null;
            for (Sheet sheet : spreadsheet.getSheets()) {
                if (sheet.getProperties().getTitle().equals(usersSheetName)) {
                    sheetId = sheet.getProperties().getSheetId();
                    break;
                }
            }

            if (sheetId == null) {
                throw new RuntimeException("Sheet not found: " + usersSheetName);
            }

            // Delete the row
            DeleteDimensionRequest deleteRequest = new DeleteDimensionRequest()
                    .setRange(new DimensionRange()
                            .setSheetId(sheetId)
                            .setDimension("ROWS")
                            .setStartIndex(rowNumber - 1) // 0-indexed
                            .setEndIndex(rowNumber));

            BatchUpdateSpreadsheetRequest batchRequest = new BatchUpdateSpreadsheetRequest()
                    .setRequests(Collections.singletonList(
                            new Request().setDeleteDimension(deleteRequest)));

            sheetsService.spreadsheets()
                    .batchUpdate(spreadsheetId, batchRequest)
                    .execute();

            log.info("Deleted user at row {}", rowNumber);

        } catch (IOException e) {
            log.error("Error deleting user from Google Sheets", e);
            throw new RuntimeException("Failed to delete user from Google Sheets", e);
        }
    }

    /**
     * Get users by status
     */
    public List<User> getUsersByStatus(String status) {
        return getAllUsers().stream()
                .filter(user -> user.getStatus().equalsIgnoreCase(status))
                .collect(Collectors.toList());
    }

    /**
     * Get users by role
     */
    public List<User> getUsersByRole(String role) {
        return getAllUsers().stream()
                .filter(user -> user.getRole().equalsIgnoreCase(role))
                .collect(Collectors.toList());
    }

    /**
     * Get all unique statuses from Named Range "Statuses"
     */
    public List<String> getAllStatuses() {
        return getValuesFromNamedRange("UserStatuses", Arrays.asList("Enabled", "Disabled"));
    }

    /**
     * Get all unique roles from Named Range "Roles"
     */
    public List<String> getAllRoles() {
        return getValuesFromNamedRange("Roles", Arrays.asList("Admin", "User"));
    }

    /**
     * Get values from a Named Range in the spreadsheet
     */
    private List<String> getValuesFromNamedRange(String namedRange, List<String> fallbackValues) {
        try {
            ValueRange response = sheetsService.spreadsheets().values()
                    .get(spreadsheetId, namedRange)
                    .execute();

            List<List<Object>> values = response.getValues();
            if (values == null || values.isEmpty()) {
                log.warn("No values found in Named Range: {}, using fallback", namedRange);
                return fallbackValues;
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
            return result.isEmpty() ? fallbackValues : result;

        } catch (IOException e) {
            log.warn("Named Range '{}' not found, using fallback values: {}", namedRange, e.getMessage());
            return fallbackValues;
        }
    }

    /**
     * Map a row from the sheet to a User object
     */
    private User mapRowToUser(List<Object> row, int rowNumber) {
        if (row == null || row.isEmpty()) {
            return null;
        }

        try {
            return User.builder()
                    .rowNumber(rowNumber)
                    .email(getStringValue(row, 0))
                    .status(getStringValue(row, 1))
                    .role(getStringValue(row, 2))
                    .build();
        } catch (Exception e) {
            log.warn("Error mapping row {} to User: {}", rowNumber, e.getMessage());
            return null;
        }
    }

    /**
     * Convert a User to a row for the sheet
     */
    private List<Object> userToRow(User user) {
        return Arrays.asList(
                user.getEmail() != null ? user.getEmail() : "",
                user.getStatus() != null ? user.getStatus() : "Enabled",
                user.getRole() != null ? user.getRole() : "User"
        );
    }

    private String getStringValue(List<Object> row, int index) {
        if (index >= row.size() || row.get(index) == null) {
            return "";
        }
        return row.get(index).toString().trim();
    }

    private int extractRowNumber(String range) {
        // Range format: "Sheet1!A5:C5" - extract 5
        String[] parts = range.split("!");
        if (parts.length > 1) {
            String cellRange = parts[1];
            String rowPart = cellRange.replaceAll("[A-Z:]", "");
            String[] rows = rowPart.split("(?<=\\d)(?=\\d)");
            return Integer.parseInt(rows[0]);
        }
        return -1;
    }
}
