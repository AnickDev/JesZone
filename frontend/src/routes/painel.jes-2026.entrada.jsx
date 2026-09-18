import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { entrar, useSessao } from "@/lib/auth.js";
import { btnCls, Feedback, inputCls } from "@/lib/admin.jsx";

export const Route = createFileRoute("/painel/jes-2026/entrada")({
  component: EntradaPainel,
});

function EntradaPainel() {
  const nav = useNavigate();
  const { sessao, pronto } = useSessao();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  // Login tradicional (e-mail + senha do administrador). Sem link/código por e-mail.
  useEffect(() => {
    if (pronto && sessao) nav({ to: "/admin" });
  }, [pronto, sessao, nav]);

  const enviar = async (e) => {
    e.preventDefault();
    setErro(null);
    if (!email.trim() || !senha) {
      setErro("Informe o e-mail e a senha.");
      return;
    }
    setCarregando(true);
    try {
      await entrar(email.trim(), senha);
      nav({ to: "/admin" });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha no acesso.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 pt-18">
      <div className="glass-strong rounded-2xl p-5">
        <div className="flex items-center gap-2 text-accent">
          <ShieldCheck className="size-5" />
          <span className="text-[11px] uppercase tracking-[0.3em]">Área restrita</span>
        </div>
        <h1 className="mt-2 font-display text-3xl tracking-wider">ENTRADA DA ORGANIZAÇÃO</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acesso exclusivo da comissão organizadora do JES 2026.
        </p>

        <form onSubmit={enviar} className="mt-5 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              maxLength={140}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground" htmlFor="senha">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              maxLength={72}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={inputCls}
            />
          </div>

          <Feedback erro={erro} ok={null} />

          <button type="submit" disabled={carregando} className={`${btnCls} w-full`}>
            {carregando ? "Aguarde…" : "Entrar no painel"}
          </button>
        </form>
      </div>
    </div>
  );
}
