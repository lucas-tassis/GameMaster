package com.gamemaster.controller;

import com.gamemaster.model.Evento;
import com.gamemaster.service.EventoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/eventos")
public class EventoController {

    private final EventoService eventoService;

    public EventoController(EventoService eventoService) {
        this.eventoService = eventoService;
    }

    @GetMapping
    public ResponseEntity<List<Evento>> listarTodos() {
        return ResponseEntity.ok(eventoService.listarTodos());
    }

    @GetMapping("/ativo")
    public ResponseEntity<Evento> obterAtivo() {
        return ResponseEntity.ok(eventoService.obterEventoAtivo());
    }

    @PostMapping
    public ResponseEntity<Evento> criar(@RequestBody Evento evento) {
        return ResponseEntity.ok(eventoService.salvar(evento));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Evento> atualizar(@PathVariable Long id, @RequestBody Evento evento) {
        return ResponseEntity.ok(eventoService.atualizarEvento(id, evento));
    }

    @PutMapping("/{id}/ativar")
    public ResponseEntity<Evento> ativar(@PathVariable Long id) {
        return ResponseEntity.ok(eventoService.ativarEvento(id));
    }

    @PutMapping("/{id}/desativar")
    public ResponseEntity<Evento> desativar(@PathVariable Long id) {
        return ResponseEntity.ok(eventoService.desativarEvento(id));
    }


    @PutMapping("/{id}/encerrar")
    public ResponseEntity<Evento> encerrar(@PathVariable Long id) {
        return ResponseEntity.ok(eventoService.encerrarEvento(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        eventoService.excluirEvento(id);
        return ResponseEntity.noContent().build();
    }
}


