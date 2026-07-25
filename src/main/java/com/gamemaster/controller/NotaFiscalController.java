package com.gamemaster.controller;

import com.gamemaster.model.NotaFiscal;
import com.gamemaster.service.NotaFiscalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/notas")
public class NotaFiscalController {

    private final NotaFiscalService notaFiscalService;

    public NotaFiscalController(NotaFiscalService notaFiscalService) {
        this.notaFiscalService = notaFiscalService;
    }

    @GetMapping
    public ResponseEntity<List<NotaFiscal>> listarTodas() {
        return ResponseEntity.ok(notaFiscalService.listarTodas());
    }

    @GetMapping("/total")
    public ResponseEntity<BigDecimal> valorTotal() {
        return ResponseEntity.ok(notaFiscalService.calcularTotalConsumido());
    }

    @PostMapping
    public ResponseEntity<NotaFiscal> enviarNota(@RequestBody NotaFiscal nota) {
        return ResponseEntity.ok(notaFiscalService.salvar(nota));
    }
}

