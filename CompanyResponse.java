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
public class CompanyResponse {
    private Long id;
    private String companyName;
    private long medicineCount;
    private List<MRDto> medicalRepresentatives;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MRDto {
        private Long id;
        private String mrName;
        private String contactNumber;
    }
}
