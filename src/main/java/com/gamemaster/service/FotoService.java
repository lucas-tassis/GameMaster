package com.gamemaster.service;

import com.gamemaster.model.FotoEvento;
import com.gamemaster.repository.FotoEventoRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FotoService {

    private final FotoEventoRepository fotoRepository;
    private final GoogleDriveService driveService;
    private final EventoService eventoService;

    public FotoService(FotoEventoRepository fotoRepository, GoogleDriveService driveService, EventoService eventoService) {
        this.fotoRepository = fotoRepository;
        this.driveService = driveService;
        this.eventoService = eventoService;
    }

    public List<FotoEvento> listarTodas() {
        return fotoRepository.findAll();
    }

    public FotoEvento salvar(FotoEvento foto) {
        if (foto.getEvento() == null) {
            foto.setEvento(eventoService.obterEventoAtivo());
        }
        FotoEvento salva = fotoRepository.save(foto);

        Map<String, Object> meta = new HashMap<>();
        meta.put("legenda", salva.getLegenda());
        meta.put("autor", salva.getAutor());
        meta.put("dataHora", salva.getDataHora() != null ? salva.getDataHora().toString() : "");
        if (salva.getEvento() != null) {
            meta.put("nomeEvento", salva.getEvento().getNome());
        }

        boolean enviado = driveService.enviarMidia("foto_evento", salva.getBase64Data(), meta);
        if (enviado) {
            salva.setDriveEnviado(true);
            fotoRepository.save(salva);
        }

        return salva;
    }
}
