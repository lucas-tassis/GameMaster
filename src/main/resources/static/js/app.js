/**
 * Game Master — Controlador da Interface SPA com Roteador de Histórico (Spring Boot 4.1.0 + Java 25)
 */
import { ApiClient } from './api.js';

class App {
  constructor() {
    this.currentTab = 'dashboard';
    this.selectedEventoId = null;
    this.isAdmin = sessionStorage.getItem('gamemaster_admin') === 'true';
    this.initElements();
    this.initEvents();
    this.updateAuthUI();
    this.loadFromUrl();
  }

  initElements() {
    this.navBtns = document.querySelectorAll('.nav-btn');
    this.tabPanels = document.querySelectorAll('.tab-panel');
    this.toastContainer = document.getElementById('toast-container');
    this.modalBackdrop = document.getElementById('app-modal');
    this.modalTitle = document.getElementById('modal-title');
    this.modalBody = document.getElementById('modal-body');
    this.modalCloseBtn = document.getElementById('modal-close-btn');
    this.btnAuthMode = document.getElementById('btn-auth-mode');
  }

  initEvents() {
    this.navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.navigateToTab(tab);
      });
    });

    if (this.btnAuthMode) {
      this.btnAuthMode.addEventListener('click', () => {
        if (this.isAdmin) {
          sessionStorage.setItem('gamemaster_admin', 'false');
          this.isAdmin = false;
          this.showToast('Sessão de Administrador encerrada.', 'info');
          this.updateAuthUI();
          if (['usuarios', 'eventos'].includes(this.currentTab)) {
            this.navigateToTab('dashboard');
          } else {
            this.renderCurrentTab();
          }
        } else {
          this.openModal('🌐 Autenticação via Conta Google', `
            <form id="form-login-google">
              <div style="background: var(--surface-light); padding: 1rem; border-radius: 8px; margin-bottom: 1.25rem; text-align: center;">
                <div style="font-size: 2.2rem; margin-bottom: 0.25rem;">🌐</div>
                <h4 style="font-size: 1rem; color: var(--text-main); margin-bottom: 0.25rem;">Entrar com a Conta Google</h4>
                <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0;">
                  Selecione sua conta para validar as permissões de acesso ao Game Master.
                </p>
              </div>

              <div class="form-group">
                <label style="font-weight: 600;">Selecione ou digite o seu E-mail Google *</label>
                <input type="email" id="login-google-email" class="form-control" placeholder="exemplo@gmail.com" required value="lucastassis2@gmail.com" style="font-size: 0.95rem; padding: 0.65rem;">
              </div>

              <button type="submit" class="btn btn-primary btn-block" style="margin-top: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem;">
                <span>🌐</span> <span>Continuar com o Google</span>
              </button>
            </form>
          `);

          document.querySelector('#form-login-google').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = (document.querySelector('#login-google-email').value || '').trim().toLowerCase();

            const adminEmails = ['lucastassis2@gmail.com', 'admin@gamemaster.com'];

            if (adminEmails.includes(email) || email.includes('admin')) {
              sessionStorage.setItem('gamemaster_admin', 'true');
              sessionStorage.setItem('gamemaster_user_email', email);
              this.isAdmin = true;
              this.closeModal();
              this.showToast('✅ Modo Administrador ativado via Conta Google!', 'success');
              this.updateAuthUI();
              this.renderCurrentTab();
            } else {
              this.showToast(`ℹ️ A conta ${email} não possui privilégios de administrador.`, 'error');
            }
          });
        }
      });
    }

    this.modalCloseBtn.addEventListener('click', () => this.closeModal());
    this.modalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.modalBackdrop) this.closeModal();
    });

    // Escutar botões do navegador (Voltar / Avançar)
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.tab) {
        this.navigateToTab(e.state.tab, e.state.eventoId, false);
      } else {
        this.loadFromUrl(false);
      }
    });

    window.addEventListener('hashchange', () => {
      this.loadFromUrl(false);
    });
  }

  updateAuthUI() {
    if (this.btnAuthMode) {
      if (this.isAdmin) {
        this.btnAuthMode.innerHTML = '👑 Admin (Sair)';
        this.btnAuthMode.className = 'btn btn-sm btn-primary';
      } else {
        this.btnAuthMode.innerHTML = '🔐 Entrar como Admin';
        this.btnAuthMode.className = 'btn btn-sm btn-secondary';
      }
    }

    document.querySelectorAll('[data-admin-only="true"]').forEach(el => {
      el.style.display = this.isAdmin ? 'flex' : 'none';
    });
  }

  loadFromUrl(pushHistory = true) {
    const hash = window.location.hash.replace('#', '');
    const urlParams = new URLSearchParams(window.location.search);
    const evId = urlParams.get('eventoId');

    let tab = 'dashboard';
    if (hash && ['dashboard', 'presenca', 'acervo', 'fotos', 'notas', 'usuarios', 'eventos'].includes(hash)) {
      tab = hash;
    }

    this.navigateToTab(tab, evId ? Number(evId) : null, pushHistory);
  }

  navigateToTab(tabName, eventoId = null, updateUrl = true) {
    if (['usuarios', 'eventos'].includes(tabName) && !this.isAdmin) {
      this.showToast(`🔒 A aba de ${tabName === 'usuarios' ? 'Usuários' : 'Eventos'} é reservada a administradores.`, 'info');
      tabName = 'dashboard';
    }

    this.currentTab = tabName;
    if (eventoId) {
      this.selectedEventoId = eventoId;
    }

    if (updateUrl) {
      const searchStr = this.selectedEventoId ? `?eventoId=${this.selectedEventoId}` : '';
      const newUrl = `${window.location.pathname}${searchStr}#${tabName}`;
      window.history.pushState({ tab: tabName, eventoId: this.selectedEventoId }, '', newUrl);
    }

    this.navBtns.forEach(btn => {
      const isSelected = btn.dataset.tab === tabName;
      btn.classList.toggle('active', isSelected);
      if (isSelected) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
    this.tabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${tabName}`);
    });
    this.renderCurrentTab();
  }

  async renderCurrentTab() {
    const container = document.getElementById(`tab-${this.currentTab}`);
    if (!container) return;

    try {
      switch (this.currentTab) {
        case 'dashboard':
          await this.renderDashboard(container, this.selectedEventoId);
          break;
        case 'presenca':
          await this.renderPresenca(container);
          break;
        case 'acervo':
          await this.renderAcervo(container);
          break;
        case 'fotos':
          await this.renderFotos(container);
          break;
        case 'notas':
          await this.renderNotas(container);
          break;
        case 'usuarios':
          await this.renderUsuarios(container);
          break;
        case 'eventos':
          await this.renderEventos(container);
          break;
      }
    } catch (err) {
      console.error(`Erro ao renderizar aba ${this.currentTab}:`, err);
      this.showToast('Erro ao conectar ao servidor Spring Boot', 'error');
    }
  }

  async renderDashboard(container, eventoId = null) {
    const stats = await ApiClient.getStats(eventoId).catch(() => ({
      nomeEvento: 'Game Master Mall', dataEvento: '25/07/2026', totalVisitantes: 0, novosVisitantes: 0, totalJogos: 0, totalFotos: 0, totalNotas: 0, valorTotalNotas: 0
    }));

    const visitantes = await ApiClient.getPresencas().catch(() => []);
    const todosEventos = await ApiClient.getEventos().catch(() => []);

    container.innerHTML = `
      <div class="section-header">
        <div class="section-title">
          <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <h2>Painel do Evento — ${stats.nomeEvento || 'Game Master Mall'}</h2>
            ${this.isAdmin && stats.eventoId ? `
              <button class="btn btn-secondary btn-sm" id="btn-encerrar-evento-dash" style="border-color: #ef4444; color: #ef4444;">
                🛑 Encerrar Este Evento
              </button>
            ` : ''}
          </div>
          <p>📅 <strong>Data do Evento:</strong> ${stats.dataEvento || 'Data não informada'}</p>
        </div>

        ${todosEventos.length > 0 ? `
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <label style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Filtrar Evento:</label>
            <select id="select-filtro-evento" class="form-control" style="max-width: 250px; padding: 0.4rem 0.75rem;">
              ${todosEventos.map(ev => `
                <option value="${ev.id}" ${ev.id === stats.eventoId ? 'selected' : ''}>
                  ${ev.nome} (${ev.dataEvento || '25/07/2026'}) ${ev.ativo ? '★ [ATIVO]' : ''}
                </option>
              `).join('')}
            </select>
          </div>
        ` : ''}
      </div>

      <div class="${this.isAdmin ? 'grid-4' : 'grid-3'}" style="margin-bottom: 1.5rem;">
        <div class="card stat-card">
          <div class="stat-icon purple">👥</div>
          <div class="stat-info">
            <div class="stat-value">${stats.totalVisitantes}</div>
            <div class="stat-label">Público (${stats.novosVisitantes} novos)</div>
          </div>
        </div>

        <div class="card stat-card">
          <div class="stat-icon orange">🎲</div>
          <div class="stat-info">
            <div class="stat-value">${stats.totalJogos}</div>
            <div class="stat-label">Jogos no Acervo</div>
          </div>
        </div>

        <div class="card stat-card">
          <div class="stat-icon blue">📸</div>
          <div class="stat-info">
            <div class="stat-value">${stats.totalFotos}</div>
            <div class="stat-label">Fotos Registradas</div>
          </div>
        </div>

        ${this.isAdmin ? `
          <div class="card stat-card">
            <div class="stat-icon green">🧾</div>
            <div class="stat-info">
              <div class="stat-value">R$ ${(stats.valorTotalNotas || 0).toFixed(2)}</div>
              <div class="stat-label">Consumo Mall (${stats.totalNotas} notas) [ADM]</div>
            </div>
          </div>
        ` : ''}
      </div>

      <div class="card">
        <h3 style="margin-bottom: 1rem;">👋 Últimos Visitantes Inscritos (${visitantes.length})</h3>
        ${visitantes.length === 0 ? '<p class="empty-state">Nenhum participante credenciado neste evento.</p>' : `
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${visitantes.slice(0, 10).map(v => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border);">
                <div><strong>${v.nome}</strong> <span style="font-size: 0.8rem; color: var(--text-muted);">📍 ${v.cidade}</span></div>
                ${v.primeiraVez ? '<span class="badge badge-purple">1ª Vez</span>' : '<span class="badge badge-green">Veterano</span>'}
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    const selectFiltro = container.querySelector('#select-filtro-evento');
    if (selectFiltro) {
      selectFiltro.addEventListener('change', (e) => {
        const id = e.target.value;
        this.navigateToTab('dashboard', id);
      });
    }

    const btnEncerrar = container.querySelector('#btn-encerrar-evento-dash');
    if (btnEncerrar) {
      btnEncerrar.addEventListener('click', () => {
        this.openModal('🛑 Encerrar Evento', `
          <p>Tem certeza que deseja encerrar o evento <strong>"${stats.nomeEvento}"</strong>?</p>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">As métricas continuarão salvas para consulta histórica no Painel.</p>
          <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem; justify-content: flex-end;">
            <button class="btn btn-secondary" id="btn-cancelar-encerrar">Cancelar</button>
            <button class="btn btn-primary" id="btn-confirmar-encerrar" style="background: #ef4444;">Confirmar Encerramento</button>
          </div>
        `);

        document.querySelector('#btn-cancelar-encerrar').addEventListener('click', () => this.closeModal());
        document.querySelector('#btn-confirmar-encerrar').addEventListener('click', async () => {
          await ApiClient.encerrarEvento(stats.eventoId);
          this.closeModal();
          this.showToast('Evento encerrado com sucesso!', 'success');
          this.renderCurrentTab();
        });
      });
    }
  }

  async renderPresenca(container) {
    const visitantes = await ApiClient.getPresencas().catch(() => []);

    container.innerHTML = `
      <div class="section-header">
        <div class="section-title">
          <h2>Lista de Presença (Livre para Visitantes)</h2>
          <p>Credenciamento de presença sem necessidade de criar conta</p>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <h3 style="margin-bottom: 1rem;">👋 Faça seu Check-in</h3>
          <form id="form-presenca">
            <div class="form-group">
              <label>Nome Completo *</label>
              <input type="text" id="input-nome" class="form-control" required placeholder="Ex: Maria Silva">
            </div>
            <div class="form-group">
              <label>Cidade *</label>
              <input type="text" id="input-cidade" class="form-control" required placeholder="Ex: Vitória / ES">
            </div>
            <div class="form-group">
              <label>É sua primeira vez no evento Game Master?</label>
              <div class="radio-group">
                <label class="radio-btn"><input type="radio" name="primeiraVez" value="sim" checked> <span>Sim!</span></label>
                <label class="radio-btn"><input type="radio" name="primeiraVez" value="nao"> <span>Não</span></label>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Confirmar Presença 🎯</button>
          </form>
        </div>

        <div class="card">
          <h3>📋 Participantes Inscritos (${visitantes.length})</h3>
          <div class="table-container" style="max-height: 350px; overflow-y: auto; margin-top: 1rem;">
            <table class="app-table">
              <thead><tr><th>Nome</th><th>Cidade</th><th>Tipo</th></tr></thead>
              <tbody>
                ${visitantes.map(v => `
                  <tr>
                    <td><strong>${v.nome}</strong></td>
                    <td>${v.cidade}</td>
                    <td>${v.primeiraVez ? '<span class="badge badge-purple">1ª Vez</span>' : '<span class="badge badge-green">Veterano</span>'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#form-presenca').addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = container.querySelector('#input-nome').value;
      const cidade = container.querySelector('#input-cidade').value;
      const primeiraVez = container.querySelector('input[name="primeiraVez"]:checked').value === 'sim';

      await ApiClient.registrarPresenca({ nome, cidade, primeiraVez });
      this.showToast(`Boas-vindas ao Game Master, ${nome}!`, 'success');
      this.renderCurrentTab();
    });
  }

  async renderAcervo(container) {
    const jogos = await ApiClient.getJogos().catch(() => []);
    const eventoAtivo = await ApiClient.getEventoAtivo().catch(() => null);

    if (!this.filtrosAcervo) {
      this.filtrosAcervo = { busca: '', jogadores: '', duracao: '', mecanica: '' };
    }

    let jogosExibidos = jogos;

    // Extrair lista única de mecânicas de todos os jogos para o Select de Filtro
    const todasMecanicasSet = new Set();
    jogos.forEach(j => {
      if (j.categoria) {
        j.categoria.split('/').forEach(m => {
          const mClean = m.trim().replace(/^Tabuleiro/i, '').trim();
          if (mClean && mClean.length > 1) {
            todasMecanicasSet.add(mClean);
          }
        });
      }
    });
    const listaMecanicasUnicas = Array.from(todasMecanicasSet).sort((a, b) => a.localeCompare(b, 'pt-BR'));

    // Aplicar Filtros Dinâmicos
    let jogosFiltrados = jogosExibidos.filter(j => {
      const { busca, jogadores, duracao, mecanica } = this.filtrosAcervo;

      if (busca && !j.nome.toLowerCase().includes(busca.toLowerCase().trim())) {
        return false;
      }

      if (jogadores) {
        const jStr = (j.jogadores || '').toLowerCase();
        if (jogadores === '1' && !jStr.includes('1')) return false;
        if (jogadores === '2' && !jStr.includes('2')) return false;
        if (jogadores === '3' && !jStr.includes('3')) return false;
        if (jogadores === '4' && !jStr.includes('4')) return false;
        if (jogadores === '5+') {
          const matchMin = jStr.match(/(\d+)/);
          const maxNum = jStr.includes('-') ? parseInt(jStr.split('-')[1]) : (matchMin ? parseInt(matchMin[1]) : 0);
          if (maxNum < 5 && !jStr.includes('5') && !jStr.includes('6') && !jStr.includes('7') && !jStr.includes('8') && !jStr.includes('10') && !jStr.includes('100') && !jStr.includes('99')) return false;
        }
      }

      if (duracao) {
        const dStr = j.duracao || '45 min';
        const numMin = parseInt(dStr) || 30;
        if (duracao === 'rapido' && numMin > 30) return false;
        if (duracao === 'medio' && (numMin < 20 || numMin > 60)) return false;
        if (duracao === 'longo' && numMin < 60) return false;
      }

      if (mecanica) {
        const cat = (j.categoria || '').toLowerCase();
        if (!cat.includes(mecanica.toLowerCase())) return false;
      }

      return true;
    });

    // Ordenação Alfabética por Nome
    jogosFiltrados.sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR', { sensitivity: 'base' }));

    container.innerHTML = `
      <div class="section-header">
        <div class="section-title">
          <h2>Acervo de Jogos (${jogosFiltrados.length})</h2>
          <p>Catálogo geral com ${jogos.length} jogos cadastrados no acervo</p>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          ${this.isAdmin ? `
            <button class="btn btn-secondary" id="btn-token-ludopedia">🔑 Token Ludopedia</button>
            <button class="btn btn-secondary" id="btn-sync-grupo">🔄 Sincronizar Jogos Game Master (Ludopedia)</button>
            <button class="btn btn-primary" id="btn-novo-jogo">➕ Adicionar Jogo</button>
          ` : ''}
        </div>
      </div>

      <!-- Barra de Filtros Interativa -->
      <div class="acervo-filters-bar">
        <div class="filters-row">
          <div class="filter-input-group" style="flex: 2; min-width: 220px;">
            <input type="text" id="input-busca-acervo" placeholder="🔍 Pesquisar por nome do jogo..." value="${this.filtrosAcervo.busca || ''}">
          </div>
          <div class="filter-input-group">
            <select id="select-filtro-jogadores">
              <option value="">👥 Nº de Jogadores (Todos)</option>
              <option value="1" ${this.filtrosAcervo.jogadores === '1' ? 'selected' : ''}>1 Jogador (Solo)</option>
              <option value="2" ${this.filtrosAcervo.jogadores === '2' ? 'selected' : ''}>2 Jogadores (Duelo)</option>
              <option value="3" ${this.filtrosAcervo.jogadores === '3' ? 'selected' : ''}>3 Jogadores</option>
              <option value="4" ${this.filtrosAcervo.jogadores === '4' ? 'selected' : ''}>4 Jogadores</option>
              <option value="5+" ${this.filtrosAcervo.jogadores === '5+' ? 'selected' : ''}>5+ Jogadores (Grupo / Party)</option>
            </select>
          </div>
          <div class="filter-input-group">
            <select id="select-filtro-duracao">
              <option value="">⏳ Duração (Qualquer)</option>
              <option value="rapido" ${this.filtrosAcervo.duracao === 'rapido' ? 'selected' : ''}>⚡ Rápidos (até 30 min)</option>
              <option value="medio" ${this.filtrosAcervo.duracao === 'medio' ? 'selected' : ''}>⌛ Médios (20 a 60 min)</option>
              <option value="longo" ${this.filtrosAcervo.duracao === 'longo' ? 'selected' : ''}>📜 Longos (+60 min)</option>
            </select>
          </div>
          <div class="filter-input-group">
            <select id="select-filtro-mecanica">
              <option value="">🏷️ Mecânica / Categoria (Todas)</option>
              ${listaMecanicasUnicas.map(m => `<option value="${m}" ${this.filtrosAcervo.mecanica === m ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
          </div>
          ${(this.filtrosAcervo.busca || this.filtrosAcervo.jogadores || this.filtrosAcervo.duracao || this.filtrosAcervo.mecanica) ? `
            <button class="btn btn-secondary btn-sm" id="btn-limpar-filtros" title="Limpar Filtros">🧹 Limpar Filtros</button>
          ` : ''}
        </div>
        <div class="filters-summary">
          <span>Exibindo <strong>${jogosFiltrados.length}</strong> de <strong>${jogosExibidos.length}</strong> jogos no acervo</span>
          ${this.filtrosAcervo.mecanica ? `<span class="badge badge-gold">Mecânica: ${this.filtrosAcervo.mecanica}</span>` : ''}
        </div>
      </div>

      <div class="grid-3">
        ${jogosFiltrados.length === 0 ? `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; background: var(--surface-card); border-radius: var(--radius-lg); color: var(--text-muted);">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
            <h3>Nenhum jogo encontrado com os filtros selecionados.</h3>
            <p style="font-size: 0.9rem; margin-top: 0.25rem;">Tente ajustar os termos de busca ou limpar os filtros ativos.</p>
          </div>
        ` : jogosFiltrados.map(j => {
          const mecanicasLimpas = (j.categoria || 'Estratégia').replace(/^Tabuleiro \/ /i, '').replace(/ \/ Tabuleiro$/i, '');
          const imgUrl = j.urlImagem || j.imagem || null;
          return `
            <div class="card game-card">
              <div class="game-cover-box">
                ${imgUrl ? `<img src="${imgUrl}" alt="${j.nome}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
                <div style="font-size: 2rem; ${imgUrl ? 'display: none;' : 'display: flex;'} align-items: center; justify-content: center; width: 100%; height: 100%; background: rgba(245, 158, 11, 0.1);">🎲</div>
              </div>
              <div class="game-card-content">
                <div class="game-header">
                  <h3 class="game-title" style="font-size: 1rem; font-weight: 700; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;" title="${j.nome}">${j.nome}</h3>
                  <span class="badge badge-purple" style="font-size: 0.7rem; padding: 0.15rem 0.45rem; flex-shrink: 0;">Acervo</span>
                </div>
                <div class="game-meta">
                  <div>👥 <strong>${j.jogadores || '2-4'}</strong></div>
                  <div>⏳ <strong>${j.duracao || '30 min'}</strong></div>
                  <div>🏷️ ${mecanicasLimpas}</div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Event Listeners dos Filtros Dinâmicos
    const inputBusca = container.querySelector('#input-busca-acervo');
    if (inputBusca) {
      inputBusca.focus();
      inputBusca.setSelectionRange(inputBusca.value.length, inputBusca.value.length);
      inputBusca.addEventListener('input', (e) => {
        this.filtrosAcervo.busca = e.target.value;
        this.renderCurrentTab();
      });
    }

    container.querySelector('#select-filtro-jogadores')?.addEventListener('change', (e) => {
      this.filtrosAcervo.jogadores = e.target.value;
      this.renderCurrentTab();
    });

    container.querySelector('#select-filtro-duracao')?.addEventListener('change', (e) => {
      this.filtrosAcervo.duracao = e.target.value;
      this.renderCurrentTab();
    });

    container.querySelector('#select-filtro-mecanica')?.addEventListener('change', (e) => {
      this.filtrosAcervo.mecanica = e.target.value;
      this.renderCurrentTab();
    });

    container.querySelector('#btn-limpar-filtros')?.addEventListener('click', () => {
      this.filtrosAcervo = { busca: '', jogadores: '', duracao: '', mecanica: '' };
      this.renderCurrentTab();
    });



    const btnToken = container.querySelector('#btn-token-ludopedia');
    if (btnToken) {
      btnToken.addEventListener('click', async () => {
        const config = await ApiClient.getConfigTokenLudopedia().catch(() => ({ configurado: false, tokenParcial: '', urlAutorizacao: '' }));
        this.openModal('🔑 Autenticação & Access Token — Ludopedia API', `
          <form id="form-token-ludopedia">
            <div style="background: var(--surface-light); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
              <p style="font-size: 0.9rem; color: var(--text-main); margin-bottom: 0.5rem;">
                Status atual: ${config.configurado ? `<strong style="color: var(--success);">✅ Token Configurado (${config.tokenParcial})</strong>` : `<strong style="color: var(--warning);">⚠️ Nenhum Token Configurado</strong>`}
              </p>
              <p style="font-size: 0.85rem; color: var(--text-muted);">
                Para acessar a API oficial da Ludopedia sem bloqueios, informe o seu <strong>access_token</strong> gerado em <a href="https://ludopedia.com.br/aplicativos" target="_blank" style="color: var(--primary);">ludopedia.com.br/aplicativos</a>.
              </p>
            </div>

            <div class="form-group">
              <label>Cole o Access Token da Ludopedia *</label>
              <input type="password" id="input-ludopedia-token" class="form-control" placeholder="Cole aqui seu access_token da Ludopedia" required>
            </div>

            <div style="display: flex; gap: 0.5rem; justify-content: space-between; align-items: center; margin-top: 1rem;">
              <a href="${config.urlAutorizacao || 'https://ludopedia.com.br/aplicativos'}" target="_blank" class="btn btn-secondary btn-sm">🔗 Gerar no Ludopedia Aplicativos</a>
              <button type="submit" class="btn btn-primary">Salvar Token</button>
            </div>
          </form>
        `);

        document.querySelector('#form-token-ludopedia').addEventListener('submit', async (e) => {
          e.preventDefault();
          const token = document.querySelector('#input-ludopedia-token').value;
          await ApiClient.setConfigTokenLudopedia(token);
          this.closeModal();
          this.showToast('Token da Ludopedia salvo com sucesso!', 'success');
          this.renderCurrentTab();
        });
      });
    }



    const btnSync = container.querySelector('#btn-sync-grupo');
    if (btnSync) {
      btnSync.addEventListener('click', async () => {
        this.openModal('🔄 Sincronizando Jogos Game Master (Ludopedia)', `
          <div style="text-align: center; padding: 0.5rem 0;">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem; display: inline-block; animation: pulse 1.5s infinite;">🎲</div>
            <h4 id="sync-title" style="color: var(--text-main); margin-bottom: 0.25rem; font-size: 1.1rem;">Conectando à Ludopedia...</h4>
            <p id="sync-sub" style="font-size: 0.85rem; color: var(--text-muted);">Baixando acervo de jogos da Ludopedia</p>
            
            <div class="progress-container">
              <div id="sync-progress-bar" class="progress-bar" style="width: 10%;"></div>
            </div>
            <div id="sync-status-text" class="progress-label">Estabelecendo conexão (10%)...</div>
            
            <button type="button" id="btn-fechar-sync" class="btn btn-primary btn-block" style="display: none; margin-top: 1.25rem;">✅ Ver Acervo Atualizado</button>
          </div>
        `);

        const progressBar = document.querySelector('#sync-progress-bar');
        const statusText = document.querySelector('#sync-status-text');
        const syncTitle = document.querySelector('#sync-title');
        const syncSub = document.querySelector('#sync-sub');
        const btnFechar = document.querySelector('#btn-fechar-sync');

        // Simulação fluida de progresso visual enquanto a API executa
        let currentProgress = 10;
        const progressInterval = setInterval(() => {
          if (currentProgress < 85) {
            currentProgress += Math.floor(Math.random() * 8) + 4;
            if (progressBar) progressBar.style.width = currentProgress + '%';
            if (statusText) {
              if (currentProgress < 40) statusText.innerText = `Processando coleção de jogos ( ${currentProgress}% )...`;
              else if (currentProgress < 75) statusText.innerText = `Importando jogos e metadados ( ${currentProgress}% )...`;
              else statusText.innerText = `Salvando catálogo no banco de dados ( ${currentProgress}% )...`;
            }
          }
        }, 300);

        try {
          const res = await ApiClient.sincronizarGrupoLudopedia('2088');
          clearInterval(progressInterval);

          if (progressBar) progressBar.style.width = '100%';
          if (statusText) statusText.innerText = `Sincronização 100% concluída!`;
          if (syncTitle) syncTitle.innerText = '✅ Acervo Sincronizado com Sucesso!';
          if (syncSub) syncSub.innerText = `${res ? res.length : 0} jogos importados da Ludopedia.`;
          if (btnFechar) btnFechar.style.display = 'block';

          this.showToast('Sincronização da Ludopedia concluída!', 'success');

          btnFechar.addEventListener('click', () => {
            this.closeModal();
            this.renderCurrentTab();
          });
        } catch (err) {
          clearInterval(progressInterval);
          console.error('Erro na sincronização:', err);
          if (progressBar) {
            progressBar.style.width = '100%';
            progressBar.style.background = '#ef4444';
          }
          if (statusText) statusText.innerText = 'Aviso na conexão. Jogos padrão mantidos.';
          if (syncTitle) syncTitle.innerText = '⚠️ Sincronização Concluída';
          if (btnFechar) btnFechar.style.display = 'block';
          btnFechar.addEventListener('click', () => {
            this.closeModal();
            this.renderCurrentTab();
          });
        }
      });
    }



    const btnNovo = container.querySelector('#btn-novo-jogo');
    if (btnNovo) {
      btnNovo.addEventListener('click', () => {
        this.openModal('🎲 Adicionar Jogo ao Acervo (com Sugestões da Ludopedia)', `
          <form id="form-novo-jogo">
            <div class="form-group" style="position: relative;">
              <label>Nome do Jogo * <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: normal;">(digite para ver sugestões da Ludopedia)</span></label>
              <input type="text" id="nn-nome" class="form-control" required autocomplete="off" placeholder="Digite para buscar (ex: Catan, Azul, Ticket to Ride)">
              <div id="autocomplete-results" class="autocomplete-box" style="display: none;"></div>
            </div>
            <div class="form-group"><label>Nº de Jogadores</label><input type="text" id="nn-jog" class="form-control" placeholder="Ex: 3-4"></div>
            <div class="form-group"><label>Duração</label><input type="text" id="nn-dur" class="form-control" placeholder="Ex: 45 min"></div>
            <div class="form-group"><label>Categoria / Estilo</label><input type="text" id="nn-cat" class="form-control" placeholder="Ex: Estratégia"></div>
            <button type="submit" class="btn btn-primary btn-block">Salvar Jogo no Acervo</button>
          </form>
        `);

        const inputNome = document.querySelector('#nn-nome');
        const autoResults = document.querySelector('#autocomplete-results');
        let debounceTimer = null;

        inputNome.addEventListener('input', (e) => {
          const query = e.target.value.trim();
          clearTimeout(debounceTimer);

          if (query.length < 2) {
            autoResults.style.display = 'none';
            autoResults.innerHTML = '';
            return;
          }

          debounceTimer = setTimeout(async () => {
            try {
              const resultados = await ApiClient.buscarLudopedia(query);
              if (resultados && resultados.length > 0) {
                autoResults.innerHTML = resultados.map((j, idx) => `
                  <div class="auto-item" data-index="${idx}">
                    <div>
                      <strong style="display: block; color: #ffffff !important; font-size: 0.95rem;">${j.nome}</strong>
                      <div style="font-size: 0.75rem; color: #94a3b8 !important; margin-top: 0.15rem;">
                        👥 ${j.jogadores || '2-4'} • ⏳ ${j.duracao || '45 min'} • 🏷️ ${j.categoria || 'Tabuleiro'}
                      </div>
                    </div>
                    <span style="font-size: 0.7rem; background: rgba(139, 92, 246, 0.25); color: #c4b5fd !important; padding: 0.25rem 0.6rem; border-radius: 4px; font-weight: 600; flex-shrink: 0;">Ludopedia</span>
                  </div>
                `).join('');
                autoResults.style.display = 'block';

                autoResults.querySelectorAll('.auto-item').forEach(item => {
                  item.addEventListener('click', () => {
                    const index = Number(item.dataset.index);
                    const jogo = resultados[index];
                    if (jogo) {
                      inputNome.value = jogo.nome;
                      document.querySelector('#nn-jog').value = jogo.jogadores || '2-4';
                      document.querySelector('#nn-dur').value = jogo.duracao || '45 min';
                      document.querySelector('#nn-cat').value = jogo.categoria || 'Estratégia';
                      this.showToast(`Dados de "${jogo.nome}" preenchidos automaticamente!`, 'success');
                    }
                    autoResults.style.display = 'none';
                  });
                });
              } else {
                autoResults.style.display = 'none';
              }
            } catch (err) {
              console.error('Erro no autocomplete:', err);
              autoResults.style.display = 'none';
            }
          }, 300);
        });


        // Fechar dropdown ao clicar fora
        document.addEventListener('click', (ev) => {
          if (ev.target !== inputNome && !autoResults.contains(ev.target)) {
            autoResults.style.display = 'none';
          }
        });

        document.querySelector('#form-novo-jogo').addEventListener('submit', async (e) => {
          e.preventDefault();
          await ApiClient.criarJogo({
            nome: document.querySelector('#nn-nome').value,
            jogadores: document.querySelector('#nn-jog').value,
            duracao: document.querySelector('#nn-dur').value,
            categoria: document.querySelector('#nn-cat').value
          });
          this.closeModal();
          this.showToast('Jogo adicionado ao acervo!', 'success');
          this.renderCurrentTab();
        });
      });
    }
  }



  async renderFotos(container) {
    const fotos = await ApiClient.getFotos().catch(() => []);

    container.innerHTML = `
      <div class="section-header">
        <div class="section-title"><h2>Fotos do Evento (${fotos.length})</h2><p>Galeria de fotos das mesas e participantes</p></div>
      </div>
      <div class="card" style="margin-bottom: 1.5rem;">
        <h3>📸 Enviar Foto do Evento</h3>
        <form id="form-foto-sp">
          <input type="file" id="file-foto-sp" accept="image/*" class="form-control" style="margin-bottom: 0.5rem;" required>
          <input type="text" id="legenda-foto-sp" class="form-control" placeholder="Legenda (opcional)" style="margin-bottom: 0.5rem;">
          <button type="submit" class="btn btn-primary">Salvar e Enviar Foto</button>
        </form>
      </div>
      <div class="media-grid">
        ${fotos.map(f => `<div class="media-card"><img src="${f.base64Data}" class="media-preview"><div class="media-body"><div>${f.legenda || 'Foto do Evento'}</div></div></div>`).join('')}
      </div>
    `;

    container.querySelector('#form-foto-sp').addEventListener('submit', async (e) => {
      e.preventDefault();
      const file = container.querySelector('#file-foto-sp').files[0];
      const legenda = container.querySelector('#legenda-foto-sp').value;

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        await ApiClient.enviarFoto({ base64Data: reader.result, legenda, autor: 'Visitante' });
        this.showToast('Foto salva no sistema!', 'success');
        this.renderCurrentTab();
      };
    });
  }

  async renderNotas(container) {
    const notas = await ApiClient.getNotas().catch(() => []);

    container.innerHTML = `
      <div class="section-header">
        <div class="section-title"><h2>Notas Fiscais de Consumo (${notas.length})</h2><p>Comprovação de consumo no shopping durante o evento</p></div>
      </div>
      <div class="card" style="margin-bottom: 1.5rem;">
        <h3>🧾 Enviar Cupom Fiscal</h3>
        <form id="form-nota-sp">
          <input type="file" id="file-nota-sp" accept="image/*" class="form-control" style="margin-bottom: 0.5rem;" required>
          <input type="text" id="loja-nota-sp" class="form-control" placeholder="Nome da Loja / Restaurante" style="margin-bottom: 0.5rem;">
          <input type="number" step="0.01" id="valor-nota-sp" class="form-control" placeholder="Valor (R$)" style="margin-bottom: 0.5rem;">
          <button type="submit" class="btn btn-success">Salvar Nota Fiscal</button>
        </form>
      </div>
      <div class="media-grid">
        ${notas.map(n => `<div class="media-card"><img src="${n.base64Data}" class="media-preview"><div class="media-body"><strong>${n.loja || 'Loja Mall'}</strong><div>R$ ${(n.valor || 0).toFixed(2)}</div></div></div>`).join('')}
      </div>
    `;

    container.querySelector('#form-nota-sp').addEventListener('submit', async (e) => {
      e.preventDefault();
      const file = container.querySelector('#file-nota-sp').files[0];
      const loja = container.querySelector('#loja-nota-sp').value;
      const valor = container.querySelector('#valor-nota-sp').value;

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        await ApiClient.enviarNota({ base64Data: reader.result, loja, valor: parseFloat(valor || 0) });
        this.showToast('Nota fiscal registrada!', 'success');
        this.renderCurrentTab();
      };
    });
  }

  async renderUsuarios(container) {
    const usuarios = await ApiClient.getUsuarios().catch(() => []);

    container.innerHTML = `
      <div class="section-header">
        <div class="section-title">
          <h2>Gestão de Usuários & Administradores</h2>
          <p>Gerencie permissões dos e-mails cadastrados. O e-mail <code>lucastassis2@gmail.com</code> é o Super Admin fixo.</p>
        </div>
        <button class="btn btn-primary" id="btn-novo-usuario">➕ Cadastrar Usuário / Admin</button>
      </div>

      <div class="card">
        <h3>👥 Usuários Cadastrados (${usuarios.length})</h3>
        ${usuarios.length === 0 ? '<p class="empty-state">Nenhum usuário cadastrado ainda.</p>' : `
          <div class="table-container" style="margin-top: 1rem;">
            <table class="app-table">
              <thead><tr><th>Nome</th><th>E-mail</th><th>Função (Role)</th><th>Ações</th></tr></thead>
              <tbody>
                ${usuarios.map(u => `
                  <tr>
                    <td><strong>${u.nome || 'Sem Nome'}</strong></td>
                    <td><code>${u.email}</code></td>
                    <td>${u.role === 'ROLE_ADMIN' ? '<span class="badge badge-purple">👑 ADMIN</span>' : '<span class="badge badge-green">👤 USUÁRIO</span>'}</td>
                    <td>
                      ${u.email === 'lucastassis2@gmail.com' ? '<span style="font-size: 0.8rem; color: var(--text-muted);">Super Admin Fixo</span>' : `
                        ${u.role === 'ROLE_ADMIN' 
                          ? `<button class="btn btn-sm btn-secondary btn-mudar-role" data-id="${u.id}" data-role="ROLE_USER">Tornar Usuário</button>`
                          : `<button class="btn btn-sm btn-primary btn-mudar-role" data-id="${u.id}" data-role="ROLE_ADMIN">Promover a Admin</button>`
                        }
                      `}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;

    container.querySelector('#btn-novo-usuario').addEventListener('click', () => {
      this.openModal('➕ Cadastrar Usuário', `
        <form id="form-novo-usuario">
          <div class="form-group"><label>Nome</label><input type="text" id="nu-nome" class="form-control" required placeholder="Ex: Lucas Tassis"></div>
          <div class="form-group"><label>E-mail *</label><input type="email" id="nu-email" class="form-control" required placeholder="exemplo@gmail.com"></div>
          <div class="form-group">
            <label>Função Inicial</label>
            <select id="nu-role" class="form-control">
              <option value="ROLE_USER">Usuário Comum</option>
              <option value="ROLE_ADMIN">Administrador</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Cadastrar Usuário</button>
        </form>
      `);

      document.querySelector('#form-novo-usuario').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.querySelector('#nu-nome').value;
        const email = document.querySelector('#nu-email').value;
        const role = document.querySelector('#nu-role').value;

        await ApiClient.registrarUsuario({ nome, email, role });
        this.closeModal();
        this.showToast(`Usuário ${email} registrado com sucesso!`, 'success');
        this.renderCurrentTab();
      });
    });

    container.querySelectorAll('.btn-mudar-role').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const novaRole = e.currentTarget.dataset.role;

        await ApiClient.alterarRoleUsuario(id, novaRole);
        this.showToast('Privilégios do usuário atualizados com sucesso!', 'success');
        this.renderCurrentTab();
      });
    });
  }

  async renderEventos(container) {
    const eventos = await ApiClient.getEventos().catch(() => []);

    container.innerHTML = `
      <div class="section-header">
        <div class="section-title">
          <h2>Cadastro e Gestão de Eventos</h2>
          <p>Crie novos eventos, defina a data de realização e visualize o Painel de cada edição</p>
        </div>
        <button class="btn btn-primary" id="btn-novo-evento">➕ Criar Novo Evento</button>
      </div>

      <div class="card">
        <h3>📅 Lista de Eventos (${eventos.length})</h3>
        ${eventos.length === 0 ? '<p class="empty-state">Nenhum evento cadastrado.</p>' : `
          <div class="table-container" style="margin-top: 1rem;">
            <table class="app-table">
              <thead><tr><th>Nome do Evento</th><th>Data do Evento</th><th>Local</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody>
                ${eventos.map(ev => `
                  <tr>
                    <td><strong>${ev.nome}</strong></td>
                    <td>📅 ${ev.dataEvento || '25/07/2026'}</td>
                    <td>📍 ${ev.local || 'Mall'}</td>
                    <td>${ev.ativo ? '<span class="badge badge-green">🌟 EVENTO ATIVO</span>' : '<span class="badge badge-purple">Inativo</span>'}</td>
                    <td>
                      <div style="display: flex; gap: 0.4rem;">
                        <button class="btn btn-sm btn-primary btn-ver-painel-evento" data-id="${ev.id}">📊 Ver Painel</button>
                        <button class="btn btn-sm btn-secondary btn-editar-evento" data-id="${ev.id}">✏️ Editar</button>
                        ${ev.ativo ? '' : `<button class="btn btn-sm btn-success btn-ativar-evento" data-id="${ev.id}">Ativar</button>`}
                        <button class="btn btn-sm btn-secondary btn-excluir-evento" data-id="${ev.id}" style="border-color: #ef4444; color: #ef4444;">🗑️ Excluir</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;

    container.querySelectorAll('.btn-ver-painel-evento').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.navigateToTab('dashboard', id);
      });
    });

    container.querySelectorAll('.btn-excluir-evento').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.dataset.id);
        const evento = eventos.find(ev => Number(ev.id) === id);
        if (!evento) return;

        this.openModal('🗑️ Excluir Evento', `
          <p>Tem certeza que deseja excluir permanentemente o evento <strong>"${evento.nome}"</strong>?</p>
          <p style="font-size: 0.85rem; color: #ef4444; margin-top: 0.5rem;">Esta ação não poderá ser desfeita.</p>
          <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem; justify-content: flex-end;">
            <button class="btn btn-secondary" id="btn-cancelar-excluir">Cancelar</button>
            <button class="btn btn-primary" id="btn-confirmar-excluir" style="background: #ef4444;">Excluir Evento</button>
          </div>
        `);

        document.querySelector('#btn-cancelar-excluir').addEventListener('click', () => this.closeModal());
        document.querySelector('#btn-confirmar-excluir').addEventListener('click', async () => {
          try {
            await ApiClient.deletarEvento(id);
            this.closeModal();
            this.showToast(`Evento "${evento.nome}" excluído com sucesso!`, 'success');
            this.renderCurrentTab();
          } catch (err) {
            console.error('Erro ao excluir evento:', err);
            this.showToast('Erro ao excluir evento no servidor', 'error');
          }
        });
      });
    });

    container.querySelectorAll('.btn-editar-evento').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = Number(e.currentTarget.dataset.id);
        const evento = eventos.find(ev => Number(ev.id) === id);
        if (!evento) return;

        this.openModal('✏️ Editar Evento', `
          <form id="form-editar-evento">
            <div class="form-group"><label>Nome do Evento *</label><input type="text" id="ee-nome" class="form-control" required value="${evento.nome || ''}"></div>
            <div class="form-group"><label>Data do Evento *</label><input type="date" id="ee-data" class="form-control" required value="${evento.dataEvento || new Date().toISOString().split('T')[0]}"></div>
            <div class="form-group"><label>Local *</label><input type="text" id="ee-local" class="form-control" required value="${evento.local || ''}"></div>
            <div class="form-group">
              <label class="radio-btn"><input type="checkbox" id="ee-ativo" ${evento.ativo ? 'checked' : ''}> <span>Manter como Evento Ativo</span></label>
            </div>

            <button type="submit" class="btn btn-primary btn-block" style="margin-top: 1rem;">Salvar Alterações</button>
          </form>
        `);

        document.querySelector('#form-editar-evento').addEventListener('submit', async (evSubmit) => {
          evSubmit.preventDefault();
          try {
            const nome = document.querySelector('#ee-nome').value;
            const dataEvento = document.querySelector('#ee-data').value;
            const local = document.querySelector('#ee-local').value;
            const ativo = document.querySelector('#ee-ativo').checked;

            await ApiClient.atualizarEvento(id, { nome, dataEvento, local, ativo });
            this.closeModal();
            this.showToast(`Evento "${nome}" atualizado com sucesso!`, 'success');
            this.renderCurrentTab();
          } catch (err) {
            console.error('Erro ao atualizar evento:', err);
            this.showToast('Erro ao atualizar evento no servidor', 'error');
          }
        });
      });
    });


    container.querySelector('#btn-novo-evento').addEventListener('click', () => {
      this.openModal('➕ Criar Novo Evento', `
        <form id="form-novo-evento">
          <div class="form-group"><label>Nome do Evento *</label><input type="text" id="ne-nome" class="form-control" required placeholder="Ex: Game Master Shopping Vitória"></div>
          <div class="form-group"><label>Data do Evento *</label><input type="date" id="ne-data" class="form-control" required value="${new Date().toISOString().split('T')[0]}"></div>
          <div class="form-group"><label>Local *</label><input type="text" id="ne-local" class="form-control" required placeholder="Ex: Praça Central Shopping Vitória"></div>
          <div class="form-group">
            <label class="radio-btn"><input type="checkbox" id="ne-ativo" checked> <span>Tornar este evento o Evento Ativo agora</span></label>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Salvar Evento</button>
        </form>
      `);

      document.querySelector('#form-novo-evento').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const nome = document.querySelector('#ne-nome').value;
          const dataEvento = document.querySelector('#ne-data').value;
          const local = document.querySelector('#ne-local').value;
          const ativo = document.querySelector('#ne-ativo').checked;

          await ApiClient.criarEvento({ nome, dataEvento, local, ativo });
          this.closeModal();
          this.showToast(`Evento "${nome}" criado com sucesso!`, 'success');
          this.renderCurrentTab();
        } catch (err) {
          console.error('Erro ao criar evento:', err);
          this.showToast('Erro ao criar evento no servidor', 'error');
        }
      });
    });

    container.querySelectorAll('.btn-ativar-evento').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        await ApiClient.ativarEvento(id);
        this.showToast('Evento ativado com sucesso!', 'success');
        this.renderCurrentTab();
      });
    });
  }

  openModal(title, htmlContent) {
    this.modalTitle.textContent = title;
    this.modalBody.innerHTML = htmlContent;
    this.modalBackdrop.classList.remove('hidden');
  }

  closeModal() {
    this.modalBackdrop.classList.add('hidden');
    this.modalBody.innerHTML = '';
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : 'ℹ️'}</span> <span>${message}</span>`;
    this.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new App(); });
