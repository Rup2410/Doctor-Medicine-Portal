package com.medicportal.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_favorite_mrs", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"doctor_id", "mr_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorFavoriteMR {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mr_id", nullable = false)
    private MedicalRepresentative mr;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
