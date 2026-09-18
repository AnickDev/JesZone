import { useState } from "react";
import { motion } from "motion/react";
import { COR_TIPO, LOCAIS, modalidadesDoLocal } from "@/lib/locais.js";
import fut7 from "@/assets/iconsMapa/fut7.png";
import voleibol from "@/assets/iconsMapa/voleibol.png";
import handebol from "@/assets/iconsMapa/handebol.png";
import futmesa from "@/assets/iconsMapa/futmesa.png";
import atletismo from "@/assets/iconsMapa/atletismo.png";

export function EventMap({ selecionado, onSelecionar }) {
  const [hover, setHover] = useState(null);

  const ordemLocais = [
    "FUT7 1",
    "FUT7 2",
    "VÔLEI 1",
    "VÔLEI 2",
    "VÔLEI 3",
    "QUEIMADO 1",
    "QUEIMADO 2",
    "QUEIMADO 3",
    "ATLETISMO",
    "FUTMESA",
  ];

  const ordemDesktop = {
    "FUT7 1": "sm:order-1",
    "FUT7 2": "sm:order-2",
    "QUEIMADO 1": "sm:order-3",
    "QUEIMADO 2": "sm:order-4",
    "QUEIMADO 3": "sm:order-5",
    "VÔLEI 1": "sm:order-6",
    "VÔLEI 2": "sm:order-7",
    "VÔLEI 3": "sm:order-8",
    "FUTMESA": "sm:order-9",
    "ATLETISMO": "sm:order-10",
  };

  const locaisOrdenados = ordemLocais
    .map((nome) => LOCAIS.find((l) => l.nome === nome))
    .filter((l) => l && l.interativo !== false);

  const imagensEsportes = {
    "FUT7 1": fut7,
    "FUT7 2": fut7,

    "VÔLEI 1": voleibol,
    "VÔLEI 2": voleibol,
    "VÔLEI 3": voleibol,

    "QUEIMADO 1": handebol,
    "QUEIMADO 2": handebol,
    "QUEIMADO 3": handebol,

    "FUTMESA": futmesa,
    "ATLETISMO": atletismo,
  };

  const coresTitulos = {
    "FUT7 1": "#079143",
    "FUT7 2": "#079143",
    "VÔLEI 1": "#fa2d02",
    "VÔLEI 2": "#fa2d02",
    "VÔLEI 3": "#fa2d02",
    "QUEIMADO 1": "#4a0e4e",
    "QUEIMADO 2": "#4a0e4e",
    "QUEIMADO 3": "#4a0e4e",
    "FUTMESA": "#0c7fb5",
    "ATLETISMO": "#8b4513"
  };

  return (
    <div className="glass rounded-2xl p-3">
      <div style={{ perspective: 1000, overflow: "visible" }} className="w-full flex justify-center">
        <motion.div className="w-full md:w-[60%]"
          style={{
            transformOrigin: "bottom center",
            rotateX: 15,
            filter: "drop-shadow(0px 3px 3px rgba(0, 0, 0, 0.15))"
          }}
        >
          <svg style={{ overflow: "visible" }} viewBox="0 8 100 74" className="w-full h-auto" role="img" aria-label="Planta do evento">


            <defs>
              <pattern id="grade" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M5 0V5H0" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="url(#grade)" />

            {LOCAIS.map((l) => {
              const ativo = selecionado === l.id;
              const cor = COR_TIPO[l.tipo];
              return (
                <g
                  key={l.id}
                  onClick={() => l.interativo !== false && onSelecionar(ativo ? undefined : l)}
                  onMouseEnter={() => setHover(l.id)}
                  onMouseLeave={() => setHover(null)}
                  className={l.interativo === false ? "" : "cursor-pointer outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"}
                  role={l.interativo === false ? undefined : "button"}
                  aria-label={l.interativo === false ? undefined : `Local ${l.nome}`}
                  tabIndex={l.interativo === false ? undefined : 0}
                  onKeyDown={(e) => {
                    if (l.interativo !== false && e.key === "Enter") onSelecionar(ativo ? undefined : l);
                  }}
                >

                  <motion.rect
                    x={l.x}
                    y={l.y}
                    width={l.w}
                    height={l.h}
                    rx={1.1}
                    fill={cor}
                    animate={{ opacity: ativo ? 0.95 : hover === l.id ? 0.95 : 0.75 }}
                    stroke={cor}
                    strokeWidth={ativo ? 0.8 : 0.35}
                  />

                  {l.vertical ? (
                    <text
                      x={l.x + l.w / 2}
                      textAnchor="middle"
                      className="fill-white"
                      style={{ fontSize: 3, letterSpacing: 0.2 }}
                    >
                      {l.nome.split("").map((letra, i) => (
                        <tspan
                          key={i}
                          x={l.x + l.w / 2}
                          y={l.y + l.h / 2 - ((l.nome.length - 1) * 3.6) / 2 + 1 + i * 3.6}
                        >
                          {letra}
                        </tspan>
                      ))}
                    </text>
                  ) : (
                    <text
                      x={l.x + l.w / 2}
                      y={l.y + l.h / 2 + 1}
                      textAnchor="middle"
                      className="fill-white"
                      style={{ fontSize: 3, letterSpacing: 0.2 }}
                    >
                      {l.nome}
                    </text>
                  )}
                </g>
              );
            })}

          </svg>
        </motion.div>
      </div>



<ul className="mt-4 mb-6 py-1 flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-[12px] md:text-[14px] text-muted-foreground">
        {["Campo", "Pista", "Futmesa", "Vôlei", "Queimado"].map((t) => (
          <li key={t} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: COR_TIPO[t] }} />
            {t === "Campo"
              ? "Campo"
              : t === "Pista"
                ? "Pista"
                : t === "Futmesa"
                  ? "Futmesa"
                  : t === "Vôlei"
                    ? "Vôlei"
                    : "Queimado"}
          </li>
        ))}
      </ul>


      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-5">
        {locaisOrdenados.map((l) => {
          const modalidades = modalidadesDoLocal(l);
          const corHex = coresTitulos[l.nome] || "inherit";
          const classeOrdemDesktop = ordemDesktop[l.nome] || "";

          return (
            <button
              key={l.id}
              onClick={() =>
                onSelecionar(selecionado === l.id ? undefined : l)
              }
              className={`flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-start text-left w-full rounded-xl px-4 py-3 transition ${classeOrdemDesktop} ${selecionado === l.id ? "bg-accent text-accent-foreground" : "hover:bg-foreground/5"}`}
              style={selecionado !== l.id ? {
                background: `
                  radial-gradient(circle at -5% -5%, rgba(205, 127, 50, 0.08) 0%, transparent 80%),
                  radial-gradient(circle at 105% -5%, rgba(43, 89, 219, 0.06) 0%, transparent 80%),
                  radial-gradient(circle at -5% 105%, rgba(43, 89, 219, 0.06) 0%, transparent 80%),
                  radial-gradient(circle at 105% 105%, rgba(34, 161, 95, 0.08) 0%, transparent 80%),
                  #F4F5F8
              `
              } : {}}
            >
              
              <div className="flex items-center gap-2">
                <img
                  src={imagensEsportes[l.nome]}
                  alt=""
                  className="size-7 object-contain"
                />

                <span
                  className="font-bold text-[13px] md:text-[14px]"
                  style={{ color: selecionado === l.id ? "inherit" : corHex }}
                >
                  {l.nome}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:mt-2">
                {modalidades.length > 0 ? (
                  modalidades.map((m) => (
                    <span
                      key={m.id}
                      className={`rounded-full px-2.5 py-1 text-[10px] md:text-[11px] font-medium ${selecionado === l.id
                        ? "bg-white/20"
                        : "bg-[#FFFFFF]"
                        }`}
                    >
                      {m.nome.replace(/^.*?\s+(Masculino|Feminino)$/i, "$1")}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Sem modalidades
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}