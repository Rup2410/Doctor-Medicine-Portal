package com.medicportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorProfileDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String profilePictureUrl;
    private String themePreference;
    private String defaultView;
    private String defaultDateRange;
    private Integer itemsPerPage;
    private String notificationsSettings;
    private Boolean reduceMotion;
    private LocalDateTime createdAt;
}
