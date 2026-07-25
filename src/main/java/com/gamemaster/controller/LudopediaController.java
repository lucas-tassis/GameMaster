package com.gamemaster.controller;

import com.gamemaster.service.LudopediaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ludopedia")
public class LudopediaController {

    private final LudopediaService ludopediaService;

    public LudopediaController(LudopediaService ludopediaService) {
        this.ludopediaService = ludopediaService;
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Map<String, String>>> buscar(@RequestParam String query) {
        return ResponseEntity.ok(ludopediaService.buscarJogos(query));
    }

    @PostMapping("/sincronizar-grupo/{idGrupo}")
    public ResponseEntity<List<Map<String, String>>> sincronizarGrupo(@PathVariable String idGrupo) {
        return ResponseEntity.ok(ludopediaService.sincronizarGrupoLudopedia(idGrupo));
    }

    @GetMapping("/config-token")
    public ResponseEntity<Map<String, Object>> getConfigToken() {
        Map<String, Object> resp = new HashMap<>();
        String token = ludopediaService.getApiToken();
        resp.put("configurado", token != null && !token.isBlank());
        resp.put("tokenParcial", (token != null && token.length() > 6) ? token.substring(0, 6) + "..." : "");
        resp.put("urlAutorizacao", ludopediaService.gerarUrlAutorizacao());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/config-token")
    public ResponseEntity<Map<String, String>> setConfigToken(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        ludopediaService.setApiToken(token);
        Map<String, String> resp = new HashMap<>();
        resp.put("status", "OK");
        resp.put("mensagem", "Token da API da Ludopedia configurado com sucesso!");
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/oauth/iniciar")
    public RedirectView iniciarOAuth() {
        return new RedirectView(ludopediaService.gerarUrlAutorizacao());
    }

    @GetMapping("/oauth/callback")
    public RedirectView oauthCallback(@RequestParam(required = false) String code,
                                       @RequestParam(required = false) String error) {
        if (code != null && !code.isBlank()) {
            ludopediaService.trocarCodePorToken(code);
        }
        return new RedirectView("/#acervo?oauth=sucesso");
    }
}
