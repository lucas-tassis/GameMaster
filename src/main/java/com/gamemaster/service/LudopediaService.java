package com.gamemaster.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gamemaster.model.Evento;
import com.gamemaster.model.Jogo;
import com.gamemaster.repository.EventoRepository;
import com.gamemaster.repository.JogoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class LudopediaService {

    @Value("${ludopedia.api.token:}")
    private String apiToken;

    @Value("${ludopedia.api.app-id:}")
    private String appId;

    @Value("${ludopedia.api.app-key:}")
    private String appKey;

    @Value("${ludopedia.api.redirect-uri:http://localhost:8085/api/v1/ludopedia/oauth/callback}")
    private String redirectUri;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final JogoRepository jogoRepository;
    private final EventoRepository eventoRepository;
    private final List<Map<String, String>> catalogoLocal = Collections.synchronizedList(new ArrayList<>());

    public LudopediaService(JogoRepository jogoRepository, EventoRepository eventoRepository) {
        this.jogoRepository = jogoRepository;
        this.eventoRepository = eventoRepository;
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(6))
                .followRedirects(HttpClient.Redirect.ALWAYS)
                .build();

        inicializarCatalogoPopular();
    }

    public String getApiToken() {
        return apiToken;
    }

    public void setApiToken(String token) {
        if (token != null) {
            this.apiToken = token.trim();
            System.out.println("🔑 Token da API da Ludopedia atualizado: " + (this.apiToken.isEmpty() ? "Vazio" : "Definido com Sucesso"));
        }
    }

    public String gerarUrlAutorizacao() {
        if (appId == null || appId.isBlank()) {
            return "https://ludopedia.com.br/aplicativos";
        }
        return "https://ludopedia.com.br/oauth?app_id=" + URLEncoder.encode(appId, StandardCharsets.UTF_8)
                + "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8);
    }

    public String trocarCodePorToken(String code) {
        if (code == null || code.isBlank()) return null;
        try {
            String formBody = "code=" + URLEncoder.encode(code, StandardCharsets.UTF_8)
                    + "&app_id=" + URLEncoder.encode(appId != null ? appId : "", StandardCharsets.UTF_8)
                    + "&app_key=" + URLEncoder.encode(appKey != null ? appKey : "", StandardCharsets.UTF_8);

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create("https://ludopedia.com.br/tokenrequest"))
                    .timeout(Duration.ofSeconds(8))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(formBody))
                    .build();

            HttpResponse<String> response = httpClient.send(req, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200 && response.body() != null) {
                JsonNode json = objectMapper.readTree(response.body());
                if (json.has("access_token")) {
                    String novoToken = json.get("access_token").asText();
                    setApiToken(novoToken);
                    return novoToken;
                }
            }
        } catch (Exception e) {
            System.err.println("Erro ao trocar code por access_token na Ludopedia: " + e.getMessage());
        }
        return null;
    }

    public List<Map<String, String>> buscarJogos(String termo) {
        if (termo == null || termo.trim().isEmpty()) {
            return new ArrayList<>();
        }

        String query = termo.trim();
        String termoNorm = removerAcentos(query.toLowerCase());
        List<Map<String, String>> resultados = new ArrayList<>();

        // 1. Buscar no Catálogo Local (Instantâneo 0ms)
        synchronized (catalogoLocal) {
            for (Map<String, String> jogo : catalogoLocal) {
                String nomeNorm = removerAcentos(jogo.get("nome").toLowerCase());
                if (nomeNorm.contains(termoNorm)) {
                    resultados.add(jogo);
                    if (resultados.size() >= 8) {
                        break;
                    }
                }
            }
        }

        // 2. Se a busca local não encontrar ou o usuário pedir, faz a busca online na Ludopedia
        if (resultados.isEmpty()) {
            List<Map<String, String>> online = buscarOnlineLudopedia(query);
            if (!online.isEmpty()) {
                resultados.addAll(online);
                for (Map<String, String> res : online) {
                    addJogoSeNaoExiste(res.get("nome"), res.get("jogadores"), res.get("duracao"), res.get("categoria"));
                }
            }
        }

        // 3. Fallback inteligente
        if (resultados.isEmpty()) {
            Map<String, String> item = new HashMap<>();
            item.put("nome", query);
            item.put("jogadores", "2-4");
            item.put("duracao", "45 min");
            item.put("categoria", "Tabuleiro / Estratégia");
            resultados.add(item);
            addJogoSeNaoExiste(query, "2-4", "45 min", "Tabuleiro / Estratégia");
        }

        return resultados;
    }

    public List<Map<String, String>> buscarOnlineLudopedia(String query) {
        List<Map<String, String>> resultados = new ArrayList<>();

        // Tentar via API REST Oficial com Authorization: Bearer <access_token>
        if (apiToken != null && !apiToken.isBlank()) {
            try {
                String termoEncoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
                String url = "https://ludopedia.com.br/api/v1/jogos?search=" + termoEncoded;

                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .timeout(Duration.ofSeconds(5))
                        .header("Accept", "application/json")
                        .header("Authorization", "Bearer " + apiToken)
                        .build();

                HttpResponse<String> response = httpClient.send(req, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 200 && response.body() != null) {
                    JsonNode rootNode = objectMapper.readTree(response.body());
                    JsonNode jogosNode = rootNode.has("jogos") ? rootNode.get("jogos") : rootNode;

                    if (jogosNode.isArray()) {
                        for (JsonNode node : jogosNode) {
                            Map<String, String> item = new HashMap<>();
                            item.put("nome", node.has("nm_jogo") ? node.get("nm_jogo").asText() : node.path("nome").asText(""));
                            item.put("jogadores", node.has("qt_jogadores") ? node.get("qt_jogadores").asText() : "2-4");
                            item.put("duracao", node.has("vl_tempo_jogo") ? node.get("vl_tempo_jogo").asText() + " min" : "45 min");
                            item.put("categoria", node.has("nm_categoria") ? node.get("nm_categoria").asText() : "Estratégia");
                            resultados.add(item);
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Aviso: Falha na API Ludopedia REST: " + e.getMessage());
            }
        }

        if (resultados.isEmpty()) {
            try {
                String termoEncoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
                String url = "https://ludopedia.com.br/search?search=" + termoEncoded;

                HttpRequest req = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .timeout(Duration.ofSeconds(5))
                        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                        .build();

                HttpResponse<String> response = httpClient.send(req, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 200 && response.body() != null) {
                    Pattern pattern = Pattern.compile("href=\"https://ludopedia.com.br/jogo/([^\"]+)\">([^<]+)</a>");
                    Matcher matcher = pattern.matcher(response.body());

                    Set<String> salvos = new HashSet<>();
                    while (matcher.find() && resultados.size() < 6) {
                        String titulo = matcher.group(2).trim();
                        if (!titulo.isEmpty() && !salvos.contains(titulo.toLowerCase())) {
                            salvos.add(titulo.toLowerCase());
                            Map<String, String> item = new HashMap<>();
                            item.put("nome", titulo);
                            item.put("jogadores", "2-4");
                            item.put("duracao", "45 min");
                            item.put("categoria", "Tabuleiro / Estratégia");
                            resultados.add(item);
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Aviso: Falha na busca pública Ludopedia: " + e.getMessage());
            }
        }

        return resultados;
    }

    @Transactional
    public List<Map<String, String>> sincronizarGrupoLudopedia(String idGrupo) {
        List<Map<String, String>> importados = new ArrayList<>();
        String grupoId = (idGrupo != null && !idGrupo.isBlank()) ? idGrupo.trim() : "2088";

        try {
            Set<String> titulosEncontrados = new LinkedHashSet<>();

            // 1. Tentar via API REST Oficial se houver token
            if (apiToken != null && !apiToken.isBlank()) {
                try {
                    String url = "https://ludopedia.com.br/api/v1/grupos/" + grupoId + "/jogos";
                    HttpRequest req = HttpRequest.newBuilder()
                            .uri(URI.create(url))
                            .timeout(Duration.ofSeconds(8))
                            .header("Accept", "application/json")
                            .header("Authorization", "Bearer " + apiToken)
                            .build();

                    HttpResponse<String> response = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
                    if (response.statusCode() == 200 && response.body() != null) {
                        JsonNode rootNode = objectMapper.readTree(response.body());
                        JsonNode jogosNode = rootNode.has("jogos") ? rootNode.get("jogos") : rootNode;
                        if (jogosNode.isArray()) {
                            for (JsonNode node : jogosNode) {
                                String t = node.has("nm_jogo") ? node.get("nm_jogo").asText() : node.path("nome").asText("");
                                if (!t.isBlank()) titulosEncontrados.add(t.trim());
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Aviso: Erro na busca do grupo via API REST com Token: " + e.getMessage());
                }
            }

            // 2. Se a API não retornar ou não houver token, fazer raspagem de todas as páginas da coleção pública
            if (titulosEncontrados.isEmpty()) {
                Pattern p = Pattern.compile("href=\"https://ludopedia.com.br/jogo/([^\"]+)\">([^<]+)</a>");

                for (int pagina = 1; pagina <= 30; pagina++) {
                    String url = "https://ludopedia.com.br/grupo/" + grupoId + "/acervo?pagina=" + pagina;

                    HttpRequest req = HttpRequest.newBuilder()
                            .uri(URI.create(url))
                            .timeout(Duration.ofSeconds(6))
                            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                            .build();

                    HttpResponse<String> response = httpClient.send(req, HttpResponse.BodyHandlers.ofString());

                    if (response.statusCode() != 200 || response.body() == null) {
                        break;
                    }

                    String html = response.body();
                    Matcher m = p.matcher(html);
                    int jogosNaPagina = 0;

                    while (m.find()) {
                        String t = m.group(2).trim();
                        if (!t.isEmpty() && !t.equalsIgnoreCase("Ver mais") && !t.equalsIgnoreCase("Ludopedia") && !t.equalsIgnoreCase("Home")) {
                            if (titulosEncontrados.add(t)) {
                                jogosNaPagina++;
                            }
                        }
                    }

                    if (jogosNaPagina == 0 && pagina > 1) {
                        break;
                    }
                }
            }

            Optional<Evento> eventoOpt = eventoRepository.findByAtivoTrue();
            Evento eventoAtivo = eventoOpt.orElse(null);

            List<Jogo> existentes = jogoRepository.findAll();
            List<Jogo> novosParaSalvar = new ArrayList<>();

            for (String t : titulosEncontrados) {
                addJogoSeNaoExiste(t, "2-4", "45 min", "Tabuleiro / Estratégia");

                String tNorm = removerAcentos(t.toLowerCase());
                Jogo jogoEntidade = existentes.stream()
                        .filter(j -> removerAcentos(j.getNome().toLowerCase()).equals(tNorm))
                        .findFirst()
                        .orElse(null);

                if (jogoEntidade == null) {
                    jogoEntidade = new Jogo(null, t, "2-4", "45 min", "Tabuleiro / Estratégia");
                    novosParaSalvar.add(jogoEntidade);
                }

                if (eventoAtivo != null && jogoEntidade != null && jogoEntidade.getId() != null) {
                    eventoAtivo.getJogosDisponiveis().add(jogoEntidade);
                }

                Map<String, String> item = new HashMap<>();
                item.put("nome", t);
                item.put("jogadores", "2-4");
                item.put("duracao", "45 min");
                item.put("categoria", "Tabuleiro / Estratégia");
                importados.add(item);
            }

            if (!novosParaSalvar.isEmpty()) {
                List<Jogo> salvosNovos = jogoRepository.saveAll(novosParaSalvar);
                if (eventoAtivo != null) {
                    eventoAtivo.getJogosDisponiveis().addAll(salvosNovos);
                }
            }

            if (eventoAtivo != null) {
                eventoRepository.save(eventoAtivo);
            }
        } catch (Exception e) {
            System.err.println("Aviso: Erro ao sincronizar grupo Ludopedia: " + e.getMessage());
        }

        return importados;
    }

    public synchronized void addJogoSeNaoExiste(String nome, String jogadores, String duracao, String categoria) {
        if (nome == null || nome.isBlank()) return;
        String nNorm = removerAcentos(nome.trim().toLowerCase());
        for (Map<String, String> j : catalogoLocal) {
            if (removerAcentos(j.get("nome").toLowerCase()).equals(nNorm)) {
                return;
            }
        }
        Map<String, String> item = new HashMap<>();
        item.put("nome", nome.trim());
        item.put("jogadores", jogadores != null && !jogadores.isBlank() ? jogadores : "2-4");
        item.put("duracao", duracao != null && !duracao.isBlank() ? duracao : "45 min");
        item.put("categoria", categoria != null && !categoria.isBlank() ? categoria : "Tabuleiro");
        catalogoLocal.add(item);
    }

    private void inicializarCatalogoPopular() {
        addJogoSeNaoExiste("Ticket to Ride", "2-5", "45 min", "Estratégia / Família");
        addJogoSeNaoExiste("Ticket to Ride: Europa", "2-5", "60 min", "Estratégia / Família");
        addJogoSeNaoExiste("Ticket to Ride: Primeira Viagem", "2-4", "30 min", "Infantil / Família");
        addJogoSeNaoExiste("Azul", "2-4", "30-45 min", "Estratégia Abstrata");
        addJogoSeNaoExiste("Azul: Vitrais de Sintra", "2-4", "30-45 min", "Estratégia Abstrata");
        addJogoSeNaoExiste("Azul: Pavilhão de Verão", "2-4", "40-45 min", "Estratégia Abstrata");
        addJogoSeNaoExiste("Azul: Jardim da Rainha", "2-4", "45-60 min", "Estratégia Abstrata");
        addJogoSeNaoExiste("Catan (Os Colonizadores)", "3-4", "60-90 min", "Negociação / Estratégia");
        addJogoSeNaoExiste("Dixit", "3-6", "30 min", "Festivo / Imagem & Dedução");
        addJogoSeNaoExiste("Dixit: Odyssey", "3-12", "30 min", "Festivo / Imagem & Dedução");
        addJogoSeNaoExiste("Codenames (Código Secreto)", "2-8", "15 min", "Palavras / Dedução");
        addJogoSeNaoExiste("Codenames: Imagens", "2-8", "15 min", "Dedução Visual");
        addJogoSeNaoExiste("Terraforming Mars", "1-5", "120 min", "Estratégia Avançada");
        addJogoSeNaoExiste("Carcassonne", "2-5", "35-45 min", "Colocação de Tiles / Estratégia");
        addJogoSeNaoExiste("Pandemic", "2-4", "45 min", "Cooperativo / Estratégia");
        addJogoSeNaoExiste("7 Wonders", "2-7", "30 min", "Draft de Cartas / Civilização");
        addJogoSeNaoExiste("7 Wonders Duel", "2", "30 min", "Estratégia / 2 Jogadores");
        addJogoSeNaoExiste("Wingspan", "1-5", "40-70 min", "Gestão de Mão / Animais");
        addJogoSeNaoExiste("Splendor", "2-4", "30 min", "Desenvolvimento / Cartas");
        addJogoSeNaoExiste("Coup (Coupe)", "2-6", "15 min", "Bluff / Dedução");
        addJogoSeNaoExiste("Exploding Kittens", "2-5", "15 min", "Festivo / Cartas");
        addJogoSeNaoExiste("King of Tokyo", "2-6", "30 min", "Dados / Festivo");
        addJogoSeNaoExiste("Munchkin", "3-6", "60 min", "Humor / Cartas");
        addJogoSeNaoExiste("Gloomhaven", "1-4", "60-120 min", "RPG / Aventura");
        addJogoSeNaoExiste("Everdell", "1-4", "40-80 min", "Alocação de Trabalhadores");
        addJogoSeNaoExiste("Cascadia", "1-4", "30-45 min", "Quebra-cabeça / Natureza");
        addJogoSeNaoExiste("Patchwork", "2", "30 min", "Quebra-cabeça / 2 Jogadores");
        addJogoSeNaoExiste("Bang!", "4-7", "20-40 min", "Velho Oeste / Identidade Oculta");
        addJogoSeNaoExiste("Scythe", "1-5", "90-115 min", "Estratégia / Controle de Área");
        addJogoSeNaoExiste("Brass: Birmingham", "2-4", "120 min", "Economia Avançada");
        addJogoSeNaoExiste("Love Letter", "2-4", "20 min", "Dedução de Cartas");
        addJogoSeNaoExiste("Uno", "2-10", "15 min", "Cartas / Família");
        addJogoSeNaoExiste("Perfil 7", "2-6", "30 min", "Trivia / Conhecimento");
        addJogoSeNaoExiste("War", "3-6", "120-180 min", "Estratégia / Conquista");
        addJogoSeNaoExiste("Imagem & Ação", "4-16", "45 min", "Desenho / Festivo");
        addJogoSeNaoExiste("Bandido", "1-4", "15 min", "Cooperativo / Cartas");
        addJogoSeNaoExiste("Black Stories", "2-15", "20 min", "Enigmas / Mistério");
        addJogoSeNaoExiste("Quartz", "3-5", "45 min", "Pressione sua Sorte");
        addJogoSeNaoExiste("Clue (Detetive)", "2-6", "45 min", "Investigação");
        addJogoSeNaoExiste("Rummikub", "2-4", "45 min", "Números / Tabuleiro");
        addJogoSeNaoExiste("Monopoly (Banco Imobiliário)", "2-6", "90 min", "Economia");
        addJogoSeNaoExiste("Jenga", "1-8", "15 min", "Habilidade Manual");
        addJogoSeNaoExiste("Taco Gato Cabra Queijo Pizza", "2-8", "10 min", "Reação Rápida / Festivo");
        addJogoSeNaoExiste("Dobble", "2-8", "15 min", "Percepção Visual");
        addJogoSeNaoExiste("Concept", "2-12", "40 min", "Associação de Ideias");
        addJogoSeNaoExiste("Santorini", "2-4", "20 min", "Estratégia Abstrata");
        addJogoSeNaoExiste("Century: Rota das Especiarias", "2-5", "30-45 min", "Gestão de Recursos");
        addJogoSeNaoExiste("Camel Up", "2-8", "30-45 min", "Corridas / Apostas");
        addJogoSeNaoExiste("The Resistance", "5-10", "30 min", "Identidade Oculta");
        addJogoSeNaoExiste("Secret Hitler", "5-10", "45 min", "Dedução Social");
    }

    private String removerAcentos(String str) {
        if (str == null) return "";
        return Normalizer.normalize(str, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
    }
}
