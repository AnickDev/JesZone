export function flagUrl(code, w = 80) {
  return `https://flagcdn.com/w${w}/${code}.png`;
}

/**
 * `wrap`: usado nos cards de confronto (MatchCard), onde o nome da turma
 * precisa continuar totalmente legível no mobile em vez de ser cortado com
 * reticências — quebra em até 2 linhas em vez de truncar.
 */
function nomeExibicao(nome) {
  return nome.replace(/\bEM\b/, "Ano");
}

export function TeamBadge({ turma, size = 32, wrap = false }) {
  const textoCls = wrap
    ? "break-words leading-tight line-clamp-2"
    : "truncate";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <img
        src={flagUrl(turma.selecao.code, 80)}
        alt={turma.selecao.pais}
        width={size}
        height={Math.round(size * 0.66)}
        className="rounded-sm ring-1 ring-border shrink-0"
        loading="lazy"
      />
      <div className="min-w-0 flex flex-col justify-center h-12">
        <div className={`text-sm font-semibold ${textoCls}`}>{nomeExibicao(turma.nome)}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
          {turma.selecao.pais}
        </div>
      </div>
    </div>
  );
}

export function TeamCard({ turma, children }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border shadow-xl">
      <div
        className="absolute inset-0 -z-10 scale-125 blur-2xl opacity-25"
        style={{
          backgroundImage: `url(${flagUrl(turma.selecao.code, 320)})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-card/80" />
      <div className="p-4">
        <TeamBadge turma={turma} size={44} />
        {children}
      </div>
    </div>
  );
}
