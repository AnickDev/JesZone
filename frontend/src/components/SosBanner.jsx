import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { X, TriangleAlert, MapPin, HeartPulse, Siren } from "lucide-react";
import { sosQueryOptions } from "@/lib/jesDados.js";
import { dispensarSos, getSosDispensados, EVENTO_PREFERENCIAS } from "@/lib/preferencias.js";
import { useSessao } from "@/lib/auth.js";

const URGENCIA_LABEL = {
  baixa: "Urgência baixa",
  media: "Urgência média",
  alta: "Urgência alta",
  critica: "URGÊNCIA CRÍTICA",
};

/** Um balão de SOS ativo para todo mundo: quadrado, bordas arredondadas, no centro da tela. */
export function SosBanner() {
  // O aviso de SOS é exclusivo do perfil admin: a permissão real vem da sessão
  // (JWT verificado no backend via useSessao), não de uma checagem visual.
  // O backend também nunca retorna avisos "sos" para quem não é admin, então
  // isso é só para evitar a busca/exibição desnecessária no cliente.
  const { sessao } = useSessao();
  const souAdmin = sessao?.admin === true;
  const { data } = useQuery({ ...sosQueryOptions(), enabled: souAdmin });
  const [dispensados, setDispensados] = useState(() => getSosDispensados());

  useEffect(() => {
    const sync = () => setDispensados(getSosDispensados());
    window.addEventListener(EVENTO_PREFERENCIAS, sync);
    return () => window.removeEventListener(EVENTO_PREFERENCIAS, sync);
  }, []);

  const ativo = souAdmin
    ? (data ?? [])
      .filter((n) => n.tipo === "sos" && !dispensados.includes(n.id))
      .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))[0]
    : undefined;

  useEffect(() => {
    if (!ativo) return;
    const onKey = (e) => {
      if (e.key === "Escape") dispensarSos(ativo.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ativo]);

  return (
    <AnimatePresence>
      {ativo && (
        <div className="fixed inset-0 z-[100] pointer-events-none grid place-items-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            role="alertdialog"
            aria-live="assertive"
            aria-label="Aviso de SOS / emergência"
            className="pointer-events-auto w-full max-w-sm rounded-3xl border-4 border-red-400/80 bg-gradient-to-br from-red-600 via-red-600 to-rose-700 text-white shadow-2xl shadow-red-900/50 p-5 relative overflow-hidden"
          >
            <motion.div
              aria-hidden
              className="absolute inset-0 bg-red-400/20"
              animate={{ opacity: [0.15, 0.4, 0.15] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />

            <div className="relative">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Siren className="size-7 shrink-0 animate-pulse" />
                  <p className="font-display text-2xl tracking-widest">Emergência</p>
                </div>
                <button
                  onClick={() => dispensarSos(ativo.id)}
                  aria-label="Fechar aviso de SOS"
                  className="size-9 grid place-items-center rounded-xl bg-white/15 hover:bg-white/25 shrink-0"
                >
                  <X className="size-5" />
                </button>
              </div>

              <p className="mt-1 text-[11px] font-bold uppercase tracking-widest bg-white/15 inline-block px-2 py-0.5 rounded-full">
                {URGENCIA_LABEL[ativo.sosUrgencia] ?? "Emergência"}
              </p>

              <p className="mt-3 text-base font-semibold leading-snug">{ativo.titulo}</p>

              {ativo.sosLocal && (
                <p className="mt-2 flex items-start gap-2 text-sm">
                  <MapPin className="size-4 mt-0.5 shrink-0" />
                  <span>
                    <span className="font-bold">Local: </span>
                    {ativo.sosLocal}
                  </span>
                </p>
              )}

              {(ativo.sosNecessidade || ativo.descricao) && (
                <p className="mt-1.5 flex items-start gap-2 text-sm">
                  <HeartPulse className="size-4 mt-0.5 shrink-0" />
                  <span>
                    <span className="font-bold">Necessário: </span>
                    {ativo.sosNecessidade ?? ativo.descricao}
                  </span>
                </p>
              )}

              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-white/85">
                <TriangleAlert className="size-3.5 shrink-0" />
                Se puder ajudar ou tiver mais informações, procure a organização do evento.
              </p>

              <div className="mt-3 text-xs text-white/70">
                Enviado às{" "}
                {new Date(ativo.criadoEm).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              <button
                onClick={() => dispensarSos(ativo.id)}
                className="mt-4 w-full min-h-11 rounded-xl bg-white text-red-700 font-bold text-sm hover:bg-white/90 transition"
              >
                Entendi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
