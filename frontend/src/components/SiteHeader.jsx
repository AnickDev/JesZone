import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import sesiLogo from "@/assets/sesi-logo.png";
import { useCategoria } from "@/context/categoria.jsx";
import { CATEGORIAS, catLabelCurto } from "@/lib/jesConfig.js";
import { NotificationBell } from "@/components/NotificationBell.jsx";
import { SearchCommand } from "@/components/SearchCommand.jsx";

const links = [
  { to: "/", label: "Início" },
  { to: "/modalidades", label: "Modalidades" },
  { to: "/ao-vivo", label: "Ao Vivo" },
  { to: "/historico", label: "Histórico" },
  { to: "/telao", label: "Telão" },
  { to: "/mapa", label: "Mapa" },
  { to: "/lider-geral", label: "Líder Geral" },
  { to: "/regulamento", label: "Regulamento" },
];

function CategoriaPill() {
  const { categoria, setCategoria } = useCategoria();
  return (
    <div
      className="glass p-0.5 rounded-full flex text-[11px] font-semibold shrink-0"
      role="tablist"
      aria-label="Categoria"
    >
      {CATEGORIAS.map((c) => (
        <button
          key={c}
          onClick={() => setCategoria(c)}
          aria-pressed={categoria === c}
          className={`px-3 py-1.5 rounded-full transition ${categoria === c ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          {catLabelCurto(c)}
        </button>
      ))}
    </div>
  );
}

export function SiteHeader() {
  const [painel, setPainel] = useState(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // O painel administrativo tem navegação própria: nada de cabeçalho público lá.
  if (pathname.startsWith("/admin") || pathname.startsWith("/painel")) return null;

  const abrir = (p, v) => setPainel(v ? p : null);
  const menuAberto = painel === "menu";

  return (
    <header className="fixed top-0 inset-x-0 z-40">
      <div className="mx-auto max-w-7xl px-2 pt-2">
        <div className="glass-strong flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-2xl">
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="JES 2026 · início">
            <img src={sesiLogo} alt="SESI SENAI" width={72} height={36} className="h-[18px] w-auto" />
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-2.5 py-1.5 text-sm rounded-lg hover:bg-foreground/5 transition"
                activeProps={{
                  className: "px-2.5 py-1.5 text-sm rounded-lg bg-[#F2C12E] text-black",
                }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5">
            <div className="hidden lg:block">
              <CategoriaPill />
            </div>
            <SearchCommand open={painel === "busca"} onOpenChange={(v) => abrir("busca", v)} />
            <NotificationBell
              open={painel === "notificacoes"}
              onOpenChange={(v) => abrir("notificacoes", v)}
            />
            <button
              className="lg:hidden p-2.5 rounded-lg hover:bg-foreground/5"
              onClick={() => setPainel(menuAberto ? null : "menu")}
              aria-label="Menu"
              aria-expanded={menuAberto}
            >
              {menuAberto ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {menuAberto && (
          <div className="lg:hidden panel-solid mt-1.5 rounded-2xl p-2 grid grid-cols-2 gap-1">
            <div className="col-span-2 py-1 flex justify-center">
              <CategoriaPill />
            </div>
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setPainel(null)}
                className="px-3 py-3 text-sm rounded-lg hover:bg-foreground/5"
                activeProps={{
                  className: "px-3 py-3 text-sm rounded-lg bg-[#F2C12E] text-black",
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
