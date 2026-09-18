import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Megaphone, Siren } from "lucide-react";
import * as api from "@/services/api.js";
import { ICONE_NOTIFICACAO, notificacoesQueryOptions } from "@/lib/jesDados.js";
import {
  AdminSection,
  btnCls,
  Feedback,
  inputCls,
  selectCls,
  useAdminAction,
} from "@/lib/admin.jsx";
import { catLabelCurto } from "@/lib/jesConfig.js";

export const Route = createFileRoute("/admin/avisos")({
  component: AdminAvisos,
});

const TIPOS = ["aviso", "agenda", "cancelado", "sos"];
const TIPO_LABEL = {
  aviso: "Aviso geral",
  agenda: "Mudança de horário",
  cancelado: "Cancelamento",
  sos: " SOS — Emergência",
};

const URGENCIAS = ["alta", "critica"];
const URGENCIA_LABEL = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};

function AdminAvisos() {
  const [tipo, setTipo] = useState("aviso");
  const [escopo, setEscopo] = useState("todos");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [sosLocal, setSosLocal] = useState("");
  const [sosNecessidade, setSosNecessidade] = useState("");
  const [sosUrgencia, setSosUrgencia] = useState("alta");
  const { run, salvando, erro, ok } = useAdminAction();
  const { data: historico } = useQuery(notificacoesQueryOptions());

  const ehSos = tipo === "sos";
  const valido = ehSos
    ? sosLocal.trim().length > 0 && sosNecessidade.trim().length > 0
    : titulo.trim().length >= 3;

  const publicar = async () => {
    if (!valido) return;

    const payload = ehSos
      ? {
          tipo,
          titulo: `${sosLocal.trim()}`,
          descricao: sosNecessidade.trim(),
          escopo,
          sosLocal: sosLocal.trim(),
          sosNecessidade: sosNecessidade.trim(),
          sosUrgencia,
        }
      : {
          tipo,
          titulo: titulo.trim(),
          descricao: descricao.trim() || undefined,
          escopo,
        };

    const enviado = await run(
      () => api.publicarAviso(payload),
      ehSos
        ? "SOS enviado a todos! O balão de emergência já está visível."
        : "Aviso enviado a todos os alunos.",
    );
    if (enviado) {
      setTitulo("");
      setDescricao("");
      setSosLocal("");
      setSosNecessidade("");
      setSosUrgencia("alta");
    }
  };

  return (
    <div className="space-y-3">
      <AdminSection titulo="Enviar aviso">
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-xs text-muted-foreground">
            Tipo
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className={inputCls}
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {TIPO_LABEL[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            Para
            <select
              value={escopo}
              onChange={(e) => setEscopo(e.target.value)}
              className={inputCls}
            >
              <option value="todos">Todos</option>
              <option value="Fundamental">
                {catLabelCurto("Fundamental")}
              </option>
              <option value="Medio">{catLabelCurto("Medio")}</option>
            </select>
          </label>
        </div>

        {ehSos ? (
          <div className="mt-2 space-y-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-xs font-semibold text-destructive flex items-center gap-1.5">
              <Siren className="size-4" /> Este aviso aparecerá como um balão de
              emergência bem chamativo, no centro da tela, para todos os
              visitantes.
            </p>
            <label className="block text-xs text-muted-foreground">
              Onde ocorreu a emergência?
              <input
                value={sosLocal}
                onChange={(e) => setSosLocal(e.target.value)}
                maxLength={160}
                placeholder="Ex.: Quadra de Vôlei 2"
                className={inputCls}
              />
            </label>
            <label className="block text-xs text-muted-foreground">
              O que ocorreu?
              <textarea
                value={sosNecessidade}
                onChange={(e) => setSosNecessidade(e.target.value)}
                maxLength={300}
                rows={3}
                placeholder="Ex.: Aluno sofreu um acidente, precisa de socorrista"
                className={inputCls}
              />
            </label>
            <label className="block text-xs text-muted-foreground">
              Urgência
              <select
                value={sosUrgencia}
                onChange={(e) => setSosUrgencia(e.target.value)}
                className={selectCls}
              >
                {URGENCIAS.map((u) => (
                  <option key={u} value={u}>
                    {URGENCIA_LABEL[u]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <>
            <label className="mt-2 block text-xs text-muted-foreground">
              Título
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={160}
                placeholder="Ex.: Abertura oficial às 8h no ginásio"
                className={inputCls}
              />
            </label>
            <label className="mt-2 block text-xs text-muted-foreground">
              Detalhe (opcional)
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                maxLength={600}
                rows={3}
                className={inputCls}
              />
            </label>
          </>
        )}

        <div className="mt-3 flex items-center gap-2">
          <button
            disabled={salvando || !valido}
            onClick={publicar}
            className={`${btnCls} flex items-center gap-1.5 ${ehSos ? "bg-destructive text-destructive-foreground" : ""}`}
          >
            {ehSos ? (
              <Siren className="size-4" />
            ) : (
              <Megaphone className="size-4" />
            )}
            {ehSos ? "Enviar SOS" : "Publicar"}
          </button>
        </div>
        <div className="mt-2">
          <Feedback erro={erro} ok={ok} />
        </div>
      </AdminSection>

      <AdminSection titulo="Histórico permanente">
        {!historico || historico.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhuma notificação registrada.
          </p>
        ) : (
          <ul className="space-y-1 text-xs max-h-[28rem] overflow-y-auto">
            {historico.map((n) => (
              <li
                key={n.id}
                className="rounded-lg bg-muted px-2 py-1.5 flex gap-2"
              >
                <div
                  className="size-5 shrink-0 grid place-items-center"
                  aria-hidden
                >
                  <img
                    src={
                      ICONE_NOTIFICACAO[n.tipo] ||
                      "/assets/notificacoes/default.png"
                    }
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="min-w-0">
                  <span className="block">{n.titulo}</span>
                  {n.descricao && (
                    <span className="block text-muted-foreground">
                      {n.descricao}
                    </span>
                  )}
                  {n.tipo === "sos" && n.sosUrgencia && (
                    <span className="block text-destructive font-semibold">
                      Urgência: {URGENCIA_LABEL[n.sosUrgencia] ?? n.sosUrgencia}
                    </span>
                  )}
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                    {new Date(n.criadoEm).toLocaleString("pt-BR")} · {n.escopo}
                    {n.autorEmail ? ` · ${n.autorEmail}` : ""}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminSection>
    </div>
  );
}
