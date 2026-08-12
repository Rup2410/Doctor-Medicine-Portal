package com.medicportal.controller;

import com.medicportal.dto.MedicineResponse;
import com.medicportal.dto.MedicineVerificationDto;
import com.medicportal.dto.PageResponse;
import com.medicportal.service.MedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    @GetMapping
    public ResponseEntity<PageResponse<MedicineResponse>> getMedicines(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "date_desc") String sort) {
        return ResponseEntity.ok(medicineService.searchMedicines(search, companyId, fromDate, toDate, page, size, sort));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicineResponse> getMedicineById(@PathVariable Long id) {
        return ResponseEntity.ok(medicineService.getMedicineById(id));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<PageResponse<MedicineResponse>> getMedicinesByCompany(
            @PathVariable Long companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(medicineService.getMedicinesByCompany(companyId, page, size));
    }

    @PostMapping("/verify-and-save")
    public ResponseEntity<List<MedicineResponse>> verifyAndSaveMedicines(
            @Valid @RequestBody MedicineVerificationDto verificationDto,
            Authentication authentication) {
        Long doctorId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(medicineService.verifyAndSaveMedicines(verificationDto, doctorId));
    }
}
