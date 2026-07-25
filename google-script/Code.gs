/**
 * GAME MASTER — GOOGLE APPS SCRIPT WEBAPP
 * 
 * Este script recebe as requisições do aplicativo web Game Master
 * e armazena automaticamente as fotos e notas fiscais em pastas do seu Google Drive.
 * 
 * PASSO A PASSO PARA DEPLOY:
 * 1. Acesse https://script.google.com e crie um "Novo Projeto".
 * 2. Substitua o conteúdo pelo código abaixo.
 * 3. Altere os IDs das pastas abaixo (ID retornado na URL da pasta no Google Drive).
 * 4. Clique em Implante > Nova implantação.
 * 5. Tipo: App da Web.
 * 6. Executar como: "Eu (seu email)".
 * 7. Quem pode acessar: "Qualquer pessoa" (Anyone).
 * 8. Copie a URL do aplicativo da web e cole na aba Ajustes do app Game Master.
 */

// ⚠️ COLOQUE AQUI OS IDS DAS PASTAS DO SEU GOOGLE DRIVE
const FOLDER_ID_FOTOS = 'COLE_AQUI_O_ID_DA_PASTA_FOTOS';
const FOLDER_ID_NOTAS = 'COLE_AQUI_O_ID_DA_PASTA_NOTAS';

function doPost(e) {
  try {
    const contents = e.postData.contents;
    const data = JSON.parse(contents);

    const tipo = data.tipo; // 'foto_evento' ou 'nota_fiscal'
    const base64Data = data.base64;
    
    if (!base64Data) {
      return responseJSON({ success: false, message: 'Nenhuma imagem enviada.' });
    }

    // Extrai o tipo mime e dados puros do dataURL base64
    const parts = base64Data.split(',');
    const mimeType = parts[0].match(/:(.*?);/)[1];
    const imageBytes = Utilities.base64Decode(parts[1]);

    // Seleciona a pasta destino conforme o tipo
    let folderId = (tipo === 'nota_fiscal') ? FOLDER_ID_NOTAS : FOLDER_ID_FOTOS;
    let folder;

    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (err) {
      // Se não houver ID configurado, salva na raiz do Drive
      folder = DriveApp.getRootFolder();
    }

    // Gera nome único para o arquivo
    const dataHoraStr = Utilities.formatDate(new Date(), "GMT-3", "yyyy-MM-dd_HH-mm-ss");
    let filename = "";

    if (tipo === 'nota_fiscal') {
      const lojaClean = (data.loja || 'Mall').replace(/[^a-zA-Z0-9]/g, '_');
      filename = `Nota_${lojaClean}_R$${data.valor || 0}_${dataHoraStr}.jpg`;
    } else {
      const legendaClean = (data.legenda || 'Foto').substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
      filename = `Foto_${legendaClean}_${dataHoraStr}.jpg`;
    }

    // Cria o Blob e salva o arquivo no Drive
    const blob = Utilities.newBlob(imageBytes, mimeType, filename);
    const file = folder.createFile(blob);

    // Se houver legenda ou loja, adiciona à descrição do arquivo
    const descricao = tipo === 'nota_fiscal' 
      ? `Nota Fiscal: ${data.loja || 'Desconhecido'} | Valor: R$ ${data.valor || 0} | Data: ${data.dataHora}`
      : `Foto do Evento Game Master | Legenda: ${data.legenda || ''} | Autor: ${data.autor || ''} | Data: ${data.dataHora}`;
    
    file.setDescription(descricao);

    return responseJSON({
      success: true,
      message: 'Arquivo salvo com sucesso no Google Drive!',
      fileUrl: file.getUrl()
    });

  } catch (error) {
    return responseJSON({
      success: false,
      message: 'Erro ao processar imagem: ' + error.toString()
    });
  }
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput("API WebApp do Game Master ativa e operacional!");
}
