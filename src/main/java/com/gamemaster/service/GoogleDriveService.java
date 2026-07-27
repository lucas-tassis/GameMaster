package com.gamemaster.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class GoogleDriveService {

    private static final Logger log = LoggerFactory.getLogger(GoogleDriveService.class);

    @Value("${gamemaster.drive.script-url:}")
    private String scriptUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean enviarMidia(String tipo, String base64Data, Map<String, Object> metadata) {
        Map<String, Object> payload = new HashMap<>(metadata);
        payload.put("tipo", tipo);
        payload.put("base64", base64Data);
        return dispararGoogleScript(payload);
    }

    public boolean criarPastasEvento(String nomeEvento) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("tipo", "criar_evento");
        payload.put("nomeEvento", nomeEvento);
        return dispararGoogleScript(payload);
    }

    private boolean dispararGoogleScript(Map<String, Object> payload) {
        if (scriptUrl == null || scriptUrl.isBlank()) {
            log.warn("URL do Google Apps Script não configurada no application.yml / Render. Mídia/Pastas não criadas no Drive.");
            return false;
        }

        try {
            String jsonPayload = objectMapper.writeValueAsString(payload);

            String targetUrl = scriptUrl;
            int maxRedirects = 5;

            while (maxRedirects-- > 0) {
                URL url = URI.create(targetUrl).toURL();
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setDoOutput(true);
                conn.setInstanceFollowRedirects(true);
                conn.setRequestProperty("Content-Type", "text/plain;charset=UTF-8");

                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = jsonPayload.getBytes(StandardCharsets.UTF_8);
                    os.write(input, 0, input.length);
                }

                int code = conn.getResponseCode();
                log.info("Google Apps Script Response Code: {}", code);

                if (code == HttpURLConnection.HTTP_MOVED_TEMP || code == HttpURLConnection.HTTP_MOVED_PERM || code == 307 || code == 308) {
                    targetUrl = conn.getHeaderField("Location");
                    conn.disconnect();
                    continue;
                }

                conn.disconnect();
                return code >= 200 && code < 300;
            }

            return false;
        } catch (Exception e) {
            log.error("Erro ao enviar dados para o Google Apps Script: {}", e.getMessage());
            return false;
        }
    }
}
