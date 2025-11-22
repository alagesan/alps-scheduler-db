package com.alps.scheduler.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Integer rowNumber;  // Row number in Google Sheet (for updates/deletes)
    private String email;       // User email address
    private String status;      // Enabled or Disabled
    private String role;        // Admin or User
}
