package com.gamemaster.controller;

import com.gamemaster.model.Evento;
import com.gamemaster.repository.EventoRepository;
import com.gamemaster.repository.FotoEventoRepository;
import com.gamemaster.repository.NotaFiscalRepository;
import com.gamemaster.repository.PresencaRepository;
import com.gamemaster.service.EventoService;
import com.gamemaster.service.JogoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final PresencaRepository presencaRepository;
    private final JogoService jogoService;
    private final FotoEventoRepository fotoRepository;
    private final NotaFiscalRepository notaRepository;
    private final EventoService eventoService;
    private final EventoRepository eventoRepository;

    public DashboardController(PresencaRepository presencaRepository, JogoService jogoService, FotoEventoRepository fotoRepository, NotaFiscalRepository notaRepository, EventoService eventoService, EventoRepository eventoRepository) {
        this.presencaRepository = presencaRepository;
        this.jogoService = jogoService;
        this.fotoRepository = fotoRepository;
        this.notaRepository = notaRepository;
        this.eventoService = eventoService;
        this.eventoRepository = eventoRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> obterEstatisticas(@RequestParam(required = false) Long eventoId) {
        Evento evento = (eventoId != null) 
                ? eventoRepository.findById(eventoId).orElseGet(eventoService::obterEventoAtivo)
                : eventoService.obterEventoAtivo();

        Long idEv = evento.getId();
        long totalVisitantes = presencaRepository.countByEventoId(idEv);
        long novosVisitantes = presencaRepository.countByEventoIdAndPrimeiraVezTrue(idEv);
        long totalFotos = fotoRepository.countByEventoId(idEv);
        long totalNotas = notaRepository.countByEventoId(idEv);
        BigDecimal valorTotalNotas = notaRepository.somarValorTotalPorEvento(idEv);

        DashboardStats stats = new DashboardStats(
                evento.getId(),
                evento.getNome(),
                evento.getDataEvento() != null ? evento.getDataEvento().toString() : "Data não informada",
                totalVisitantes,
                novosVisitantes,
                jogoService.listarTodos().size(),
                (int) totalFotos,
                (int) totalNotas,
                valorTotalNotas != null ? valorTotalNotas : BigDecimal.ZERO
        );

        return ResponseEntity.ok(stats);
    }

    public static class DashboardStats {
        private Long eventoId;
        private String nomeEvento;
        private String dataEvento;
        private long totalVisitantes;
        private long novosVisitantes;
        private int totalJogos;
        private int totalFotos;
        private int totalNotas;
        private BigDecimal valorTotalNotas;

        public DashboardStats() {}

        public DashboardStats(Long eventoId, String nomeEvento, String dataEvento, long totalVisitantes, long novosVisitantes, int totalJogos, int totalFotos, int totalNotas, BigDecimal valorTotalNotas) {
            this.eventoId = eventoId;
            this.nomeEvento = nomeEvento;
            this.dataEvento = dataEvento;
            this.totalVisitantes = totalVisitantes;
            this.novosVisitantes = novosVisitantes;
            this.totalJogos = totalJogos;
            this.totalFotos = totalFotos;
            this.totalNotas = totalNotas;
            this.valorTotalNotas = valorTotalNotas;
        }

        public Long getEventoId() { return eventoId; }
        public String getNomeEvento() { return nomeEvento; }
        public String getDataEvento() { return dataEvento; }
        public long getTotalVisitantes() { return totalVisitantes; }
        public long getNovosVisitantes() { return novosVisitantes; }
        public int getTotalJogos() { return totalJogos; }
        public int getTotalFotos() { return totalFotos; }
        public int getTotalNotas() { return totalNotas; }
        public BigDecimal getValorTotalNotas() { return valorTotalNotas; }
    }
}




