import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Star, Trophy } from "lucide-react";
import { catLabel, liderGeral, serieLabel, turmaById } from "@/lib/jesConfig.js";
import { useJesState } from "@/context/jesContext.jsx";
import { MatchCard } from "@/components/MatchCard.jsx";
import { EmptyState } from "@/components/EmptyState.jsx";
import { flagUrl } from "@/components/TeamBadge.jsx";
import { isFavorito, toggleFavorito } from "@/lib/favoritos.js";

export const Route = createFileRoute("/turmas/$id")({
  component: TurmaView,
});

function TurmaView() {
  const { id } = Route.useParams();
  const state = useJesState();
  const turma = turmaById(state, id);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    const sync = () => setFav(isFavorito(id));
    sync();
    window.addEventListener("jes-favoritos", sync);
    return () => window.removeEventListener("jes-favoritos", sync);
  }, [id]);

  const jogos = useMemo(
    () =>
      state.jogos
        .filter((j) => {
          const timeA = turmaById(state, j.turmaA);
          const timeB = turmaById(state, j.turmaB);
          const idsA = timeA?.membros?.length ? timeA.membros : [j.turmaA];
          const idsB = timeB?.membros?.length ? timeB.membros : [j.turmaB];
          return idsA.includes(id) || idsB.includes(id);
        })
        .sort((a, b) => +new Date(a.data) - +new Date(b.data)),
    [state, id],
  );

  const pontos = useMemo(() => {
    if (!turma) return 0;
    return liderGeral(state, turma.categoria).find((r) => r.turmaId === id)?.pontos ?? 0;
  }, [state, turma, id]);

  if (!turma) {
    return (
      <div className="mx-auto max-w-3xl px-3 sm:px-4">
        <EmptyState
          icon="🔎"
          titulo="Turma não encontrada"
          descricao="Ela pode ter sido removida ou renomeada pela organização."
        />
        <Link to="/" className="mt-3 inline-block text-sm text-accent">
          ← Voltar ao início
        </Link>
      </div>
    );
  }

  const vivos = jogos.filter((j) => j.status === "ao-vivo");
  const agendados = jogos.filter((j) => j.status === "agendado");
  const encerrados = jogos
    .filter((j) => j.status === "encerrado")
    .sort((a, b) => +new Date(b.data) - +new Date(a.data));

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-4 space-y-5">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-accent min-h-11 px-1 -ml-1"
      >
        <ArrowLeft className="size-4" /> Início
      </Link>

      <header className="glass-strong rounded-2xl p-4 flex items-center gap-3">
        <img
          src={flagUrl(turma.selecao.code, 160)}
          alt={turma.selecao.pais}
          width={80}
          height={53}
          className="w-16 sm:w-20 rounded ring-1 ring-border shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl sm:text-4xl tracking-wider truncate">
            {turma.nome}
          </h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground truncate">
            {turma.selecao.pais} · {serieLabel(turma.serie)} · {catLabel(turma.categoria)}
          </p>
          <p className="mt-1 text-sm flex items-center gap-1.5 text-accent">
            <Trophy className="size-4" /> {pontos} pts no líder geral
          </p>
        </div>
        <button
          onClick={() => toggleFavorito(turma.id)}
          aria-pressed={fav}
          aria-label={fav ? "Remover dos favoritos" : "Favoritar turma"}
          title={fav ? "Remover dos favoritos" : "Favoritar turma"}
          className="flex flex-col items-center justify-center gap-0.5 rounded-xl border border-border hover:bg-foreground/5 shrink-0 px-2.5 py-1.5"
        >
          <Star className={`size-5 ${fav ? "text-accent fill-accent" : "text-muted-foreground"}`} />
          <span className={`text-[9px] font-semibold uppercase tracking-wide ${fav ? "text-accent" : "text-muted-foreground"}`}>
            {fav ? "Favorita" : "Favoritar"}
          </span>
        </button>
      </header>

      {turma.juncao && (
        <p className="text-xs text-muted-foreground">
          Junção com {turmaById(state, turma.juncao.com)?.nome ?? turma.juncao.com} ·{" "}
          {turma.juncao.motivo}
        </p>
      )}

      <Secao titulo={`Ao vivo (${vivos.length})`} jogos={vivos} vazio="Nenhum jogo agora." />
      <Secao
        titulo={`Agendados (${agendados.length})`}
        jogos={agendados}
        vazio="Nenhum jogo agendado."
      />
      <Secao
        titulo={`Encerrados (${encerrados.length})`}
        jogos={encerrados}
        vazio="Nenhum jogo encerrado."
      />
    </div>
  );
}

function Secao({ titulo, jogos, vazio }) {
  return (
    <section>
      <h2 className="font-display text-xl tracking-wider mb-2">{titulo.toUpperCase()}</h2>
      {jogos.length === 0 ? (
        <p className="text-xs text-muted-foreground">{vazio}</p>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {jogos.map((j) => (
            <MatchCard key={j.id} j={j} />
          ))}
        </div>
      )}
    </section>
  );
}
