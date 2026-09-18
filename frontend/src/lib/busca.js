// Busca instantânea do JES 2026: prioriza TURMAS (e suas seleções) e oferece
// atalhos para as funcionalidades do site. Tolerante a acentos, pontuação,
// ordem das palavras e pequenos erros de digitação.
import { catLabel, serieLabel } from "./jesConfig.js";

export function norm(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[º°ª]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const ORDINAIS = {
  primeiro: "1",
  primeira: "1",
  segundo: "2",
  segunda: "2",
  terceiro: "3",
  terceira: "3",
  quarto: "4",
  quinto: "5",
  sexto: "6",
  sexta: "6",
  setimo: "7",
  setima: "7",
  oitavo: "8",
  oitava: "8",
  nono: "9",
  nona: "9",
  ano: "",
  serie: "",
  turma: "",
  em: "em",
  medio: "em",
  fundamental: "ef",
};

/** Divide o termo em tokens úteis, separando números de letras ("7b" -> "7","b"). */
function tokens(s) {
  const bruto = norm(s)
    .split(" ")
    .flatMap((p) => p.match(/\d+|[a-z]+/g) ?? []);
  return bruto
    .map((t) => (ORDINAIS[t] !== undefined ? ORDINAIS[t] : t))
    .filter((t) => t.length > 0);
}

/** Distância de edição limitada — tolera 1 erro em palavras curtas, 2 nas longas. */
function proximo(alvo, termo) {
  if (alvo.includes(termo)) return true;
  if (termo.length < 4) return false;
  const max = termo.length >= 7 ? 2 : 1;
  // janela deslizante comparando com pedaços do alvo
  for (let i = 0; i <= Math.max(0, alvo.length - termo.length + max); i++) {
    const trecho = alvo.slice(i, i + termo.length + max);
    if (distancia(trecho, termo) <= max) return true;
  }
  return false;
}

function distancia(a, b) {
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const atual = [i];
    for (let j = 1; j <= n; j++) {
      atual[j] = Math.min(
        prev[j] + 1,
        atual[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = atual;
  }
  return prev[n];
}

const PAGINAS = [
  { to: "/", titulo: "Início", subtitulo: "Página inicial", termos: "inicio home principal" },
  {
    to: "/modalidades",
    titulo: "Modalidades",
    subtitulo: "Todas as modalidades",
    termos: "modalidades esportes futebol volei queimado futmesa atletismo xadrez dama",
  },
  {
    to: "/ao-vivo",
    titulo: "Ao Vivo",
    subtitulo: "Jogos acontecendo agora",
    termos: "ao vivo agora live placar",
  },
  {
    to: "/historico",
    titulo: "Histórico",
    subtitulo: "Jogos encerrados",
    termos: "historico resultados encerrados",
  },
  { to: "/telao", titulo: "Telão", subtitulo: "Modo projeção", termos: "telao projecao tv tela" },
  {
    to: "/mapa",
    titulo: "Mapa do Evento",
    subtitulo: "Locais dos jogos",
    termos: "mapa locais quadra campo",
  },
  {
    to: "/lider-geral",
    titulo: "Líder Geral",
    subtitulo: "Ranking de pontos",
    termos: "lider geral ranking pontos classificacao podio",
  },
  {
    to: "/regulamento",
    titulo: "Regulamento",
    subtitulo: "Regras dos jogos",
    termos: "regulamento regras wo",
  },
];

export function buscar(state, termo, categoria, limite = 12) {
  const ts = tokens(termo);
  if (norm(termo).length < 2 || ts.length === 0) return [];

  const casaTudo = (alvo) => ts.every((t) => proximo(alvo, t));

  const turmas = [];
  for (const t of state.turmas) {
    const campos = [t.nome, t.selecao.pais, serieLabel(t.serie), t.letra, t.serie].join(" ");
    const alvo = norm(campos) + " " + tokens(campos).join(" ");
    if (!casaTudo(alvo)) continue;
    turmas.push({
      peso:
        (categoria && t.categoria !== categoria ? 1 : 0) + (alvo.includes(ts.join(" ")) ? 0 : 1),
      r: {
        id: `t-${t.id}`,
        tipo: "turma",
        titulo: `${t.nome} · ${t.selecao.pais}`,
        subtitulo: `${serieLabel(t.serie)} · ${catLabel(t.categoria)}`,
        turmaId: t.id,
      },
    });
  }
  turmas.sort((a, b) => a.peso - b.peso);

  const paginas = PAGINAS.filter((p) =>
    casaTudo(norm(`${p.titulo} ${p.subtitulo} ${p.termos}`)),
  ).map((p) => ({
    id: `p-${p.to}`,
    tipo: "pagina",
    titulo: p.titulo,
    subtitulo: p.subtitulo,
    to: p.to,
  }));

  return [...turmas.map((x) => x.r), ...paginas].slice(0, limite);
}
