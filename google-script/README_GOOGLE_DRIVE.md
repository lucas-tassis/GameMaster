# 🚀 Guia de Implantação — Google Drive Integrador (Game Master)

O script organiza **automaticamente** todas as Fotos e Notas Fiscais na seguinte estrutura de pastas dentro do seu Google Drive:

```text
📁 Meu Drive
 └── 📁 Game Master
      └── 📁 [Nome do Evento] (ex: "Game Master Mall — Edição Principal")
           ├── 📁 Fotos (para fotos do evento)
           └── 📁 Notas Fiscais (para comprovantes de despesa)
```

---

## 📋 Passo a Passo de Configuração (2 Minutos):

1. **Acesse o Google Apps Script:**
   - Acesse [script.google.com](https://script.google.com) (faça login na sua conta Google).
   - Clique no botão **"Novo projeto"** no canto superior esquerdo.

2. **Cole o Código do Script:**
   - Apague todo o conteúdo do arquivo `Código.gs`.
   - Copie e cole todo o conteúdo do arquivo [google-script/Code.gs](file:///d:/eclipse-workspace/GameMaster/google-script/Code.gs).

3. **Realize a Implantação (Deploy):**
   - No canto superior direito, clique em **"Implantar"** > **"Nova implantação"**.
   - Ao lado de *Selecionar tipo*, clique na engrenagem ⚙️ e escolha **"App da Web"**.
   - Configure os seguintes valores:
     - **Descrição:** `Game Master Drive`
     - **Executar como:** `Eu (seu email)`
     - **Quem pode acessar:** `Qualquer pessoa` *(Anyone)*
   - Clique em **"Implantar"**.

4. **Conceda Permissões ao Script:**
   - O Google solicitará permissão para salvar arquivos no seu Drive.
   - Clique em **"Autorizar acesso"** > escolha sua conta Google > clique em **"Avançado"** > **"Acessar (não seguro)"** > **"Permitir"**.

5. **Copie a URL do WebApp:**
   - Copie o **"URL do aplicativo da web"** (um link que termina em `/exec`).

6. **Cole no Game Master:**
   - Abra o arquivo [application.yml](file:///d:/eclipse-workspace/GameMaster/src/main/resources/application.yml) e cole na propriedade `gamemaster.drive.script-url`:
     ```yaml
     gamemaster:
       drive:
         script-url: "SUA_URL_AQUI"
     ```
   - Ao enviar fotos ou notas pelo app, a estrutura `Meu Drive > Game Master > [Nome do Evento] > Fotos / Notas Fiscais` será criada **automaticamente** no seu Google Drive! 🚀
