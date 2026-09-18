import { createFileRoute } from "@tanstack/react-router";
import { GlassCard } from "@/components/GlassCard.jsx";
import { MODALIDADES } from "@/lib/jesConfig.js";
import { useJesState } from "@/context/jesContext.jsx";
import { BookOpen } from "lucide-react";
import { Download } from "lucide-react";

export const Route = createFileRoute("/regulamento")({
  component: RegulamentoPublic,
});

const PADRAO_GERAL = `O presente documento estabelece o regulamento específico das modalidades que compõem os Jogos Estudantis SESI 2026, definindo regras, critérios de pontuação, formas de disputa e disposições disciplinares aplicáveis às competições. Todas as normas aqui descritas complementam o regulamento geral do evento, cabendo às equipes, atletas e responsáveis o conhecimento e cumprimento integral destas disposições.`;

function RegulamentoPublic() {
  const s = useJesState();
  const geral = s.regulamento.geral ?? PADRAO_GERAL;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6">
      <h1 className="font-display text-4xl tracking-wider mb-2 flex items-center gap-3">
        <BookOpen className="size-8 text-accent" /> REGULAMENTO
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Regras oficiais do JES 2026.
      </p>

      <GlassCard className="mb-4">
        <h2 className="font-display text-2xl tracking-wider mb-3">Geral</h2>
        <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
          {geral}
        </pre>
      </GlassCard>

      <div className="flex justify-center my-6">
        <a
          href="/Regulamento-JES-2026.pdf"
          download
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 transition"
        >
          <Download className="size-4" />
          Baixar regulamento
        </a>
      </div>

      <h2 className="font-display text-2xl tracking-wider mb-3 mt-6">
        Por modalidade
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        {MODALIDADES
          .filter(
            (m, index, arr) =>
              arr.findIndex(
                (item) =>
                  item.nome
                    .replace(/\s*[-–—]?\s*(masculino|feminino)\s*/gi, "")
                    .replace(/\s*\((masculino|feminino)\)\s*/gi, "")
                    .trim()
                    .toLowerCase() ===
                  m.nome
                    .replace(/\s*[-–—]?\s*(masculino|feminino)\s*/gi, "")
                    .replace(/\s*\((masculino|feminino)\)\s*/gi, "")
                    .trim()
                    .toLowerCase()
              ) === index
          )
          .map((m) => {
            const texto = s.regulamento[m.slug] ?? m.regrasWO;
            return (
              <GlassCard key={m.slug}>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="caixa-icone"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "40px",
                      height: "40px",
                    }}
                  >
                    {typeof m.icon === "string" && m.icon.length <= 4 ? (
                      <span className="texto-emoji" style={{ fontSize: "30px" }}>
                        {m.icon}
                      </span>
                    ) : (
                      <img
                        src={m.icon}
                        alt={m.nome}
                        className="imagem-icone"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    )}
                  </div>

                  <div>
                    <div className="font-display text-lg tracking-wider">
                      {m.nome
                        .replace(/\s*[-–—]?\s*(masculino|feminino)\s*/gi, "")
                        .replace(/\s*\((masculino|feminino)\)\s*/gi, "")
                        .trim()}
                    </div>
                  </div>
                </div>
                <div className="text-xs whitespace-pre-wrap font-sans leading-relaxed text-muted-foreground">
                  {texto.split(/(\*\*.*?\*\*)/g).map((parte, index) =>
                    parte.startsWith("**") && parte.endsWith("**") ? (
                      <strong key={index} className="font-bold text-foreground">
                        {parte.slice(2, -2)}
                      </strong>
                    ) : (
                      <span key={index}>{parte}</span>
                    )
                  )}
                </div>
              </GlassCard>
            );
          })}
      </div>
    </div>
  );
}
