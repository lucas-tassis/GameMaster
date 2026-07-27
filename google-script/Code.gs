/**
 * ==========================================================================
 * GAME MASTER — GOOGLE APPS SCRIPT WEBAPP (AUTOMAÇÃO HIERÁRQUICA DO DRIVE)
 * ==========================================================================
 * 
 * ESTRUTURA AUTOMÁTICA DE PASTAS NO SEU GOOGLE DRIVE:
 * 
 * 📁 Meu Drive
 *    └── 📁 Game Master
 *         └── 📁 [Nome do Evento] (ex: "Game Master Mall — Edição Principal")
 *              ├── 📁 Fotos
 *              └── 📁 Notas Fiscais
 * ==========================================================================
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return responseJSON({ success: false, message: "Dados não recebidos na requisição." });
    }

    const data = JSON.parse(e.postData.contents);
    const tipo = data.tipo || 'foto_evento'; // 'foto_evento' ou 'nota_fiscal'
    const base64Data = data.base64;
    const nomeEvento = data.nomeEvento || data.eventoNome || 'Edição Principal';

    if (tipo === 'criar_evento') {
      const pastaRaizApp = obterOuCriarPastaNoPai(DriveApp.getRootFolder(), "Game Master");
      const nomeEvClean = (nomeEvento && nomeEvento.trim()) ? nomeEvento.trim() : "Evento_Geral";
      const pastaEvento = obterOuCriarPastaNoPai(pastaRaizApp, nomeEvClean);
      obterOuCriarPastaNoPai(pastaEvento, "Fotos");
      obterOuCriarPastaNoPai(pastaEvento, "Notas Fiscais");
      return responseJSON({
        success: true,
        message: `Pastas do evento "${nomeEvClean}" criadas no Google Drive!`,
        folderUrl: pastaEvento.getUrl()
      });
    }

    if (!base64Data) {
      return responseJSON({ success: false, message: "Conteúdo da imagem (Base64) não informado." });
    }

    // 1. Obter ou Criar a Estrutura Hierárquica no Google Drive:
    // Meu Drive > Game Master > [Nome do Evento] > Fotos (ou Notas Fiscais)
    const folderDestino = obterOuCriarEstruturaPastas(nomeEvento, tipo);

    // 2. Processar Dados da Imagem Base64
    const parts = base64Data.split(',');
    const mimeType = (parts.length > 1 && parts[0].indexOf(':') > -1)
      ? parts[0].match(/:(.*?);/)[1]
      : 'image/jpeg';
    const rawBase64 = (parts.length > 1) ? parts[1] : parts[0];
    const imageBytes = Utilities.base64Decode(rawBase64);

    // 3. Formatar Nome do Arquivo
    const dataHoraStr = Utilities.formatDate(new Date(), "GMT-3", "yyyy-MM-dd_HH-mm-ss");
    let filename = "";

    if (tipo === 'nota_fiscal') {
      const lojaClean = (data.loja || 'Nota').replace(/[^a-zA-Z0-9]/g, '_');
      const valorStr = data.valor ? `R$${parseFloat(data.valor).toFixed(2)}` : 'R$0.00';
      filename = `Nota_${lojaClean}_${valorStr}_${dataHoraStr}.jpg`;
    } else {
      const legendaClean = (data.legenda || 'Foto').substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
      filename = `Foto_${legendaClean}_${dataHoraStr}.jpg`;
    }

    // 4. Salvar Arquivo na Pasta Destino
    const blob = Utilities.newBlob(imageBytes, mimeType, filename);
    const file = folderDestino.createFile(blob);

    // Permitir visualização por link
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (errSharing) {}

    // 5. Adicionar Descrição com Metadados
    const descricao = (tipo === 'nota_fiscal')
      ? `Nota Fiscal: ${data.loja || 'Comprovante'} | Valor: R$ ${data.valor || 0} | Evento: ${nomeEvento} | Data: ${data.dataHora || dataHoraStr}`
      : `Foto do Evento Game Master | Legenda: ${data.legenda || ''} | Autor: ${data.autor || 'Participante'} | Evento: ${nomeEvento} | Data: ${data.dataHora || dataHoraStr}`;
    
    file.setDescription(descricao);

    // 6. Retornar Resposta de Sucesso
    return responseJSON({
      success: true,
      message: `Arquivo salvo com sucesso em Game Master > ${nomeEvento} > ${tipo === 'nota_fiscal' ? 'Notas Fiscais' : 'Fotos'}!`,
      fileId: file.getId(),
      fileUrl: file.getUrl(),
      directUrl: `https://drive.google.com/uc?export=view&id=${file.getId()}`
    });

  } catch (error) {
    return responseJSON({
      success: false,
      message: 'Erro ao processar arquivo no Google Drive: ' + error.toString()
    });
  }
}

/**
 * Cria/Localiza a hierarquia:
 * Meu Drive > Game Master > [Nome do Evento] > Fotos (ou Notas Fiscais)
 */
function obterOuCriarEstruturaPastas(nomeEvento, tipo) {
  // Pasta 1: Raiz "Game Master" em Meu Drive
  const pastaRaizApp = obterOuCriarPastaNoPai(DriveApp.getRootFolder(), "Game Master");

  // Pasta 2: Pasta do Evento (ex: "Game Master Mall — Edição Principal")
  const nomeEvClean = (nomeEvento && nomeEvento.trim()) ? nomeEvento.trim() : "Evento_Geral";
  const pastaEvento = obterOuCriarPastaNoPai(pastaRaizApp, nomeEvClean);

  // Pasta 3: Subpasta de destino ("Fotos" ou "Notas Fiscais")
  const nomeSubpasta = (tipo === 'nota_fiscal') ? "Notas Fiscais" : "Fotos";
  return obterOuCriarPastaNoPai(pastaEvento, nomeSubpasta);
}

function obterOuCriarPastaNoPai(pastaPai, nomePasta) {
  const folders = pastaPai.getFoldersByName(nomePasta);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    const novaPasta = pastaPai.createFolder(nomePasta);
    try {
      novaPasta.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) {}
    return novaPasta;
  }
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return responseJSON({
    status: "ONLINE",
    app: "Game Master — Hierarquia de Mídia no Google Drive",
    timestamp: new Date().toISOString()
  });
}
