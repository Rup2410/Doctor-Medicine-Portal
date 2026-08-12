package com.medicportal.service;

import com.medicportal.config.JwtTokenProvider;
import com.medicportal.dto.AuthResponse;
import com.medicportal.dto.LoginRequest;
import com.medicportal.dto.RegisterRequest;
import com.medicportal.model.Doctor;
import com.medicportal.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthResponse register(RegisterRequest request) {
        if (doctorRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email address is already registered.");
        }

        Doctor doctor = Doctor.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();

        Doctor savedDoctor = doctorRepository.save(doctor);
        String token = tokenProvider.generateToken(savedDoctor.getEmail(), savedDoctor.getId());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(savedDoctor.getId())
                .name(savedDoctor.getName())
                .email(savedDoctor.getEmail())
                .phone(savedDoctor.getPhone())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Doctor doctor = doctorRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), doctor.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        String token = tokenProvider.generateToken(doctor.getEmail(), doctor.getId());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(doctor.getId())
                .name(doctor.getName())
                .email(doctor.getEmail())
                .phone(doctor.getPhone())
                .build();
    }
}
