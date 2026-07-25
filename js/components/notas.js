/**
 * Game Master — Componente Notas Fiscais (Consumo no Mall)
 */
import { store } from '../store.js';
import { DriveService } from '../drive-service.js';

export function renderNotas(container, showToast) {
  const notas = store.getNotas();
  const config = store.getConfig();

  const totalConsumido = notas.reduce((sum, n) => sum + (n.valor || 0), 0);

  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">
        <h2>Notas Fiscais de Consumo</h2>
        <p>Registre comprovantes e cupons fiscais dos consumos realizados no shopping durante o evento</p>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom: 1.5rem;">
      
      <!-- FORMULÁRIO DE UPLOAD DE NOTA FISCAL -->
      <div class="card">
        <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">🧾 Cadastrar Cupom / Nota Fiscal</h3>
        
        <form id="form-nota">
          <div class="upload-zone" id="nota-dropzone">
            <div class="upload-icon">🧾</div>
            <p style="font-weight: 600;">Fotografar Nota Fiscal ou Selecionar da Galeria</p>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Foto legível do cupom fiscal do shopping</p>
            <input type="file" id="input-nota-file" accept="image/*" capture="environment" style="display: none;" required>
          </div>

          <div id="nota-preview-container" style="display: none; margin-top: 1rem; text-align: center;">
            <img id="nota-preview-img" style="max-height: 200px; border-radius: var(--radius-md); border: 1px solid var(--border);" alt="Preview Nota">
            <button type="button" class="btn btn-sm btn-secondary" id="btn-remover-nota-preview" style="margin-top: 0.5rem;">Trocar Foto</button>
          </div>

          <div class="grid-2" style="margin-top: 1rem;">
            <div class="form-group">
              <label for="input-nota-loja">Nome do Estabelecimento / Loja</label>
              <input type="text" id="input-nota-loja" class="form-control" placeholder="Ex: Praça de Alimentação / Bob's">
            </div>

            <div class="form-group">
              <label for="input-nota-valor">Valor Total da Nota (R$)</label>
              <input type="number" step="0.01" id="input-nota-valor" class="form-control" placeholder="Ex: 45.90">
            </div>
          </div>

          <button type="submit" class="btn btn-success btn-block" id="btn-submit-nota">
            🚀 Enviar Nota Fiscal para o Drive
          </button>
        </form>
      </div>

      <!-- PAINEL DE CONSOLIDAÇÃO -->
      <div class="card">
        <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">💰 Balanço de Consumo no Mall</h3>
        
        <div style="background-color: var(--primary-light); border: 1px solid rgba(139, 92, 246, 0.3); padding: 1.25rem; border-radius: var(--radius-md); text-align: center; margin-bottom: 1rem;">
          <span style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Total Acumulado em Notas</span>
          <div style="font-size: 2.2rem; font-family: 'Outfit', sans-serif; font-weight: 800; color: var(--accent-green); margin-top: 0.2rem;">
            R$ ${totalConsumido.toFixed(2)}
          </div>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${notas.length} cupons registrados</span>
        </div>

        ${config.scriptUrl ? `
          <div style="font-size: 0.85rem; color: var(--accent-green);">
            ☁️ As notas fiscais estão sendo armazenadas na pasta <strong>"Notas Fiscais"</strong> do seu Google Drive.
          </div>
        ` : `
          <div style="font-size: 0.85rem; color: var(--accent-orange);">
            ⚠️ Configure a URL do Google Apps Script em <strong>Ajustes</strong> para salvar direto no Google Drive.
          </div>
        `}
      </div>

    </div>

    <!-- LISTA DE NOTAS ENVIADAS -->
    <h3 style="margin-bottom: 1rem; font-size: 1.2rem;">📋 Cupons Cadastrados (${notas.length})</h3>
    ${notas.length === 0 ? `
      <div class="empty-state card">
        <div class="empty-icon">🧾</div>
        <p>Nenhuma nota fiscal cadastrada ainda hoje.</p>
      </div>
    ` : `
      <div class="media-grid">
        ${notas.map(n => {
          const hora = new Date(n.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          return `
            <div class="media-card">
              <img src="${n.data}" class="media-preview" alt="Nota Fiscal">
              <div class="media-body">
                <div class="media-title">${n.loja}</div>
                <div style="font-weight: 700; color: var(--accent-green); font-size: 1.1rem;">
                  R$ ${(n.valor || 0).toFixed(2)}
                </div>
                <div style="font-size: 0.75rem;">🕒 ${hora}</div>
                <div style="margin-top: 0.2rem;">
                  ${n.driveEnviado 
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

  // Handlers
  const dropzone = container.querySelector('#nota-dropzone');
  const fileInput = container.querySelector('#input-nota-file');
  const previewContainer = container.querySelector('#nota-preview-container');
  const previewImg = container.querySelector('#nota-preview-img');
  const btnRemover = container.querySelector('#btn-remover-nota-preview');

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

  container.querySelector('#form-nota').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!previewImg.src) {
      showToast('Por favor, tire a foto do cupom fiscal!', 'error');
      return;
    }

    const loja = container.querySelector('#input-nota-loja').value;
    const valor = container.querySelector('#input-nota-valor').value;
    const base64 = previewImg.src;

    const novaNota = store.adicionarNota(base64, loja, valor);
    showToast('Nota fiscal registrada!', 'success');

    if (config.scriptUrl) {
      try {
        await DriveService.uploadMedia(config.scriptUrl, {
          tipo: 'nota_fiscal',
          base64: base64,
          loja: novaNota.loja,
          valor: novaNota.valor,
          dataHora: novaNota.dataHora
        });
        store.marcarNotaEnviadaDrive(novaNota.id);
        showToast('Nota fiscal enviada ao Google Drive!', 'success');
      } catch (err) {
        console.error(err);
        showToast('Salvo no app! Falha no envio para o Drive.', 'info');
      }
    }

    renderNotas(container, showToast);
  });
}
