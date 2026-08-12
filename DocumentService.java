package com.medicportal.service;

import com.medicportal.dto.DocumentResponse;
import com.medicportal.dto.ExtractedDataDto;
import com.medicportal.dto.PageResponse;
import com.medicportal.model.Doctor;
import com.medicportal.model.Document;
import com.medicportal.repository.DoctorRepository;
import com.medicportal.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private final DocumentRepository documentRepository;
    private final DoctorRepository doctorRepository;
    private final OCRService ocrService;

    private static final List<String> ALLOWED_TYPES = Arrays.asList(
            "application/pdf", "image/jpeg", "image/png", "image/jpg"
    );

    public ExtractedDataDto uploadAndProcessDocument(MultipartFile file, Long doctorId) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty.");
        }

        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) originalFilename = "document.pdf";
        
        String ext = getFileExtension(originalFilename).toLowerCase();
        boolean isValidType = ALLOWED_TYPES.contains(contentType) || 
                              Arrays.asList(".pdf", ".jpg", ".jpeg", ".png").contains(ext);

        if (!isValidType) {
            throw new IllegalArgumentException("Invalid file type. Only PDF, JPG, JPEG, and PNG are allowed.");
        }

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        // Ensure upload directory exists
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        // Generate unique server-side file name
        String storedFileName = "doc_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;
        Path targetPath = uploadPath.resolve(storedFileName);

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // Create Document entity
        Document document = Document.builder()
                .doctor(doctor)
                .fileName(originalFilename)
                .storedFileName(storedFileName)
                .filePath(targetPath.toString())
                .fileType(contentType != null ? contentType : "application/octet-stream")
                .fileSize(file.getSize())
                .processingStatus("PROCESSING")
                .uploadDate(LocalDateTime.now())
                .build();

        document = documentRepository.save(document);

        // Call OCR/AI microservice
        ExtractedDataDto extractedData = ocrService.processDocument(document);

        // Update Document record
        document.setExtractedText(extractedData.getRawText());
        document.setProcessingStatus("VERIFICATION_REQUIRED");
        documentRepository.save(document);

        return extractedData;
    }

    public Resource loadDocumentFile(Long documentId, Long doctorId) throws IOException {
        Document document = documentRepository.findByIdAndDoctorId(documentId, doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found or unauthorized"));

        Path filePath = Paths.get(document.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new IllegalArgumentException("Could not read file: " + document.getFileName());
        }
    }

    public Document getDocumentById(Long documentId, Long doctorId) {
        return documentRepository.findByIdAndDoctorId(documentId, doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found or unauthorized"));
    }

    public PageResponse<DocumentResponse> getDoctorDocuments(Long doctorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Document> pageResult = documentRepository.findByDoctorIdOrderByUploadDateDesc(doctorId, pageable);

        List<DocumentResponse> content = pageResult.getContent().stream()
                .map(this::mapToDocumentResponse)
                .collect(Collectors.toList());

        return PageResponse.<DocumentResponse>builder()
                .content(content)
                .pageNo(pageResult.getNumber())
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    private DocumentResponse mapToDocumentResponse(Document doc) {
        return DocumentResponse.builder()
                .id(doc.getId())
                .fileName(doc.getFileName())
                .fileType(doc.getFileType())
                .fileSize(doc.getFileSize())
                .processingStatus(doc.getProcessingStatus())
                .extractedText(doc.getExtractedText())
                .uploadDate(doc.getUploadDate())
                .build();
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex >= 0) ? filename.substring(dotIndex) : "";
    }
}
