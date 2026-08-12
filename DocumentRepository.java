package com.medicportal.repository;

import com.medicportal.model.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    Page<Document> findByDoctorIdOrderByUploadDateDesc(Long doctorId, Pageable pageable);
    List<Document> findByDoctorId(Long doctorId);
    Optional<Document> findByIdAndDoctorId(Long id, Long doctorId);
}
