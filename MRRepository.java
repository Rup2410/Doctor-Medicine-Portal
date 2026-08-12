package com.medicportal.repository;

import com.medicportal.model.MedicalRepresentative;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MRRepository extends JpaRepository<MedicalRepresentative, Long> {
    List<MedicalRepresentative> findByCompanyId(Long companyId);
    Optional<MedicalRepresentative> findByMrNameIgnoreCaseAndCompanyId(String mrName, Long companyId);
}
