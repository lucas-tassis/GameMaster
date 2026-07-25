package com.gamemaster.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "presencas")
public class Presenca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String cidade;

    private boolean primeiraVez;

    private LocalDateTime dataHora;

    @ManyToOne
    @JoinColumn(name = "evento_id")
    private Evento evento;

    public Presenca() {}

    public Presenca(Long id, String nome, String cidade, boolean primeiraVez, LocalDateTime dataHora, Evento evento) {
        this.id = id;
        this.nome = nome;
        this.cidade = cidade;
        this.primeiraVez = primeiraVez;
        this.dataHora = dataHora;
        this.evento = evento;
    }

    @PrePersist
    protected void onCreate() {
        this.dataHora = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCidade() { return cidade; }
    public void setCidade(String cidade) { this.cidade = cidade; }

    public boolean isPrimeiraVez() { return primeiraVez; }
    public void setPrimeiraVez(boolean primeiraVez) { this.primeiraVez = primeiraVez; }

    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }

    public Evento getEvento() { return evento; }
    public void setEvento(Evento evento) { this.evento = evento; }
}


