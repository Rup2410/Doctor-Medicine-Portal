package com.medicportal.dto;

import lombok.Data;

@Data
public class DoctorPreferencesDto {
    private String themePreference; // LIGHT, DARK, SYSTEM
    private String defaultView; // GRID, TABLE
    private String defaultDateRange; // TODAY, 7DAYS, 30DAYS
    private Integer itemsPerPage; // 10, 25, 50
    private String notificationsSettings; // JSON string
    private Boolean reduceMotion;
}
