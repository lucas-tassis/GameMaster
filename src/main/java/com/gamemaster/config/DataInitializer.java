package com.gamemaster.config;

import com.gamemaster.model.Evento;
import com.gamemaster.model.Jogo;
import com.gamemaster.repository.EventoRepository;
import com.gamemaster.repository.JogoRepository;
import com.gamemaster.service.EventoService;
import com.gamemaster.service.LudopediaService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final JogoRepository jogoRepository;
    private final EventoService eventoService;
    private final EventoRepository eventoRepository;
    private final LudopediaService ludopediaService;

    public DataInitializer(JogoRepository jogoRepository, EventoService eventoService, EventoRepository eventoRepository, LudopediaService ludopediaService) {
        this.jogoRepository = jogoRepository;
        this.eventoService = eventoService;
        this.eventoRepository = eventoRepository;
        this.ludopediaService = ludopediaService;
    }

    @Override
    public void run(String... args) {
        if (jogoRepository.count() == 0) {
            System.out.println("🎲 Inicializando o acervo inicial com os principais jogos de tabuleiro...");

            List<Jogo> jogosIniciais = List.of(
                    new Jogo(null, "Catan (Os Colonizadores)", "3-4", "60-90 min", "Negociação / Estratégia"),
                    new Jogo(null, "Ticket to Ride", "2-5", "45 min", "Estratégia / Família"),
                    new Jogo(null, "Ticket to Ride: Europa", "2-5", "60 min", "Estratégia / Família"),
                    new Jogo(null, "Azul", "2-4", "30-45 min", "Estratégia Abstrata"),
                    new Jogo(null, "Dixit", "3-6", "30 min", "Festivo / Imagem & Dedução"),
                    new Jogo(null, "Codenames (Código Secreto)", "2-8", "15 min", "Palavras / Dedução"),
                    new Jogo(null, "Carcassonne", "2-5", "35-45 min", "Colocação de Tiles"),
                    new Jogo(null, "Pandemic", "2-4", "45 min", "Cooperativo"),
                    new Jogo(null, "7 Wonders", "2-7", "30 min", "Draft de Cartas"),
                    new Jogo(null, "Coup (Coupe)", "2-6", "15 min", "Bluff / Dedução"),
                    new Jogo(null, "Exploding Kittens", "2-5", "15 min", "Festivo / Cartas"),
                    new Jogo(null, "King of Tokyo", "2-6", "30 min", "Dados / Festivo"),
                    new Jogo(null, "Perfil 7", "2-6", "30 min", "Trivia / Conhecimento"),
                    new Jogo(null, "War", "3-6", "120-180 min", "Estratégia / Conquista"),
                    new Jogo(null, "Imagem & Ação", "4-16", "45 min", "Desenho / Festivo")
            );

            List<Jogo> salvos = jogoRepository.saveAll(jogosIniciais);

            Evento eventoAtivo = eventoService.obterEventoAtivo();
            if (eventoAtivo != null) {
                eventoAtivo.setJogosDisponiveis(new HashSet<>(salvos));
                eventoRepository.save(eventoAtivo);
            }

            for (Jogo j : salvos) {
                ludopediaService.addJogoSeNaoExiste(j.getNome(), j.getJogadores(), j.getDuracao(), j.getCategoria());
            }

            System.out.println("✅ Acervo inicial carregado com sucesso! (" + salvos.size() + " jogos pré-cadastrados no evento ativo)");
        }
    }
}
