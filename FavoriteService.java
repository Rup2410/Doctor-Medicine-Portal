package com.medicportal.service;

import com.medicportal.dto.FavoriteMRResponse;
import com.medicportal.model.Doctor;
import com.medicportal.model.DoctorFavoriteMR;
import com.medicportal.model.MedicalRepresentative;
import com.medicportal.model.Medicine;
import com.medicportal.repository.DoctorFavoriteMRRepository;
import com.medicportal.repository.DoctorRepository;
import com.medicportal.repository.MRRepository;
import com.medicportal.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final DoctorFavoriteMRRepository favoriteRepository;
    private final DoctorRepository doctorRepository;
    private final MRRepository mrRepository;
    private final MedicineRepository medicineRepository;

    @Transactional
    public FavoriteMRResponse addFavorite(Long doctorId, Long mrId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        MedicalRepresentative mr = mrRepository.findById(mrId)
                .orElseThrow(() -> new IllegalArgumentException("Medical Representative not found with id: " + mrId));

        if (favoriteRepository.existsByDoctorIdAndMrId(doctorId, mrId)) {
            DoctorFavoriteMR existing = favoriteRepository.findByDoctorIdAndMrId(doctorId, mrId).get();
            return mapToFavoriteResponse(existing);
        }

        DoctorFavoriteMR fav = DoctorFavoriteMR.builder()
                .doctor(doctor)
                .mr(mr)
                .build();

        fav = favoriteRepository.save(fav);
        return mapToFavoriteResponse(fav);
    }

    @Transactional
    public void removeFavorite(Long doctorId, Long mrId) {
        if (favoriteRepository.existsByDoctorIdAndMrId(doctorId, mrId)) {
            favoriteRepository.deleteByDoctorIdAndMrId(doctorId, mrId);
        }
    }

    public boolean isFavorite(Long doctorId, Long mrId) {
        return favoriteRepository.existsByDoctorIdAndMrId(doctorId, mrId);
    }

    public List<FavoriteMRResponse> getDoctorFavorites(Long doctorId) {
        List<DoctorFavoriteMR> favorites = favoriteRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
        return favorites.stream()
                .map(this::mapToFavoriteResponse)
                .collect(Collectors.toList());
    }

    private FavoriteMRResponse mapToFavoriteResponse(DoctorFavoriteMR fav) {
        MedicalRepresentative mr = fav.getMr();
        
        // Fetch medicines under this MR's company
        List<Medicine> companyMeds = medicineRepository.findByCompanyId(mr.getCompany().getId(), PageRequest.of(0, 10)).getContent();
        
        List<FavoriteMRResponse.AssociatedMedicineDto> medDtos = companyMeds.stream()
                .map(m -> FavoriteMRResponse.AssociatedMedicineDto.builder()
                        .id(m.getId())
                        .medicineName(m.getMedicineName())
                        .composition(m.getComposition())
                        .build())
                .collect(Collectors.toList());

        return FavoriteMRResponse.builder()
                .id(fav.getId())
                .mrId(mr.getId())
                .mrName(mr.getMrName())
                .contactNumber(mr.getContactNumber())
                .companyId(mr.getCompany().getId())
                .companyName(mr.getCompany().getCompanyName())
                .favoritedAt(fav.getCreatedAt())
                .medicines(medDtos)
                .build();
    }
}
