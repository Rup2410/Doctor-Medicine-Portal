package com.medicportal.controller;

import com.medicportal.dto.NotificationItemDto;
import com.medicportal.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationItemDto>> getNotifications(Authentication authentication) {
        Long doctorId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(notificationService.getNotificationsForDoctor(doctorId));
    }
}
