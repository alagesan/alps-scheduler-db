package com.alps.scheduler.api.service;

import com.alps.scheduler.api.model.Task;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
public class CsvParserService {

    @Value("${scheduler.csv.path:/data/Scheduler-Master.csv}")
    private String csvPath;

    private final List<Task> tasks = new CopyOnWriteArrayList<>();
    private WatchService watchService;

    @PostConstruct
    public void init() {
        loadCsvData();
        startFileWatcher();
    }

    public void loadCsvData() {
        try (Reader reader = new FileReader(csvPath);
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT
                     .withFirstRecordAsHeader()
                     .withIgnoreHeaderCase()
                     .withTrim())) {

            List<Task> newTasks = new ArrayList<>();
            for (CSVRecord record : csvParser) {
                // Skip empty rows
                if (record.get("Activity").isEmpty()) {
                    continue;
                }

                Task task = Task.builder()
                        .activity(record.get("Activity"))
                        .department(record.get("Dept"))
                        .frequency(record.get("Frequency"))
                        .noOfTimes(parseInteger(record.get("NoOfTimes")))
                        .specificDates(record.get("Specific Dates"))
                        .comments(record.get("Comments"))
                        .build();
                newTasks.add(task);
            }

            tasks.clear();
            tasks.addAll(newTasks);
            log.info("Loaded {} tasks from CSV", tasks.size());

        } catch (IOException e) {
            log.error("Error reading CSV file: {}", e.getMessage(), e);
        }
    }

    private Integer parseInteger(String value) {
        try {
            return value != null && !value.isEmpty() ? Integer.parseInt(value) : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private void startFileWatcher() {
        Thread watcherThread = new Thread(() -> {
            try {
                watchService = FileSystems.getDefault().newWatchService();
                Path path = Paths.get(csvPath).getParent();
                path.register(watchService, StandardWatchEventKinds.ENTRY_MODIFY);

                log.info("File watcher started for: {}", path);

                while (true) {
                    WatchKey key = watchService.take();
                    for (WatchEvent<?> event : key.pollEvents()) {
                        if (event.kind() == StandardWatchEventKinds.ENTRY_MODIFY) {
                            Path changed = (Path) event.context();
                            if (changed.toString().equals(Paths.get(csvPath).getFileName().toString())) {
                                log.info("CSV file modified, reloading...");
                                Thread.sleep(1000); // Wait for file write to complete
                                loadCsvData();
                            }
                        }
                    }
                    key.reset();
                }
            } catch (Exception e) {
                log.error("File watcher error: {}", e.getMessage(), e);
            }
        });
        watcherThread.setDaemon(true);
        watcherThread.start();
    }

    public List<Task> getAllTasks() {
        return new ArrayList<>(tasks);
    }
}
