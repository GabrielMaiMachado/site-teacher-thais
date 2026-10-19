/**
 * Planilha do teste de nivelamento · Learn with Teacher Thaís
 *
 * Como usar (detalhes em docs/SETUP-NIVELAMENTO.md):
 *  1. Cole este arquivo em Extensões → Apps Script da planilha.
 *  2. Em Configurações do projeto → Propriedades do script, crie SHEETS_SECRET.
 *  3. Execute configurarPlanilha() uma vez e autorize.
 *  4. Implante como App da Web (executar como você, acesso: qualquer pessoa).
 *
 * configurarPlanilha() pode ser executada de novo sem duplicar nada e sem
 * apagar respostas: ela só refaz cabeçalhos, formatos e as abas de fórmulas.
 *
 * Fórmulas da aba Respostas: o script escreve as fórmulas em cada linha nova
 * (e não uma ARRAYFORMULA no cabeçalho). Assim, se a Thaís digitar sem querer
 * numa dessas colunas, só aquela linha é afetada — com ARRAYFORMULA, um único
 * valor digitado quebra a coluna inteira (#REF!). As fórmulas por linha também
 * acompanham a linha quando a planilha é ordenada ou filtrada.
 */

const ABA = {
  respostas: 'Respostas',
  turmas: 'Turmas em formação',
  painel: 'Painel',
  detalhes: 'Detalhes',
  comoUsar: 'Como usar',
};

const STATUS = [
  'Novo',
  'Escrita corrigida',
  'Conversa agendada',
  'Aguardando turma',
  'Em turma',
  'Desistiu',
];
const STATUS_PODE_ENTRAR = STATUS.slice(0, 4);

const CORES_STATUS = {
  'Novo': ['#E3ECF6', '#2F5D8C'],
  'Escrita corrigida': ['#EDE4F7', '#5B3C88'],
  'Conversa agendada': ['#FBF0DC', '#8A5A12'],
  'Aguardando turma': ['#FDE2E8', '#A23B5C'],
  'Em turma': ['#E1F1E8', '#2F7A55'],
  'Desistiu': ['#EEEEEE', '#777777'],
};

const NIVEIS = ['A1', 'A2', 'B1', 'B2', 'C1'];
// escala de uma cor só (rosa da marca), do mais claro ao mais escuro
const CORES_NIVEL = {
  A1: ['#FCE8EE', '#4A3039'],
  A2: ['#F8CFDB', '#4A3039'],
  B1: ['#F0A1B8', '#4A3039'],
  B2: ['#D9718F', '#FFFFFF'],
  C1: ['#A8486A', '#FFFFFF'],
};

const AMBAR = ['#FBF0DC', '#8A5A12'];
const VERDE = ['#CDEBD8', '#1F5C3D'];

const PLANOS = ['Turma de até 4', 'Dupla', 'Individual 1x', 'Individual 2x', 'Ainda não sei'];
const TIPOS_TURMA = ['Mista', 'Mesmo gênero', 'Tanto faz'];

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const TURNOS = ['manhã', 'tarde', 'noite'];
const HORARIOS = DIAS.flatMap((dia) => TURNOS.map((turno) => dia + ' ' + turno));

const COLUNAS = [
  'ID', 'Data/hora', 'Status', 'Nome', 'WhatsApp', 'Abrir WhatsApp', 'E-mail',
  'Gênero', 'Tipo de turma', 'Plano de interesse', 'Objetivo', 'Já estudou',
  'Nível preliminar', 'Nível final', 'Nível efetivo', 'Gramática', 'Gramática %',
  'Escuta', 'Escuta %', 'Nota da escrita (1–5)', 'Turma', 'Observações',
  'Horários (resumo)',
]
  .concat(HORARIOS)
  .concat([
    'Duração (min)', 'Trocas de aba', 'Tentativas de colar', 'Encerrado por tempo',
    'Pode entrar em turma?', 'Grupo mista?', 'Grupo mulheres?', 'Grupo homens?',
  ]);

// Número (1 = A) de cada coluna da aba Respostas, pelo nome.
const C = {};
COLUNAS.forEach((nome, i) => (C[nome] = i + 1));
const COL_PRIMEIRO_HORARIO = C['Seg manhã']; // X
const COLUNAS_DA_THAIS = ['Status', 'Nível final', 'Nota da escrita (1–5)', 'Turma', 'Observações'];

const COLUNAS_DETALHES = [
  'ID', 'Data/hora', 'Nível preliminar', 'Tema da escrita', 'Texto da escrita',
  'Palavras', 'Respostas de gramática', 'Respostas de escuta',
];

// ---------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Nivelamento')
    .addItem('Configurar / reformatar planilha', 'configurarPlanilha')
    .addToUi();
}

// ---------------------------------------------------------------------------
// Configuração (pode rodar quantas vezes quiser)
// ---------------------------------------------------------------------------

function configurarPlanilha() {
  // Localidade dos EUA: as fórmulas usam vírgula como separador, e com a
  // localidade Brasil (que espera ponto e vírgula) elas dão erro de análise.
  // O fuso continua o de São Paulo, para a coluna Data/hora sair certa.
  SpreadsheetApp.getActive().setSpreadsheetLocale('en_US');
  SpreadsheetApp.getActive().setSpreadsheetTimeZone('America/Sao_Paulo');
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const respostas = obterAba_(ss, ABA.respostas, 0);
  const turmas = obterAba_(ss, ABA.turmas, 1);
  const painel = obterAba_(ss, ABA.painel, 2);
  const detalhes = obterAba_(ss, ABA.detalhes, 3);
  const comoUsar = obterAba_(ss, ABA.comoUsar, 4);

  configurarRespostas_(respostas);
  configurarDetalhes_(detalhes);
  configurarTurmas_(turmas);
  configurarPainel_(painel);
  configurarComoUsar_(comoUsar);

  ss.setActiveSheet(respostas);
  try {
    ss.toast('Planilha pronta! Nenhuma resposta foi apagada.', 'Nivelamento', 5);
  } catch (e) {}
}

/** Pega a aba pelo nome ou cria. Na primeira vez, reaproveita a "Página1" vazia. */
function obterAba_(ss, nome, posicao) {
  let aba = ss.getSheetByName(nome);
  if (!aba) {
    const sheets = ss.getSheets();
    const vazia = sheets.length === 1 && sheets[0].getLastRow() === 0 &&
      !Object.values(ABA).includes(sheets[0].getName());
    aba = vazia ? sheets[0].setName(nome) : ss.insertSheet(nome);
  }
  ss.setActiveSheet(aba);
  ss.moveActiveSheet(posicao + 1);
  return aba;
}

function letra_(coluna) {
  let s = '';
  while (coluna > 0) {
    const m = (coluna - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    coluna = Math.floor((coluna - 1) / 26);
  }
  return s;
}

function garantirColunas_(aba, quantidade) {
  if (aba.getMaxColumns() < quantidade) {
    aba.insertColumnsAfter(aba.getMaxColumns(), quantidade - aba.getMaxColumns());
  }
}

function configurarRespostas_(aba) {
  garantirColunas_(aba, COLUNAS.length);
  const total = COLUNAS.length;
  const linhas = aba.getMaxRows();

  // Cabeçalho (só a linha 1; os dados não são tocados)
  const cabecalho = aba.getRange(1, 1, 1, total);
  cabecalho.setValues([COLUNAS])
    .setFontWeight('bold')
    .setFontColor('#4A3039')
    .setVerticalAlignment('middle')
    .setWrap(true)
    .clearNote();
  aba.setRowHeight(1, 44);

  // Cores por grupo de colunas
  const grupos = [
    ['ID', 'Data/hora', '#E8E3E5'],
    ['Nome', 'E-mail', '#DCE7F2'],
    ['Gênero', 'Já estudou', '#E6EFE3'],
    ['Nível preliminar', 'Escuta %', '#F7E8C8'],
    ['Horários (resumo)', 'Sáb noite', '#E9E4F3'],
    ['Duração (min)', 'Encerrado por tempo', '#F3E3D3'],
    ['Pode entrar em turma?', 'Grupo homens?', '#EEEEEE'],
  ];
  grupos.forEach(([de, ate, cor]) => {
    aba.getRange(1, C[de], 1, C[ate] - C[de] + 1).setBackground(cor);
  });
  COLUNAS_DA_THAIS.forEach((nome) => {
    aba.getRange(1, C[nome])
      .setBackground('#F0A1B8')
      .setNote('Preencha você');
  });

  aba.setFrozenRows(1);
  aba.setFrozenColumns(C['Nome']); // A até D: ID, data, status e nome sempre visíveis

  // Textos longos cortados, sem quebrar a linha
  aba.getRange(2, 1, linhas - 1, total).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

  // Formatos
  aba.getRange(2, C['Data/hora'], linhas - 1).setNumberFormat('dd/mm/yyyy hh:mm');
  aba.getRange(2, C['WhatsApp'], linhas - 1).setNumberFormat('@');
  aba.getRange(2, C['Gramática'], linhas - 1).setNumberFormat('@');
  aba.getRange(2, C['Escuta'], linhas - 1).setNumberFormat('@');
  aba.getRange(2, C['Gramática %'], linhas - 1).setNumberFormat('0%');
  aba.getRange(2, C['Escuta %'], linhas - 1).setNumberFormat('0%');
  [C['Status'], C['Nível final'], C['Nível efetivo'], C['Nível preliminar'], C['Nota da escrita (1–5)']]
    .forEach((c) => aba.getRange(2, c, linhas - 1).setHorizontalAlignment('center'));

  // Listas suspensas das colunas da Thaís
  const lista = (valores) => SpreadsheetApp.newDataValidation()
    .requireValueInList(valores, true).setAllowInvalid(false).build();
  aba.getRange(2, C['Status'], linhas - 1).setDataValidation(lista(STATUS));
  aba.getRange(2, C['Nível final'], linhas - 1).setDataValidation(lista(NIVEIS));
  aba.getRange(2, C['Nota da escrita (1–5)'], linhas - 1)
    .setDataValidation(lista(['1', '2', '3', '4', '5']));

  // Larguras
  const larguras = {
    'ID': 150, 'Data/hora': 120, 'Status': 150, 'Nome': 170, 'WhatsApp': 120,
    'Abrir WhatsApp': 90, 'E-mail': 180, 'Gênero': 110, 'Tipo de turma': 120,
    'Plano de interesse': 130, 'Objetivo': 170, 'Já estudou': 150,
    'Nível preliminar': 80, 'Nível final': 80, 'Nível efetivo': 80,
    'Gramática': 80, 'Gramática %': 80, 'Escuta': 70, 'Escuta %': 70,
    'Nota da escrita (1–5)': 90, 'Turma': 150, 'Observações': 220,
    'Horários (resumo)': 220, 'Duração (min)': 80, 'Trocas de aba': 80,
    'Tentativas de colar': 90, 'Encerrado por tempo': 150,
  };
  Object.keys(larguras).forEach((nome) => aba.setColumnWidth(C[nome], larguras[nome]));
  aba.setColumnWidths(COL_PRIMEIRO_HORARIO, HORARIOS.length, 74);

  // Colunas auxiliares (usadas pela aba Turmas em formação) ficam ocultas
  aba.hideColumns(C['Pode entrar em turma?'], 4);

  // Formatação condicional (substitui as regras anteriores: não duplica)
  const regras = [];
  const colunaInteira = (nome) => aba.getRange(2, C[nome], linhas - 1);
  STATUS.forEach((status) => {
    regras.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(status)
      .setBackground(CORES_STATUS[status][0]).setFontColor(CORES_STATUS[status][1])
      .setRanges([colunaInteira('Status')]).build());
  });
  NIVEIS.forEach((nivel) => {
    regras.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(nivel)
      .setBackground(CORES_NIVEL[nivel][0]).setFontColor(CORES_NIVEL[nivel][1])
      .setRanges([colunaInteira('Nível efetivo')]).build());
  });
  regras.push(SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThanOrEqualTo(3)
    .setBackground(AMBAR[0]).setFontColor(AMBAR[1])
    .setRanges([colunaInteira('Trocas de aba')]).build());
  regras.push(SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThanOrEqualTo(1)
    .setBackground(AMBAR[0]).setFontColor(AMBAR[1])
    .setRanges([colunaInteira('Tentativas de colar')]).build());
  aba.setConditionalFormatRules(regras);

  // Filtro em todas as linhas (recria para cobrir colunas novas)
  if (aba.getFilter()) aba.getFilter().remove();
  aba.getRange(1, 1, linhas, total).createFilter();
}

function configurarDetalhes_(aba) {
  garantirColunas_(aba, COLUNAS_DETALHES.length);
  aba.getRange(1, 1, 1, COLUNAS_DETALHES.length)
    .setValues([COLUNAS_DETALHES])
    .setFontWeight('bold')
    .setBackground('#E8E3E5')
    .setFontColor('#4A3039');
  aba.setFrozenRows(1);
  aba.setFrozenColumns(1);
  const linhas = aba.getMaxRows();
  aba.getRange(2, 2, linhas - 1).setNumberFormat('dd/mm/yyyy hh:mm');
  aba.getRange(2, 1, linhas - 1, COLUNAS_DETALHES.length).setVerticalAlignment('top');
  aba.getRange(2, 5, linhas - 1).setWrap(true); // texto da escrita
  [150, 120, 80, 280, 520, 80, 520, 520].forEach((largura, i) => aba.setColumnWidth(i + 1, largura));

  // Protegida só com aviso: dá para editar, mas o Sheets pergunta antes.
  const jaProtegida = aba.getProtections(SpreadsheetApp.ProtectionType.SHEET).length > 0;
  if (!jaProtegida) {
    aba.protect()
      .setDescription('Dados brutos do teste. Edite só se tiver certeza.')
      .setWarningOnly(true);
  }
}

function configurarTurmas_(aba) {
  // Aba só de fórmulas: pode ser refeita do zero sem perder nada.
  aba.getRange(1, 1, aba.getMaxRows(), aba.getMaxColumns()).breakApart();
  aba.clear();
  aba.clearConditionalFormatRules();
  garantirColunas_(aba, 12);
  aba.showColumns(1, aba.getMaxColumns());

  const R = "Respostas!";
  const fim = '$2:$';
  const ref = (nome) => R + '$' + letra_(C[nome]) + fim + letra_(C[nome]);
  const refHorario = (indice) => {
    const l = letra_(COL_PRIMEIRO_HORARIO + indice);
    return R + '$' + l + fim + l;
  };

  aba.getRange('A1').setValue('Turmas em formação').setFontSize(16).setFontWeight('bold');
  aba.getRange('A2').setValue(
    'Cada número mostra quantas pessoas podem entrar em turma (status Novo, Escrita corrigida, ' +
    'Conversa agendada ou Aguardando turma), daquele grupo, com aquele nível efetivo e que ' +
    'marcaram aquele horário. Uma pessoa aparece em vários horários se marcou vários.'
  ).setFontColor('#6B4653');
  aba.getRange('A3:E3')
    .setValues([['Legenda:', '0 · ninguém', '1–2 · ainda não fecha', '3 · dá para abrir', '4+ · turma cheia']])
    .setBackgrounds([['#FFFFFF', '#F2F2F2', '#FFFFFF', AMBAR[0], VERDE[0]]])
    .setFontColors([['#4A3039', '#999999', '#4A3039', AMBAR[1], VERDE[1]]])
    .setFontWeight('bold');

  const grupos = [
    { nome: 'Turma mista', rotulo: 'Mista', coluna: 'Grupo mista?' },
    { nome: 'Só mulheres', rotulo: 'Só mulheres', coluna: 'Grupo mulheres?' },
    { nome: 'Só homens', rotulo: 'Só homens', coluna: 'Grupo homens?' },
  ];

  const ALTURA_QUADRO = 2 + HORARIOS.length + 1; // título, cabeçalho, 18 linhas, espaço
  const LINHA_AUX = 6; // tabela auxiliar oculta em H:L, uma linha por combinação
  const aux = [];
  const intervalosQuadros = [];

  grupos.forEach((grupo, g) => {
    const topo = 5 + g * ALTURA_QUADRO;
    aba.getRange(topo, 1, 1, 6).merge()
      .setValue(grupo.nome).setFontWeight('bold').setFontSize(12)
      .setBackground('#4A3039').setFontColor('#FFF8FA');
    aba.getRange(topo + 1, 1, 1, 6)
      .setValues([['Horário'].concat(NIVEIS)])
      .setFontWeight('bold').setBackground('#FBEFF3').setHorizontalAlignment('center');

    const formulas = HORARIOS.map((horario, h) => {
      const linha = topo + 2 + h;
      return [horario].concat(NIVEIS.map((nivel, n) => {
        const celula = letra_(2 + n) + linha;
        aux.push([
          grupo.rotulo,
          nivel,
          horario,
          '=' + celula,
          '=IF(' + letra_(11) + (LINHA_AUX + aux.length) + '>=3,IFERROR(TEXTJOIN(", ",TRUE,FILTER(' +
            ref('Nome') + ',' + ref('Pode entrar em turma?') + '=TRUE,' + ref(grupo.coluna) + '=TRUE,' +
            ref('Nível efetivo') + '="' + nivel + '",' + refHorario(h) + '=TRUE)),""),"")',
        ]);
        return '=COUNTIFS(' + ref('Pode entrar em turma?') + ',TRUE,' + ref(grupo.coluna) + ',TRUE,' +
          ref('Nível efetivo') + ',"' + nivel + '",' + refHorario(h) + ',TRUE)';
      }));
    });
    aba.getRange(topo + 2, 2, HORARIOS.length, 5)
      .setFormulas(formulas.map((linha) => linha.slice(1)));
    aba.getRange(topo + 2, 1, HORARIOS.length, 1)
      .setValues(HORARIOS.map((h) => [h])).setFontWeight('bold');
    aba.getRange(topo + 2, 2, HORARIOS.length, 5).setHorizontalAlignment('center');
    intervalosQuadros.push(aba.getRange(topo + 2, 2, HORARIOS.length, 5));
  });

  // Tabela auxiliar (oculta): grupo, nível, horário, pessoas, nomes
  const auxRange = aba.getRange(LINHA_AUX, 8, aux.length, 5);
  auxRange.setValues(aux.map((l) => [l[0], l[1], l[2], '', '']));
  aba.getRange(LINHA_AUX, 11, aux.length, 2).setFormulas(aux.map((l) => [l[3], l[4]]));
  aba.getRange(LINHA_AUX - 1, 8, 1, 5)
    .setValues([['Grupo', 'Nível', 'Horário', 'Pessoas', 'Nomes']]).setFontWeight('bold');
  aba.hideColumns(8, 5);

  // Lista "Prontas para abrir"
  const topoLista = 5 + grupos.length * ALTURA_QUADRO;
  aba.getRange(topoLista, 1, 1, 6).merge()
    .setValue('Prontas para abrir (3 ou mais pessoas)').setFontWeight('bold').setFontSize(12)
    .setBackground('#4A3039').setFontColor('#FFF8FA');
  aba.getRange(topoLista + 1, 1, 1, 5)
    .setValues([['Grupo', 'Nível', 'Horário', 'Pessoas', 'Nomes']])
    .setFontWeight('bold').setBackground('#FBEFF3');
  const fimAux = LINHA_AUX + aux.length - 1;
  aba.getRange(topoLista + 2, 1).setFormula(
    '=IFERROR(SORT(FILTER(H' + LINHA_AUX + ':L' + fimAux + ',K' + LINHA_AUX + ':K' + fimAux +
    '>=3),4,FALSE),"Nenhuma combinação com 3 ou mais pessoas ainda.")'
  );

  // Cores: 0 cinza, 1–2 neutro, 3 âmbar, 4+ verde
  const regras = [
    SpreadsheetApp.newConditionalFormatRule().whenNumberEqualTo(0)
      .setBackground('#F2F2F2').setFontColor('#BBBBBB').setRanges(intervalosQuadros).build(),
    SpreadsheetApp.newConditionalFormatRule().whenNumberEqualTo(3)
      .setBackground(AMBAR[0]).setFontColor(AMBAR[1]).setBold(true).setRanges(intervalosQuadros).build(),
    SpreadsheetApp.newConditionalFormatRule().whenNumberGreaterThanOrEqualTo(4)
      .setBackground(VERDE[0]).setFontColor(VERDE[1]).setBold(true).setRanges(intervalosQuadros).build(),
  ];
  aba.setConditionalFormatRules(regras);

  aba.setColumnWidth(1, 120);
  aba.setColumnWidths(2, 5, 70);
  aba.setColumnWidth(5, 110);
  aba.setColumnWidth(6, 70);
  aba.getRange('A2:F2').merge().setWrap(true);
  aba.setRowHeight(2, 54);
  aba.getRange(topoLista + 2, 5, 200, 1).setWrapStrategy(SpreadsheetApp.WrapStrategy.OVERFLOW);
  aba.setFrozenRows(0);
}

function configurarPainel_(aba) {
  aba.clear();
  aba.getCharts().forEach((grafico) => aba.removeChart(grafico));

  const R = 'Respostas!';
  aba.getRange('A1').setValue('Painel').setFontSize(16).setFontWeight('bold');

  aba.getRange('A3:B6').setValues([
    ['Total de testes', ''],
    ['Últimos 7 dias', ''],
    ['Últimos 30 dias', ''],
    ['Em turma (% do total)', ''],
  ]);
  aba.getRange('B3:B6').setFormulas([
    ['=COUNTA(' + R + 'A2:A)'],
    ['=COUNTIFS(' + R + 'B2:B,">="&(NOW()-7))'],
    ['=COUNTIFS(' + R + 'B2:B,">="&(NOW()-30))'],
    ['=IFERROR(COUNTIF(' + R + 'C2:C,"Em turma")/B3,0)'],
  ]);
  aba.getRange('B6').setNumberFormat('0%');
  aba.getRange('A3:A6').setFontWeight('bold');
  aba.getRange('B3:B6').setFontSize(14).setHorizontalAlignment('left');

  const tabela = (coluna, titulo, valores, colunaRespostas) => {
    const l = letra_(coluna);
    aba.getRange(8, coluna, 1, 2).setValues([[titulo, 'Pessoas']])
      .setFontWeight('bold').setBackground('#FBEFF3');
    aba.getRange(9, coluna, valores.length, 1).setValues(valores.map((v) => [v]));
    aba.getRange(9, coluna + 1, valores.length, 1).setFormulas(valores.map((_, i) =>
      ['=COUNTIF(' + R + colunaRespostas + '2:' + colunaRespostas + ',' + l + (9 + i) + ')']));
  };
  tabela(1, 'Nível efetivo', NIVEIS, letra_(C['Nível efetivo']));
  tabela(4, 'Plano de interesse', PLANOS, letra_(C['Plano de interesse']));
  tabela(7, 'Status', STATUS, letra_(C['Status']));
  tabela(10, 'Tipo de turma', TIPOS_TURMA, letra_(C['Tipo de turma']));

  [1, 4, 7, 10].forEach((c) => aba.setColumnWidth(c, 170));
  [2, 5, 8, 11].forEach((c) => aba.setColumnWidth(c, 70));
  [3, 6, 9].forEach((c) => aba.setColumnWidth(c, 24));

  const grafico = aba.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(aba.getRange('A8:B13'))
    .setNumHeaders(1)
    .setPosition(17, 1, 0, 0)
    .setOption('title', 'Pessoas por nível')
    .setOption('legend', { position: 'none' })
    .setOption('colors', ['#C96D8A'])
    .build();
  aba.insertChart(grafico);
}

function configurarComoUsar_(aba) {
  aba.clear();
  const linhas = [
    ['Como usar esta planilha', 'titulo'],
    ['', ''],
    ['O fluxo recomendado', 'secao'],
    ['1. Chegou teste novo (Status "Novo"). Leia a escrita: passe o mouse no ID para ver o texto, ou clique no ID para abrir a linha na aba Detalhes.', ''],
    ['2. Dê a nota da escrita (1–5) e defina o Nível final. Mude o Status para "Escrita corrigida".', ''],
    ['3. Chame a pessoa no WhatsApp (coluna "Abrir WhatsApp") e marque a conversa de 10 min pelo Meet. Status: "Conversa agendada".', ''],
    ['4. Depois da conversa, se estiver tudo certo, Status: "Aguardando turma".', ''],
    ['5. Acompanhe a aba "Turmas em formação". Quando uma combinação ficar âmbar (3 pessoas) ou verde (4+), chame as pessoas no WhatsApp.', ''],
    ['6. Quem fechar: Status "Em turma" e preencha a coluna Turma com um código, por exemplo B1-TER-NOITE-01.', ''],
    ['', ''],
    ['O que significa cada status', 'secao'],
    ['Novo: acabou de fazer o teste, ninguém olhou ainda.', ''],
    ['Escrita corrigida: você já leu a escrita e definiu o nível final.', ''],
    ['Conversa agendada: a conversa de 10 minutos está marcada.', ''],
    ['Aguardando turma: nível confirmado, esperando fechar 3 ou 4 pessoas.', ''],
    ['Em turma: já está numa turma (não aparece mais em Turmas em formação).', ''],
    ['Desistiu: não quer mais ou não respondeu (não aparece em Turmas em formação).', ''],
    ['', ''],
    ['Colunas que você preenche (cabeçalho rosa)', 'secao'],
    ['Status, Nível final, Nota da escrita (1–5), Turma e Observações. Todo o resto é preenchido sozinho — evite editar.', ''],
    ['Nível efetivo = o Nível final, se você preencheu; senão, o Nível preliminar do teste. É ele que conta para montar turmas.', ''],
    ['Trocas de aba (âmbar a partir de 3) e Tentativas de colar (âmbar a partir de 1) são só um sinal para você conversar com a pessoa. Ninguém é reprovado por isso.', ''],
    ['', ''],
    ['Como ler a aba Turmas em formação', 'secao'],
    ['São três quadros: Turma mista, Só mulheres e Só homens. Cada linha é um horário e cada coluna um nível.', ''],
    ['O número é quantas pessoas daquele grupo, daquele nível, marcaram aquele horário e ainda podem entrar em turma.', ''],
    ['Quem escolheu "Tanto faz" aparece no quadro misto e no do seu gênero. A mesma pessoa pode aparecer em vários horários.', ''],
    ['Cinza = 0 · sem cor = 1 ou 2 · âmbar = 3, dá para abrir · verde = 4 ou mais, turma cheia.', ''],
    ['Embaixo dos quadros, "Prontas para abrir" lista as combinações com 3+ pessoas e os nomes de quem está nelas.', ''],
    ['', ''],
    ['Se algo quebrar a formatação, use o menu Nivelamento → Configurar / reformatar planilha. Nenhuma resposta é apagada.', 'nota'],
  ];
  aba.getRange(1, 1, linhas.length, 1).setValues(linhas.map((l) => [l[0]]));
  aba.setColumnWidth(1, 900);
  aba.getRange(1, 1, linhas.length, 1).setWrap(true).setVerticalAlignment('middle');
  linhas.forEach((l, i) => {
    const celula = aba.getRange(i + 1, 1);
    if (l[1] === 'titulo') celula.setFontSize(16).setFontWeight('bold');
    if (l[1] === 'secao') celula.setFontWeight('bold').setBackground('#FBEFF3').setFontColor('#BF5D7D');
    if (l[1] === 'nota') celula.setFontStyle('italic').setFontColor('#6B4653');
  });
}

// ---------------------------------------------------------------------------
// Recebimento dos testes (Web App)
// ---------------------------------------------------------------------------

function doGet() {
  return json_({ ok: true, mensagem: 'Planilha de nivelamento no ar.' });
}

function doPost(e) {
  let dados;
  try {
    dados = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, erro: 'JSON inválido' });
  }

  const segredo = PropertiesService.getScriptProperties().getProperty('SHEETS_SECRET');
  if (!segredo || dados.secret !== segredo) {
    return json_({ ok: false, erro: 'Não autorizado' });
  }

  const trava = LockService.getScriptLock();
  try {
    trava.waitLock(30000);
  } catch (err) {
    return json_({ ok: false, erro: 'Planilha ocupada, tente de novo' });
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss.getSheetByName(ABA.respostas) || !ss.getSheetByName(ABA.detalhes)) {
      configurarPlanilha();
    }
    const respostas = ss.getSheetByName(ABA.respostas);
    const detalhes = ss.getSheetByName(ABA.detalhes);

    // O site pode tentar de novo depois de uma falha de rede: não duplica.
    const existente = respostas.getRange('A2:A').createTextFinder(String(dados.id))
      .matchEntireCell(true).findNext();
    if (existente) return json_({ ok: true, duplicado: true });

    const agora = new Date();
    const linhaDetalhes = gravarDetalhes_(detalhes, dados, agora);
    gravarResposta_(respostas, dados, agora, detalhes.getSheetId(), linhaDetalhes);
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, erro: String(err) });
  } finally {
    trava.releaseLock();
  }
}

function gravarDetalhes_(aba, d, agora) {
  const linha = aba.getLastRow() + 1;
  aba.getRange(linha, 1, 1, COLUNAS_DETALHES.length).setValues([[
    d.id, agora, d.nivelPreliminar, d.temaEscrita, d.textoEscrita || '(em branco)',
    d.palavras, d.respostasGramatica, d.respostasEscuta,
  ]]);
  return linha;
}

function gravarResposta_(aba, d, agora, gidDetalhes, linhaDetalhes) {
  const r = aba.getLastRow() + 1;
  const pct = (acertos, total) => (total ? acertos / total : 0);
  const marcados = d.horarios || [];

  const valores = new Array(COLUNAS.length).fill('');
  const set = (nome, valor) => (valores[C[nome] - 1] = valor);
  set('ID', d.id);
  set('Data/hora', agora);
  set('Status', 'Novo');
  set('Nome', d.nome);
  set('WhatsApp', String(d.whatsapp));
  set('E-mail', d.email);
  set('Gênero', d.genero);
  set('Tipo de turma', d.tipoTurma);
  set('Plano de interesse', d.plano);
  set('Objetivo', d.objetivo);
  set('Já estudou', d.jaEstudou);
  set('Nível preliminar', d.nivelPreliminar);
  set('Gramática', d.gramaticaAcertos + '/' + d.gramaticaTotal);
  set('Gramática %', pct(d.gramaticaAcertos, d.gramaticaTotal));
  set('Escuta', d.escutaAcertos + '/' + d.escutaTotal);
  set('Escuta %', pct(d.escutaAcertos, d.escutaTotal));
  set('Horários (resumo)', marcados.join(', '));
  HORARIOS.forEach((h) => set(h, marcados.indexOf(h) >= 0));
  set('Duração (min)', d.duracaoMin);
  set('Trocas de aba', d.trocasDeAba);
  set('Tentativas de colar', d.tentativasColar);
  set('Encerrado por tempo', d.encerradoPorTempo);

  // insertCheckboxes zera os valores, então vem antes do setValues
  aba.getRange(r, COL_PRIMEIRO_HORARIO, 1, HORARIOS.length).insertCheckboxes();
  aba.getRange(r, 1, 1, COLUNAS.length).setValues([valores]);

  // Fórmulas da linha (sintaxe em inglês, que o Apps Script sempre aceita)
  const formula = (nome, f) => aba.getRange(r, C[nome]).setFormula(f);
  const cel = (nome) => letra_(C[nome]) + r;
  formula('Abrir WhatsApp', '=HYPERLINK("https://wa.me/"&' + cel('WhatsApp') + ',"Abrir")');
  formula('Nível efetivo', '=IF(' + cel('Nível final') + '="",' + cel('Nível preliminar') + ',' + cel('Nível final') + ')');
  formula('Pode entrar em turma?', '=OR(' + STATUS_PODE_ENTRAR.map((s) => cel('Status') + '="' + s + '"').join(',') + ')');
  formula('Grupo mista?', '=OR(' + cel('Tipo de turma') + '="Mista",' + cel('Tipo de turma') + '="Tanto faz")');
  formula('Grupo mulheres?', '=AND(' + cel('Gênero') + '="Mulher",OR(' + cel('Tipo de turma') + '="Mesmo gênero",' + cel('Tipo de turma') + '="Tanto faz"))');
  formula('Grupo homens?', '=AND(' + cel('Gênero') + '="Homem",OR(' + cel('Tipo de turma') + '="Mesmo gênero",' + cel('Tipo de turma') + '="Tanto faz"))');

  // "Ver escrita": o ID vira link para a linha em Detalhes, e a escrita
  // aparece como observação ao passar o mouse.
  const celulaId = aba.getRange(r, C['ID']);
  celulaId.setRichTextValue(SpreadsheetApp.newRichTextValue()
    .setText(d.id)
    .setLinkUrl('#gid=' + gidDetalhes + '&range=A' + linhaDetalhes)
    .build());
  celulaId.setNote('Tema: ' + d.temaEscrita + '\n\n' + (d.textoEscrita || '(em branco)') +
    '\n\n(' + d.palavras + ' palavras · clique no ID para abrir em Detalhes)');
}

function json_(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}
