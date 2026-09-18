// Leitura "inteligente" de arquivos CSV, Excel (.xlsx/.xls), Word (.docx) e
// JSON para importação em lote de turmas e confrontos/chaveamento.
//
// O arquivo enviado pela escola normalmente tem várias abas/tópicos (regras,
// instruções, outras tabelas) além da tabela que realmente interessa. Este
// módulo varre todo o conteúdo, localiza automaticamente as tabelas de
// "turmas" e de "confrontos/chaveamento" (onde quer que estejam) e ignora o
// resto — sem exigir que a planilha siga um layout fixo.
//
// Também entende notação de turmas compostas usadas em chaveamentos reais,
// como "7ºA/B/C" ou "7 A/B/C/D": cada letra é uma turma diferente, mas todas
// jogam unidas numa mesma modalidade/confronto (quantidade de turmas unidas
// é ilimitada).
import * as XLSX from "xlsx";
import * as mammoth from "mammoth";
import { categoriaDaSerie, serieLabel } from "./jesConfig.js";

const EXTENSOES_ACEITAS = [".csv", ".xlsx", ".xls", ".docx", ".json"];
export const ACCEPT_ARQUIVO = EXTENSOES_ACEITAS.join(",");

function normalizarChave(k) {
  return String(k ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]+/g, "");
}

function normalizarLinha(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj ?? {})) {
    out[normalizarChave(k)] = typeof v === "string" ? v.trim() : v;
  }
  return out;
}

function hashCurto(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/** Converte texto solto (ex.: "7", "7º Ano", "7EF", "1º EM") na série canônica usada pelo sistema. */
function normalizarSerie(bruto) {
  const s = String(bruto ?? "").toUpperCase();
  const direto = s.match(/([1-9])\s*(EF|EM)\b/);
  if (direto) return `${direto[1]}${direto[2]}`;
  const digito = s.match(/[1-9]/);
  if (!digito) return null;
  const d = digito[0];
  if (/M[EÉ]DIO/.test(s)) return `${d}EM`;
  if (/FUNDAMENTAL/.test(s)) return `${d}EF`;
  // Neste sistema só existem 6º-9º no Fundamental e 1º-3º no Médio, então o
  // dígito sozinho já é suficiente para decidir sem ambiguidade.
  return ["6", "7", "8", "9"].includes(d) ? `${d}EF` : `${d}EM`;
}

/** Extrai letras de turma de um texto como "A/B/C", "A, B e C" ou "A-B-C". */
function extrairLetras(bruto) {
  return String(bruto ?? "")
    .toUpperCase()
    .split(/[/,]+|\s+E\s+|-/)
    .map((x) => x.trim())
    .filter((x) => /^[A-Z]$/.test(x));
}

/**
 * Interpreta um texto de turma(s) composta(s), incluindo o formato usado nas
 * tabelas reais de chaveamento (coluna "EQUIPE"), onde depois das letras vem
 * o local/unidade da turma, ex.:
 *   "7ºA/B/C"                        (formato simples, sem local)
 *   "7 A/B/C/D"
 *   "7º D/E – Benedito/Centro"       (travessão + local)
 *   "1ª E/F/G/H    Benedito/Centro"  (série do médio, só espaços, sem travessão)
 *   "6º C – Benedito/Centro"
 * O bloco de letras é sempre a sequência de letras isoladas separadas por "/"
 * logo após o número/ordinal; qualquer texto depois disso (local, unidade,
 * travessão "–"/"—", espaços) é apenas descartado — não faz parte da turma.
 * Retorna { serie, letras[] } ou null se não reconhecer.
 */
export function parseTurmaComposta(bruto) {
  const texto = String(bruto ?? "").trim();
  if (!texto || !/\d/.test(texto)) return null;
  const serie = normalizarSerie(texto);
  const paisDaSerie = serieSelecao[serie];
  if (!serie) return null;

  const limpo = texto
    .toUpperCase()
    .replace(/[–—−]/g, "-") // travessões variados -> hífen simples
    .replace(/\s+/g, " ")
    .trim();

  const semPrefixo = limpo
    .replace(/^[1-9]\s*[º°ª]?\.?\s*/, "") // número + ordinal (º/°/ª), ex.: "7º ", "1ª "
    .replace(/^(ANOS?|S[ÉE]RIE)\s*/, "") // palavra auxiliar opcional
    .trim();

  // Bloco de letras isoladas separadas por "/", logo no início do que sobrou.
  // Tudo depois disso (travessão, espaços, nome do local/unidade) é ignorado.
  const blocoLetras = semPrefixo.match(/^([A-Z](?:\s*\/\s*[A-Z])*)/);
  if (!blocoLetras) return null;

  const letras = extrairLetras(blocoLetras[1]);
  if (!letras.length) return null;
  return { serie, letras: [...new Set(letras)] };
}

const PAISES_VALIDOS = ["br", "ar", "de", "it", "fr", "uy", "eng", "es"];

// ---------------------------------------------------------------------------
// Detecção automática de tabelas dentro de uma matriz de linhas x colunas
// (uma aba de planilha, ou uma tabela extraída de um .docx). Localiza a(s)
// linha(s) de cabeçalho pelo nome das colunas e agrupa as linhas seguintes
// como dados daquele bloco, até o próximo cabeçalho (ou fim da tabela).
// Linhas antes do primeiro cabeçalho (títulos, instruções, tópicos) e linhas
// em branco são ignoradas.
// ---------------------------------------------------------------------------

const TURMA_EXATAS = new Set(["turma", "turmas"]);
const CHAVES_TURMA = [
  "serie",
  "letra",
  "nome",
  "categoria",
  "paiskey",
  "pais",
  "selecao",
  "juncao",
];

const CHAVES_CONFRONTO = [
  "turmaa",
  "turmab",
  "time",
  "equipe",
  "mandante",
  "visitante",
  "adversario",
  "confronto",
  "chave",
  "jogo",
  "grupo",
  "campo",
  "quadra",
  "local",
  "data",
  "hora",
  "fase",
  "modalidade",
];

/**
 * Reconhece o layout padrão das tabelas reais de jogos (o mesmo usado pela
 * escola nos arquivos .docx/.xlsx de chaveamento), com pequenas variações de
 * nome de coluna, ex.:
 *   CAMPO | Nº DO JOGO | EQUIPE | (X) | EQUIPE
 *   QUADRA | JOGO Nº | TIME A | X | TIME B
 * Esse cabeçalho tem a coluna de time/equipe repetida (lado A e lado B), então
 * não dá para mapear por nome de coluna (um sobrescreveria o outro) — aqui a
 * leitura é posicional: a primeira ocorrência é o lado A e a última é o lado
 * B, e qualquer coluna entre elas (vazia ou "X"/"VS") é só separador visual.
 * Retorna os índices das colunas ou null se a linha não for esse cabeçalho.
 */
function detectarCabecalhoJogos(celulas) {
  const normalizadas = celulas.map(normalizarChave);
  const idxCampo = normalizadas.findIndex(
    (c) => c.includes("campo") || c.includes("quadra"),
  );
  const idxTimes = [];
  normalizadas.forEach((c, i) => {
    if (!c) return;
    if (
      c.includes("equipe") ||
      c.includes("time") ||
      c.includes("mandante") ||
      c.includes("visitante")
    ) {
      idxTimes.push(i);
    }
  });
  if (idxCampo === -1 || idxTimes.length < 2) return null;

  const idxJogo = normalizadas.findIndex(
    (c, idx) =>
      c.includes("jogo") && idx !== idxCampo && !idxTimes.includes(idx),
  );
  const idxGrupo = normalizadas.findIndex(
    (c, idx) =>
      c.includes("grupo") &&
      idx !== idxCampo &&
      idx !== idxJogo &&
      !idxTimes.includes(idx),
  );

  console.log(idxGrupo);
  return {
    idxCampo,
    idxJogo: idxJogo === -1 ? null : idxJogo,
    idxEquipeA: idxTimes[0],
    idxEquipeB: idxTimes[idxTimes.length - 1],
    idxGrupo: idxGrupo === -1 ? null : idxGrupo,
  };
}

function pontuarCabecalho(celulas) {
  let turma = 0;
  let confronto = 0;
  let preenchidas = 0;
  for (const c of celulas) {
    const k = normalizarChave(c);
    if (!k) continue;
    preenchidas++;
    if (TURMA_EXATAS.has(k) || CHAVES_TURMA.some((chave) => k.includes(chave)))
      turma++;
    if (CHAVES_CONFRONTO.some((chave) => k.includes(chave))) confronto++;
  }
  return { turma, confronto, preenchidas };
}

/** Recebe uma matriz (array de arrays) e devolve os blocos de tabela reconhecidos. */
function extrairBlocosDaMatriz(matriz) {
  const blocos = [];
  let atual = null;

  for (const linhaBruta of matriz ?? []) {
    const linha = linhaBruta ?? [];
    const naoVazias = linha.filter((c) => String(c ?? "").trim() !== "");
    if (naoVazias.length === 0) continue; // separador em branco entre tópicos/tabelas

    // Layout real "CAMPO | Nº DO JOGO | EQUIPE | X | EQUIPE": verificado antes
    // do detector genérico porque a coluna "EQUIPE" repetida confundiria a
    // pontuação por nome de coluna.
    const layoutJogos = detectarCabecalhoJogos(linha);
    if (layoutJogos) {
      atual = { tipo: "confrontos", layoutJogos, linhas: [] };
      blocos.push(atual);
      continue;
    }

    if (atual?.layoutJogos) {
      const { idxGrupo, idxCampo, idxJogo, idxEquipeA, idxEquipeB } =
        atual.layoutJogos;
      const equipeA = String(linha[idxEquipeA] ?? "").trim();
      const equipeB = String(linha[idxEquipeB] ?? "").trim();
      if (!equipeA || !equipeB) continue; // linha sem os dois lados: separador/observação solta
      atual.linhas.push({
        campo: String(linha[idxCampo] ?? "").trim(),
        njogo: idxJogo != null ? String(linha[idxJogo] ?? "").trim() : "",
        turmaa: equipeA,
        turmab: equipeB,
        grupo: idxGrupo != null ? String(linha[idxGrupo] ?? "").trim() : "",
      });
      console.log(linha);
      continue;
    }

    const { turma, confronto, preenchidas } = pontuarCabecalho(linha);
    const pareceCabecalho = preenchidas >= 2 && (turma >= 2 || confronto >= 2);

    if (pareceCabecalho) {
      atual = {
        tipo: confronto > turma ? "confrontos" : "turmas",
        cabecalho: linha.map(normalizarChave),
        linhas: [],
      };
      blocos.push(atual);
      continue;
    }

    if (!atual) continue; // texto/tópico antes de qualquer tabela reconhecida: ignora

    const obj = {};
    atual.cabecalho.forEach((chave, idx) => {
      if (!chave) return;
      const valor = linha[idx];
      obj[chave] = typeof valor === "string" ? valor.trim() : (valor ?? "");
    });
    if (Object.values(obj).some((v) => String(v ?? "").trim() !== "")) {
      atual.linhas.push(obj);
    }
  }

  return blocos;
}

/** Converte um <table> do HTML em matriz alinhada, preenchendo células
 * mescladas (rowspan/colspan) com o mesmo valor em todas as posições que elas
 * ocupam — comum em tabelas reais de chaveamento (ex.: uma célula de "CAMPO"
 * mesclada cobrindo vários jogos daquela quadra). Sem isso, linhas com menos
 * células que o cabeçalho fariam as colunas seguintes desalinharem.
 */
function tabelaParaMatriz(tabela) {
  const linhasTr = [...tabela.querySelectorAll("tr")];
  const grade = [];
  const pendentes = []; // { linhaFim, coluna, valor } de mesclagens verticais em aberto

  linhasTr.forEach((tr, linhaIdx) => {
    grade[linhaIdx] = grade[linhaIdx] ?? [];
    // Aplica mesclagens verticais (rowspan) que já vinham de linhas anteriores.
    for (const p of pendentes) {
      if (p.linhaFim >= linhaIdx) grade[linhaIdx][p.coluna] = p.valor;
    }

    let coluna = 0;
    for (const td of tr.querySelectorAll("td,th")) {
      while (grade[linhaIdx][coluna] !== undefined) coluna++; // pula colunas já preenchidas por rowspan
      const valor = td.textContent.trim();
      const colspan = Number(td.getAttribute("colspan")) || 1;
      const rowspan = Number(td.getAttribute("rowspan")) || 1;

      for (let c = 0; c < colspan; c++) grade[linhaIdx][coluna + c] = valor;
      if (rowspan > 1) {
        for (let c = 0; c < colspan; c++) {
          pendentes.push({
            linhaFim: linhaIdx + rowspan - 1,
            coluna: coluna + c,
            valor,
          });
        }
      }
      coluna += colspan;
    }
  });

  const largura = Math.max(0, ...grade.map((l) => l.length));
  return grade.map((l) =>
    Array.from({ length: largura }, (_, i) => l[i] ?? ""),
  );
}

async function lerBlocosDeDocx(file) {
  const buffer = await file.arrayBuffer();
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buffer });
  const doc = new DOMParser().parseFromString(html, "text/html");

  const turmas = [];
  const confrontos = [];

  for (const tabela of doc.querySelectorAll("table")) {
    const matriz = tabelaParaMatriz(tabela);
    for (const bloco of extrairBlocosDaMatriz(matriz)) {
      (bloco.tipo === "confrontos" ? confrontos : turmas).push(...bloco.linhas);
    }
  }

  // Sem nenhuma tabela reconhecível: tenta interpretar parágrafos soltos do
  // tipo "LadoA X LadoB" (um confronto por linha/parágrafo), formato comum em
  // documentos de chaveamento escritos como texto corrido.
  if (turmas.length === 0 && confrontos.length === 0) {
    const paragrafos = [...doc.querySelectorAll("p")]
      .map((p) => p.textContent.trim())
      .filter(Boolean);
    for (const linha of paragrafos) {
      const partes = linha.split(/\s+(?:x|vs\.?|×)\s+/i);
      if (partes.length === 2) {
        confrontos.push({ turmaa: partes[0].trim(), turmab: partes[1].trim() });
      }
    }
  }

  return { turmas, confrontos };
}

/** Preenche células mescladas de uma aba do Excel na matriz já extraída
 * (`XLSX.utils.sheet_to_json(aba, { header: 1 })` só traz valor na célula
 * superior-esquerda da mesclagem, deixando as demais em branco). */
function preencherMescladasExcel(matriz, aba) {
  const merges = aba["!merges"];
  if (!merges?.length) return matriz;
  for (const { s, e } of merges) {
    const valor = matriz[s.r]?.[s.c] ?? "";
    if (valor === "") continue;
    for (let r = s.r; r <= e.r; r++) {
      if (!matriz[r]) continue;
      for (let c = s.c; c <= e.c; c++) matriz[r][c] = valor;
    }
  }
  return matriz;
}

/**
 * Lê um arquivo (.csv, .xlsx/.xls, .docx ou .json), varre todo o conteúdo
 * (todas as abas/tabelas) e devolve as linhas já separadas por finalidade:
 * `turmas` (tabela de cadastro de turmas) e `confrontos` (chaveamento/tabela
 * de jogos). Tópicos, títulos e outras seções do documento são ignorados.
 */
export async function lerBlocosDoArquivo(file) {
  if (!file) return { turmas: [], confrontos: [] };
  const nome = file.name.toLowerCase();
  if (!EXTENSOES_ACEITAS.some((ext) => nome.endsWith(ext))) {
    throw new Error(
      "Formato não suportado. Envie um arquivo .csv, .xlsx, .xls, .docx ou .json.",
    );
  }

  if (nome.endsWith(".json")) {
    const linhas = await lerLinhasDoArquivo(file);
    // JSON não tem "tabelas": as mesmas linhas são oferecidas para os dois
    // usos e cada tela (turmas/confrontos) aproveita só os campos que precisa.
    return { turmas: linhas, confrontos: linhas };
  }

  if (nome.endsWith(".docx")) {
    return lerBlocosDeDocx(file);
  }

  const buffer = await file.arrayBuffer();
  const planilha = nome.endsWith(".csv")
    ? XLSX.read(new TextDecoder("utf-8").decode(buffer), { type: "string" })
    : XLSX.read(buffer, { type: "array" });

  const turmas = [];
  const confrontos = [];
  for (const abaNome of planilha.SheetNames) {
    const aba = planilha.Sheets[abaNome];
    if (!aba) continue;
    const matriz = preencherMescladasExcel(
      XLSX.utils.sheet_to_json(aba, { header: 1, defval: "", raw: false }),
      aba,
    );
    for (const bloco of extrairBlocosDaMatriz(matriz)) {
      (bloco.tipo === "confrontos" ? confrontos : turmas).push(...bloco.linhas);
    }
  }
  return { turmas, confrontos };
}

/**
 * Lê um arquivo .csv, .xlsx/.xls ou .json e retorna uma lista "achatada" de
 * registros com as chaves normalizadas. Mantido para compatibilidade e para
 * o formato JSON (que não tem o conceito de tabelas separadas).
 */
export async function lerLinhasDoArquivo(file) {
  if (!file) return [];
  const nome = file.name.toLowerCase();
  if (!EXTENSOES_ACEITAS.some((ext) => nome.endsWith(ext))) {
    throw new Error(
      "Formato não suportado. Envie um arquivo .csv, .xlsx, .xls, .docx ou .json.",
    );
  }

  if (nome.endsWith(".json")) {
    const texto = await file.text();
    let dados;
    try {
      dados = JSON.parse(texto);
    } catch {
      throw new Error(
        "Não foi possível ler o arquivo JSON: verifique o formato.",
      );
    }
    const lista = Array.isArray(dados)
      ? dados
      : (dados?.turmas ??
        dados?.jogos ??
        dados?.confrontos ??
        dados?.linhas ??
        null);
    if (!Array.isArray(lista)) {
      throw new Error("O arquivo JSON deve conter uma lista de registros.");
    }
    return lista.map(normalizarLinha);
  }

  if (nome.endsWith(".docx")) {
    const blocos = await lerBlocosDeDocx(file);
    return [...blocos.turmas, ...blocos.confrontos];
  }

  const buffer = await file.arrayBuffer();
  const planilha = nome.endsWith(".csv")
    ? XLSX.read(new TextDecoder("utf-8").decode(buffer), { type: "string" })
    : XLSX.read(buffer, { type: "array" });

  const primeiraAba = planilha.SheetNames[0];
  if (!primeiraAba) return [];
  const linhas = XLSX.utils.sheet_to_json(planilha.Sheets[primeiraAba], {
    defval: "",
  });
  return linhas.map(normalizarLinha);
}

/**
 * Converte linhas normalizadas (de lerBlocosDoArquivo/lerLinhasDoArquivo) em
 * turmas prontas para salvar. Entende tanto uma turma por linha (colunas
 * "serie"+"letra") quanto turmas compostas em uma única célula (coluna
 * "turma" com "7ºA/B/C" ou "letra" com "A/B/C"), expandindo em uma turma real
 * por letra — sem limite de quantas turmas a célula reunir.
 */
export function linhasParaTurmas(
  linhas,
  { serieSelecao = {} } = {}
) {
  const erros = [];
  const turmas = [];
  const vistos = new Set();

  linhas.forEach((linha, i) => {
    const n = i + 2; // linha 1 = cabeçalho

    let serie = String(linha.serie ?? "").trim();
    let letrasBrutas = linha.letra ?? linha.letras ?? "";
    const turmaComposta = linha.turma ?? linha.turmas ?? "";

    if ((!serie || !letrasBrutas) && turmaComposta) {
      const composto = parseTurmaComposta(turmaComposta);
      if (composto) {
        serie = composto.serie;
        letrasBrutas = composto.letras.join("/");
      }
    } else if (serie) {
      serie = normalizarSerie(serie) ?? serie.toUpperCase();
    }

    const letras = extrairLetras(letrasBrutas);

    if (!serie || letras.length === 0) {
      erros.push(
        `Linha ${n}: não foi possível identificar a(s) turma(s) (série/letra).`,
      );
      return;
    }

    const categoriaBruta = String(linha.categoria ?? "").trim();
    const categoria =
      categoriaBruta === "Fundamental" || categoriaBruta === "Medio"
        ? categoriaBruta
        : categoriaDaSerie(serie);

    const paisBruto = String(
  linha.paiskey ?? linha.pais ?? linha.selecao ?? ""
).trim().toLowerCase();
    const paisKey = paisDaSerie ??
  (PAISES_VALIDOS.includes(paisBruto) ? paisBruto : "br");

    letras.forEach((letra) => {
      const id = `${serie}-${letra}`;
      if (vistos.has(id)) return;
      vistos.add(id);
      const nome =
        letras.length === 1 && linha.nome
          ? String(linha.nome).trim()
          : `${serieLabel(serie)} ${letra}`;

      turmas.push({
        id,
        nome,
        serie,
        letra,
        categoria,
        paisKey,
        juncaoCom: linha.juncaocom ? String(linha.juncaocom).trim() : null,
        juncaoMotivo: linha.juncaomotivo
          ? String(linha.juncaomotivo).trim()
          : null,
      });
    });
  });

  return { turmas, erros };
}

/**
 * Converte linhas normalizadas em confrontos, resolvendo os nomes/ids de
 * turma informados no arquivo contra as turmas já cadastradas. Também
 * entende lados compostos por várias turmas (ex.: "7ºA/B/C X 7ºD/E/F"): cada
 * turma citada que ainda não existir é devolvida em `turmasNovas` (para ser
 * cadastrada antes do jogo), e cada lado com mais de uma turma vira uma
 * "turma-união" (devolvida em `unioes`) que reúne todas elas — sem limite de
 * quantas turmas podem ser unidas. Ao exibir esse confronto, a união mostra
 * todas as turmas que a compõem.
 */
export function linhasParaConfrontos(
  linhas,
  { turmas, serieSelecao, locaisPadrao, inicio, intervaloMin },
) {
  const porChave = new Map();
  const existentesIds = new Set();
  for (const t of turmas) {
    porChave.set(normalizarChave(t.id), t.id);
    porChave.set(normalizarChave(t.nome), t.id);
    existentesIds.add(t.id);
  }
  const locais = locaisPadrao?.length ? locaisPadrao : ["Quadra 1"];

  const erros = [];
  const confrontos = [];
  const turmasNovasMap = new Map();
  const unioesMap = new Map();

  function registrarTurmaNova(t) {
    if (existentesIds.has(t.id)) return;
    existentesIds.add(t.id);
    porChave.set(normalizarChave(t.id), t.id);
    if (!turmasNovasMap.has(t.id)) turmasNovasMap.set(t.id, t);
  }

  function resolverLado(bruto) {
    if (!bruto) return null;

    const direto = porChave.get(normalizarChave(bruto));
    if (direto) return direto;

    const composto = parseTurmaComposta(bruto);
    if (!composto) return null;

    const { serie, letras } = composto;
    const categoria = categoriaDaSerie(serie);
    const ids = letras.map((letra) => `${serie}-${letra}`);

    const paisKeySerie = serieSelecao?.[serie] ?? "br";

    ids.forEach((id, idx) => {
      registrarTurmaNova({
        id,
        nome: `${serieLabel(serie)} ${letras[idx]}`,
        serie,
        letra: letras[idx],
        categoria,
        paisKey: paisKeySerie,
      });
    });

    if (ids.length === 1) return ids[0];

    const idsOrdenados = [...ids].sort();
    const idUniao = `UNI-${hashCurto(idsOrdenados.join("|"))}`.slice(0, 20);
    if (!unioesMap.has(idUniao)) {
      unioesMap.set(idUniao, {
        id: idUniao,
        nome: `${serieLabel(serie)} ${[...letras].sort().join("/")}`,
        serie,
        letra: "-",
        categoria,
        paisKey: paisKeySerie,
        membros: ids,
      });
    }
    porChave.set(normalizarChave(idUniao), idUniao);
    existentesIds.add(idUniao);
    return idUniao;
  }

  function inferirFase(bruto) {
    const s = normalizarChave(bruto);
    if (!s) return "grupos";
    if (s.includes("oitava")) return "oitavas";
    if (s.includes("quarta")) return "quartas";
    if (s.includes("semi")) return "semi";
    if (s.includes("terceiro") || s.includes("3lugar")) return "terceiro";
    if (s.includes("final")) return "final";
    return "grupos";
  }

  // Quando o arquivo traz "Nº DO JOGO" (tabelas reais de chaveamento), os
  // confrontos são processados na ordem numérica desses jogos — a mesma
  // sequência do documento original — em vez da ordem bruta das linhas.
  const linhasOrdenadas = linhas.some(
    (l) => l.njogo !== undefined && l.njogo !== "",
  )
    ? [...linhas].sort((a, b) => {
        const na = Number(a.njogo);
        const nb = Number(b.njogo);
        if (Number.isNaN(na) && Number.isNaN(nb)) return 0;
        if (Number.isNaN(na)) return 1;
        if (Number.isNaN(nb)) return -1;
        return na - nb;
      })
    : linhas;

  linhasOrdenadas.forEach((linha, i) => {
    const n = linha.njogo ? `jogo ${linha.njogo}` : `linha ${i + 2}`;
    let brutoA = linha.turmaa ?? linha.a ?? linha.time1 ?? linha.mandante;
    let brutoB = linha.turmab ?? linha.b ?? linha.time2 ?? linha.visitante;

    if (
      (!brutoA || !brutoB) &&
      (linha.confronto || linha.chave || linha.jogo)
    ) {
      const combinado = String(linha.confronto ?? linha.chave ?? linha.jogo);
      const partes = combinado.split(/\s+(?:x|vs\.?|×)\s+/i);
      if (partes.length === 2) {
        [brutoA, brutoB] = partes;
      }
    }

    const turmaA = resolverLado(brutoA);
    const turmaB = resolverLado(brutoB);

    if (!turmaA || !turmaB) {
      erros.push(
        `${n[0].toUpperCase()}${n.slice(1)}: turma "${brutoA ?? "?"}" ou "${brutoB ?? "?"}" não encontrada/reconhecida.`,
      );
      return;
    }
    if (turmaA === turmaB) {
      erros.push(
        `${n[0].toUpperCase()}${n.slice(1)}: as duas turmas do confronto são iguais.`,
      );
      return;
    }

    const grupo = linha.grupo
      ? String(linha.grupo).trim().toUpperCase().slice(0, 2)
      : null;
    const fase = inferirFase(linha.fase);
    const localBruto = linha.local ? String(linha.local).trim() : "";
    // Tabelas reais de chaveamento trazem a coluna "CAMPO" (nº da quadra) em
    // vez de um nome de local — usa esse número para escolher a quadra certa
    // dentre as quadras da modalidade, em vez de distribuir aleatoriamente.
    const campoNum = Number(String(linha.campo ?? "").trim());
    const local = localBruto
      ? localBruto
      : Number.isFinite(campoNum) && campoNum > 0
        ? locais[(campoNum - 1) % locais.length]
        : locais[confrontos.length % locais.length];

    const dataBruta = linha.data ? new Date(linha.data) : null;
    const data =
      dataBruta && !Number.isNaN(+dataBruta)
        ? dataBruta.toISOString()
        : new Date(
            inicio + confrontos.length * intervaloMin * 60_000,
          ).toISOString();

    confrontos.push({ turmaA, turmaB, grupo, fase, local, data });
  });

  return {
    confrontos,
    erros,
    turmasNovas: [...turmasNovasMap.values()],
    unioes: [...unioesMap.values()],
  };
}

export default {
  lerLinhasDoArquivo,
  lerBlocosDoArquivo,
  linhasParaTurmas,
  linhasParaConfrontos,
  parseTurmaComposta,
  ACCEPT_ARQUIVO,
};
