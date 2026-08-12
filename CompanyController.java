package com.medicportal.controller;

import com.medicportal.dto.CompanyResponse;
import com.medicportal.dto.MedicineResponse;
import com.medicportal.dto.PageResponse;
import com.medicportal.service.CompanyService;
import com.medicportal.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;
    private final MedicineService medicineService;

    @GetMapping
    public ResponseEntity<List<CompanyResponse>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    @GetMapping("/{id}/medicines")
    public ResponseEntity<PageResponse<MedicineResponse>> getCompanyMedicines(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(medicineService.getMedicinesByCompany(id, page, size));
    }
}
