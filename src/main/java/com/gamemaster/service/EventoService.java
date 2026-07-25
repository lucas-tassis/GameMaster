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

    public EventoService(EventoRepository eventoRepository, PresencaRepository presencaRepository, FotoEventoRepository fotoRepository, NotaFiscalRepository notaRepository) {
        this.eventoRepository = eventoRepository;
        this.presencaRepository = presencaRepository;
        this.fotoRepository = fotoRepository;
        this.notaRepository = notaRepository;
    }

    public List<Evento> listarTodos() {
        return eventoRepository.findAll();
    }

    public Evento obterEventoAtivo() {
        return eventoRepository.findByAtivoTrue().orElseGet(() -> {
            Evento eventoPadrao = new Evento(null, "Game Master Mall — Edição Principal", "Shopping Mall", LocalDate.now(), LocalDate.now(), LocalDate.now().plusDays(1), true);
            return eventoRepository.save(eventoPadrao);
        });
    }

    public Evento salvar(Evento evento) {
        if (evento.getDataEvento() == null) {
            evento.setDataEvento(LocalDate.now());
        }
        if (evento.isAtivo()) {
            desativarTodos();
        }
        return eventoRepository.save(evento);
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
        }

        return eventoRepository.save(eventoExistente);
    }

    @Transactional
    public Evento encerrarEvento(Long id) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado com ID: " + id));
        evento.setAtivo(false);
        return eventoRepository.save(evento);
    }

    @Transactional
    public void excluirEvento(Long id) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado com ID: " + id));

        // Desvincular presenças, fotos e notas para evitar erro de Chave Estrangeira (FK)
        List<Presenca> presencas = presencaRepository.findByEventoId(id);
        for (Presenca p : presencas) {
            p.setEvento(null);
        }
        presencaRepository.saveAll(presencas);

        List<FotoEvento> fotos = fotoRepository.findByEventoId(id);
        for (FotoEvento f : fotos) {
            f.setEvento(null);
        }
        fotoRepository.saveAll(fotos);

        List<NotaFiscal> notas = notaRepository.findByEventoId(id);
        for (NotaFiscal n : notas) {
            n.setEvento(null);
        }
        notaRepository.saveAll(notas);

        boolean eraAtivo = evento.isAtivo();
        eventoRepository.delete(evento);

        // Se o evento excluído era o ativo, ativar o primeiro evento restante
        if (eraAtivo) {
            List<Evento> restantes = eventoRepository.findAll();
            if (!restantes.isEmpty()) {
                Evento proximo = restantes.get(0);
                proximo.setAtivo(true);
                eventoRepository.save(proximo);
            }
        }
    }

    private void desativarTodos() {
        List<Evento> todos = eventoRepository.findAll();
        for (Evento e : todos) {
            e.setAtivo(false);
        }
        eventoRepository.saveAll(todos);
    }
}



