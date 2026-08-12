package com.medicportal.controller;

import com.medicportal.dto.DashboardStatsDto;
import com.medicportal.dto.MedicineResponse;
import com.medicportal.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/statistics")
    public ResponseEntity<DashboardStatsDto> getStatistics(Authentication authentication) {
        Long doctorId = (authentication != null && authentication.getCredentials() instanceof Long) ? (Long) authentication.getCredentials() : null;
        return ResponseEntity.ok(dashboardService.getStatistics(doctorId));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<MedicineResponse>> getRecentMedicines(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "10") Integer limit) {
        return ResponseEntity.ok(dashboardService.getRecentMedicines(fromDate, toDate, limit));
    }
}
