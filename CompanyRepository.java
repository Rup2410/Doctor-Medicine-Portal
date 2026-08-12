package com.medicportal.repository;

import com.medicportal.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByCompanyNameIgnoreCase(String companyName);
    
    @Query("SELECT c FROM Company c WHERE LOWER(REPLACE(c.companyName, '.', '')) LIKE LOWER(CONCAT('%', :normalized, '%'))")
    Optional<Company> findNormalizedMatch(@Param("normalized") String normalized);
}
