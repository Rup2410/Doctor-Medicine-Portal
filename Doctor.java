package com.medicportal.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "profile_picture_path")
    private String profilePicturePath;

    @Column(name = "theme_preference")
    @Builder.Default
    private String themePreference = "LIGHT"; // LIGHT, DARK, SYSTEM

    @Column(name = "default_view")
    @Builder.Default
    private String defaultView = "GRID"; // GRID, TABLE

    @Column(name = "default_date_range")
    @Builder.Default
    private String defaultDateRange = "7DAYS"; // TODAY, 7DAYS, 30DAYS

    @Column(name = "items_per_page")
    @Builder.Default
    private Integer itemsPerPage = 10;

    @Column(name = "notifications_settings", columnDefinition = "TEXT")
    private String notificationsSettings;

    @Column(name = "reduce_motion")
    @Builder.Default
    private Boolean reduceMotion = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
