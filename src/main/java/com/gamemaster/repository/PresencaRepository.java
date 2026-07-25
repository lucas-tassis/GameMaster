package com.gamemaster.repository;

import com.gamemaster.model.Presenca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PresencaRepository extends JpaRepository<Presenca, Long> {
    long countByPrimeiraVezTrue();
    long countByEventoId(Long eventoId);
    long countByEventoIdAndPrimeiraVezTrue(Long eventoId);
    List<Presenca> findByEventoId(Long eventoId);
}

