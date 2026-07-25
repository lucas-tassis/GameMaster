package com.gamemaster.controller;

import com.gamemaster.model.FotoEvento;
import com.gamemaster.service.FotoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fotos")
public class FotoController {

    private final FotoService fotoService;

    public FotoController(FotoService fotoService) {
        this.fotoService = fotoService;
    }

    @GetMapping
    public ResponseEntity<List<FotoEvento>> listarTodas() {
        return ResponseEntity.ok(fotoService.listarTodas());
    }

    @PostMapping
    public ResponseEntity<FotoEvento> enviarFoto(@RequestBody FotoEvento foto) {
        return ResponseEntity.ok(fotoService.salvar(foto));
    }
}

