package com.medicportal.service;

import com.medicportal.dto.ExtractedDataDto;
import com.medicportal.model.Document;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class OCRService {

    @Value("${app.ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @SuppressWarnings("unchecked")
    public ExtractedDataDto processDocument(Document document) {
        String endpoint = aiServiceUrl + "/extract";

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("file_path", document.getFilePath());
        requestBody.put("file_name", document.getFileName());
        requestBody.put("file_type", document.getFileType());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

        try {
            log.info("Sending document extraction request to AI service endpoint: {}", endpoint);
            Map<String, Object> response = restTemplate.postForObject(endpoint, entity, Map.class);

            if (response != null && "SUCCESS".equals(response.get("status"))) {
                String rawText = (String) response.get("raw_text");
                Map<String, Object> extractedData = (Map<String, Object>) response.get("extracted_data");

                return parseExtractedData(document.getId(), document.getFileName(), rawText, extractedData);
            }
        } catch (Exception e) {
            log.warn("AI Service call failed or unreachable: {}. Falling back to default extraction wrapper.", e.getMessage());
        }

        // Fallback response if Python AI microservice is temporarily offline
        return buildFallbackExtraction(document);
    }

    @SuppressWarnings("unchecked")
    private ExtractedDataDto parseExtractedData(Long docId, String fileName, String rawText, Map<String, Object> data) {
        ExtractedDataDto dto = new ExtractedDataDto();
        dto.setDocumentId(docId);
        dto.setFileName(fileName);
        dto.setRawText(rawText);

        if (data != null) {
            // Company
            Map<String, Object> compMap = (Map<String, Object>) data.get("company");
            if (compMap != null) {
                dto.setCompany(ExtractedDataDto.CompanyExtraction.builder()
                        .value((String) compMap.get("value"))
                        .confidence(compMap.get("confidence") != null ? ((Number) compMap.get("confidence")).doubleValue() : 0.8)
                        .build());
            }

            // MR
            Map<String, Object> mrMap = (Map<String, Object>) data.get("mr");
            if (mrMap != null) {
                dto.setMr(ExtractedDataDto.MRExtraction.builder()
                        .name((String) mrMap.get("name"))
                        .contactNumber((String) mrMap.get("contact_number"))
                        .confidence(mrMap.get("confidence") != null ? ((Number) mrMap.get("confidence")).doubleValue() : 0.8)
                        .build());
            }

            // Medicines
            List<Map<String, Object>> medList = (List<Map<String, Object>>) data.get("medicines");
            List<ExtractedDataDto.MedicineExtraction> medicines = new ArrayList<>();
            if (medList != null) {
                for (Map<String, Object> m : medList) {
                    medicines.add(ExtractedDataDto.MedicineExtraction.builder()
                            .medicineName((String) m.get("medicine_name"))
                            .composition((String) m.get("composition"))
                            .description((String) m.get("description"))
                            .confidence(m.get("confidence") != null ? ((Number) m.get("confidence")).doubleValue() : 0.8)
                            .build());
                }
            }
            dto.setMedicines(medicines);
        }

        return dto;
    }

    private ExtractedDataDto buildFallbackExtraction(Document document) {
        String cleanName = document.getFileName().replace(".pdf", "").replace(".png", "").replace(".jpg", "");
        
        return ExtractedDataDto.builder()
                .documentId(document.getId())
                .fileName(document.getFileName())
                .rawText("Document uploaded: " + document.getFileName())
                .company(ExtractedDataDto.CompanyExtraction.builder()
                        .value("Pharma Company")
                        .confidence(0.50)
                        .build())
                .mr(ExtractedDataDto.MRExtraction.builder()
                        .name("Medical Representative")
                        .contactNumber("")
                        .confidence(0.50)
                        .build())
                .medicines(Collections.singletonList(
                        ExtractedDataDto.MedicineExtraction.builder()
                                .medicineName(cleanName)
                                .composition("Please enter composition details")
                                .description("Extracted medicine item ready for doctor review.")
                                .confidence(0.50)
                                .build()
                ))
                .build();
    }
}
