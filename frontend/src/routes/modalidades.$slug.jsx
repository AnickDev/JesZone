import { useJesState } from "@/context/jesContext.jsx";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { listFavoritos } from "@/lib/favoritos.js";
import aoVivo from '../assets/aoVivo.png'
import agendado from '../assets/agenda.png'
import encerrado from '../assets/apito.png'
import favoritados from '../assets/star.png'

import {
  classificacaoDetalhada,
  gruposDaCategoria,
  modalidadeBySlug,
  resultadoUnico,
  turmaById,
  catLabel,
} from "@/lib/jesConfig.js";
import { chaveamento, statusMataMata } from "@/lib/bracket.js";
import { useCategoria } from "@/context/categoria.jsx";
import { GlassCard } from "@/components/GlassCard.jsx";
import { TeamBadge } from "@/components/TeamBadge.jsx";
import { MatchCard } from "@/components/MatchCard.jsx";
import { EmptyState } from "@/components/EmptyState.jsx";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/modalidades/$slug")({
  component: ModalidadeView,
  notFoundComponent: () => (
    <p className="text-center text-muted-foreground">
      Modalidade não encontrada.
    </p>
  ),
});

function ModalidadeView() {
  const { slug } = Route.useParams();
  const modalidade = modalidadeBySlug(slug);
  if (!modalidade) throw notFound();

  const { categoria: cat } = useCategoria();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const h = () => setTick((t) => t + 1);
    window.addEventListener("jes-data-changed", h);
    return () => window.removeEventListener("jes-data-changed", h);
  }, []);
  void tick;

  const state = useJesState();
  const unico = modalidade.formato === "unico";
  const resultado = unico ? resultadoUnico(state, slug, cat) : undefined;

  const jogos = useMemo(
    () =>
      state.jogos.filter(
        (j) => j.modalidadeSlug === slug && j.categoria === cat,
      ),
    [state.jogos, slug, cat],
  );
  const vivos = jogos.filter((j) => j.status === "ao-vivo");
  const agendados = jogos.filter((j) => j.status === "agendado");
  const encerrados = jogos.filter((j) => j.status === "encerrado");

  const [filtro, setFiltro] = useState("agendado");
  const [favs, setFavs] = useState([]);
  useEffect(() => {
    const sync = () => setFavs(listFavoritos());
    sync();
    window.addEventListener("jes-favoritos", sync);
    return () => window.removeEventListener("jes-favoritos", sync);
  }, []);
  const favoritos = jogos.filter(
    (j) => favs.includes(j.turmaA) || favs.includes(j.turmaB),
  );
  const lista =
    filtro === "ao-vivo"
      ? vivos
      : filtro === "agendado"
        ? agendados
        : filtro === "encerrado"
          ? encerrados
          : favoritos;

  const grupos = gruposDaCategoria(state.turmas, cat);
  const km = statusMataMata(state, slug, cat);
  const chaves = chaveamento(state, slug, cat);

  return (
    <div className="space-y-6">
      <Link
        to="/modalidades"
        className="inline-flex items-center gap-1.5 text-sm text-accent min-h-11 px-1 -ml-1"
      >
        <ArrowLeft className="size-4" /> Modalidades
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <div
          className="caixa-icone"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
          }}
        >
          {typeof modalidade.icon === "string" &&
            modalidade.icon.length <= 4 ? (
            <span className="texto-emoji" style={{ fontSize: "48px" }}>
              {modalidade.icon}
            </span>
          ) : (
            <img
              src={modalidade.icon}
              alt={modalidade.nome}
              className="imagem-icone"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl tracking-wider">
            {modalidade.nome}
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            {modalidade.tipo}
          </p>
        </div>
      </div>

      {unico ? (
        resultado ? (
          <GlassCard>
            <h3 className="font-display text-2xl tracking-wider mb-3">
              Resultado Final
            </h3>
            <div className="space-y-2">
              {[
                ["🥇 Campeã", resultado.campeaoTurmaId],
                ["🥈 Vice", resultado.viceTurmaId],
                ["🥉 3º lugar", resultado.terceiroTurmaId],
              ].map(([label, id]) => {
                const t = id ? turmaById(state, id) : undefined;
                if (!t) return null;
                return (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0"
                  >
                    <span className="text-sm text-muted-foreground">
                      {label}
                    </span>
                    <TeamBadge turma={t} size={28} />
                  </div>
                );
              })}
            </div>
            {resultado.observacoes && (
              <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
                {resultado.observacoes}
              </p>
            )}
          </GlassCard>
        ) : (
          <EmptyState
            icon={
              typeof modalidade.icon === "string" &&
                modalidade.icon.length <= 4 ? (
                modalidade.icon
              ) : (
                <img
                  src={modalidade.icon}
                  alt={modalidade.nome}
                  className="imagem-aviso-centralizada"
                  style={{
                    width: "48px",
                    height: "48px",
                    objectFit: "contain",
                    margin: "0 auto",
                  }}
                />
              )
            }
            titulo="Resultados em definição"
            descricao="Os resultados desta modalidade ainda estão sendo definidos e darão origem a um resultado único."
          />
        )
      ) : (
        <>
          <div className="glass-strong rounded-lg p-1 flex overflow-x-auto gap-1">
            {[
              ["ao-vivo", `Ao vivo (${vivos.length})`],
              ["agendado", `Agendados (${agendados.length})`],
              ["encerrado", `Encerrados (${encerrados.length})`],
              ["favoritos", `★ Favoritos (${favoritos.length})`],
            ].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setFiltro(k)}
                aria-pressed={filtro === k}
                className={`px-4 min-h-11 rounded-md text-sm whitespace-nowrap ${filtro === k ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
              >
                {l}
              </button>
            ))}
          </div>

          {lista.length === 0 ? (
            <EmptyState
              icon={
                <img
                  src={
                    filtro === "ao-vivo"
                      ? aoVivo
                      : filtro === "agendado"
                        ? agendado
                        : filtro === "encerrado"
                          ? encerrado
                          : favoritados
                  }
                  alt="Aviso de lista vazia"
                  className="imagem-aba-vazia"
                  style={{ width: "64px", height: "64px", objectFit: "contain", margin: "0 auto" }}
                />
              }
              titulo={
                filtro === "ao-vivo"
                  ? "Nenhum jogo agora"
                  : filtro === "agendado"
                    ? "Nada agendado"
                    : filtro === "favoritos"
                      ? "Nenhum favorito nesta modalidade"
                      : "Nenhum jogo encerrado"
              }
              descricao={
                filtro === "favoritos"
                  ? "Toque na estrela de uma turma para acompanhar os jogos dela aqui."
                  : "Assim que a organização publicar novos jogos, eles aparecem aqui."
              }
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {lista.map((j) => (
                <MatchCard
                  key={j.id}
                  j={j}
                  mostrarModalidade={false}
                  onFavoritar={() => setFiltro("favoritos")}
                />
              ))}
            </div>
          )}

          <section>
            <h3 className="font-display text-2xl tracking-wider mb-3">
              Classificação
            </h3>
            <div className="space-y-4">
              {grupos
                .map(({ grupo }) => ({
                  grupo,
                  rk: classificacaoDetalhada(state, slug, cat, { grupo }),
                }))
                .filter(({ rk }) => rk && rk.length > 0)
                .map(({ grupo, rk }) => (
                  <GlassCard key={grupo} className="overflow-x-auto">
                    <h4 className="font-display text-lg tracking-wider mb-2">
                      Grupo {grupo}
                    </h4>

                    <StandingsTable rk={rk} />
                  </GlassCard>
                ))}
              <GlassCard className="overflow-x-auto">
                <h4 className="font-display text-lg tracking-wider mb-2">
                  Geral (unificada)
                </h4>
                <StandingsTable rk={classificacaoDetalhada(state, slug, cat)} />
              </GlassCard>
            </div>
          </section>

          <section>
            <h3 className="font-display text-2xl tracking-wider mb-3">
              Mata-mata
            </h3>
            {!km.prontoParaMataMata && (
              <GlassCard className="mb-4">
                <p className="text-sm">
                  Aguardando fim da fase de grupos ({km.encerradosGrupos}/
                  {km.jogosGrupos} jogos encerrados).
                </p>
              </GlassCard>
            )}
            {km.prontoParaMataMata &&
              chaves.quartas.length +
              chaves.semi.length +
              chaves.final.length ===
              0 && (
                <GlassCard className="mb-4">
                  <p className="text-sm">
                    Fase de grupos concluída. Aguardando a definição do
                    chaveamento.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Classificados:{" "}
                    {km.classificados
                      .map((id) => turmaById(state, id)?.nome)
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </GlassCard>
              )}
            <div className="space-y-4">
              {/* Quartas e Semi lado a lado em duas colunas no desktop */}
              <div className="grid gap-4 md:grid-cols-2">
                {chaves.quartas.length > 0 && (
                  <BracketColumn
                    titulo="Quartas"
                    jogos={chaves.quartas}
                    onFavoritar={() => setFiltro("favoritos")}
                  />
                )}
                {chaves.semi.length > 0 && (
                  <BracketColumn
                    titulo="Semifinal"
                    jogos={chaves.semi}
                    onFavoritar={() => setFiltro("favoritos")}
                  />
                )}
              </div>

              {/* Final: Card com cor sólida âmbar/dourada por inteiro */}
              {chaves.final.length > 0 && (
                <div className="[&_div.transition]:bg-amber-500/10 [&_div.transition]:border-amber-500/30">
                  <BracketColumn
                    titulo="Final"
                    jogos={chaves.final}
                    onFavoritar={() => setFiltro("favoritos")}
                  />
                </div>
              )}

            </div>

            {chaves.terceiro.length > 0 && (
              <div className="mt-4">
                <BracketColumn
                  titulo="Disputa do 3º lugar"
                  jogos={chaves.terceiro}
                  onFavoritar={() => setFiltro("favoritos")}
                />
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StandingsTable({ rk }) {
  const state = useJesState();
  return (
    <table className="w-full text-sm">
      <thead className="text-xs text-muted-foreground uppercase">
        <tr>
          <th className="text-left py-2">#</th>
          <th className="text-left">Turma</th>
          <th>J</th>
          <th>V</th>
          <th>D</th>
          <th>SG</th>
          <th>Pts</th>
        </tr>
      </thead>
      <tbody>
        {rk.length === 0 && (
          <tr>
            <td colSpan={7} className="py-4 text-center text-muted-foreground">
              Sem partidas encerradas.
            </td>
          </tr>
        )}
        {rk.map((r, i) => {
          const t = turmaById(state, r.turmaId);
          if (!t) return null;
          return (
            <tr key={r.turmaId} className="border-t border-border">
              <td className="py-2 font-display">{i + 1}</td>
              <td>
                <TeamBadge turma={t} />
              </td>
              <td className="text-center">{r.jogos}</td>
              <td className="text-center">{r.vitorias}</td>
              <td className="text-center">{r.derrotas}</td>
              <td className="text-center">
                {r.saldo > 0 ? "+" : ""}
                {r.saldo}
              </td>
              <td className="text-center font-display text-lg text-accent">
                {r.pontos}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function BracketColumn({ titulo, jogos, onFavoritar }) {
  return (
    <div>
      <h4 className="font-display text-lg tracking-wider mb-2 text-accent">
        {titulo}
      </h4>
      <div className="space-y-3">
        {jogos.map((j) => (
          <MatchCard key={j.id} j={j} mostrarModalidade={false} onFavoritar={onFavoritar} />
        ))}
      </div>
    </div>
  );
}
