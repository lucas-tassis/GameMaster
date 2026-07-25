/**
 * Game Master — Componente Dashboard
 */
import { store } from '../store.js';

export function renderDashboard(container, navigateToTab) {
  const visitantes = store.getVisitantes();
  const jogos = store.getJogos();
  const fotos = store.getFotos();
  const notas = store.getNotas();

  const totalVisitantes = visitantes.length;
  const novosVisitantes = visitantes.filter(v => v.primeiraVez).length;
  const jogosEmprestados = jogos.filter(j => j.status === 'emprestado');
  const totalFotos = fotos.length;
  const totalNotas = notas.length;
  const valorTotalNotas = notas.reduce((acc, curr) => acc + (curr.valor || 0), 0);

  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">
        <h2>Painel do Evento</h2>
        <p>Visão geral em tempo real das atividades no shopping</p>
      </div>
    </div>

    <!-- CARDS DE ESTATÍSTICAS -->
    <div class="grid-4" style="margin-bottom: 1.5rem;">
      <div class="card stat-card">
        <div class="stat-icon purple">👥</div>
        <div class="stat-info">
          <div class="stat-value">${totalVisitantes}</div>
          <div class="stat-label">Público Total (${novosVisitantes} novos)</div>
        </div>
      </div>

      <div class="card stat-card">
        <div class="stat-icon orange">🎲</div>
        <div class="stat-info">
          <div class="stat-value">${jogosEmprestados.length} / ${jogos.length}</div>
          <div class="stat-label">Jogos em Mesa Agora</div>
        </div>
      </div>

      <div class="card stat-card">
        <div class="stat-icon blue">📸</div>
        <div class="stat-info">
          <div class="stat-value">${totalFotos}</div>
          <div class="stat-label">Fotos Registradas</div>
        </div>
      </div>

      <div class="card stat-card">
        <div class="stat-icon green">🧾</div>
        <div class="stat-info">
          <div class="stat-value">R$ ${valorTotalNotas.toFixed(2)}</div>
          <div class="stat-label">Consumo Registrado (${totalNotas} notas)</div>
        </div>
      </div>
    </div>

    <!-- ATALHOS RÁPIDOS -->
    <div class="card" style="margin-bottom: 1.5rem;">
      <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">⚡ Ações Rápidas</h3>
      <div class="grid-4">
        <button class="btn btn-primary" id="btn-quick-presenca">
          <span>📋</span> Registrar Presença
        </button>
        <button class="btn btn-secondary" id="btn-quick-acervo">
          <span>🎲</span> Ver Acervo de Jogos
        </button>
        <button class="btn btn-secondary" id="btn-quick-foto">
          <span>📸</span> Enviar Foto
        </button>
        <button class="btn btn-secondary" id="btn-quick-nota">
          <span>🧾</span> Enviar Nota Fiscal
        </button>
      </div>
    </div>

    <!-- GRID INFORMATIVO: EMPRÉSTIMOS ATIVOS & ÚLTIMAS PRESENÇAS -->
    <div class="grid-2">
      
      <!-- JOGOS EMPRESTADOS AGORA -->
      <div class="card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <h3 style="font-size: 1.1rem;">🎯 Jogos em Mesa (${jogosEmprestados.length})</h3>
          <button class="btn btn-sm btn-secondary" id="btn-ver-todos-jogos">Ver Acervo</button>
        </div>

        ${jogosEmprestados.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">🎲</div>
            <p>Todos os jogos estão na estante disponíveis!</p>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${jogosEmprestados.map(j => `
              <div style="background-color: var(--bg-main); border: 1px solid var(--border); padding: 0.75rem; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <strong style="color: var(--text-main); font-size: 0.95rem;">${j.nome}</strong>
                  <div style="font-size: 0.8rem; color: var(--accent-orange); margin-top: 0.2rem;">
                    👤 ${j.emprestadoPara} (${j.mesa || 'Mesa não informada'}) • ${j.horaEmprestimo}
                  </div>
                </div>
                <button class="btn btn-sm btn-success btn-devolver-dash" data-id="${j.id}">
                  Devolver
                </button>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- ÚLTIMOS VISITANTES REGISTRADOS -->
      <div class="card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <h3 style="font-size: 1.1rem;">👋 Últimos Visitantes (${totalVisitantes})</h3>
          <button class="btn btn-sm btn-secondary" id="btn-ver-presenca">Ver Lista</button>
        </div>

        ${visitantes.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <p>Nenhum visitante registrado ainda hoje.</p>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${visitantes.slice(0, 5).map(v => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border);">
                <div>
                  <span style="font-weight: 600;">${v.nome}</span>
                  <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">📍 ${v.cidade}</span>
                </div>
                ${v.primeiraVez ? `<span class="badge badge-purple">1ª Vez!</span>` : `<span class="badge badge-green">Veterano</span>`}
              </div>
            `).join('')}
          </div>
        `}
      </div>

    </div>
  `;

  // Event Handlers
  container.querySelector('#btn-quick-presenca').addEventListener('click', () => navigateToTab('presenca'));
  container.querySelector('#btn-quick-acervo').addEventListener('click', () => navigateToTab('acervo'));
  container.querySelector('#btn-quick-foto').addEventListener('click', () => navigateToTab('fotos'));
  container.querySelector('#btn-quick-nota').addEventListener('click', () => navigateToTab('notas'));

  container.querySelector('#btn-ver-todos-jogos').addEventListener('click', () => navigateToTab('acervo'));
  container.querySelector('#btn-ver-presenca').addEventListener('click', () => navigateToTab('presenca'));

  // Botões de devolução rápida no dashboard
  container.querySelectorAll('.btn-devolver-dash').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      store.devolverJogo(id);
      renderDashboard(container, navigateToTab);
    });
  });
}
