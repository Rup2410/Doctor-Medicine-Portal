package com.medicportal.repository;

import com.medicportal.model.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    Optional<Medicine> findByMedicineNameIgnoreCaseAndCompanyId(String medicineName, Long companyId);

    @Query("SELECT DISTINCT m FROM Medicine m " +
           "JOIN m.company c " +
           "LEFT JOIN MedicalRepresentative mr ON mr.company.id = c.id " +
           "WHERE (:search IS NULL OR :search = '' OR LOWER(m.medicineName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.companyName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(mr.mrName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:companyId IS NULL OR c.id = :companyId) " +
           "AND (:fromDate IS NULL OR m.createdAt >= :fromDate) " +
           "AND (:toDate IS NULL OR m.createdAt <= :toDate)")
    Page<Medicine> searchMedicines(@Param("search") String search,
                                  @Param("companyId") Long companyId,
                                  @Param("fromDate") LocalDateTime fromDate,
                                  @Param("toDate") LocalDateTime toDate,
                                  Pageable pageable);

    Page<Medicine> findByCompanyId(Long companyId, Pageable pageable);

    @Query("SELECT m FROM Medicine m ORDER BY m.createdAt DESC")
    List<Medicine> findRecentMedicines(Pageable pageable);

    @Query("SELECT m FROM Medicine m WHERE m.createdAt >= :fromDate AND m.createdAt <= :toDate ORDER BY m.createdAt DESC")
    List<Medicine> findMedicinesByDateRange(@Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);

    long countByCompanyId(Long companyId);
}
