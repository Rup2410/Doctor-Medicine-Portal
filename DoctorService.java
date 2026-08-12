package com.medicportal.service;

import com.medicportal.dto.*;
import com.medicportal.model.Doctor;
import com.medicportal.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/jpg", "image/webp"
    );

    public DoctorProfileDto getDoctorProfile(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        return mapToProfileDto(doctor);
    }

    @Transactional
    public DoctorProfileDto updateDoctorProfile(Long doctorId, DoctorProfileUpdateDto dto) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        if (!doctor.getEmail().equalsIgnoreCase(dto.getEmail().trim())) {
            if (doctorRepository.existsByEmail(dto.getEmail().trim())) {
                throw new IllegalArgumentException("Email address is already in use.");
            }
            doctor.setEmail(dto.getEmail().trim().toLowerCase());
        }

        doctor.setName(dto.getName().trim());
        doctor.setPhone(dto.getPhone() != null ? dto.getPhone().trim() : null);

        Doctor saved = doctorRepository.save(doctor);
        return mapToProfileDto(saved);
    }

    @Transactional
    public DoctorProfileDto uploadProfilePicture(Long doctorId, MultipartFile file) throws IOException {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        String ext = (originalFilename != null && originalFilename.contains("."))
                ? originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase()
                : ".jpg";

        boolean isValidImage = ALLOWED_IMAGE_TYPES.contains(contentType) ||
                Arrays.asList(".jpg", ".jpeg", ".png", ".webp").contains(ext);

        if (!isValidImage) {
            throw new IllegalArgumentException("Invalid image format. Supported: JPG, JPEG, PNG, WEBP");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("Image size exceeds 10MB limit.");
        }

        Path uploadPath = Paths.get(uploadDir, "profiles").toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        String storedFileName = "avatar_" + doctorId + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;
        Path targetPath = uploadPath.resolve(storedFileName);

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        doctor.setProfilePicturePath(targetPath.toString());
        Doctor saved = doctorRepository.save(doctor);
        return mapToProfileDto(saved);
    }

    @Transactional
    public DoctorProfileDto removeProfilePicture(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        if (doctor.getProfilePicturePath() != null) {
            try {
                Path file = Paths.get(doctor.getProfilePicturePath());
                Files.deleteIfExists(file);
            } catch (Exception e) {
                log.warn("Could not delete avatar file: {}", e.getMessage());
            }
            doctor.setProfilePicturePath(null);
            doctor = doctorRepository.save(doctor);
        }
        return mapToProfileDto(doctor);
    }

    public Resource loadProfilePictureFile(Long doctorId) throws IOException {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        if (doctor.getProfilePicturePath() == null) {
            throw new IllegalArgumentException("No profile picture set for doctor");
        }

        Path filePath = Paths.get(doctor.getProfilePicturePath());
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new IllegalArgumentException("Could not read avatar file");
        }
    }

    @Transactional
    public void changePassword(Long doctorId, ChangePasswordDto dto) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), doctor.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }

        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirm password do not match.");
        }

        doctor.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        doctorRepository.save(doctor);
    }

    @Transactional
    public DoctorProfileDto updatePreferences(Long doctorId, DoctorPreferencesDto dto) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        if (dto.getThemePreference() != null) {
            doctor.setThemePreference(dto.getThemePreference().toUpperCase());
        }
        if (dto.getDefaultView() != null) {
            doctor.setDefaultView(dto.getDefaultView().toUpperCase());
        }
        if (dto.getDefaultDateRange() != null) {
            doctor.setDefaultDateRange(dto.getDefaultDateRange().toUpperCase());
        }
        if (dto.getItemsPerPage() != null) {
            doctor.setItemsPerPage(dto.getItemsPerPage());
        }
        if (dto.getNotificationsSettings() != null) {
            doctor.setNotificationsSettings(dto.getNotificationsSettings());
        }
        if (dto.getReduceMotion() != null) {
            doctor.setReduceMotion(dto.getReduceMotion());
        }

        Doctor saved = doctorRepository.save(doctor);
        return mapToProfileDto(saved);
    }

    @Transactional
    public void deleteAccount(Long doctorId, String confirmPassword) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        if (!passwordEncoder.matches(confirmPassword, doctor.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect password. Account deletion cancelled.");
        }

        doctorRepository.delete(doctor);
    }

    private DoctorProfileDto mapToProfileDto(Doctor doc) {
        return DoctorProfileDto.builder()
                .id(doc.getId())
                .name(doc.getName())
                .email(doc.getEmail())
                .phone(doc.getPhone())
                .profilePictureUrl(doc.getProfilePicturePath() != null ? "/api/doctors/profile-picture" : null)
                .themePreference(doc.getThemePreference() != null ? doc.getThemePreference() : "LIGHT")
                .defaultView(doc.getDefaultView() != null ? doc.getDefaultView() : "GRID")
                .defaultDateRange(doc.getDefaultDateRange() != null ? doc.getDefaultDateRange() : "7DAYS")
                .itemsPerPage(doc.getItemsPerPage() != null ? doc.getItemsPerPage() : 10)
                .notificationsSettings(doc.getNotificationsSettings())
                .reduceMotion(doc.getReduceMotion() != null ? doc.getReduceMotion() : false)
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
