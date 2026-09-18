// Preferências locais do visitante: série/turma de interesse e notificações lidas.
import { categoriaDaSerie } from "./jesConfig.js";

const SERIE_KEY = "jes-serie-v1";
const LIDAS_KEY = "jes-notif-lidas-v1";
const ONBOARD_KEY = "jes-onboard-v2";
const SOS_DISPENSADOS_KEY = "jes-sos-dispensados-v1";

export const EVENTO_PREFERENCIAS = "jes-preferencias";

function emitir() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVENTO_PREFERENCIAS));
}

export function getSerie() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(SERIE_KEY);
  } catch {
    return null;
  }
}

export function setSerie(serie) {
  try {
    localStorage.setItem(SERIE_KEY, serie);
  } catch {
    // ignora
  }
  emitir();
}

export function categoriaDaPreferencia() {
  const s = getSerie();
  return s ? categoriaDaSerie(s) : null;
}

export function getLidas() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LIDAS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function marcarLidas(ids) {
  try {
    const set = new Set([...getLidas(), ...ids]);
    localStorage.setItem(LIDAS_KEY, JSON.stringify([...set].slice(-200)));
  } catch {
    // ignora
  }
  emitir();
}

/** IDs de avisos de SOS já dispensados (fechados) pelo visitante neste dispositivo. */
export function getSosDispensados() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SOS_DISPENSADOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function dispensarSos(id) {
  try {
    const set = new Set([...getSosDispensados(), id]);
    localStorage.setItem(SOS_DISPENSADOS_KEY, JSON.stringify([...set].slice(-100)));
  } catch {
    // ignora
  }
  emitir();
}

export function jaFezOnboarding() {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(ONBOARD_KEY) === "1";
  } catch {
    return true;
  }
}

export function concluirOnboarding() {
  try {
    localStorage.setItem(ONBOARD_KEY, "1");
  } catch {
    // ignora
  }
  emitir();
}
