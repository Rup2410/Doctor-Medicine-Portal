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
public class NotificationItemDto {
    private String id;
    private String title;
    private String message;
    private String type; // DOCUMENT_PROCESSED, EXTRACTION_REVIEW, SECURITY_ALERT
    private boolean read;
    private LocalDateTime timestamp;
}
