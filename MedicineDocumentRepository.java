package com.medicportal.repository;

import com.medicportal.model.MedicineDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineDocumentRepository extends JpaRepository<MedicineDocument, Long> {
    List<MedicineDocument> findByMedicineId(Long medicineId);
    List<MedicineDocument> findByDocumentId(Long documentId);
    boolean existsByMedicineIdAndDocumentId(Long medicineId, Long documentId);
}
