// Espelho (somente nomes) das quadras/espaços do mapa do evento — mantido em
// sincronia com frontend/src/lib/locais.js — usado para distribuir automaticamente
// os jogos entre as quadras da mesma modalidade quando o mata-mata avança sozinho.
export const LOCAIS = [
  { id: "quadra-volei-1", nome: "VÔLEI 1", modalidades: ["volei-m", "volei-f"] },
  { id: "quadra-volei-2", nome: "VÔLEI 2", modalidades: ["volei-m", "volei-f"] },
  { id: "quadra-volei-3", nome: "VÔLEI 3", modalidades: ["volei-m", "volei-f"] },

  { id: "quadra-queimado-1", nome: "QUEIMADO 1", modalidades: ["queimado-m", "queimado-f"] },
  { id: "quadra-queimado-2", nome: "QUEIMADO 2", modalidades: ["queimado-m", "queimado-f"] },
  { id: "quadra-queimado-3", nome: "QUEIMADO 3", modalidades: ["queimado-m", "queimado-f"] },

  { id: "quadra-fut7-1", nome: "FUT7 1", modalidades: ["fut7-m", "fut7-f"] },
  { id: "quadra-fut7-2", nome: "FUT7 2", modalidades: ["fut7-m", "fut7-f"] },

  { id: "quadra-atletismo", nome: "ATLETISMO", modalidades: ["atletismo-100m"] },

  { id: "quadra-futmesa", nome: "FUTMESA", modalidades: ["futmesa"] },

  { id: "ginasio", nome: "Ginásio", modalidades: ["xadrez"] },
  { id: "sala-jogos", nome: "Sala de Jogos", modalidades: ["dama"] },
];

/** Nomes dos locais de uma modalidade, prontos para distribuição round-robin. */
export function locaisDaModalidade(slug) {
  const nomes = LOCAIS.filter((l) => l.modalidades.includes(slug)).map((l) => l.nome);
  return nomes.length ? nomes : ["Quadra 1"];
}

export default { LOCAIS, locaisDaModalidade };
