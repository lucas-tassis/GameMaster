package com.gamemaster.service;

import com.gamemaster.model.NotaFiscal;
import com.gamemaster.repository.NotaFiscalRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotaFiscalService {

    private final NotaFiscalRepository notaRepository;
    private final GoogleDriveService driveService;
    private final EventoService eventoService;

    public NotaFiscalService(NotaFiscalRepository notaRepository, GoogleDriveService driveService, EventoService eventoService) {
        this.notaRepository = notaRepository;
        this.driveService = driveService;
        this.eventoService = eventoService;
    }

    public List<NotaFiscal> listarTodas() {
        return notaRepository.findAll();
    }

    public BigDecimal calcularTotalConsumido() {
        BigDecimal total = notaRepository.somarValorTotal();
        return total != null ? total : BigDecimal.ZERO;
    }

    public NotaFiscal salvar(NotaFiscal nota) {
        if (nota.getEvento() == null) {
            nota.setEvento(eventoService.obterEventoAtivo());
        }
        NotaFiscal salva = notaRepository.save(nota);

        Map<String, Object> meta = new HashMap<>();
        meta.put("loja", salva.getLoja());
        meta.put("valor", salva.getValor());
        meta.put("dataHora", salva.getDataHora() != null ? salva.getDataHora().toString() : "");
        if (salva.getEvento() != null) {
            meta.put("nomeEvento", salva.getEvento().getNome());
        }

        boolean enviado = driveService.enviarMidia("nota_fiscal", salva.getBase64Data(), meta);
        if (enviado) {
            salva.setDriveEnviado(true);
            notaRepository.save(salva);
        }

        return salva;
    }
}
