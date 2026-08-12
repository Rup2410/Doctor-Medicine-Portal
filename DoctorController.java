package com.medicportal.controller;

import com.medicportal.dto.*;
import com.medicportal.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping("/me")
    public ResponseEntity<DoctorProfileDto> getProfile(Authentication authentication) {
        Long doctorId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(doctorService.getDoctorProfile(doctorId));
    }

    @PutMapping("/me")
    public ResponseEntity<DoctorProfileDto> updateProfile(
            @Valid @RequestBody DoctorProfileUpdateDto dto,
            Authentication authentication) {
        Long doctorId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(doctorService.updateDoctorProfile(doctorId, dto));
    }

    @PostMapping("/profile-picture")
    public ResponseEntity<DoctorProfileDto> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {
        Long doctorId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(doctorService.uploadProfilePicture(doctorId, file));
    }

    @DeleteMapping("/profile-picture")
    public ResponseEntity<DoctorProfileDto> removeProfilePicture(Authentication authentication) {
        Long doctorId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(doctorService.removeProfilePicture(doctorId));
    }

    @GetMapping("/profile-picture")
    public ResponseEntity<Resource> getProfilePicture(Authentication authentication) throws IOException {
        Long doctorId = (Long) authentication.getCredentials();
        Resource resource = doctorService.loadProfilePictureFile(doctorId);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordDto dto,
            Authentication authentication) {
        Long doctorId = (Long) authentication.getCredentials();
        doctorService.changePassword(doctorId, dto);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }

    @PutMapping("/preferences")
    public ResponseEntity<DoctorProfileDto> updatePreferences(
            @RequestBody DoctorPreferencesDto dto,
            Authentication authentication) {
        Long doctorId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(doctorService.updatePreferences(doctorId, dto));
    }

    @PostMapping("/account/delete")
    public ResponseEntity<Map<String, String>> deleteAccount(
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        Long doctorId = (Long) authentication.getCredentials();
        String confirmPassword = payload.get("password");
        doctorService.deleteAccount(doctorId, confirmPassword);
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully."));
    }
}
