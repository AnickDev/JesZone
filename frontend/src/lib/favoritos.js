// Turmas favoritas do usuário (armazenamento local).

const KEY = "jes-favoritos-v1";

function read() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(ids) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent("jes-favoritos"));
  } catch {
    // localStorage indisponível — ignora silenciosamente.
  }
}

export function listFavoritos() {
  return read();
}

export function isFavorito(turmaId) {
  return read().includes(turmaId);
}

export function toggleFavorito(turmaId) {
  const atual = read();
  write(atual.includes(turmaId) ? atual.filter((x) => x !== turmaId) : [...atual, turmaId]);
}

/** Jogos de turmas favoritas primeiro, mantendo a ordem relativa. */
export function priorizarFavoritos(jogos) {
  const fav = new Set(read());
  const destaque = (j) => (fav.has(j.turmaA) || fav.has(j.turmaB) ? 0 : 1);
  return [...jogos].sort((a, b) => destaque(a) - destaque(b));
}

export function temFavorito(j) {
  const fav = read();
  return fav.includes(j.turmaA) || fav.includes(j.turmaB);
}
