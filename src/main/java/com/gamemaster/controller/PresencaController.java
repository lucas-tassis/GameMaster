package com.gamemaster.controller;

import com.gamemaster.model.Presenca;
import com.gamemaster.service.PresencaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/presenca")
public class PresencaController {

    private final PresencaService presencaService;

    public PresencaController(PresencaService presencaService) {
        this.presencaService = presencaService;
    }

    @GetMapping
    public ResponseEntity<List<Presenca>> listarTodas() {
        return ResponseEntity.ok(presencaService.listarTodas());
    }

    @PostMapping
    public ResponseEntity<Presenca> registrar(@RequestBody Presenca presenca) {
        return ResponseEntity.ok(presencaService.registrar(presenca));
    }
}

