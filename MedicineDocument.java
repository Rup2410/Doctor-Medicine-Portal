package com.medicportal.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medicine_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;
}
