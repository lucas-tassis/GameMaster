/**
 * Game Master — Componente Acervo de Jogos & Empréstimos
 */
import { store } from '../store.js';

export function renderAcervo(container, showToast, openModal, closeModal) {
  const todosJogos = store.getJogos();
  const visitantes = store.getVisitantes();

  let filtroStatus = 'todos';
  let termoBusca = '';

  function updateView() {
    const jogosFiltrados = todosJogos.filter(j => {
      const bateStatus = filtroStatus === 'todos' || j.status === filtroStatus;
      const bateBusca = j.nome.toLowerCase().includes(termoBusca.toLowerCase()) || 
                        j.categoria.toLowerCase().includes(termoBusca.toLowerCase());
      return bateStatus && bateBusca;
    });

    const disponiveisCount = todosJogos.filter(j => j.status === 'disponivel').length;
    const emprestadosCount = todosJogos.filter(j => j.status === 'emprestado').length;

    container.innerHTML = `
      <div class="section-header">
        <div class="section-title">
          <h2>Acervo de Jogos (${todosJogos.length})</h2>
          <p>Consulte a lista de jogos do evento e controle o empréstimo para as mesas</p>
        </div>
        <button class="btn btn-primary" id="btn-novo-jogo">
          ➕ Adicionar Jogo ao Acervo
        </button>
      </div>

      <!-- BARRA DE FILTROS & BUSCA -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="grid-2" style="align-items: center;">
          <div class="form-group" style="margin-bottom: 0;">
            <input type="text" id="input-busca-jogo" class="form-control" placeholder="🔍 Buscar por nome do jogo ou categoria..." value="${termoBusca}">
          </div>

          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-sm ${filtroStatus === 'todos' ? 'btn-primary' : 'btn-secondary'}" data-filtro="todos">
              Todos (${todosJogos.length})
            </button>
            <button class="btn btn-sm ${filtroStatus === 'disponivel' ? 'btn-success' : 'btn-secondary'}" data-filtro="disponivel">
              Disponíveis (${disponiveisCount})
            </button>
            <button class="btn btn-sm ${filtroStatus === 'emprestado' ? 'btn-warning' : 'btn-secondary'}" data-filtro="emprestado">
              Emprestados (${emprestadosCount})
            </button>
          </div>
        </div>
      </div>

      <!-- GRID DE JOGOS -->
      ${jogosFiltrados.length === 0 ? `
        <div class="empty-state card">
          <div class="empty-icon">🎲</div>
          <p>Nenhum jogo encontrado com os filtros selecionados.</p>
        </div>
      ` : `
        <div class="grid-3">
          ${jogosFiltrados.map(j => `
            <div class="card game-card">
              <div>
                <div class="game-header">
                  <h3 class="game-title">${j.nome}</h3>
                  ${j.status === 'disponivel' 
                    ? '<span class="badge badge-green">Disponível</span>' 
                    : '<span class="badge badge-orange">Emprestado</span>'}
                </div>

                <div class="game-meta">
                  <span>👥 ${j.jogadores}</span>
                  <span>⏳ ${j.duracao}</span>
                  <span>🏷️ ${j.categoria}</span>
                </div>
              </div>

              ${j.status === 'emprestado' ? `
                <div class="game-borrower-info">
                  <strong>Emprestado para:</strong> ${j.emprestadoPara}<br>
                  📍 <strong>Mesa:</strong> ${j.mesa || 'Não informada'}<br>
                  🕒 <strong>Retirado às:</strong> ${j.horaEmprestimo}
                </div>
                <button class="btn btn-success btn-block btn-devolver" data-id="${j.id}">
                  🔄 Devolver à Estante
                </button>
              ` : `
                <button class="btn btn-primary btn-block btn-emprestar" data-id="${j.id}">
                  📤 Emprestar Jogo
                </button>
              `}
            </div>
          `).map(item => item).join('')}
        </div>
      `}
    `;

    // Eventos dos filtros e busca
    container.querySelector('#input-busca-jogo').addEventListener('input', (e) => {
      termoBusca = e.target.value;
      updateView();
    });

    container.querySelectorAll('[data-filtro]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        filtroStatus = e.currentTarget.dataset.filtro;
        updateView();
      });
    });

    // Botão Adicionar Jogo
    container.querySelector('#btn-novo-jogo').addEventListener('click', () => {
      openModal('➕ Adicionar Jogo ao Acervo', `
        <form id="form-novo-jogo">
          <div class="form-group">
            <label>Nome do Jogo *</label>
            <input type="text" id="novo-nome" class="form-control" placeholder="Ex: Catan" required>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label>Nº de Jogadores</label>
              <input type="text" id="novo-jogadores" class="form-control" placeholder="Ex: 3-4">
            </div>
            <div class="form-group">
              <label>Duração Estimada</label>
              <input type="text" id="novo-duracao" class="form-control" placeholder="Ex: 45 min">
            </div>
          </div>
          <div class="form-group">
            <label>Categoria / Estilo</label>
            <input type="text" id="novo-categoria" class="form-control" placeholder="Ex: Estratégia / Cartas">
          </div>
          <button type="submit" class="btn btn-primary btn-block">Salvar Jogo</button>
        </form>
      `);

      document.querySelector('#form-novo-jogo').addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.querySelector('#novo-nome').value;
        const jogadores = document.querySelector('#novo-jogadores').value;
        const duracao = document.querySelector('#novo-duracao').value;
        const categoria = document.querySelector('#novo-categoria').value;

        store.adicionarJogo(nome, jogadores, duracao, categoria);
        closeModal();
        showToast(`Jogo "${nome}" adicionado ao acervo!`, 'success');
        updateView();
      });
    });

    // Botões Emprestar
    container.querySelectorAll('.btn-emprestar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const jogo = todosJogos.find(j => j.id === id);

        const opcoesVisitantes = visitantes.map(v => `<option value="${v.nome}">${v.nome} (${v.cidade})</option>`).join('');

        openModal(`📤 Emprestar Jogo: ${jogo.nome}`, `
          <form id="form-emprestimo">
            <div class="form-group">
              <label>Quem está levando o jogo? *</label>
              ${visitantes.length > 0 ? `
                <select id="emp-nome-select" class="form-control" style="margin-bottom: 0.5rem;">
                  <option value="">-- Selecionar da Lista de Presença --</option>
                  ${opcoesVisitantes}
                </select>
              ` : ''}
              <input type="text" id="emp-nome-input" class="form-control" placeholder="Ou digite o nome completo..." required>
            </div>
            
            <div class="form-group">
              <label>Mesa / Localização no Mall *</label>
              <input type="text" id="emp-mesa" class="form-control" placeholder="Ex: Mesa 04 / Praça de Alimentação" required>
            </div>

            <button type="submit" class="btn btn-primary btn-block">Confirmar Empréstimo</button>
          </form>
        `);

        const select = document.querySelector('#emp-nome-select');
        const input = document.querySelector('#emp-nome-input');

        if (select) {
          select.addEventListener('change', () => {
            if (select.value) input.value = select.value;
          });
        }

        document.querySelector('#form-emprestimo').addEventListener('submit', (e) => {
          e.preventDefault();
          const nomePessoa = input.value;
          const mesa = document.querySelector('#emp-mesa').value;

          store.emprestarJogo(id, nomePessoa, mesa);
          closeModal();
          showToast(`Jogo "${jogo.nome}" emprestado para ${nomePessoa}!`, 'info');
          updateView();
        });
      });
    });

    // Botões Devolver
    container.querySelectorAll('.btn-devolver').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const jogo = todosJogos.find(j => j.id === id);
        store.devolverJogo(id);
        showToast(`Jogo "${jogo.nome}" devolvido ao acervo!`, 'success');
        updateView();
      });
    });
  }

  updateView();
}
