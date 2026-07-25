/**
 * Game Master — Store de Estado Global (LocalStorage)
 */

const STORAGE_KEYS = {
  JOGOS: 'gm_jogos_v1',
  VISITANTES: 'gm_visitantes_v1',
  FOTOS: 'gm_fotos_v1',
  NOTAS: 'gm_notas_v1',
  CONFIG: 'gm_config_v1'
};

// Acervo Inicial de Jogos Demonstrativo
const JOGOS_INICIAIS = [
  { id: '1', nome: 'Catan', jogadores: '3-4', duracao: '60 min', categoria: 'Estratégia', status: 'disponivel', emprestadoPara: null, mesa: null, horaEmprestimo: null },
  { id: '2', nome: 'Carcassonne', jogadores: '2-5', duracao: '35 min', categoria: 'Tile Placement', status: 'disponivel', emprestadoPara: null, mesa: null, horaEmprestimo: null },
  { id: '3', nome: 'Ticket to Ride', jogadores: '2-5', duracao: '45 min', categoria: 'Família', status: 'disponivel', emprestadoPara: null, mesa: null, horaEmprestimo: null },
  { id: '4', nome: 'Dixit', jogadores: '3-6', duracao: '30 min', categoria: 'Criatividade', status: 'disponivel', emprestadoPara: null, mesa: null, horaEmprestimo: null },
  { id: '5', nome: 'Coup', jogadores: '2-6', duracao: '15 min', categoria: 'Bluff / Festivo', status: 'disponivel', emprestadoPara: null, mesa: null, horaEmprestimo: null },
  { id: '6', nome: 'Exploding Kittens', jogadores: '2-5', duracao: '15 min', categoria: 'Cartas / Festivo', status: 'disponivel', emprestadoPara: null, mesa: null, horaEmprestimo: null },
  { id: '7', nome: 'Azul', jogadores: '2-4', duracao: '40 min', categoria: 'Abstrato', status: 'disponivel', emprestadoPara: null, mesa: null, horaEmprestimo: null },
  { id: '8', nome: 'King of Tokyo', jogadores: '2-6', duracao: '30 min', categoria: 'Dados / Combate', status: 'disponivel', emprestadoPara: null, mesa: null, horaEmprestimo: null }
];

class Store extends EventTarget {
  constructor() {
    super();
    this.jogos = this.load(STORAGE_KEYS.JOGOS, JOGOS_INICIAIS);
    this.visitantes = this.load(STORAGE_KEYS.VISITANTES, []);
    this.fotos = this.load(STORAGE_KEYS.FOTOS, []);
    this.notas = this.load(STORAGE_KEYS.NOTAS, []);
    this.config = this.load(STORAGE_KEYS.CONFIG, {
      scriptUrl: '',
      nomeEvento: 'Game Master Mall Event'
    });
  }

  load(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.error(`Erro ao carregar chave ${key} do LocalStorage:`, e);
      return fallback;
    }
  }

  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.dispatchEvent(new CustomEvent('state-changed', { detail: { key, data } }));
    } catch (e) {
      console.error(`Erro ao salvar chave ${key} no LocalStorage:`, e);
    }
  }

  /* --- VISITANTES / PRESENÇA --- */
  adicionarVisitante(nome, cidade, primeiraVez) {
    const novoVisitante = {
      id: Date.now().toString(),
      nome: nome.trim(),
      cidade: cidade.trim(),
      primeiraVez: Boolean(primeiraVez),
      dataHora: new Date().toISOString()
    };
    this.visitantes.unshift(novoVisitante);
    this.save(STORAGE_KEYS.VISITANTES, this.visitantes);
    return novoVisitante;
  }

  getVisitantes() {
    return this.visitantes;
  }

  /* --- ACERVO & EMPRÉSTIMOS DE JOGOS --- */
  getJogos() {
    return this.jogos;
  }

  adicionarJogo(nome, jogadores, duracao, categoria) {
    const novoJogo = {
      id: Date.now().toString(),
      nome: nome.trim(),
      jogadores: jogadores.trim() || '2-4',
      duracao: duracao.trim() || '30 min',
      categoria: categoria.trim() || 'Geral',
      status: 'disponivel',
      emprestadoPara: null,
      mesa: null,
      horaEmprestimo: null
    };
    this.jogos.push(novoJogo);
    this.save(STORAGE_KEYS.JOGOS, this.jogos);
    return novoJogo;
  }

  emprestarJogo(jogoId, nomePessoa, mesa) {
    const jogo = this.jogos.find(j => j.id === jogoId);
    if (!jogo) return false;

    jogo.status = 'emprestado';
    jogo.emprestadoPara = nomePessoa.trim();
    jogo.mesa = mesa.trim();
    jogo.horaEmprestimo = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    this.save(STORAGE_KEYS.JOGOS, this.jogos);
    return jogo;
  }

  devolverJogo(jogoId) {
    const jogo = this.jogos.find(j => j.id === jogoId);
    if (!jogo) return false;

    jogo.status = 'disponivel';
    jogo.emprestadoPara = null;
    jogo.mesa = null;
    jogo.horaEmprestimo = null;

    this.save(STORAGE_KEYS.JOGOS, this.jogos);
    return jogo;
  }

  /* --- FOTOS DO EVENTO --- */
  adicionarFoto(base64Data, legenda, autor) {
    const novaFoto = {
      id: Date.now().toString(),
      data: base64Data,
      legenda: legenda ? legenda.trim() : 'Foto do Evento',
      autor: autor ? autor.trim() : 'Visitante',
      dataHora: new Date().toISOString(),
      driveEnviado: false
    };
    this.fotos.unshift(novaFoto);
    this.save(STORAGE_KEYS.FOTOS, this.fotos);
    return novaFoto;
  }

  marcarFotoEnviadaDrive(fotoId) {
    const foto = this.fotos.find(f => f.id === fotoId);
    if (foto) {
      foto.driveEnviado = true;
      this.save(STORAGE_KEYS.FOTOS, this.fotos);
    }
  }

  getFotos() {
    return this.fotos;
  }

  /* --- NOTAS FISCAIS --- */
  adicionarNota(base64Data, loja, valor) {
    const novaNota = {
      id: Date.now().toString(),
      data: base64Data,
      loja: loja ? loja.trim() : 'Estabelecimento Mall',
      valor: valor ? parseFloat(valor) : 0,
      dataHora: new Date().toISOString(),
      driveEnviado: false
    };
    this.notas.unshift(novaNota);
    this.save(STORAGE_KEYS.NOTAS, this.notas);
    return novaNota;
  }

  marcarNotaEnviadaDrive(notaId) {
    const nota = this.notas.find(n => n.id === notaId);
    if (nota) {
      nota.driveEnviado = true;
      this.save(STORAGE_KEYS.NOTAS, this.notas);
    }
  }

  getNotas() {
    return this.notas;
  }

  /* --- CONFIGURAÇÕES --- */
  getConfig() {
    return this.config;
  }

  salvarConfig(scriptUrl, nomeEvento) {
    this.config.scriptUrl = scriptUrl.trim();
    if (nomeEvento) this.config.nomeEvento = nomeEvento.trim();
    this.save(STORAGE_KEYS.CONFIG, this.config);
  }
}

export const store = new Store();
