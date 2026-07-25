package com.gamemaster.repository;

import com.gamemaster.model.FotoEvento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FotoEventoRepository extends JpaRepository<FotoEvento, Long> {
    List<FotoEvento> findByDriveEnviadoFalse();
    long countByEventoId(Long eventoId);
    List<FotoEvento> findByEventoId(Long eventoId);
}

