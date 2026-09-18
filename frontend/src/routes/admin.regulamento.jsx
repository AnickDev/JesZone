import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MODALIDADES } from "@/lib/jesConfig.js";
import { useJesState } from "@/context/jesContext.jsx";
import * as api from "@/services/api.js";
import {
  AdminSection,
  btnCls,
  Feedback,
  inputCls,
  useAdminAction,
} from "@/lib/admin.jsx";

export const Route = createFileRoute("/admin/regulamento")({
  component: AdminRegulamento,
});

const PADRAO_GERAL = `O presente documento estabelece o regulamento específico das modalidades que compõem os Jogos Estudantis SESI 2026, definindo regras, critérios de pontuação, formas de disputa e disposições disciplinares aplicáveis às competições. Todas as normas aqui descritas complementam o regulamento geral do evento, cabendo às equipes, atletas e responsáveis o conhecimento e cumprimento integral destas disposições.`;

function AdminRegulamento() {
  const state = useJesState();
  const { run, salvando, erro, ok } = useAdminAction();

  return (
    <div className="space-y-3">
      <AdminSection titulo="Regulamento geral">
        <Feedback erro={erro} ok={ok} />
        <Editor
          chave="geral"
          valorInicial={state.regulamento["geral"] ?? PADRAO_GERAL}
          salvando={salvando}
          onSalvar={(texto) =>
            run(
              () => api.salvarRegulamento("geral", texto),
              "Regulamento geral salvo.",
            )
          }
        />
      </AdminSection>

      <AdminSection titulo="Regras por modalidade">
        <div className="grid gap-3 lg:grid-cols-2">
          {MODALIDADES.filter(
            (m, index, arr) =>
              arr.findIndex(
                (item) =>
                  item.nome
                    .replace(/\s*[-–—]?\s*(masculino|feminino)\s*/gi, "")
                    .replace(/\s*\((masculino|feminino)\)\s*/gi, "")
                    .trim()
                    .toLowerCase() ===
                  m.nome
                    .replace(/\s*[-–—]?\s*(masculino|feminino)\s*/gi, "")
                    .replace(/\s*\((masculino|feminino)\)\s*/gi, "")
                    .trim()
                    .toLowerCase(),
              ) === index,
          ).map((m) => (
            <div
              key={m.slug}
              className="rounded-xl border border-border bg-muted p-2.5"
            >
              <div
                className="titulo-modalidade-caixa"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  marginBottom: "4px",
                }}
              >
                {typeof m.icon === "string" && m.icon.length <= 4 ? (
                  <span className="texto-emoji" style={{ fontSize: "18px" }}>
                    {m.icon}
                  </span>
                ) : (
                  <img
                    src={m.icon}
                    alt={m.nome}
                    className="imagem-icone"
                    style={{
                      width: "18px",
                      height: "18px",
                      objectFit: "contain",
                    }}
                  />
                )}
                <span className="nome-texto">
                  {m.nome
                    .replace(/\s*[-–—]?\s*(masculino|feminino)\s*/gi, "")
                    .replace(/\s*\((masculino|feminino)\)\s*/gi, "")
                    .trim()}
                </span>
              </div>
              <Editor
                chave={m.slug}
                valorInicial={state.regulamento[m.slug] ?? m.regrasWO}
                salvando={salvando}
                onSalvar={(texto) =>
                  run(
                    () => api.salvarRegulamento(m.slug, texto),
                    `${m.nome} salvo.`,
                  )
                }
              />
            </div>
          ))}
        </div>
      </AdminSection>
    </div>
  );
}

function Editor({ chave, valorInicial, salvando, onSalvar }) {
  const [texto, setTexto] = useState(valorInicial);
  return (
    <div>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={chave === "geral" ? 8 : 5}
        maxLength={8000}
        className={`${inputCls} font-sans leading-relaxed`}
        aria-label={`Regulamento ${chave}`}
      />
      <button
        disabled={salvando}
        onClick={() => onSalvar(texto)}
        className={`${btnCls} mt-2 text-xs`}
      >
        Salvar
      </button>
    </div>
  );
}
