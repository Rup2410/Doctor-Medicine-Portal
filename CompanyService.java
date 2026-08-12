package com.medicportal.service;

import com.medicportal.dto.CompanyResponse;
import com.medicportal.model.Company;
import com.medicportal.model.MedicalRepresentative;
import com.medicportal.repository.CompanyRepository;
import com.medicportal.repository.MRRepository;
import com.medicportal.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final MedicineRepository medicineRepository;
    private final MRRepository mrRepository;

    public Company findOrCreateCompany(String name) {
        if (name == null || name.trim().isEmpty()) {
            name = "Unknown Company";
        }
        String trimmed = name.trim();

        // 1. Direct case-insensitive match
        Optional<Company> existing = companyRepository.findByCompanyNameIgnoreCase(trimmed);
        if (existing.isPresent()) {
            return existing.get();
        }

        // 2. Normalized match (without suffixes like Pvt Ltd, Inc)
        String normalized = trimmed.replaceAll("(?i)\\b(Pvt|Ltd|Inc|Corp|Laboratories|Pharma|Pharmaceuticals)\\b", "")
                .replaceAll("[^a-zA-Z0-9]", "").trim();
        if (!normalized.isEmpty()) {
            Optional<Company> normMatch = companyRepository.findNormalizedMatch(normalized);
            if (normMatch.isPresent()) {
                return normMatch.get();
            }
        }

        // 3. Create new company record
        Company company = Company.builder()
                .companyName(trimmed)
                .build();
        return companyRepository.save(company);
    }

    public List<CompanyResponse> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::mapToCompanyResponse)
                .collect(Collectors.toList());
    }

    public CompanyResponse getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with id: " + id));
        return mapToCompanyResponse(company);
    }

    private CompanyResponse mapToCompanyResponse(Company company) {
        long count = medicineRepository.countByCompanyId(company.getId());
        List<MedicalRepresentative> mrs = mrRepository.findByCompanyId(company.getId());

        List<CompanyResponse.MRDto> mrDtos = mrs.stream()
                .map(mr -> CompanyResponse.MRDto.builder()
                        .id(mr.getId())
                        .mrName(mr.getMrName())
                        .contactNumber(mr.getContactNumber())
                        .build())
                .collect(Collectors.toList());

        return CompanyResponse.builder()
                .id(company.getId())
                .companyName(company.getCompanyName())
                .medicineCount(count)
                .medicalRepresentatives(mrDtos)
                .build();
    }
}
