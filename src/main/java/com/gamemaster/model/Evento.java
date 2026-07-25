package com.gamemaster.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "eventos")
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String local;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataEvento;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataInicio;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataFim;

    private boolean ativo;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "evento_jogos",
        joinColumns = @JoinColumn(name = "evento_id"),
        inverseJoinColumns = @JoinColumn(name = "jogo_id")
    )
    private java.util.Set<Jogo> jogosDisponiveis = new java.util.HashSet<>();

    public Evento() {}

    public Evento(Long id, String nome, String local, LocalDate dataEvento, LocalDate dataInicio, LocalDate dataFim, boolean ativo) {
        this.id = id;
        this.nome = nome;
        this.local = local;
        this.dataEvento = dataEvento;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.ativo = ativo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getLocal() { return local; }
    public void setLocal(String local) { this.local = local; }

    public LocalDate getDataEvento() { return dataEvento; }
    public void setDataEvento(LocalDate dataEvento) { this.dataEvento = dataEvento; }

    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }

    public LocalDate getDataFim() { return dataFim; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }

    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }

    public java.util.Set<Jogo> getJogosDisponiveis() { return jogosDisponiveis; }
    public void setJogosDisponiveis(java.util.Set<Jogo> jogosDisponiveis) { this.jogosDisponiveis = jogosDisponiveis; }
}


