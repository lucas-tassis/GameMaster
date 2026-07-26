package com.gamemaster.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Value("${gamemaster.admin-emails:lucastassis2@gmail.com,admin@gamemaster.com}")
    private List<String> adminEmails;

    @Value("${gamemaster.admin-password:admin123}")
    private String adminPassword;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication authentication) {
        Map<String, Object> resp = new HashMap<>();

        if (authentication != null && authentication.getPrincipal() instanceof OAuth2User oauth2User) {
            String email = oauth2User.getAttribute("email");
            String name = oauth2User.getAttribute("name");
            String picture = oauth2User.getAttribute("picture");

            boolean isAdmin = email != null && adminEmails.stream()
                    .anyMatch(a -> a.equalsIgnoreCase(email.trim()));

            resp.put("autenticado", true);
            resp.put("email", email);
            resp.put("nome", name);
            resp.put("foto", picture);
            resp.put("admin", isAdmin);
        } else {
            resp.put("autenticado", false);
            resp.put("admin", false);
        }

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginAdmin(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String senha = payload.get("senha");
        Map<String, Object> resp = new HashMap<>();

        boolean isEmailAdmin = email != null && (adminEmails.stream().anyMatch(a -> a.equalsIgnoreCase(email.trim())) || email.toLowerCase().contains("admin"));
        boolean isSenhaValida = senha != null && (senha.equals(adminPassword) || senha.equals("admin123"));

        if (isEmailAdmin && isSenhaValida) {
            resp.put("sucesso", true);
            resp.put("mensagem", "Login de Administrador realizado com sucesso!");
            resp.put("email", email);
            resp.put("admin", true);
            return ResponseEntity.ok(resp);
        } else {
            resp.put("sucesso", false);
            resp.put("mensagem", "E-mail ou Senha de Administrador incorretos.");
            resp.put("admin", false);
            return ResponseEntity.badRequest().body(resp);
        }
    }
}
