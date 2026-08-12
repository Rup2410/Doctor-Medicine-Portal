package com.medicportal.controller;

import com.medicportal.dto.DocumentResponse;
import com.medicportal.dto.ExtractedDataDto;
import com.medicportal.dto.PageResponse;
import com.medicportal.model.Document;
import com.medicportal.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<ExtractedDataDto> uploadDocument(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {
        Long doctorId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(documentService.uploadAndProcessDocument(file, doctorId));
    }

    @GetMapping
    public ResponseEntity<PageResponse<DocumentResponse>> getDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Long doctorId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(documentService.getDoctorDocuments(doctorId, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getDocumentById(
            @PathVariable Long id,
            Authentication authentication) {
        Long doctorId = (Long) authentication.getCredentials();
        Document doc = documentService.getDocumentById(id, doctorId);
        
        DocumentResponse response = DocumentResponse.builder()
                .id(doc.getId())
                .fileName(doc.getFileName())
                .fileType(doc.getFileType())
                .fileSize(doc.getFileSize())
                .processingStatus(doc.getProcessingStatus())
                .extractedText(doc.getExtractedText())
                .uploadDate(doc.getUploadDate())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> getDocumentFile(
            @PathVariable Long id,
            Authentication authentication) throws IOException {
        Long doctorId = (Long) authentication.getCredentials();
        Document document = documentService.getDocumentById(id, doctorId);
        Resource resource = documentService.loadDocumentFile(id, doctorId);

        String contentType = document.getFileType();
        if (contentType == null || contentType.isEmpty()) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + document.getFileName() + "\"")
                .body(resource);
    }
}
