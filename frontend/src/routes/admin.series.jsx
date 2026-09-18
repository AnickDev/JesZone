import { createFileRoute } from "@tanstack/react-router";
import { allSeries, catLabelCurto, listPaises, paisByKey } from "@/lib/jesConfig.js";
import { useJesState } from "@/context/jesContext.jsx";
import * as api from "@/services/api.js";
import { AdminSection, Feedback, inputCls, useAdminAction } from "@/lib/admin.jsx";
import { flagUrl } from "@/components/TeamBadge.jsx";

export const Route = createFileRoute("/admin/series")({
  component: AdminSeries,
});

function AdminSeries() {
  const state = useJesState();
  const paises = listPaises();
  const { run, salvando, erro, ok } = useAdminAction();

  return (
    <div className="space-y-3">
      <AdminSection titulo="Seleção de cada série">
        <Feedback erro={erro} ok={ok} />
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {allSeries().map((s) => {
            const key = state.serieSelecao[s.serie] ?? "br";
            const sel = paisByKey(key);
            return (
              <div key={s.serie} className="rounded-xl border border-border bg-muted p-2.5">
                <div className="flex items-center gap-2">
                  <img
                    src={flagUrl(sel.code, 80)}
                    alt={sel.pais}
                    width={40}
                    height={26}
                    className="rounded-sm ring-1 ring-border"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{s.label}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {catLabelCurto(s.categoria)} · {sel.pais}
                    </p>
                  </div>
                </div>
                <select
                  value={key}
                  disabled={salvando}
                  onChange={(e) =>
                    run(
                      () => api.definirSerieSelecao(s.serie, e.target.value),
                      `Seleção de ${s.label} atualizada.`,
                    )
                  }
                  aria-label={`Seleção de ${s.label}`}
                  className={`${inputCls} mt-2`}
                >
                  {paises.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.sel.pais}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </AdminSection>
    </div>
  );
}
