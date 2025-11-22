package com.alps.scheduler.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Task {
    private String activity;
    private String department;
    private String frequency;
    private Integer noOfTimes;
    private String specificDates;
    private String comments;
}
