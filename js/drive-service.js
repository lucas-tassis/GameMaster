/**
 * Game Master — Google Drive Service Integration (via Google Apps Script WebApp)
 */

export class DriveService {
  /**
   * Converte um arquivo HTML File em string Base64
   * @param {File} file 
   * @returns {Promise<string>}
   */
  static fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Envia uma foto do evento ou nota fiscal para o Google Apps Script
   * @param {string} scriptUrl - URL do Apps Script implantado
   * @param {Object} payload - Dados do arquivo (tipo, base64, legenda/loja, dataHora)
   * @returns {Promise<{success: boolean, message: string}>}
   */
  static async uploadMedia(scriptUrl, payload) {
    if (!scriptUrl || !scriptUrl.startsWith('http')) {
      throw new Error('URL do Google Apps Script não configurada.');
    }

    try {
      // Como o Google Apps Script redireciona (302) para script.googleusercontent.com,
      // enviamos como text/plain para evitar bloqueios de CORS pre-flight
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok || response.type === 'opaque') {
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          return { success: true, message: json.message || 'Arquivo enviado com sucesso para o Drive!' };
        } catch {
          // Se retornado opaque ou texto simples
          return { success: true, message: 'Arquivo enviado para a fila do Drive!' };
        }
      } else {
        throw new Error(`Falha no servidor (${response.status})`);
      }
    } catch (err) {
      console.warn('Tentando envio alternativo no-cors para Google Apps Script:', err);
      // Fallback em modo no-cors caso ocorra CORS no navegador
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });
      
      return { success: true, message: 'Enviado para o Google Drive!' };
    }
  }
}
