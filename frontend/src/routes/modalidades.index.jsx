import { createFileRoute, Link } from "@tanstack/react-router";
import { MODALIDADES } from "@/lib/jesConfig.js";
import { GlassCard } from "@/components/GlassCard.jsx";
import modalidade from "../assets/modalidade.png"

export const Route = createFileRoute("/modalidades/")({
  component: ModalidadesIndex,
});

function ModalidadesIndex() {
  return (
    <div>
      <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-4 flex items-center gap-3">
      <img
        src={modalidade}
        alt="Modalidades"
        className="size-8 object-contain"
      />
      MODALIDADES
    </h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {MODALIDADES.map((m) => (
          <Link key={m.slug} to="/modalidades/$slug" params={{ slug: m.slug }}>
            <GlassCard className="h-full hover:scale-[1.02] transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                  {typeof m.icon === "string" && m.icon.length <= 4 ? (
                    <span className="text-4xl">{m.icon}</span>
                  ) : (
                    <img
                      src={m.icon}
                      alt={m.nome}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <div>
                  <div className="font-display text-xl tracking-wider">
                    {m.nome}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest">
                    {m.tipo}
                  </div>
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
