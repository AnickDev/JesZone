import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { desenharResumo, baixarImagem } from "@/lib/shareImage.js";
import { flagUrl } from "@/components/TeamBadge.jsx";
import { useJesState } from "@/context/jesContext.jsx";
import { FASE_LABEL, MODALIDADES, turmaById } from "@/lib/jesConfig.js";

export const Route = createFileRoute("/preview-resumo")({
  component: PreviewResumo,
});

const FORMATOS = ["9:16", "4:5"];

function PreviewResumo() {
  const state = useJesState();
  const [jogoId, setJogoId] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);
  const FORMATOS = ['9:16', '4:5'];
  const [formato, setFormato] = useState(FORMATOS[0]);
  const [erro, setErro] = useState(null);

  // Assim que o estado carregar, seleciona o primeiro jogo encerrado por padrão.
  useEffect(() => {
    if (jogoId) return;
    const primeiro = state.jogos.find((j) => j.status === "encerrado");
    if (primeiro) setJogoId(primeiro.id);
  }, [state, jogoId]);

  const encerrados = useMemo(
    () => state.jogos.filter((j) => j.status === "encerrado"),
    [state],
  );

  // Monta o objeto `d` exatamente como o MatchSummaryDialog.jsx real faz.
  const dados = useMemo(() => {
    if (!jogoId) return null;
    const jogo = encerrados.find((j) => j.id === jogoId);

    const A = turmaById(state, jogo.turmaA);
    const B = turmaById(state, jogo.turmaB);
    const m = MODALIDADES.find((x) => x.slug === jogo.modalidadeSlug);
    if (!A || !B || !m) return null;

    const quando = new Date(jogo.data).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const fase = FASE_LABEL[jogo.fase] ?? jogo.fase;
    const vencedor = jogo.wo
      ? jogo.wo === "A"
        ? A
        : B
      : jogo.placarA === jogo.placarB
        ? undefined
        : jogo.placarA > jogo.placarB
          ? A
          : B;

    return {
      modalidade: m.nome,
      fase: jogo.fase === "grupos" ? `${fase} · Grupo ${jogo.grupo ?? "-"}` : fase,
      quando,
      local: jogo.local,
      turmaA: A.nome,
      paisA: A.selecao.pais,
      bandeiraA: flagUrl(A.selecao.code, 640),
      turmaB: B.nome,
      paisB: B.selecao.pais,
      bandeiraB: flagUrl(B.selecao.code, 640),
      placarA: jogo.placarA,
      placarB: jogo.placarB,
      situacao: "Encerrado",
      wo: Boolean(jogo.wo),
      nota: undefined,
    };
  }, [state, jogoId, encerrados]);

  // Redesenha sempre que o formato ou o jogo escolhido mudam.
  useEffect(() => {
    if (!dados) return;
    let ativo = true;
    setErro(null);
    desenharResumo(formato, dados)
      .then((url) => {
        if (ativo) setImgUrl(url);
      })
      .catch((e) => {
        if (ativo) setErro(e.message);
      });
    return () => {
      ativo = false;
    };
  }, [formato, dados]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="glass rounded-2xl p-4 flex items-center justify-center bg-black/20">
        {erro && <p className="text-sm text-destructive">{erro}</p>}
        {!erro && imgUrl && (
          <img src={imgUrl} alt="Prévia do resumo" className="max-h-[80vh] w-auto rounded-lg shadow-2xl" />
        )}
        {!erro && !imgUrl && <p className="text-sm text-muted-foreground">Carregando…</p>}
      </div>

      <div className="glass rounded-2xl p-4 space-y-4 h-fit">
        <h1 className="font-display text-xl tracking-wider">PRÉVIA DO RESUMO</h1>

        <div>
          <label className="block text-xs text-muted-foreground mb-1">Formato</label>
          <select
            value={formato}
            onChange={(e) => setFormato(e.target.value)}
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm"
          >
            {FORMATOS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            Jogo real (encerrados: {encerrados.length})
          </label>
          <select
            value={jogoId ?? ""}
            onChange={(e) => setJogoId(e.target.value)}
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm"
          >
            {encerrados.length === 0 && <option value="">Nenhum jogo encerrado ainda</option>}
            {encerrados.map((j) => {
              const A = turmaById(state, j.turmaA);
              const B = turmaById(state, j.turmaB);
              const m = MODALIDADES.find((x) => x.slug === j.modalidadeSlug);
              return (
                <option key={j.id} value={j.id}>
                  {A?.nome} {j.placarA}x{j.placarB} {B?.nome} · {m?.nome}
                </option>
              );
            })}
          </select>
        </div>

        <button
          disabled={!imgUrl}
          onClick={() => baixarImagem(imgUrl, `resumo-${formato.replace(":", "x")}.png`)}
          className="w-full min-h-11 rounded-lg bg-accent text-accent-foreground font-semibold disabled:opacity-50"
        >
          Baixar imagem
        </button>
      </div>
    </div>
  );
}