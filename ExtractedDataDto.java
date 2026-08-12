package com.medicportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtractedDataDto {
    private Long documentId;
    private String fileName;
    private String rawText;
    private CompanyExtraction company;
    private List<MedicineExtraction> medicines;
    private MRExtraction mr;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanyExtraction {
        private String value;
        private Double confidence;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicineExtraction {
        private String medicineName;
        private String composition;
        private String description;
        private Double confidence;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MRExtraction {
        private String name;
        private String contactNumber;
        private Double confidence;
    }
}
