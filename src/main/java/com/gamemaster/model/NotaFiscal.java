package com.gamemaster.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "notas_fiscais")
public class NotaFiscal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String base64Data;

    private String loja;

    private BigDecimal valor;

    private boolean driveEnviado;

    private LocalDateTime dataHora;

    @ManyToOne
    @JoinColumn(name = "evento_id")
    private Evento evento;

    public NotaFiscal() {}

    public NotaFiscal(Long id, String base64Data, String loja, BigDecimal valor, boolean driveEnviado, LocalDateTime dataHora, Evento evento) {
        this.id = id;
        this.base64Data = base64Data;
        this.loja = loja;
        this.valor = valor;
        this.driveEnviado = driveEnviado;
        this.dataHora = dataHora;
        this.evento = evento;
    }

    @PrePersist
    protected void onCreate() {
        this.dataHora = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBase64Data() { return base64Data; }
    public void setBase64Data(String base64Data) { this.base64Data = base64Data; }

    public String getLoja() { return loja; }
    public void setLoja(String loja) { this.loja = loja; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public boolean isDriveEnviado() { return driveEnviado; }
    public void setDriveEnviado(boolean driveEnviado) { this.driveEnviado = driveEnviado; }

    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }

    public Evento getEvento() { return evento; }
    public void setEvento(Evento evento) { this.evento = evento; }
}


