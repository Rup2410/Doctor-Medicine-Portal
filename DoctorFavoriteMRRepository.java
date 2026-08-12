package com.medicportal.repository;

import com.medicportal.model.DoctorFavoriteMR;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorFavoriteMRRepository extends JpaRepository<DoctorFavoriteMR, Long> {
    List<DoctorFavoriteMR> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);
    Optional<DoctorFavoriteMR> findByDoctorIdAndMrId(Long doctorId, Long mrId);
    boolean existsByDoctorIdAndMrId(Long doctorId, Long mrId);
    void deleteByDoctorIdAndMrId(Long doctorId, Long mrId);
}
