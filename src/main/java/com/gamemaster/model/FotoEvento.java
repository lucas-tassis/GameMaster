package com.gamemaster.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "fotos_evento")
public class FotoEvento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String base64Data;

    private String legenda;

    private String autor;

    private boolean driveEnviado;

    private LocalDateTime dataHora;

    @ManyToOne
    @JoinColumn(name = "evento_id")
    private Evento evento;

    public FotoEvento() {}

    public FotoEvento(Long id, String base64Data, String legenda, String autor, boolean driveEnviado, LocalDateTime dataHora, Evento evento) {
        this.id = id;
        this.base64Data = base64Data;
        this.legenda = legenda;
        this.autor = autor;
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

    public String getLegenda() { return legenda; }
    public void setLegenda(String legenda) { this.legenda = legenda; }

    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }

    public boolean isDriveEnviado() { return driveEnviado; }
    public void setDriveEnviado(boolean driveEnviado) { this.driveEnviado = driveEnviado; }

    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }

    public Evento getEvento() { return evento; }
    public void setEvento(Evento evento) { this.evento = evento; }
}


