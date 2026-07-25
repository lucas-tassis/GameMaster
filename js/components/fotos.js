/**
 * Game Master — Componente Fotos do Evento
 */
import { store } from '../store.js';
import { DriveService } from '../drive-service.js';

export function renderFotos(container, showToast) {
  const fotos = store.getFotos();
  const config = store.getConfig();

  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">
        <h2>Galeria de Fotos do Evento</h2>
        <p>Tire fotos das mesas, galera e momentos para salvar no álbum do Google Drive</p>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom: 1.5rem;">
      
      <!-- FORMULÁRIO DE UPLOAD DE FOTO -->
      <div class="card">
        <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">📸 Enviar Foto do Evento</h3>
        
        <form id="form-foto">
          <div class="upload-zone" id="foto-dropzone">
            <div class="upload-icon">📷</div>
            <p style="font-weight: 600;">Clique para Tirar Foto ou Escolher da Galeria</p>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Suporta JPG, PNG e WebP</p>
            <input type="file" id="input-foto-file" accept="image/*" capture="environment" style="display: none;" required>
          </div>

          <div id="foto-preview-container" style="display: none; margin-top: 1rem; text-align: center;">
            <img id="foto-preview-img" style="max-height: 200px; border-radius: var(--radius-md); border: 1px solid var(--border);" alt="Preview">
            <button type="button" class="btn btn-sm btn-secondary" id="btn-remover-preview" style="margin-top: 0.5rem;">Trocar Foto</button>
          </div>

          <div class="form-group" style="margin-top: 1rem;">
            <label for="input-foto-legenda">Legenda / Quem está na foto? (Opcional)</label>
            <input type="text" id="input-foto-legenda" class="form-control" placeholder="Ex: Mesa de Catan na praça de alimentação">
          </div>

          <div class="form-group">
            <label for="input-foto-autor">Seu Nome (Opcional)</label>
            <input type="text" id="input-foto-autor" class="form-control" placeholder="Ex: Lucas / Staff / Visitante">
          </div>

          <button type="submit" class="btn btn-primary btn-block" id="btn-submit-foto">
            🚀 Salvar e Enviar para o Drive
          </button>
        </form>
      </div>

      <!-- STATUS DA INTEGRAÇÃO DO DRIVE -->
      <div class="card">
        <h3 style="margin-bottom: 0.5rem; font-size: 1.1rem;">☁️ Status do Google Drive</h3>
        ${config.scriptUrl ? `
          <div style="background-color: var(--accent-green-bg); border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.75rem; border-radius: var(--radius-md); color: var(--accent-green); font-size: 0.85rem; margin-bottom: 1rem;">
            ✅ <strong>Conectado ao Drive!</strong> As fotos enviadas irão para a pasta "Fotos Evento".
          </div>
        ` : `
          <div style="background-color: var(--accent-orange-bg); border: 1px solid rgba(245, 158, 11, 0.3); padding: 0.75rem; border-radius: var(--radius-md); color: var(--accent-orange); font-size: 0.85rem; margin-bottom: 1rem;">
            ⚠️ <strong>Modo Local:</strong> O Google Apps Script não foi configurado na aba Ajustes. As fotos ficarão salvas localmente no app.
          </div>
        `}

        <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem;">📊 Resumo da Galeria</h4>
        <ul style="font-size: 0.875rem; color: var(--text-muted); padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.25rem;">
          <li>Total de Fotos no App: <strong>${fotos.length}</strong></li>
          <li>Enviadas ao Drive: <strong>${fotos.filter(f => f.driveEnviado).length}</strong></li>
          <li>Salvas Localmente: <strong>${fotos.filter(f => !f.driveEnviado).length}</strong></li>
        </ul>
      </div>

    </div>

    <!-- GALERIA DE FOTOS REGISTRADAS -->
    <h3 style="margin-bottom: 1rem; font-size: 1.2rem;">🖼️ Fotos do Evento (${fotos.length})</h3>
    ${fotos.length === 0 ? `
      <div class="empty-state card">
        <div class="empty-icon">📷</div>
        <p>Nenhuma foto enviada ainda. Registre a primeira foto acima!</p>
      </div>
    ` : `
      <div class="media-grid">
        ${fotos.map(f => {
          const hora = new Date(f.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          return `
            <div class="media-card">
              <img src="${f.data}" class="media-preview" alt="${f.legenda}">
              <div class="media-body">
                <div class="media-title">${f.legenda}</div>
                <div>👤 ${f.autor} • ${hora}</div>
                <div>
                  ${f.driveEnviado 
                    ? '<span class="badge badge-green">☁️ Salvo no Drive</span>' 
                    : '<span class="badge badge-orange">💾 Salvo no App</span>'}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;

  // UI Event Handlers
  const dropzone = container.querySelector('#foto-dropzone');
  const fileInput = container.querySelector('#input-foto-file');
  const previewContainer = container.querySelector('#foto-preview-container');
  const previewImg = container.querySelector('#foto-preview-img');
  const btnRemover = container.querySelector('#btn-remover-preview');

  dropzone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await DriveService.fileToBase64(file);
      previewImg.src = base64;
      previewContainer.style.display = 'block';
      dropzone.style.display = 'none';
    }
  });

  btnRemover.addEventListener('click', () => {
    fileInput.value = '';
    previewImg.src = '';
    previewContainer.style.display = 'none';
    dropzone.style.display = 'block';
  });

  // Submit Handler
  container.querySelector('#form-foto').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];
    if (!file && !previewImg.src) {
      showToast('Por favor, selecione ou tire uma foto!', 'error');
      return;
    }

    const legenda = container.querySelector('#input-foto-legenda').value;
    const autor = container.querySelector('#input-foto-autor').value;
    const base64 = previewImg.src;

    // Salva no Store Local
    const novaFoto = store.adicionarFoto(base64, legenda, autor);
    showToast('Foto salva com sucesso!', 'success');

    // Se tiver URL do Google Drive configurado, envia em segundo plano
    if (config.scriptUrl) {
      try {
        await DriveService.uploadMedia(config.scriptUrl, {
          tipo: 'foto_evento',
          base64: base64,
          legenda: novaFoto.legenda,
          autor: novaFoto.autor,
          dataHora: novaFoto.dataHora
        });
        store.marcarFotoEnviadaDrive(novaFoto.id);
        showToast('Foto enviada para o Google Drive!', 'success');
      } catch (err) {
        console.error(err);
        showToast('Salvo no app! Não foi possível enviar ao Drive.', 'info');
      }
    }

    renderFotos(container, showToast);
  });
}
