package com.gamemaster.model;

import jakarta.persistence.*;

@Entity
@Table(name = "jogos")
public class Jogo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String jogadores;

    private String duracao;

    private String categoria;

    @Column(length = 500)
    private String urlImagem;

    public Jogo() {}

    public Jogo(Long id, String nome, String jogadores, String duracao, String categoria) {
        this(id, nome, jogadores, duracao, categoria, null);
    }

    public Jogo(Long id, String nome, String jogadores, String duracao, String categoria, String urlImagem) {
        this.id = id;
        this.nome = nome;
        this.jogadores = jogadores;
        this.duracao = duracao;
        this.categoria = categoria;
        this.urlImagem = urlImagem;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getJogadores() { return jogadores; }
    public void setJogadores(String jogadores) { this.jogadores = jogadores; }

    public String getDuracao() { return duracao; }
    public void setDuracao(String duracao) { this.duracao = duracao; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getUrlImagem() { return urlImagem; }
    public void setUrlImagem(String urlImagem) { this.urlImagem = urlImagem; }
}
