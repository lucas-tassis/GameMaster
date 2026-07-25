package com.gamemaster.repository;

import com.gamemaster.model.NotaFiscal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface NotaFiscalRepository extends JpaRepository<NotaFiscal, Long> {
    List<NotaFiscal> findByDriveEnviadoFalse();

    @Query("SELECT SUM(n.valor) FROM NotaFiscal n")
    BigDecimal somarValorTotal();

    @Query("SELECT SUM(n.valor) FROM NotaFiscal n WHERE n.evento.id = :eventoId")
    BigDecimal somarValorTotalPorEvento(@Param("eventoId") Long eventoId);

    long countByEventoId(Long eventoId);

    List<NotaFiscal> findByEventoId(Long eventoId);
}

