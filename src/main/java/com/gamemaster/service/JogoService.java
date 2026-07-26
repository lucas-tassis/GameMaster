package com.gamemaster.service;

import com.gamemaster.model.Evento;
import com.gamemaster.model.Jogo;
import com.gamemaster.repository.EventoRepository;
import com.gamemaster.repository.JogoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class JogoService {

    private final JogoRepository jogoRepository;
    private final LudopediaService ludopediaService;
    private final EventoRepository eventoRepository;

    public JogoService(JogoRepository jogoRepository, LudopediaService ludopediaService, EventoRepository eventoRepository) {
        this.jogoRepository = jogoRepository;
        this.ludopediaService = ludopediaService;
        this.eventoRepository = eventoRepository;
    }

    public List<Jogo> listarTodos() {
        return jogoRepository.findAllByOrderByNomeAsc();
    }

    public Jogo salvar(Jogo jogo) {
        Jogo salvo = jogoRepository.save(jogo);
        if (salvo.getNome() != null && !salvo.getNome().isBlank()) {
            ludopediaService.addJogoSeNaoExiste(salvo.getNome(), salvo.getJogadores(), salvo.getDuracao(), salvo.getCategoria());
        }
        return salvo;
    }

    public void deletar(Long id) {
        jogoRepository.deleteById(id);
    }

    @Transactional
    public void deletarTodos() {
        List<Evento> eventos = eventoRepository.findAll();
        for (Evento e : eventos) {
            e.getJogosDisponiveis().clear();
            eventoRepository.save(e);
        }
        jogoRepository.deleteAll();
    }
}
