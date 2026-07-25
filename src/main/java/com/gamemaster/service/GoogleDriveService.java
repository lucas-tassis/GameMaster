package com.gamemaster.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class GoogleDriveService {

    private static final Logger log = LoggerFactory.getLogger(GoogleDriveService.class);

    @Value("${gamemaster.drive.script-url:}")
    private String scriptUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean enviarMidia(String tipo, String base64Data, Map<String, Object> metadata) {
        if (scriptUrl == null || scriptUrl.isBlank()) {
            log.warn("URL do Google Apps Script não configurada no application.yml. Mídia salva apenas localmente.");
            return false;
        }

        try {
            Map<String, Object> payload = new HashMap<>(metadata);
            payload.put("tipo", tipo);
            payload.put("base64", base64Data);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_PLAIN);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(scriptUrl, request, String.class);

            log.info("Resposta do envio para o Google Drive: Status {}", response.getStatusCode());
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.error("Erro ao enviar mídia para o Google Drive via Spring Boot: {}", e.getMessage());
            return false;
        }
    }
}

