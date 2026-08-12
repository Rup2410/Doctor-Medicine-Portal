package com.medicportal.service;

import com.medicportal.dto.NotificationItemDto;
import com.medicportal.model.Document;
import com.medicportal.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final DocumentRepository documentRepository;

    public List<NotificationItemDto> getNotificationsForDoctor(Long doctorId) {
        List<NotificationItemDto> notifications = new ArrayList<>();
        List<Document> docs = documentRepository.findByDoctorId(doctorId);

        for (Document doc : docs) {
            if ("CONFIRMED".equalsIgnoreCase(doc.getProcessingStatus())) {
                notifications.add(NotificationItemDto.builder()
                        .id("notif_doc_" + doc.getId())
                        .title("Document Processed & Confirmed")
                        .message("Medicine details from file " + doc.getFileName() + " were successfully saved into your portal database.")
                        .type("DOCUMENT_PROCESSED")
                        .read(true)
                        .timestamp(doc.getUpdatedAt() != null ? doc.getUpdatedAt() : doc.getUploadDate())
                        .build());
            } else if ("VERIFICATION_REQUIRED".equalsIgnoreCase(doc.getProcessingStatus())) {
                notifications.add(NotificationItemDto.builder()
                        .id("notif_rev_" + doc.getId())
                        .title("Extraction Review Pending")
                        .message("Document " + doc.getFileName() + " OCR extraction requires doctor verification before saving.")
                        .type("EXTRACTION_REVIEW")
                        .read(false)
                        .timestamp(doc.getUploadDate())
                        .build());
            }
        }

        // Add a security alert notification
        notifications.add(NotificationItemDto.builder()
                .id("notif_sec_01")
                .title("Portal Session Active")
                .message("Your Doctor Medicine Portal session is active and protected with JWT encryption.")
                .type("SECURITY_ALERT")
                .read(false)
                .timestamp(LocalDateTime.now().minusHours(2))
                .build());

        return notifications;
    }
}
