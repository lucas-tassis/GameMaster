package com.gamemaster.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Value("${gamemaster.admin-emails:lucastassis2@gmail.com,admin@gamemaster.com}")
    private List<String> adminEmails;

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
}
