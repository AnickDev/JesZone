// Locais do evento e as modalidades que acontecem em cada um.
import { MODALIDADES } from "./jesConfig.js";

export const LOCAIS = [
  // --- PISTA DE ATLETISMO --- 
  {
    id: 'quadra-atletismo',
    nome: 'ATLETISMO',
    tipo: 'Pista',
    x: 20.4,
    y: 7.25,
    w: 7.2,
    h: 65.7,
    modalidades: ['atletismo-100m'],
    vertical: true,
  },

  // --- FUTMESA --- 
  {
    id: 'quadra-futmesa',
    nome: 'FUTMESA',
    tipo: 'Futmesa',
    x: 58.2,
    y: 7.25,
    w: 18.0,
    h: 7.2,
    modalidades: ['futmesa'],
  },

  // --- FILEIRA DO TOPO --- 
  {
    id: 'quadra-volei-1',
    nome: 'VÔLEI 1',
    tipo: 'Vôlei',
    x: 28.5,
    y: 15.35,
    w: 23.4,
    h: 10.8,
    modalidades: ['volei-m', 'volei-f'],
  },
  {
    id: 'quadra-queimado-3',
    nome: 'QUEIMADO 3',
    tipo: 'Queimado',
    x: 52.8,
    y: 15.35,
    w: 23.4,
    h: 10.8,
    modalidades: ['queimado-m', 'queimado-f'],
  },

  // --- FILEIRA DO MEIO SUPERIOR --- 
  {
    id: 'quadra-volei-3',
    nome: 'VÔLEI 3',
    tipo: 'Vôlei',
    x: 28.5,
    y: 27.05,
    w: 23.4,
    h: 10.8,
    modalidades: ['volei-m', 'volei-f'],
  },
  {
    id: 'quadra-queimado-1',
    nome: 'QUEIMADO 1',
    tipo: 'Queimado',
    x: 52.8,
    y: 27.05,
    w: 23.4,
    h: 10.8,
    modalidades: ['queimado-m', 'queimado-f'],
  },

  // --- FILEIRA DO MEIO INFERIOR --- 
  {
    id: 'quadra-volei-2',
    nome: 'VÔLEI 2',
    tipo: 'Vôlei',
    x: 28.5,
    y: 38.75,
    w: 23.4,
    h: 10.8,
    modalidades: ['volei-m', 'volei-f'],
  },
  {
    id: 'quadra-queimado-2',
    nome: 'QUEIMADO 2',
    tipo: 'Queimado',
    x: 52.8,
    y: 38.75,
    w: 23.4,
    h: 10.8,
    modalidades: ['queimado-m', 'queimado-f'],
  },

  // --- QUADRAS DE FUT7 --- 
  {
    id: 'quadra-fut7-1',
    nome: 'FUT7 1',
    tipo: 'Campo',
    x: 28.5,
    y: 50.45,
    w: 23.4,
    h: 22.5,
    modalidades: ['fut7-m', 'fut7-f'],
  },
  {
    id: 'quadra-fut7-2',
    nome: 'FUT7 2',
    tipo: 'Campo',
    x: 52.8,
    y: 50.45,
    w: 23.4,
    h: 22.5,
    modalidades: ['fut7-m', 'fut7-f'],
  },

  // --- ENTRADA  --- 
  {
    id: 'entrada',
    nome: 'Entrada',
    tipo: 'acesso',
    x: 27.3,
    y: 74.95,
    w: 42.0,
    h: 7.2,
    modalidades: [],
    interativo: false
  }
]

export function localByNome(nome) {
  return LOCAIS.find((l) => l.nome.toLowerCase() === nome.toLowerCase());
}

export function modalidadesDoLocal(l) {
  return MODALIDADES.filter((m) => l.modalidades.includes(m.slug));
}

/** Todos os locais (quadras/espaços) onde uma modalidade pode acontecer. */
export function locaisDaModalidade(slug) {
  return LOCAIS.filter((l) => l.modalidades.includes(slug));
}

/** Nomes dos locais de uma modalidade, prontos para uso em seletores/distribuição. */
export function nomesLocaisDaModalidade(slug) {
  const nomes = locaisDaModalidade(slug).map((l) => l.nome);
  return nomes.length ? nomes : LOCAIS.map((l) => l.nome);
}

export const COR_TIPO = {
  Vôlei: "#fa2d02",
  Queimado: "#4A0E4E",
  Futmesa: "#0c7fb5",
  Campo: "#079143",
  Sala: "#60a5fa",
  Pista: "#8B4513",
  acesso: "#080808",
};
