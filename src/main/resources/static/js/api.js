/**
 * Game Master — Cliente de API REST para comunicação com o Spring Boot Backend
 */

const API_BASE = '/api/v1';

export class ApiClient {

  static async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`);
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Erro no GET ${endpoint}:`, error);
      throw error;
    }
  }

  static async post(endpoint, body) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Erro no POST ${endpoint}:`, error);
      throw error;
    }
  }

  static async put(endpoint, body = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Erro no PUT ${endpoint}:`, error);
      throw error;
    }
  }

  /* --- MÉTODOS ESPECÍFICOS --- */
  static async getStats(eventoId = null) {
    const query = eventoId ? `?eventoId=${eventoId}` : '';
    return this.get(`/dashboard/stats${query}`);
  }


  static async getPresencas() {
    return this.get('/presenca');
  }

  static async registrarPresenca(dados) {
    return this.post('/presenca', dados);
  }

  static async getJogos() {
    return this.get('/jogos');
  }

  static async criarJogo(dados) {
    return this.post('/jogos', dados);
  }

  static async getFotos() {
    return this.get('/fotos');
  }

  static async enviarFoto(dados) {
    return this.post('/fotos', dados);
  }

  static async getNotas() {
    return this.get('/notas');
  }

  static async enviarNota(dados) {
    return this.post('/notas', dados);
  }

  static async getUsuarios() {
    return this.get('/usuarios');
  }

  static async registrarUsuario(dados) {
    return this.post('/usuarios', dados);
  }

  static async alterarRoleUsuario(id, role) {
    return this.put(`/usuarios/${id}/role`, { role });
  }

  static async getEventos() {
    return this.get('/eventos');
  }

  static async getEventoAtivo() {
    return this.get('/eventos/ativo');
  }

  static async criarEvento(dados) {
    return this.post('/eventos', dados);
  }

  static async atualizarEvento(id, dados) {
    return this.put(`/eventos/${id}`, dados);
  }

  static async ativarEvento(id) {
    return this.put(`/eventos/${id}/ativar`);
  }


  static async encerrarEvento(id) {
    return this.put(`/eventos/${id}/encerrar`);
  }

  static async deletarEvento(id) {
    return this.delete(`/eventos/${id}`);
  }

  static async buscarLudopedia(query) {
    return this.get(`/ludopedia/buscar?query=${encodeURIComponent(query)}`);
  }

  static async sincronizarGrupoLudopedia(idGrupo = '2088') {
    return this.post(`/ludopedia/sincronizar-grupo/${idGrupo}`);
  }

  static async getConfigTokenLudopedia() {
    return this.get('/ludopedia/config-token');
  }

  static async setConfigTokenLudopedia(token) {
    return this.post('/ludopedia/config-token', { token });
  }

  static async getMe() {
    return this.get('/auth/me');
  }

  static async loginAdmin(email, senha) {
    return this.post('/auth/login', { email, senha });
  }
}






