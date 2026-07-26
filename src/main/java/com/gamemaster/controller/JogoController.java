package com.gamemaster.controller;

import com.gamemaster.model.Jogo;
import com.gamemaster.service.JogoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/jogos")
public class JogoController {

    private final JogoService jogoService;

    public JogoController(JogoService jogoService) {
        this.jogoService = jogoService;
    }

    @GetMapping
    public ResponseEntity<List<Jogo>> listarTodos() {
        return ResponseEntity.ok(jogoService.listarTodos());
    }

    @PostMapping
    public ResponseEntity<Jogo> criar(@RequestBody Jogo jogo) {
        return ResponseEntity.ok(jogoService.salvar(jogo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        jogoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deletarTodos() {
        jogoService.deletarTodos();
        return ResponseEntity.noContent().build();
    }
}
