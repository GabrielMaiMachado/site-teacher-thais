# Teste de nivelamento: como deixar tudo funcionando

Este guia é para quem não programa. Faça os passos na ordem. Leva uns 30 minutos.

O que vai acontecer no final: cada aluno que fizer o teste em
`seusite.com.br/nivelamento` vira uma linha numa planilha do Google da Thaís,
e a própria planilha mostra quais turmas já dá para abrir.

---

## 1. Criar a planilha

1. Entre no [Google Drive](https://drive.google.com) com a conta da Thaís.
2. Clique em **Novo → Planilhas Google → Planilha em branco**.
3. Dê um nome, por exemplo **Nivelamento – Teacher Thaís**.

## 2. Colar o código e criar a senha

1. Com a planilha aberta, clique em **Extensões → Apps Script**. Abre uma aba nova.
2. Apague tudo o que estiver no arquivo `Código.gs`.
3. Abra o arquivo `apps-script/Codigo.gs` deste projeto, copie **tudo** e cole lá.
4. Clique no ícone de disquete (**Salvar projeto**).
5. Invente uma senha longa, só com letras e números (por exemplo, 30 caracteres
   aleatórios). Guarde: ela vai ser usada de novo no passo 5.
6. No menu da esquerda, clique na engrenagem **Configurações do projeto**.
7. Role até **Propriedades do script → Adicionar propriedade do script**:
   - Propriedade: `SHEETS_SECRET`
   - Valor: a senha que você inventou
8. Clique em **Salvar propriedades do script**.

## 3. Montar as abas

1. Volte para o editor (ícone `< >` na esquerda).
2. Na barra de cima, escolha a função **configurarPlanilha** e clique em **Executar**.
3. O Google pede autorização: **Revisar permissões → escolha a conta →
   Avançado → Acessar (não seguro) → Permitir**. Isso aparece porque o código é
   seu e não foi publicado na loja do Google; é normal.
4. Volte para a planilha. Devem aparecer as abas **Respostas**, **Turmas em
   formação**, **Painel**, **Detalhes** e **Como usar**.

Pode executar `configurarPlanilha` de novo quando quiser (também pelo menu
**Nivelamento → Configurar / reformatar planilha**). Ela refaz a formatação e
**não apaga nenhuma resposta**.

## 4. Publicar como App da Web

1. No Apps Script, clique em **Implantar → Nova implantação**.
2. Na engrenagem ao lado de "Selecionar tipo", escolha **App da Web**.
3. Preencha:
   - Descrição: `Nivelamento`
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
4. Clique em **Implantar** e copie a **URL do app da Web** (termina em `/exec`).

> Se um dia você mudar o código, use **Implantar → Gerenciar implantações →
> lápis → Versão: Nova versão → Implantar**. Assim a URL continua a mesma.

Para testar: abra a URL no navegador. Deve aparecer
`{"ok":true,"mensagem":"Planilha de nivelamento no ar."}`.

## 5. Colocar a URL e a senha na Vercel

1. Entre na [Vercel](https://vercel.com), abra o projeto do site.
2. Vá em **Settings → Environment Variables** e adicione duas variáveis
   (marque Production, Preview e Development):
   - `SHEETS_WEBHOOK_URL` = a URL do passo 4
   - `SHEETS_SECRET` = a mesma senha do passo 2
3. Vá em **Deployments**, clique nos três pontinhos do último deploy e em
   **Redeploy**. As variáveis só valem depois de um novo deploy.

A URL e a senha ficam só no servidor. Ninguém consegue vê-las pelo navegador.

## 6. Gerar os áudios da escuta (no computador de quem cuida do site)

Os áudios são gerados **uma vez só** com a ElevenLabs e ficam guardados no site.
A chave da ElevenLabs **não** vai para a Vercel.

1. Na raiz do projeto, copie `.env.example` para `.env.local` e preencha
   `ELEVENLABS_API_KEY` (no site da ElevenLabs: **perfil → API Keys**).
2. Rode:

   ```bash
   node scripts/gerar-audios.mjs
   ```

3. Na primeira vez, o script lista as vozes da sua conta e sugere uma para cada
   áudio (mulher americana, homem britânico, homem americano, mulher britânica).
   Copie os IDs para o campo `"voiceId"` de cada áudio em
   `src/lib/nivelamento/banco.json` e rode o comando de novo.
4. Os arquivos `escuta-1.mp3` a `escuta-4.mp3` aparecem em
   `public/audio/nivelamento/`. **Ouça todos.** Se algum não ficou bom, troque a
   voz ou a `"velocidade"` (0,7 a 1,2) no `banco.json` e rode
   `node scripts/gerar-audios.mjs --force`.
5. Faça o commit dos MP3 e publique.

O modelo de voz fica em `banco.json` (`"modelo"`). O padrão é
`eleven_multilingual_v2`, indicado pela ElevenLabs para narração e que aceita o
ajuste de velocidade.

## 7. Fazer um teste completo

1. Abra `seusite.com.br/nivelamento?plano=turma&demo=1`.
   O `demo=1` divide todos os tempos por 6, para testar rápido.
2. Faça o teste até o fim. Na tela de resultado deve aparecer **Resultado salvo**.
3. Abra a planilha: a linha nova deve estar na aba **Respostas** (e na
   **Detalhes**), com o mesmo código `NIV-…` que aparece na mensagem do WhatsApp.
4. Apague essa linha de teste das abas Respostas e Detalhes.

Se aparecer "Tentando salvar…" e não sair disso, confira:
- se a URL na Vercel termina em `/exec`;
- se a senha é exatamente igual nos dois lugares;
- se o App da Web está com acesso **Qualquer pessoa**;
- se você fez o Redeploy depois de criar as variáveis.

---

## Para quem cuida do código

- Questões, áudios e temas de escrita: `src/lib/nivelamento/banco.json`.
- Cálculo dos níveis (com testes): `src/lib/nivelamento/pontuacao.ts` → `npm test`.
- Tela do teste: `src/components/nivelamento/`; rota: `src/app/nivelamento/page.tsx`.
- Envio para a planilha: `src/app/api/nivelamento/route.ts` (valida, aplica
  limite de 5 envios a cada 10 minutos por IP e repassa ao Apps Script).
- Se mudar colunas da planilha, mude em `apps-script/Codigo.gs` e rode
  `configurarPlanilha` de novo.
