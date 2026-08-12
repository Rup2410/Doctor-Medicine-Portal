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
public class FavoriteMRResponse {
    private Long id;
    private Long mrId;
    private String mrName;
    private String contactNumber;
    private Long companyId;
    private String companyName;
    private LocalDateTime favoritedAt;
    private List<AssociatedMedicineDto> medicines;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssociatedMedicineDto {
        private Long id;
        private String medicineName;
        private String composition;
    }
}
