package com.medicportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineResponse {
    private Long id;
    private String medicineName;
    private Long companyId;
    private String companyName;
    private String composition;
    private String description;
    private String mrName;
    private String mrContact;
    private LocalDateTime createdAt;
    private List<DocumentSummaryDto> documents;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentSummaryDto {
        private Long id;
        private String fileName;
        private String fileType;
        private LocalDateTime uploadDate;
    }
}
