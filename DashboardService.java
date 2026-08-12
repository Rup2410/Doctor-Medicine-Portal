package com.medicportal.service;

import com.medicportal.dto.DashboardStatsDto;
import com.medicportal.dto.MedicineResponse;
import com.medicportal.model.Medicine;
import com.medicportal.repository.CompanyRepository;
import com.medicportal.repository.DocumentRepository;
import com.medicportal.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MedicineRepository medicineRepository;
    private final CompanyRepository companyRepository;
    private final DocumentRepository documentRepository;
    private final MedicineService medicineService;

    public DashboardStatsDto getStatistics(Long doctorId) {
        long totalMedicines = medicineRepository.count();
        long totalCompanies = companyRepository.count();
        long totalDocuments = (doctorId != null) ? documentRepository.findByDoctorId(doctorId).size() : documentRepository.count();

        return DashboardStatsDto.builder()
                .totalMedicines(totalMedicines)
                .totalCompanies(totalCompanies)
                .totalDocuments(totalDocuments)
                .recentlyAddedCount(totalMedicines)
                .build();
    }

    public List<MedicineResponse> getRecentMedicines(LocalDate fromDate, LocalDate toDate, Integer limit) {
        int maxResults = (limit != null && limit > 0) ? limit : 10;
        List<Medicine> medicines;

        if (fromDate != null || toDate != null) {
            LocalDateTime start = (fromDate != null) ? fromDate.atStartOfDay() : LocalDateTime.of(2000, 1, 1, 0, 0);
            LocalDateTime end = (toDate != null) ? toDate.atTime(LocalTime.MAX) : LocalDateTime.now();
            medicines = medicineRepository.findMedicinesByDateRange(start, end);
        } else {
            medicines = medicineRepository.findRecentMedicines(PageRequest.of(0, maxResults));
        }

        return medicines.stream()
                .limit(maxResults)
                .map(medicineService::mapToMedicineResponse)
                .collect(Collectors.toList());
    }
}
