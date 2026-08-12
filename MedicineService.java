package com.medicportal.service;

import com.medicportal.dto.MedicineResponse;
import com.medicportal.dto.MedicineVerificationDto;
import com.medicportal.dto.PageResponse;
import com.medicportal.model.*;
import com.medicportal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final CompanyService companyService;
    private final MRRepository mrRepository;
    private final DocumentRepository documentRepository;
    private final MedicineDocumentRepository medicineDocumentRepository;

    @Transactional
    public List<MedicineResponse> verifyAndSaveMedicines(MedicineVerificationDto dto, Long doctorId) {
        // 1. Fetch document
        Document document = documentRepository.findByIdAndDoctorId(dto.getDocumentId(), doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found or unauthorized"));

        // 2. Resolve/Normalize Company
        Company company = companyService.findOrCreateCompany(dto.getCompanyName());

        // 3. Resolve or Create Medical Representative
        if (dto.getMrName() != null && !dto.getMrName().trim().isEmpty()) {
            String mrName = dto.getMrName().trim();
            Optional<MedicalRepresentative> existingMr = mrRepository.findByMrNameIgnoreCaseAndCompanyId(mrName, company.getId());
            if (existingMr.isEmpty()) {
                MedicalRepresentative newMr = MedicalRepresentative.builder()
                        .mrName(mrName)
                        .contactNumber(dto.getMrContact())
                        .company(company)
                        .build();
                mrRepository.save(newMr);
            } else if (dto.getMrContact() != null && !dto.getMrContact().trim().isEmpty()) {
                MedicalRepresentative mr = existingMr.get();
                mr.setContactNumber(dto.getMrContact());
                mrRepository.save(mr);
            }
        }

        List<MedicineResponse> savedResponses = new ArrayList<>();

        if (dto.getMedicines() != null) {
            for (MedicineVerificationDto.MedicineItem item : dto.getMedicines()) {
                Medicine medicine;
                
                if (item.getExistingMedicineId() != null) {
                    medicine = medicineRepository.findById(item.getExistingMedicineId())
                            .orElseThrow(() -> new IllegalArgumentException("Existing medicine not found with id: " + item.getExistingMedicineId()));
                } else {
                    // Check duplicate by name & company ID
                    Optional<Medicine> dup = medicineRepository.findByMedicineNameIgnoreCaseAndCompanyId(item.getMedicineName().trim(), company.getId());
                    if (dup.isPresent()) {
                        medicine = dup.get();
                        if (item.getComposition() != null && !item.getComposition().trim().isEmpty()) {
                            medicine.setComposition(item.getComposition().trim());
                        }
                        if (item.getDescription() != null && !item.getDescription().trim().isEmpty()) {
                            medicine.setDescription(item.getDescription().trim());
                        }
                        medicineRepository.save(medicine);
                    } else {
                        medicine = Medicine.builder()
                                .medicineName(item.getMedicineName().trim())
                                .company(company)
                                .composition(item.getComposition())
                                .description(item.getDescription())
                                .build();
                        medicine = medicineRepository.save(medicine);
                    }
                }

                // Link Medicine and Document
                if (!medicineDocumentRepository.existsByMedicineIdAndDocumentId(medicine.getId(), document.getId())) {
                    MedicineDocument md = MedicineDocument.builder()
                            .medicine(medicine)
                            .document(document)
                            .build();
                    medicineDocumentRepository.save(md);
                }

                savedResponses.add(mapToMedicineResponse(medicine));
            }
        }

        // Update Document processing status
        document.setProcessingStatus("CONFIRMED");
        documentRepository.save(document);

        return savedResponses;
    }

    public PageResponse<MedicineResponse> searchMedicines(String search, Long companyId, LocalDate fromDate, LocalDate toDate, int page, int size, String sort) {
        Sort sortOrder = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("name_asc".equalsIgnoreCase(sort)) {
            sortOrder = Sort.by(Sort.Direction.ASC, "medicineName");
        } else if ("name_desc".equalsIgnoreCase(sort)) {
            sortOrder = Sort.by(Sort.Direction.DESC, "medicineName");
        }

        Pageable pageable = PageRequest.of(page, size, sortOrder);
        LocalDateTime fromDateTime = (fromDate != null) ? fromDate.atStartOfDay() : null;
        LocalDateTime toDateTime = (toDate != null) ? toDate.atTime(LocalTime.MAX) : null;

        Page<Medicine> pageResult = medicineRepository.searchMedicines(search, companyId, fromDateTime, toDateTime, pageable);

        List<MedicineResponse> content = pageResult.getContent().stream()
                .map(this::mapToMedicineResponse)
                .collect(Collectors.toList());

        return PageResponse.<MedicineResponse>builder()
                .content(content)
                .pageNo(pageResult.getNumber())
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    public MedicineResponse getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Medicine not found with id: " + id));
        return mapToMedicineResponse(medicine);
    }

    public PageResponse<MedicineResponse> getMedicinesByCompany(Long companyId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Medicine> pageResult = medicineRepository.findByCompanyId(companyId, pageable);

        List<MedicineResponse> content = pageResult.getContent().stream()
                .map(this::mapToMedicineResponse)
                .collect(Collectors.toList());

        return PageResponse.<MedicineResponse>builder()
                .content(content)
                .pageNo(pageResult.getNumber())
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    public MedicineResponse mapToMedicineResponse(Medicine medicine) {
        List<MedicalRepresentative> mrs = mrRepository.findByCompanyId(medicine.getCompany().getId());
        String mrName = mrs.isEmpty() ? "N/A" : mrs.get(0).getMrName();
        String mrContact = mrs.isEmpty() ? "N/A" : mrs.get(0).getContactNumber();

        List<MedicineDocument> mds = medicineDocumentRepository.findByMedicineId(medicine.getId());
        List<MedicineResponse.DocumentSummaryDto> docSummaries = mds.stream()
                .map(md -> MedicineResponse.DocumentSummaryDto.builder()
                        .id(md.getDocument().getId())
                        .fileName(md.getDocument().getFileName())
                        .fileType(md.getDocument().getFileType())
                        .uploadDate(md.getDocument().getUploadDate())
                        .build())
                .collect(Collectors.toList());

        return MedicineResponse.builder()
                .id(medicine.getId())
                .medicineName(medicine.getMedicineName())
                .companyId(medicine.getCompany().getId())
                .companyName(medicine.getCompany().getCompanyName())
                .composition(medicine.getComposition())
                .description(medicine.getDescription())
                .mrName(mrName)
                .mrContact(mrContact)
                .createdAt(medicine.getCreatedAt())
                .documents(docSummaries)
                .build();
    }
}
