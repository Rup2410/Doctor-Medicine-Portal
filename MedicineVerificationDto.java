package com.medicportal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class MedicineVerificationDto {

    private Long documentId;

    @NotBlank(message = "Company name is required")
    private String companyName;

    private String mrName;
    private String mrContact;

    private List<MedicineItem> medicines;

    @Data
    public static class MedicineItem {
        private Long existingMedicineId; // Optional: set if associating with an existing duplicate medicine

        @NotBlank(message = "Medicine name is required")
        private String medicineName;

        private String composition;
        private String description;
    }
}
