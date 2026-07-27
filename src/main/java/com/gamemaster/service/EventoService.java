package com.gamemaster.service;

import com.gamemaster.model.Evento;
import com.gamemaster.model.FotoEvento;
import com.gamemaster.model.NotaFiscal;
import com.gamemaster.model.Presenca;
import com.gamemaster.repository.EventoRepository;
import com.gamemaster.repository.FotoEventoRepository;
import com.gamemaster.repository.NotaFiscalRepository;
import com.gamemaster.repository.PresencaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class EventoService {

    private final EventoRepository eventoRepository;
    private final PresencaRepository presencaRepository;
    private final FotoEventoRepository fotoRepository;
    private final NotaFiscalRepository notaRepository;
    private final GoogleDriveService googleDriveService;

    public EventoService(EventoRepository eventoRepository, PresencaRepository presencaRepository, FotoEventoRepository fotoRepository, NotaFiscalRepository notaRepository, GoogleDriveService googleDriveService) {
        this.eventoRepository = eventoRepository;
        this.presencaRepository = presencaRepository;
        this.fotoRepository = fotoRepository;
        this.notaRepository = notaRepository;
        this.googleDriveService = googleDriveService;
    }

    public List<Evento> listarTodos() {
        return eventoRepository.findAll();
    }

    public Evento obterEventoAtivo() {
        return eventoRepository.findByAtivoTrue().orElse(null);
    }

    public Evento salvar(Evento evento) {
        if (evento.getDataEvento() == null) {
            evento.setDataEvento(LocalDate.now());
        }
        if (evento.isAtivo()) {
            desativarTodos();
        }
        Evento salvo = eventoRepository.save(evento);
        if (salvo.getNome() != null && !salvo.getNome().isBlank()) {
            try {
                googleDriveService.criarPastasEvento(salvo.getNome());
            } catch (Exception ignored) {}
        }
        return salvo;
    }

    @Transactional
    public Evento ativarEvento(Long id) {
        desativarTodos();
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado com ID: " + id));
        evento.setAtivo(true);
        return eventoRepository.save(evento);
    }

    @Transactional
    public Evento desativarEvento(Long id) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado com ID: " + id));
        evento.setAtivo(false);
        return eventoRepository.save(evento);
    }

    @Transactional
    public Evento atualizarEvento(Long id, Evento eventoAtualizado) {
        Evento eventoExistente = eventoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado com ID: " + id));

        eventoExistente.setNome(eventoAtualizado.getNome());
        eventoExistente.setLocal(eventoAtualizado.getLocal());
        if (eventoAtualizado.getDataEvento() != null) {
            eventoExistente.setDataEvento(eventoAtualizado.getDataEvento());
        }

        if (eventoAtualizado.isAtivo() && !eventoExistente.isAtivo()) {
            desativarTodos();
            eventoExistente.setAtivo(true);
        } else if (!eventoAtualizado.isAtivo()) {
            eventoExistente.setAtivo(false);
        }

        return eventoRepository.save(eventoExistente);
    }

    @Transactional
    public Evento encerrarEvento(Long id) {
        return desativarEvento(id);
    }

    @Transactional
    public void excluirEvento(Long id) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado com ID: " + id));

        // Deletar registros vinculados para evitar erros de Integridade / FK
        List<Presenca> presencas = presencaRepository.findByEventoId(id);
        if (!presencas.isEmpty()) {
            presencaRepository.deleteAll(presencas);
        }

        List<FotoEvento> fotos = fotoRepository.findByEventoId(id);
        if (!fotos.isEmpty()) {
            fotoRepository.deleteAll(fotos);
        }

        List<NotaFiscal> notas = notaRepository.findByEventoId(id);
        if (!notas.isEmpty()) {
            notaRepository.deleteAll(notas);
        }

        eventoRepository.delete(evento);
    }

    private void desativarTodos() {
        List<Evento> todos = eventoRepository.findAll();
        for (Evento e : todos) {
            e.setAtivo(false);
        }
        eventoRepository.saveAll(todos);
    }
}



