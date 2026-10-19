# Prompt para o Claude Code: plano de turmas + teste de nivelamento

> **Antes de colar:** salve o arquivo `prototipo-nivelamento.html` (enviado junto) dentro do repositório, em `docs/prototipo-nivelamento.html`. O prompt usa esse arquivo como referência de fluxo e de conteúdo.

---

Você é um desenvolvedor sênior especialista em Next.js e em sites de professores particulares. Vai trabalhar no site **Learn with Teacher Thaís** (este repositório, publicado na Vercel). A Thaís dá aulas de inglês online pelo Meet e vai abrir **turmas de até 4 pessoas do mesmo nível**. Para isso, o site precisa de:

1. uma seção de planos atualizada, com o novo plano de turma;
2. um **teste de nivelamento** cronometrado (gramática, escuta e escrita) para onde o plano de turma redireciona;
3. o envio de cada teste para uma **planilha do Google Sheets organizada** (sem banco de dados);
4. um botão para o aluno **enviar o resultado no WhatsApp** da Thaís.

## Como trabalhar

1. **Leia o projeto primeiro.** Descubra o roteador (App Router ou Pages Router), os componentes, as fontes, as cores, o padrão de espaçamento e o estilo dos títulos (o site usa títulos com trechos em itálico, por exemplo "Inglês para você *finalmente começar a falar.*").
2. Leia `docs/prototipo-nivelamento.html`. Ele é a **referência de fluxo, regras e conteúdo**, não de visual. O visual do teste tem que parecer parte do site atual: mesmas fontes, cores, botões, raios de borda e tom de texto. Reaproveite os componentes que já existem.
3. Antes de escrever código, me mostre um plano curto com os arquivos que vai criar ou alterar. Depois implemente.
4. Não adicione banco de dados, autenticação nem serviços pagos além dos descritos aqui.
5. Todo o texto da interface é em português do Brasil. O conteúdo do teste é em inglês.

---

## Parte 1: seção de planos

Substitua os planos atuais por estes quatro (valores mensais **por pessoa**):

| Plano | Valor | Botão |
|---|---|---|
| Individual · 1x por semana (4 aulas/mês) | R$ 200/mês | "Agendar minha aula" → WhatsApp (link atual) |
| Individual · 2x por semana (8 aulas/mês) | R$ 380/mês | "Agendar minha aula" → WhatsApp (link atual) |
| Dupla | R$ 170/mês por pessoa | "Agendar minha aula" → WhatsApp (link atual) |
| **Turma de até 4 pessoas** · selo "Novo" | R$ 140/mês por pessoa | **"Fazer teste de nivelamento"** → `/nivelamento?plano=turma` |

- Mantenha as listas de benefícios que já existem em cada card (material incluso, fala em todas as aulas, feedback semanal, Google Classroom; no 2x também a aula extra de conversação e as aulas gravadas).
- O card de **Turma** lista:
  - "Turma montada por nível, a partir de um teste de nivelamento"
  - "Turma mista ou só com pessoas do mesmo gênero, você escolhe"
  - e os mesmos benefícios do card de Dupla.
- Abaixo do card de Turma, coloque uma linha curta: "A turma abre quando fecharmos 3 ou 4 pessoas do mesmo nível com horário em comum."
- Mantenha a regra de indicação (vale para os planos individuais) e o plano de estudos por R$ 10 a mais no mês.
- No layout, 4 cards em linha no desktop, 2×2 no tablet e 1 coluna no celular. O destaque visual que hoje está no plano 2x pode continuar nele. O plano de Turma recebe só o selo "Novo".
- No FAQ, adicione:
  - **"Como funcionam as turmas?"**: até 4 pessoas do mesmo nível, online pelo Meet, com a turma montada a partir do teste. Pode ser mista ou só com pessoas do mesmo gênero, sem diferença de preço.
  - **"Preciso fazer o teste para a aula individual?"**: não. No individual, o nível é avaliado na primeira aula.
- No hero, adicione um link secundário discreto: "Quer estudar em turma? Faça o teste de nivelamento", apontando para `/nivelamento?plano=turma`.

---

## Parte 2: teste de nivelamento (`/nivelamento`)

Uma única rota, com as etapas trocando na mesma página. Organize o código assim (adapte ao padrão do projeto):

```
lib/nivelamento/banco.json         ← questões, áudios e temas de escrita (fonte única)
lib/nivelamento/pontuacao.ts       ← cálculo dos níveis (funções puras)
components/nivelamento/*           ← telas e componentes do teste
app/nivelamento/page.tsx           ← (ou pages/nivelamento.tsx)
app/api/nivelamento/route.ts       ← envio para o Google Sheets
public/audio/nivelamento/*.mp3     ← áudios gerados com ElevenLabs
scripts/gerar-audios.mjs           ← script que gera os áudios
apps-script/Codigo.gs              ← código da planilha
docs/SETUP-NIVELAMENTO.md          ← passo a passo para a Thaís
```

### Etapas e tempos

| Etapa | Tempo | Correção |
|---|---|---|
| 0 · Introdução | sem tempo | — |
| 1 · Cadastro | sem tempo | — |
| 2 · Gramática e vocabulário | 12 min | automática |
| 3 · Escuta | 8 min | automática |
| 4 · Escrita | 10 min | pela Thaís, na planilha |
| 5 · Resultado | — | — |

### Etapa 0: introdução
Título no estilo do site, por exemplo "Descubra seu nível e encontre *sua turma.*" Explique as etapas e o tempo de cada uma (cerca de 30 min no total) e peça para a pessoa não usar tradutor, num tom gentil. Botão "Começar".

### Etapa 1: cadastro
Campos:
- **Nome** (obrigatório)
- **WhatsApp com DDD** (obrigatório; máscara `(55) 99999-9999`; valide 10 ou 11 dígitos)
- **E-mail** (opcional)
- **Gênero** (obrigatório): Mulher · Homem · Prefiro não informar
- **Tipo de turma** (obrigatório):
  - Turma mista
  - Turma só com pessoas do mesmo gênero
  - Tanto faz
  - Se a pessoa escolher "mesmo gênero", o gênero precisa ser Mulher ou Homem. Se ela tiver escolhido "Prefiro não informar", mostre uma explicação gentil pedindo para escolher "Turma mista" ou "Tanto faz".
  - Mostre a nota: "Não muda o valor. Usamos só para montar as turmas."
- **Plano de interesse**: Turma de até 4 · Dupla · Individual 1x · Individual 2x · Ainda não sei. Vem pré-selecionado pelo `?plano=` da URL.
- **Objetivo principal**: Conversação no dia a dia · Trabalho/carreira · Viagens · Provas e certificados · Faculdade/estudos
- **Já estudou inglês?** Nunca · Pouco (escola) · Curso por 1–2 anos · Curso por 3 anos ou mais
- **Horários disponíveis** (obrigatório pelo menos 1): grade clicável com dias **Seg a Sáb** nas colunas e **Manhã, Tarde e Noite** nas linhas (18 opções). Os botões precisam ser acessíveis por teclado (`aria-pressed`) e a grade não pode quebrar no celular.
- **Consentimento** (obrigatório, caixa de seleção): "Autorizo a Teacher Thaís a usar meus dados para me contatar e montar turmas." (LGPD)
- **Campo anti-robô invisível** (honeypot): se vier preenchido, o envio é descartado em silêncio.

### Etapa 2: gramática e vocabulário (adaptativa)
- Use as 25 questões do protótipo: 5 blocos (A1, A2, B1, B2, C1) com 5 questões cada, múltipla escolha com 4 alternativas.
- Mostre uma questão por vez, com o botão "Próxima". Não dá para voltar.
- **Regra adaptativa:** ao terminar um bloco, a pessoa só passa para o próximo se acertou 3 ou mais. Caso contrário, vai direto para a escuta.
- O nível de gramática é o último bloco aprovado (−1 se não passou nem no A1).
- Embaralhe a ordem das alternativas, mas guarde o índice da resposta certa corretamente.

### Etapa 3: escuta (vozes geradas com ElevenLabs)
- São 4 áudios (níveis A2, B1, B2 e C1), cada um com 2 perguntas. Os textos e as perguntas estão no protótipo.
- **Os áudios são arquivos MP3 gerados uma única vez** pelo script `scripts/gerar-audios.mjs` e salvos em `public/audio/nivelamento/`. **Nunca chame a API da ElevenLabs a partir do navegador ou em tempo de execução.** Isso exporia a chave e gastaria créditos a cada aluno.
- O script:
  - lê os textos de `banco.json`;
  - usa `ELEVENLABS_API_KEY` do `.env.local`;
  - usa vozes diferentes por áudio para variar os sotaques: americano e britânico, homem e mulher. Os IDs ficam configuráveis em `banco.json` (`voiceId`). Se estiverem vazios, o script lista as vozes da conta e mostra as sugestões;
  - usa o modelo de texto-para-fala recomendado na documentação atual da ElevenLabs;
  - deixa os níveis mais baixos com fala um pouco mais lenta (configuração de velocidade da voz, se o modelo permitir);
  - salva `escuta-1.mp3` até `escuta-4.mp3` e não regera um arquivo que já existe, a menos que receba `--force`.
- Os MP3 vão para o repositório. O site só toca arquivos estáticos.
- O player é personalizado, **sem a barra nativa**, para impedir avançar e voltar:
  - botão de play grande, animação de onda enquanto toca e indicador "2 de 2 reproduções restantes";
  - **cada áudio toca no máximo 2 vezes**; o botão fica desativado durante a reprodução e quando as reproduções acabam;
  - se o arquivo não carregar, mostre um erro claro com a opção de tentar novamente, sem gastar uma reprodução.
- Avance com "Próximo áudio" quando as 2 perguntas estiverem respondidas.
- **Nível de escuta:** o maior nível em que a pessoa acertou as 2 perguntas (mínimo A1).

### Etapa 4: escrita
- **Nível estimado** = `round(nívelGramática × 0,6 + nívelEscuta × 0,4)`, limitado entre A1 e C1. Coloque essa conta numa função pura em `pontuacao.ts` com testes simples.
- Mostre o tema de escrita correspondente ao nível estimado (os 5 temas estão no protótipo).
- No campo de texto:
  - colar e arrastar texto ficam bloqueados, e as tentativas de colar são contadas;
  - corretor ortográfico e autocompletar ficam desligados;
  - mostre um contador de palavras.
- Quando o tempo acaba, o texto é enviado do jeito que estiver.

### Regras gerais do teste
- **Timer por etapa**, numa barra fixa no topo (formato `mm:ss`) que fica âmbar nos últimos 15%. Quando o tempo zera, a etapa vai para a próxima sozinha.
- **Progresso salvo no `localStorage`**: se a página recarregar, o teste continua de onde parou, com o tempo que restava.
- Conte as **trocas de aba** (`visibilitychange`) durante as etapas cronometradas. Isso só vai para a planilha; nunca puna a pessoa por isso.
- O teste só pode ser enviado uma vez. Depois do envio, a página mostra o resultado salvo e o botão "Refazer" fica escondido atrás de uma confirmação.
- Acessibilidade: tudo funciona pelo teclado, com foco visível e `prefers-reduced-motion` respeitado.
- Para testes de desenvolvimento, o parâmetro `?demo=1` divide os tempos por 6.

### Etapa 5: resultado
- O nível preliminar aparece grande: por exemplo, "B1 · *Intermediário*", com uma frase sobre o que a pessoa já consegue fazer (use os textos do protótipo).
- Mostre a escala A1 → C1 com o nível destacado e três blocos de resumo: gramática (acertos/total), escuta (acertos/total) e escrita ("em análise pela Thaís").
- Texto de próximo passo: "A Teacher Thaís lê sua escrita e confirma seu nível em até 48h. Depois, vocês fazem uma conversa rápida de 10 minutos pelo Meet. A turma abre quando tiver 3 ou 4 pessoas do seu nível com horário em comum."
- **Envio para a planilha:** acontece automaticamente quando a pessoa chega ao resultado, via `POST /api/nivelamento`. Mostre o estado discretamente ("Resultado salvo" ou "Tentando salvar…"). Se falhar, tente de novo até 3 vezes. Se ainda falhar, guarde no `localStorage` e tente na próxima visita. **O botão do WhatsApp funciona mesmo que a planilha falhe.**
- **Botão "Enviar resultado no WhatsApp"** → `https://wa.me/555591359494?text=...` com esta mensagem (sem o texto da escrita, que vai só para a planilha):

```
Oi, Teacher Thaís! Fiz o teste de nivelamento 😊
Código: {ID}
Nome: {nome}
Nível preliminar: {código} ({nome do nível})
Plano de interesse: {plano}
Tipo de turma: {Mista | Mesmo gênero | Tanto faz}
Objetivo: {objetivo}
Horários: {ex.: Ter noite, Qui noite, Sáb manhã}
```

- Inclua também um botão "Copiar mensagem", com alternativa de selecionar o texto caso a área de transferência falhe.
- **Código do teste:** `NIV-AAAAMMDD-XXXX`, com 4 caracteres aleatórios sem ambiguidade (sem 0/O nem 1/I). É gerado no navegador ao finalizar e enviado à planilha e ao WhatsApp, para a Thaís cruzar as duas informações.

---

## Parte 3: envio para o Google Sheets (sem banco de dados)

### Rota `POST /api/nivelamento`
- Recebe o JSON do teste e valida campos obrigatórios e tamanhos (limite o texto da escrita a 3.000 caracteres).
- Descarta em silêncio se o honeypot vier preenchido.
- Encaminha para a URL do Apps Script em `SHEETS_WEBHOOK_URL`, adicionando `secret: process.env.SHEETS_SECRET`. A URL e o segredo **nunca** chegam ao navegador.
- Faça um limite simples de taxa por IP em memória (por exemplo, 5 envios a cada 10 minutos).
- Responda `{ ok: true }` ou um erro com mensagem clara.
- Atenção: o Web App do Apps Script responde ao POST com um redirecionamento 302. O `fetch` do servidor precisa seguir esse redirecionamento e ler o JSON final.

### `apps-script/Codigo.gs`
Escreva o código completo do Apps Script com duas funções principais:

**`configurarPlanilha()`**: a Thaís executa uma vez. Cria e formata todas as abas abaixo. Se for executada de novo, não pode duplicar nada nem apagar dados.

**`doPost(e)`**: confere o `secret`, usa `LockService` para evitar duas gravações simultâneas, grava uma linha em **Respostas** e uma em **Detalhes** e devolve JSON.

#### Aba 1 · `Respostas` (uma linha por aluno; é a aba principal da Thaís)
Cabeçalho congelado, filtros ativados, a coluna Nome congelada, cabeçalhos agrupados por cor e colunas com largura ajustada. Os textos longos ficam cortados, sem quebrar a linha.

| # | Coluna | Preenchida por | Formato |
|---|---|---|---|
| A | ID | script | |
| B | Data/hora | script | `dd/mm/aaaa hh:mm`, fuso America/Sao_Paulo |
| C | **Status** | **Thaís** | lista: Novo · Escrita corrigida · Conversa agendada · Aguardando turma · Em turma · Desistiu. Valor inicial "Novo". Uma cor por status |
| D | Nome | script | |
| E | WhatsApp | script | só números com DDI 55, mais uma fórmula `HYPERLINK` para `wa.me` na coluna F |
| F | Abrir WhatsApp | fórmula | link clicável |
| G | E-mail | script | |
| H | Gênero | script | |
| I | Tipo de turma | script | Mista · Mesmo gênero · Tanto faz |
| J | Plano de interesse | script | |
| K | Objetivo | script | |
| L | Já estudou | script | |
| M | Nível preliminar | script | A1–C1 |
| N | **Nível final** | **Thaís** | lista A1–C1 |
| O | Nível efetivo | fórmula | `=SE(N="";M;N)`. Cor por nível (A1 → C1 em escala de uma cor) |
| P | Gramática | script | ex.: `14/20` |
| Q | Gramática % | script | porcentagem |
| R | Escuta | script | ex.: `6/8` |
| S | Escuta % | script | porcentagem |
| T | **Nota da escrita (1–5)** | **Thaís** | lista 1–5 |
| U | **Turma** | **Thaís** | texto livre, ex.: `B1-TER-NOITE-01` |
| V | **Observações** | **Thaís** | |
| W | Horários (resumo) | script | ex.: `Ter noite, Qui noite` |
| X–AO | 18 colunas de horário: `Seg manhã`, `Seg tarde`, `Seg noite` … `Sáb noite` | script | caixas de seleção (TRUE/FALSE) |
| AP | Duração (min) | script | |
| AQ | Trocas de aba | script | destaque em âmbar se for 3 ou mais |
| AR | Tentativas de colar | script | destaque em âmbar se for 1 ou mais |
| AS | Encerrado por tempo | script | etapas que zeraram, ex.: `Gramática, Escrita` |
| AT | Pode entrar em turma? | fórmula (oculta) | VERDADEIRO se Status for Novo, Escrita corrigida, Conversa agendada ou Aguardando turma |
| AU | Grupo mista? | fórmula (oculta) | Tipo = Mista ou Tanto faz |
| AV | Grupo mulheres? | fórmula (oculta) | Gênero = Mulher e Tipo = Mesmo gênero ou Tanto faz |
| AW | Grupo homens? | fórmula (oculta) | Gênero = Homem e Tipo = Mesmo gênero ou Tanto faz |

- Os cabeçalhos das colunas que a Thaís preenche (Status, Nível final, Nota da escrita, Turma, Observações) ficam com uma cor diferente e uma observação: "Preencha você".
- As fórmulas de O, F e AT–AW são escritas pelo script em cada linha nova (ou com `ARRAYFORMULA` no cabeçalho). Escolha a forma mais robusta e explique a escolha.

#### Aba 2 · `Turmas em formação` (só fórmulas; é aqui que a Thaís monta as turmas)
- Três quadros lado a lado ou empilhados: **Turma mista**, **Só mulheres** e **Só homens**.
- Cada quadro tem 18 linhas (os horários) e 5 colunas (A1 a C1). Cada célula conta quantas pessoas da aba Respostas podem entrar em turma, pertencem àquele grupo, têm aquele nível efetivo e marcaram aquele horário (`CONT.SES` usando as colunas auxiliares).
- Formatação condicional: 0 em cinza claro, 1–2 em neutro, **3 em âmbar ("dá para abrir")** e **4 ou mais em verde ("turma cheia")**.
- Embaixo dos quadros, uma lista automática **"Prontas para abrir"** com as combinações de grupo + nível + horário que têm 3 ou mais pessoas, ordenadas da maior para a menor. Ao lado de cada combinação, os nomes das pessoas (`FILTER` + `TEXTJOIN`).
- Uma legenda curta no topo explica como ler a aba.

#### Aba 3 · `Painel`
Números e pequenos resumos, todos com fórmulas:
- total de testes; testes nos últimos 7 dias e nos últimos 30 dias;
- quantidade de pessoas por nível efetivo;
- quantidade por plano de interesse;
- quantidade por status;
- quantidade por tipo de turma;
- porcentagem de pessoas "Em turma" sobre o total.

Inclua um gráfico de barras simples de pessoas por nível.

#### Aba 4 · `Detalhes` (dados brutos, protegida com aviso)
Uma linha por teste: ID, data, tema da escrita, **texto completo da escrita**, número de palavras e as respostas de gramática e de escuta, em formato legível. Exemplo: `A1-1 ✓ | A1-2 ✓ | A2-3 ✗ (marcou "had have", certa "were having")`.

Na aba Respostas, inclua uma coluna "Ver escrita" com um link para a linha correspondente em Detalhes, ou mostre a escrita como observação na célula do ID. Escolha a opção mais prática para a Thaís ler.

#### Aba 5 · `Como usar`
Um texto curto em português para a Thaís:
- o que significa cada status;
- quais colunas ela preenche;
- como ler a aba Turmas em formação;
- o fluxo recomendado: corrigir a escrita → definir o nível final → conversa de 10 min → "Aguardando turma" → quando a combinação ficar verde ou âmbar, chamar no WhatsApp → "Em turma" e preencher o código da turma.

---

## Parte 4: documentação e variáveis de ambiente

Crie `docs/SETUP-NIVELAMENTO.md` com um passo a passo **para alguém que não programa**:
1. Criar uma planilha nova no Google Drive da Thaís.
2. Abrir Extensões → Apps Script, colar `Codigo.gs` e definir o `SHEETS_SECRET` nas Propriedades do script.
3. Executar `configurarPlanilha` uma vez e autorizar o acesso.
4. Implantar como **App da Web**: executar como "eu", com acesso para "qualquer pessoa". Copiar a URL.
5. Colocar `SHEETS_WEBHOOK_URL` e `SHEETS_SECRET` nas variáveis de ambiente da Vercel e fazer um novo deploy.
6. Gerar os áudios: colocar `ELEVENLABS_API_KEY` no `.env.local`, rodar `node scripts/gerar-audios.mjs`, ouvir os arquivos e fazer o commit.
7. Fazer um teste completo com `?demo=1` e conferir a linha nova na planilha.

Crie também um `.env.example` com `SHEETS_WEBHOOK_URL`, `SHEETS_SECRET` e `ELEVENLABS_API_KEY`. A chave da ElevenLabs **não** vai para a Vercel, porque só é usada localmente pelo script.

---

## Critérios de pronto
- [ ] Planos com os 4 valores novos; o card de Turma leva para `/nivelamento?plano=turma`.
- [ ] Teste completo funcionando no celular (cerca de 375px) e no desktop, com o visual do site.
- [ ] Gramática adaptativa, áudios com limite de 2 reproduções, escrita com colar bloqueado e timers com envio automático.
- [ ] Recarregar a página no meio do teste não perde o progresso.
- [ ] Validação de "mesmo gênero" funcionando.
- [ ] A linha chega à planilha com todas as colunas, e a aba Turmas em formação conta corretamente.
- [ ] O WhatsApp abre com a mensagem certa, e o código do teste é o mesmo da planilha.
- [ ] Nenhuma chave ou URL secreta aparece no código do navegador.
- [ ] `npm run build` sem erros.

No final, me entregue um resumo do que mudou, a lista dos arquivos e o que eu preciso fazer manualmente (planilha, variáveis na Vercel e áudios).
