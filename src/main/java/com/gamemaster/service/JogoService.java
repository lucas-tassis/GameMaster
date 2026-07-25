package com.gamemaster.service;

import com.gamemaster.model.Jogo;
import com.gamemaster.repository.JogoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JogoService {

    private final JogoRepository jogoRepository;
    private final LudopediaService ludopediaService;

    public JogoService(JogoRepository jogoRepository, LudopediaService ludopediaService) {
        this.jogoRepository = jogoRepository;
        this.ludopediaService = ludopediaService;
    }

    public List<Jogo> listarTodos() {
        return jogoRepository.findAll();
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
}



