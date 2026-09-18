// Geração automática de tabelas (fase de grupos) — puro, sem gravar no banco.
import { gruposDaCategoria, modalidadeBySlug } from "./jesConfig.js";
import { nomesLocaisDaModalidade } from "./locais.js";

/** Valor sentinela usado pelos seletores de local para "distribuir automaticamente". */
export const LOCAL_AUTOMATICO = "__automatico__";

function chave(a, b) {
  return [a, b].sort().join("|");
}

/** Confrontos que faltam (round-robin por grupo), sem duplicar os já existentes. */
export function previewTabela(state, slug, categoria, opts = {}) {
  const m = modalidadeBySlug(slug);
  if (!m || m.formato === "unico") return [];

  const existentes = new Set(
    state.jogos
      .filter((j) => j.modalidadeSlug === slug && j.categoria === categoria)
      .map((j) => chave(j.turmaA, j.turmaB)),
  );

  const inicio = +(opts.inicio ?? new Date(Date.now() + 24 * 3600_000));
  const intervalo = (opts.intervaloMin ?? 30) * 60_000;
  // Quando existir mais de uma quadra/espaço para a modalidade, os jogos são
  // distribuídos (round-robin) entre todas elas.
  const locais = opts.locais?.length ? opts.locais : nomesLocaisDaModalidade(slug);

  const out = [];
  gruposDaCategoria(state.turmas, categoria).forEach(({ grupo, turmas }) => {
    for (let i = 0; i < turmas.length; i++) {
      for (let j = i + 1; j < turmas.length; j++) {
        const k = chave(turmas[i].id, turmas[j].id);
        if (existentes.has(k)) continue;
        existentes.add(k);
        const n = out.length;
        out.push({
          turmaA: turmas[i].id,
          turmaB: turmas[j].id,
          grupo,
          data: new Date(inicio + n * intervalo).toISOString(),
          local: locais[n % locais.length],
        });
      }
    }
  });
  return out;
}
