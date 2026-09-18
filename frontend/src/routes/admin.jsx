import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { LogOut, RefreshCw } from "lucide-react";
import { sair, useSessao } from "@/lib/auth.js";
import { useJesData } from "@/context/jesContext.jsx";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const TABS = [
  { to: "/admin", label: "Resumo", exact: true },
  { to: "/admin/resultados", label: "Placares", exact: false },
  { to: "/admin/jogos", label: "Jogos & Tabela", exact: false },
  { to: "/admin/unicos", label: "Pódios", exact: false },
  { to: "/admin/turmas", label: "Turmas", exact: false },
  { to: "/admin/series", label: "Seleções", exact: false },
  { to: "/admin/avisos", label: "Avisos", exact: false },
  { to: "/admin/regulamento", label: "Regulamento", exact: false },
];

function AdminLayout() {
  const nav = useNavigate();
  const { sessao, pronto } = useSessao();
  const { atualizando, recarregar } = useJesData();

  if (pronto && !sessao) {
    nav({ to: "/painel/jes-2026/entrada", replace: true });
    return null;
  }

  if (!pronto) return <p className="px-4 text-sm text-muted-foreground">Verificando acesso…</p>;

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h1 className="font-display text-2xl sm:text-3xl tracking-wider text-black">PAINEL JES</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={recarregar}
            aria-label="Recarregar dados"
            className="p-2 rounded-lg border border-border hover:bg-foreground/5"
          >
            <RefreshCw className={`size-4 ${atualizando ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              sair();
              nav({ to: "/", replace: true });
            }}
            className="p-2 rounded-lg border border-border hover:bg-foreground/5"
            aria-label="Sair"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>

      <nav className="glass-strong p-1 rounded-xl flex overflow-x-auto gap-1 mb-3 border border-accent/30">
        {TABS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            activeOptions={t.exact ? { exact: true } : undefined}
            className="px-3 py-1.5 rounded-lg text-xs sm:text-sm whitespace-nowrap hover:bg-foreground/5"
            activeProps={{
              className:
                "px-3 py-1.5 rounded-lg text-xs sm:text-sm whitespace-nowrap bg-accent text-accent-foreground font-semibold",
            }}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
