import { classificacao, gruposDaCategoria } from "./jesConfig.js";

export function statusMataMata(state, slug, categoria) {
  const jogosGrupos = state.jogos.filter(
    (j) => j.modalidadeSlug === slug && j.categoria === categoria && j.fase === "grupos",
  );
  const encerradosGrupos = jogosGrupos.filter((j) => j.status === "encerrado").length;
  const grupos = gruposDaCategoria(state.turmas, categoria);
  const prontoParaMataMata = jogosGrupos.length > 0 && encerradosGrupos === jogosGrupos.length;

  // Classificados: 1º de cada grupo, depois melhores 2ºs até completar 8/4/2.
  const rankPorGrupo = grupos.map((g) => classificacao(state, slug, categoria, { grupo: g.grupo }));
  const primeiros = rankPorGrupo.map((r) => r[0]).filter(Boolean);
  const restantes = rankPorGrupo.flatMap((r) => r.slice(1));
  restantes.sort((a, b) => b.pontos - a.pontos || b.saldo - a.saldo || b.pro - a.pro);
  const unificado = [...primeiros, ...restantes];

  let n = 2;
  if (unificado.length >= 8) n = 8;
  else if (unificado.length >= 4) n = 4;
  const classificados = unificado.slice(0, n).map((r) => r.turmaId);

  return {
    totalGrupos: grupos.length,
    jogosGrupos: jogosGrupos.length,
    encerradosGrupos,
    prontoParaMataMata,
    classificados,
  };
}

export function jogosMataMata(state, slug, categoria) {
  return state.jogos.filter(
    (j) => j.modalidadeSlug === slug && j.categoria === categoria && j.fase !== "grupos",
  );
}

function vencedor(j) {
  if (j.status !== "encerrado") return null;
  if (j.wo) return j.wo === "A" ? j.turmaA : j.turmaB;
  if (j.placarA === j.placarB) return null;
  return j.placarA > j.placarB ? j.turmaA : j.turmaB;
}

function perdedor(j) {
  const v = vencedor(j);
  if (!v) return null;
  return v === j.turmaA ? j.turmaB : j.turmaA;
}

const ORDEM = ["oitavas", "quartas", "semi", "final"];

/**
 * Monta (sem gravar) a PRÓXIMA rodada pendente do mata-mata:
 * - se ainda não existe mata-mata, gera a fase inicial com os classificados dos grupos;
 * - se a fase atual está toda encerrada, gera a fase seguinte com os vencedores
 *   (e a disputa de 3º lugar junto com a final).
 */
export function previewMataMata(state, slug, categoria, opts = {}) {
  const inicio = +(opts.inicio ?? new Date(Date.now() + 24 * 3600_000));
  const intervalo = (opts.intervaloMin ?? 60) * 60_000;
  // Se houver mais de uma quadra/espaço para a modalidade, distribui (round-robin)
  // os jogos do mata-mata entre elas; senão usa o local único informado.
  const locais = opts.locais?.length ? opts.locais : [opts.local ?? "Quadra 1"];
  const montar = (fase, duplas) =>
    duplas.map(([turmaA, turmaB], i) => ({
      turmaA,
      turmaB,
      fase,
      data: new Date(inicio + i * intervalo).toISOString(),
      local: locais[i % locais.length],
    }));

  const existentes = jogosMataMata(state, slug, categoria);

  // 1) Nenhum jogo de mata-mata ainda → fase inicial pelos classificados.
  if (existentes.length === 0) {
    const st = statusMataMata(state, slug, categoria);
    if (!st.prontoParaMataMata) return [];
    const q = st.classificados;
    const n = q.length;
    if (n < 2) return [];
    const fase = n === 8 ? "quartas" : n === 4 ? "semi" : "final";
    const duplas = [];
    for (let i = 0; i < n / 2; i++) duplas.push([q[i], q[n - 1 - i]]);
    return montar(fase, duplas);
  }

  // 2) Já existe mata-mata → avança a partir da última fase completa.
  const ultima = [...ORDEM].reverse().find((f) => existentes.some((j) => j.fase === f));
  if (!ultima) return [];
  const jogosFase = existentes.filter((j) => j.fase === ultima);
  const encerrados = jogosFase.every((j) => j.status === "encerrado");
  if (!encerrados) return [];

  const proxima = ORDEM[ORDEM.indexOf(ultima) + 1];
  if (!proxima) return []; // final já disputada

  const vencedores = jogosFase.map(vencedor);
  if (vencedores.some((v) => !v)) return []; // empate/pendência: definição manual
  const ids = vencedores;
  if (ids.length < 2) return [];

  const duplas = [];
  for (let i = 0; i < Math.floor(ids.length / 2); i++) duplas.push([ids[i * 2], ids[i * 2 + 1]]);
  const pares = montar(proxima, duplas);

  // Disputa de 3º lugar junto com a final.
  if (proxima === "final" && !existentes.some((j) => j.fase === "terceiro")) {
    const perdedores = jogosFase.map(perdedor).filter(Boolean);
    if (perdedores.length === 2) {
      pares.push({
        turmaA: perdedores[0],
        turmaB: perdedores[1],
        fase: "terceiro",
        data: new Date(inicio - intervalo).toISOString(),
        local: locais[pares.length % locais.length],
      });
    }
  }

  return pares;
}

/** Jogos organizados por fase para exibir chaveamento. */
export function chaveamento(state, slug, categoria) {
  const jm = jogosMataMata(state, slug, categoria);
  const por = (f) => jm.filter((j) => j.fase === f);
  return {
    oitavas: por("oitavas"),
    quartas: por("quartas"),
    semi: por("semi"),
    final: por("final"),
    terceiro: por("terceiro"),
  };
}
