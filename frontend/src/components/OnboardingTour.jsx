import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { allSeries, catLabelCurto, categoriaDaSerie, serieLabel } from "@/lib/jesConfig.js";
import { concluirOnboarding, jaFezOnboarding, setSerie } from "@/lib/preferencias.js";
import { useCategoria } from "@/context/categoria.jsx";

/**
 * Primeiro acesso: pergunta a série do estudante para já abrir o site na
 * categoria correta (Fundamental 6º-9º ou Médio 1º-3º).
 */
export function OnboardingTour() {
  const [aberto, setAberto] = useState(false);
  const { setCategoria } = useCategoria();

  useEffect(() => {
    if (!jaFezOnboarding()) setAberto(true);
  }, []);

  const escolher = (serie) => {
    setSerie(serie);
    setCategoria(categoriaDaSerie(serie));
    concluirOnboarding();
    setAberto(false);
  };

  const pular = () => {
    concluirOnboarding();
    setAberto(false);
  };

  const series = allSeries();

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-foreground/40 backdrop-blur-sm grid place-items-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Escolha sua série"
        >
          <motion.div
            initial={{ y: 20, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="glass-strong w-full max-w-md rounded-2xl p-5"
          >
            <p className="text-[11px] uppercase tracking-[0.3em] text-accent">JES 2026</p>
            <h2 className="mt-1 font-display text-3xl tracking-wider">QUAL A SUA SÉRIE?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Assim mostramos direto os jogos da sua categoria.
            </p>

            {["Fundamental", "Medio"].map((cat) => (
              <div key={cat} className="mt-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  {cat === "Fundamental" ? "FUNDAMENTAL" : "MÉDIO"}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {series
                    .filter((s) => s.categoria === cat)
                    .map((s) => (
                      <button
                        key={s.serie}
                        onClick={() => escolher(s.serie)}
                        className="glass rounded-xl py-3 text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition"
                      >
                        {serieLabel(s.serie)}
                      </button>
                    ))}
                </div>
              </div>
            ))}

            <button
              onClick={pular}
              className="mt-5 w-full text-xs text-muted-foreground hover:text-foreground py-2"
            >
              pular
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
