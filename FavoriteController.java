package com.medicportal.controller;

import com.medicportal.dto.FavoriteMRResponse;
import com.medicportal.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<List<FavoriteMRResponse>> getDoctorFavorites(Authentication authentication) {
        Long doctorId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(favoriteService.getDoctorFavorites(doctorId));
    }

    @PostMapping("/{mrId}")
    public ResponseEntity<FavoriteMRResponse> addFavorite(
            @PathVariable Long mrId,
            Authentication authentication) {
        Long doctorId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(favoriteService.addFavorite(doctorId, mrId));
    }

    @DeleteMapping("/{mrId}")
    public ResponseEntity<Map<String, String>> removeFavorite(
            @PathVariable Long mrId,
            Authentication authentication) {
        Long doctorId = (Long) authentication.getCredentials();
        favoriteService.removeFavorite(doctorId, mrId);
        return ResponseEntity.ok(Map.of("message", "MR removed from favorites."));
    }

    @GetMapping("/{mrId}/status")
    public ResponseEntity<Map<String, Boolean>> checkFavoriteStatus(
            @PathVariable Long mrId,
            Authentication authentication) {
        Long doctorId = (Long) authentication.getCredentials();
        boolean isFav = favoriteService.isFavorite(doctorId, mrId);
        return ResponseEntity.ok(Map.of("isFavorite", isFav));
    }
}
