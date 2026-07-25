/**
 * Game Master — Componente Configurações & Integração Google Drive
 */
import { store } from '../store.js';

export function renderConfig(container, showToast) {
  const config = store.getConfig();

  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">
        <h2>Configurações do Evento</h2>
        <p>Ajuste os parâmetros da aplicação e conecte o aplicativo às pastas do seu Google Drive</p>
      </div>
    </div>

    <div class="grid-2">
      
      <!-- CONFIGURAÇÃO DO GOOGLE APPS SCRIPT WEBHOOK -->
      <div class="card">
        <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">☁️ Integração com Google Drive</h3>

        <form id="form-config-drive">
          <div class="form-group">
            <label for="input-script-url">URL da Web App do Google Apps Script *</label>
            <input type="url" id="input-script-url" class="form-control" placeholder="https://script.google.com/macros/s/AKfycb.../exec" value="${config.scriptUrl || ''}">
            <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
              Cole aqui o URL gerado após publicar o script <code>google-script/Code.gs</code> no Google Drive.
            </span>
          </div>

          <div class="form-group">
            <label for="input-nome-evento">Nome do Evento</label>
            <input type="text" id="input-nome-evento" class="form-control" value="${config.nomeEvento || 'Game Master Mall Event'}">
          </div>

          <button type="submit" class="btn btn-primary btn-block">
            💾 Salvar Configurações
          </button>
        </form>
      </div>

      <!-- INSTRUÇÕES RÁPIDAS DE CONFIGURAÇÃO DO GOOGLE DRIVE -->
      <div class="card">
        <h3 style="margin-bottom: 0.75rem; font-size: 1.1rem;">📖 Como configurar o Google Drive (2 minutos)</h3>
        <ol style="font-size: 0.85rem; color: var(--text-muted); padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem;">
          <li>Acesse seu <strong>Google Drive</strong> e crie duas pastas: <code>Notas Fiscais</code> e <code>Fotos Evento</code>.</li>
          <li>Abra <a href="https://script.google.com" target="_blank" style="color: var(--primary);">script.google.com</a> e crie um Novo Projeto.</li>
          <li>Copie e cole o código contido no arquivo <code>google-script/Code.gs</code> deste projeto.</li>
          <li>Substitua os IDs das duas pastas no código do script.</li>
          <li>Clique em <strong>Implantar -> Nova Implantação -> App da Web</strong>.</li>
          <li>Defina <em>"Quem pode acessar"</em> como <strong>"Qualquer pessoa"</strong> e publique.</li>
          <li>Copie o URL gerado e cole no campo ao lado!</li>
        </ol>
      </div>

    </div>
  `;

  // Submit Handler
  container.querySelector('#form-config-drive').addEventListener('submit', (e) => {
    e.preventDefault();
    const url = container.querySelector('#input-script-url').value;
    const nome = container.querySelector('#input-nome-evento').value;

    store.salvarConfig(url, nome);
    showToast('Configurações salvas com sucesso!', 'success');
  });
}
