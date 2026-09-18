// Utilitários compartilhados do painel administrativo.
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

export function useAdminAction() {
  const qc = useQueryClient();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [ok, setOk] = useState(null);

  const run = useCallback(
    async (fn, mensagem = "Salvo com sucesso.") => {
      setSalvando(true);
      setErro(null);
      setOk(null);
      try {
        await fn();
        await qc.invalidateQueries({ queryKey: ["jes"] });
        setOk(mensagem);
        setTimeout(() => setOk(null), 2600);
        return true;
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível salvar.");
        return false;
      } finally {
        setSalvando(false);
      }
    },
    [qc],
  );

  return { run, salvando, erro, ok };
}

export function Feedback({ erro, ok }) {
  if (!erro && !ok) return null;
  return (
    <p
      role="status"
      className={`text-xs rounded-lg px-3 py-2 ${erro ? "bg-destructive/10 text-destructive" : "bg-jes-green/15 text-jes-green"}`}
    >
      {erro ?? ok}
    </p>
  );
}

export function AdminSection({ titulo, acao, children }) {
  return (
    <section className="glass rounded-2xl p-3 sm:p-4 border-t-4 border-t-accent">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="font-display text-lg sm:text-xl tracking-wider text-black">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

export const inputCls =
  "w-full min-h-11 bg-muted border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-accent";
/** Seletores nativos com fundo claro e texto escuro (contraste garantido no mobile). */
export const selectCls =
  "w-full min-h-11 bg-card text-foreground border border-border rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:border-accent";
export const btnCls =
  "min-h-11 px-4 py-2.5 rounded-lg text-sm font-semibold bg-accent text-black disabled:opacity-50";
export const btnGhost =
  "min-h-11 px-4 py-2.5 rounded-lg text-sm border border-border text-foreground hover:bg-foreground/5";
  
/** Rótulo acima de um campo do painel. */
export function Campo({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
