package com.gamemaster.service;

import com.gamemaster.model.Presenca;
import com.gamemaster.repository.PresencaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PresencaService {

    private final PresencaRepository presencaRepository;
    private final EventoService eventoService;

    public PresencaService(PresencaRepository presencaRepository, EventoService eventoService) {
        this.presencaRepository = presencaRepository;
        this.eventoService = eventoService;
    }

    public List<Presenca> listarTodas() {
        return presencaRepository.findAll();
    }

    public Presenca registrar(Presenca presenca) {
        if (presenca.getEvento() == null) {
            presenca.setEvento(eventoService.obterEventoAtivo());
        }
        return presencaRepository.save(presenca);
    }

    public long contarTotal() {
        return presencaRepository.count();
    }

    public long contarPrimeiraVez() {
        return presencaRepository.countByPrimeiraVezTrue();
    }
}


