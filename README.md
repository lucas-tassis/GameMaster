# 🎲 Game Master — Aplicativo para Evento de Jogos de Tabuleiro

O **Game Master** é uma aplicação web moderna, leve e responsiva criada para a gestão presencial do evento de jogos de tabuleiro em shopping centers.

---

## 🚀 Funcionalidades Principais

1. **📊 Painel / Dashboard Em Tempo Real:**
   - Métricas do evento: Total de participantes, total de jogos em uso nas mesas, quantidade de fotos e valor acumulado em notas fiscais de consumo no shopping.
   - Atalhos de ação rápida e lista de jogos atualmente emprestados.

2. **📋 Credenciamento de Presença (Check-in do Público):**
   - Formulário limpo e rápido para o próprio público cadastrar sua presença pelo celular ou tablet do evento.
   - Registro de: **Nome Completo**, **Cidade** e se é a **1ª vez no evento**.

3. **🎲 Acervo & Empréstimo Rápido de Jogos:**
   - Catálogo completo de jogos de tabuleiro do evento com busca rápida e filtros de status.
   - Fluxo de empréstimo em 2 cliques: seleciona quem pegou o jogo e em qual mesa ele está.
   - Devolução simples para retornar o jogo à estante.

4. **📸 Envio de Fotos do Evento (Google Drive):**
   - Qualquer participante ou organizador pode tirar fotos das mesas e da galera jogando.
   - Upload automático para a pasta `Fotos Evento` no Google Drive via Webhook do Google Apps Script.

5. **🧾 Envio de Notas Fiscais (Consumo no Mall):**
   - Captura de foto do cupom/nota fiscal dos restaurantes e lanchonetes do shopping durante o evento.
   - Registro opcional do valor (R$) e nome da loja.
   - Upload automático para a pasta `Notas Fiscais` no Google Drive.

---

## 💻 Como Rodar o Aplicativo Localmente

Como o **Game Master** foi desenvolvido com HTML5, CSS3 e JavaScript ES Modules nativos:

1. **Pelo Navegador Directo:**
   - Abra a pasta `d:\eclipse-workspace\GameMaster`.
   - Dê um duplo clique no arquivo `index.html` ou abra-o em qualquer navegador moderno (Chrome, Edge, Firefox, Safari).

2. **Via Servidor Local (Ex: VS Code Live Server ou HTTP Server):**
   - Se preferir rodar via HTTP local:
     ```bash
     npx serve d:\eclipse-workspace\GameMaster
     ```
   - Acesse a URL indicada no terminal (ex: `http://localhost:3000`).

---

## ☁️ Como Configurar a Integração Gratuita com o Google Drive

Para que as fotos e notas fiscais enviadas no app caiam direto nas pastas do seu Google Drive sem custos de servidores:

1. Acesse seu **Google Drive** e crie 2 pastas:
   - Uma pasta chamada `Notas Fiscais`
   - Uma pasta chamada `Fotos Evento`
2. Copie o **ID** de cada pasta (é a parte final da URL da pasta no navegador, ex: `drive.google.com/drive/folders/1a2b3c4d5e...` -> o ID é `1a2b3c4d5e...`).
3. Acesse [script.google.com](https://script.google.com) e crie um **Novo Projeto**.
4. Abra o arquivo `google-script/Code.gs` localizado nesta pasta do projeto e copie todo o seu código.
5. Cole no editor do Google Apps Script e substitua os IDs das pastas nas variáveis `FOLDER_ID_FOTOS` e `FOLDER_ID_NOTAS`.
6. No menu superior, clique em **Implantar -> Nova implantação**.
7. Selecione o tipo **App da Web**:
   - *Executar como:* **Eu (seu email)**
   - *Quem pode acessar:* **Qualquer pessoa (Anyone)**
8. Clique em **Implantar**, autorize as permissões da sua conta do Google e copie a **URL do aplicativo da web** (termina em `/exec`).
9. Abra o app Game Master, vá na aba **⚙️ Ajustes** e cole a URL no campo do Google Drive. Pronto! As fotos e notas agora irão direto para o seu Drive.

---

## 📱 Tecnologias Utilizadas
- **HTML5 & CSS3 Vanilla** (Variáveis CSS, CSS Grid, Flexbox, Design System escuro/clean).
- **JavaScript ES6+** (Módulos nativos, LocalStorage para estado offline-first).
- **Google Apps Script API** (Integração sem custo de backend).
