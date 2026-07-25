/**
 * Game Master — Componente Presença (Credenciamento de Visitantes)
 */
import { store } from '../store.js';

export function renderPresenca(container, showToast) {
  const visitantes = store.getVisitantes();

  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">
        <h2>Lista de Presença</h2>
        <p>Cadastre sua entrada no evento ou consulte os participantes inscritos</p>
      </div>
    </div>

    <div class="grid-2">
      
      <!-- FORMULÁRIO DE CADASTRO DO VISITANTE -->
      <div class="card">
        <h3 style="margin-bottom: 1rem; font-size: 1.2rem;">👋 Faça seu Check-in</h3>
        
        <form id="form-presenca">
          <div class="form-group">
            <label for="input-nome">Nome Completo *</label>
            <input type="text" id="input-nome" class="form-control" placeholder="Ex: Maria Silva" required>
          </div>

          <div class="form-group">
            <label for="input-cidade">Cidade *</label>
            <input type="text" id="input-cidade" class="form-control" placeholder="Ex: Vitória / ES" required>
          </div>

          <div class="form-group">
            <label>É sua primeira vez no evento Game Master?</label>
            <div class="radio-group">
              <label class="radio-btn">
                <input type="radio" name="primeiraVez" value="sim" checked>
                <span>✨ Sim, é a 1ª vez!</span>
              </label>
              <label class="radio-btn">
                <input type="radio" name="primeiraVez" value="nao">
                <span>🎲 Já participei antes</span>
              </label>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block" style="margin-top: 0.5rem;">
            Confirmar Presença 🎯
          </button>
        </form>
      </div>

      <!-- LISTA DE INSCRITOS HOJE -->
      <div class="card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <h3 style="font-size: 1.2rem;">📋 Participantes Inscritos (${visitantes.length})</h3>
        </div>

        ${visitantes.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">📝</div>
            <p>Nenhum participante cadastrado ainda.<br>Preencha o formulário ao lado!</p>
          </div>
        ` : `
          <div class="table-container" style="max-height: 400px; overflow-y: auto;">
            <table class="app-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Cidade</th>
                  <th>Tipo</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                ${visitantes.map(v => {
                  const hora = new Date(v.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  return `
                    <tr>
                      <td style="font-weight: 600;">${v.nome}</td>
                      <td style="color: var(--text-muted);">${v.cidade}</td>
                      <td>
                        ${v.primeiraVez ? '<span class="badge badge-purple">1ª Vez</span>' : '<span class="badge badge-green">Veterano</span>'}
                      </td>
                      <td style="color: var(--text-subtle); font-size: 0.8rem;">${hora}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

    </div>
  `;

  // Submit Handler
  const form = container.querySelector('#form-presenca');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = container.querySelector('#input-nome').value;
    const cidade = container.querySelector('#input-cidade').value;
    const primeiraVezVal = container.querySelector('input[name="primeiraVez"]:checked').value;
    const primeiraVez = primeiraVezVal === 'sim';

    store.adicionarVisitante(nome, cidade, primeiraVez);
    showToast(`Boas-vindas ao Game Master, ${nome}! 🎲`, 'success');
    
    // Re-render
    renderPresenca(container, showToast);
  });
}
