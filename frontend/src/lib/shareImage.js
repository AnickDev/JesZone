// ======================================================
// FORMATAR DATA DA API (Garante o padrão: DD/MM - XXHXX)
// ======================================================
function tratarDataAPI(stringData) {
  if (!stringData) return "";

  try {
    // Substitui espaço por 'T' caso venha no formato "YYYY-MM-DD HH:MM"
    const dataTratada = stringData.includes("T") ? stringData : stringData.replace(" ", "T");
    const dataObj = new Date(dataTratada);

    // Se a data for inválida, tenta limpar como string pura (fallback)
    if (isNaN(dataObj.getTime())) {
      return stringData
        .replace(/\/\d{4}/g, "")
        .replace(/(\d{1,2}):(\d{2})/g, "$1H$2")
        .toUpperCase();
    }

    // Extrai os pedaços ignorando o ano
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
    const hora = String(dataObj.getHours()).padStart(2, '0');
    const minuto = String(dataObj.getMinutes()).padStart(2, '0');

    return `${dia}/${mes} - ${hora}h${minuto}`;
  } catch (e) {
    return stringData; // Caso dê qualquer erro na conversão, retorna o bruto
  }
}

// Geração da imagem de resumo do jogo direto no navegador (canvas 2D).
// Layout baseado na referência 9:16 fornecida: caixa com borda no topo,
// fundo cobrindo o card inteiro, resultado + placar no meio,
// escudos dos times, bandeira do país e rodapé com data/local.

// ======================================================
// DIMENSÕES
// ======================================================

const DIMENSOES = {
  "9:16": [1080, 1920],
  "4:5": [1080, 1350],
};


// ======================================================
// CORES
// ======================================================

const OURO = "#D9A62B";
const CLARO = "#F2F1EA";


// ======================================================
// FUNDOS
// ======================================================

// FUT7
import fundoFut7MVertical from "../assets/backgrounds/fut7/9x16m.png";
import fundoFut7MFeed from "../assets/backgrounds/fut7/4x5m.png";
import fundoFut7FVertical from "../assets/backgrounds/fut7/9x16f.png";
import fundoFut7FFeed from "../assets/backgrounds/fut7/4x5f.png";

// VÔLEI
import fundoVoleiMVertical from "../assets/backgrounds/volei/9x16m.png";
import fundoVoleiMFeed from "../assets/backgrounds/volei/4x5m.png";
import fundoVoleiFVertical from "../assets/backgrounds/volei/9x16f.png";
import fundoVoleiFFeed from "../assets/backgrounds/volei/4x5f.png";

// QUEIMADO
import fundoQueimadoMVertical from "../assets/backgrounds/queimado/9x16m.png";
import fundoQueimadoMFeed from "../assets/backgrounds/queimado/4x5m.png";
import fundoQueimadoFVertical from "../assets/backgrounds/queimado/9x16f.png";
import fundoQueimadoFFeed from "../assets/backgrounds/queimado/4x5f.png";

// FUTMESA
import fundoFutmesaVertical from "../assets/backgrounds/futmesa/9x16.png";
import fundoFutmesaFeed from "../assets/backgrounds/futmesa/4x5.png";

// ATLETISMO
import fundoAtletismoVertical from "../assets/backgrounds/atletismo/9x16.png";
import fundoAtletismoFeed from "../assets/backgrounds/atletismo/4x5.png";

// MOLDURA
import molduraVertical from "../assets/backgrounds/moldura/9x16.png";
import molduraFeed from "../assets/backgrounds/moldura/4x5.png";

// ======================================================
// MAPA DE FUNDOS
// ======================================================
const LAYOUT = {
  "9:16": {
    wo: {
      fontSize: 28,
      y: 1735,
    },

    resultado: {
      fontSize: 30,
      y: 2,
    },

    turmaA: {
      fontSize: 34,
      x: 190,
      y: 1460,
    },
    turmaB: {
      fontSize: 34,
      x: 890,
      y: 1460,
    },

    modalidade: {
      fontSize: 40,
      yOffset: 160,
    },
    fase: {
      fontSize: 24,
      yOffset: 203,
    },
    situacao: {
      fontSize: 22,
      yOffset: 238,
      spacing: 5
    },

    placar: {
      fontSize: 225,
      x: 540,
      y: 1600,
    },

    placarDuplo: {
      fontSize: 200,
      x: 540,
      y: 1590,
    },

    x: {
      fontSize: 200,
      x: 540,
      y: 900,
      gap: 68,
    },

    xDuplo: {
      fontSize: 0,
      x: 540,
      y: 900,
      gap: 70,
    },

    label: {
      fontSize: 34,
      x: 540,
      y: 1015,
    },

    bandeiraA: {
      size: 74,
      x: 114,
      y: 1570,
    },

    bandeiraB: {
      size: 74,
      x: 968,
      y: 1570,
    },

    rodape: {
      fontSize: 34,

      dataX: 310,
      dataY: 1840,

      localX: 825,
      localY: 1840,
    },
  },

  "4:5": {
    wo: {
      fontSize: 26,
      y: 1215,
    },

    resultado: {
      fontSize: 30,
      y: 2,
    },

    turmaA: {
      fontSize: 34,
      x: 290,
      y: 1012,
    },
    turmaB: {
      fontSize: 34,
      x: 790,
      y: 1012,
    },

    modalidade: {
      fontSize: 36,
      yOffset: 10,
    },
    fase: {
      fontSize: 22,
      yOffset: 46,
    },
    situacao: {
      fontSize: 18,
      yOffset: 78,
      spacing: 5
    },

    placar: {
      fontSize: 200,
      x: 540,
      y: 1125,
    },

    placarDuplo: {
      fontSize: 150,
      x: 540,
      y: 1125,
    },

    x: {
      fontSize: 25,
      x: 540,
      y: 900,
      gap: 68,
    },

    xDuplo: {
      fontSize: 0,
      x: 540,
      y: 900,
      gap: 68,
    },

    label: {
      fontSize: 34,
      x: 540,
      y: 1015,
    },

    bandeiraA: {
      size: 60,
      x: 215,
      y: 1088,
    },

    bandeiraB: {
      size: 60,
      x: 870,
      y: 1088,
    },

    rodape: {
      fontSize: 30,

      dataX: 365,
      dataY: 1292,

      localX: 760,
      localY: 1292,
    },
  },
};

const BACKGROUNDS = {
  "fut7-masculino": { "9:16": fundoFut7MVertical, "4:5": fundoFut7MFeed },
  "fut7-feminino": { "9:16": fundoFut7FVertical, "4:5": fundoFut7FFeed },

  "volei-masculino": { "9:16": fundoVoleiMVertical, "4:5": fundoVoleiMFeed },
  "volei-feminino": { "9:16": fundoVoleiFVertical, "4:5": fundoVoleiFFeed },

  "queimado-masculino": { "9:16": fundoQueimadoMVertical, "4:5": fundoQueimadoMFeed },
  "queimado-feminino": { "9:16": fundoQueimadoFVertical, "4:5": fundoQueimadoFFeed },

  futmesa: {
    "9:16": fundoFutmesaVertical,
    "4:5": fundoFutmesaFeed,
  },

  atletismo: {
    "9:16": fundoAtletismoVertical,
    "4:5": fundoAtletismoFeed,
  },
};

const MOLDURAS = {
  "9:16": molduraVertical,
  "4:5": molduraFeed,
};

export function obterMoldura(formato) {
  return MOLDURAS[formato];
}

// ======================================================
// NORMALIZAR MODALIDADE
// ======================================================

function normalizarModalidade(modalidade = "") {
  return modalidade
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}


// ======================================================
// PEGAR FUNDO DA MODALIDADE
// ======================================================

function obterFundo(modalidade, formato) {
  const mod = normalizarModalidade(modalidade);
  const feminino = mod.includes("feminino");

  if (mod.includes("fut7") || mod.includes("fut 7")) {
    return feminino ? BACKGROUNDS["fut7-feminino"][formato] : BACKGROUNDS["fut7-masculino"][formato];
  }

  if (mod.includes("volei")) {
    return feminino ? BACKGROUNDS["volei-feminino"][formato] : BACKGROUNDS["volei-masculino"][formato];
  }

  if (mod.includes("queimado")) {
    return feminino ? BACKGROUNDS["queimado-feminino"][formato] : BACKGROUNDS["queimado-masculino"][formato];
  }

  if (mod.includes("futmesa") || mod.includes("fut mesa")) {
    return BACKGROUNDS.futmesa[formato];
  }

  if (mod.includes("atletismo")) {
    return BACKGROUNDS.atletismo[formato];
  }

  return null;
}


// ======================================================
// CARREGAR IMAGEM
// ======================================================

function carregar(src) {
  if (!src) return Promise.resolve(null);

  return new Promise((resolve) => {
    const img = new Image();

    img.crossOrigin = "anonymous";

    img.onload = () => resolve(img);

    img.onerror = () => resolve(null);

    img.src = src;
  });
}


// ======================================================
// RETÂNGULO ARREDONDADO
// ======================================================

function arredondado(ctx, x, y, w, h, r) {
  ctx.beginPath();

  ctx.moveTo(x + r, y);

  ctx.arcTo(
    x + w,
    y,
    x + w,
    y + h,
    r
  );

  ctx.arcTo(
    x + w,
    y + h,
    x,
    y + h,
    r
  );

  ctx.arcTo(
    x,
    y + h,
    x,
    y,
    r
  );

  ctx.arcTo(
    x,
    y,
    x + w,
    y,
    r
  );

  ctx.closePath();
}


// ======================================================
// TEXTO ESPAÇADO
// ======================================================

function textoEspacado(
  ctx,
  texto,
  cx,
  y,
  spacing = 3
) {
  const letras = texto.split("");

  const larguras = letras.map(
    (c) => ctx.measureText(c).width
  );

  const total =
    larguras.reduce(
      (a, b) => a + b,
      0
    ) +
    spacing *
    (letras.length - 1);

  const alinhamentoOriginal =
    ctx.textAlign;

  ctx.textAlign = "left";

  let x =
    cx -
    total / 2;

  letras.forEach(
    (c, i) => {
      ctx.fillText(
        c,
        x,
        y
      );

      x +=
        larguras[i] +
        spacing;
    }
  );

  ctx.textAlign =
    alinhamentoOriginal;
}


// ======================================================
// IMAGEM COVER
// ======================================================

function desenharCover(
  ctx,
  img,
  x,
  y,
  w,
  h,
  escala = 1,
  offsetX = 0,
  offsetY = 0
) {
  if (!img) return;

  const proporcaoQuadro =
    w / h;

  const proporcaoImg =
    img.width /
    img.height;

  let drawW;
  let drawH;

  if (
    proporcaoImg >
    proporcaoQuadro
  ) {
    drawH =
      h * escala;

    drawW =
      drawH *
      proporcaoImg;
  } else {
    drawW =
      w * escala;

    drawH =
      drawW /
      proporcaoImg;
  }

  const cx =
    x +
    w / 2 +
    offsetX;

  const cy =
    y +
    h / 2 +
    offsetY;

  ctx.drawImage(
    img,
    cx - drawW / 2,
    cy - drawH / 2,
    drawW,
    drawH
  );
}


// ======================================================
// EMBLEMA CIRCULAR
// ======================================================

function desenharEmblema(
  ctx,
  img,
  cx,
  cy,
  raio
) {
  const tamanho = raio * 2;

  ctx.save();

  if (img) {
    desenharCover(
      ctx,
      img,
      cx - raio,
      cy - raio,
      tamanho,
      tamanho
    );
  } else {
    ctx.fillStyle =
      "rgba(255,255,255,0.15)";

    ctx.fillRect(
      cx - raio,
      cy - raio,
      tamanho,
      tamanho
    );
  }

  ctx.restore();
}


// ======================================================
// BANDEIRA DO PAÍS
// ======================================================
//
// Usa d.bandeiraPais.
//
// Exemplo:
// d.bandeiraPais = "/assets/bandeiras/brasil.png"
//
// A posição é adicionada ao lado da data,
// sem alterar a posição original do conteúdo.
// ======================================================

function desenharBandeiraPais(
  ctx,
  img,
  x,
  y,
  tamanho
) {
  if (!img) return;

  ctx.save();

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    tamanho / 2,
    0,
    Math.PI * 2
  );

  ctx.closePath();

  ctx.clip();

  ctx.drawImage(
    img,
    x - tamanho / 2,
    y - tamanho / 2,
    tamanho,
    tamanho
  );

  ctx.restore();

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    tamanho / 2,
    0,
    Math.PI * 2
  );

  ctx.lineWidth = 2;

  ctx.strokeStyle =
    "rgba(255,255,255,0.85)";

  ctx.stroke();
}


// ======================================================
// DESENHAR RESUMO
// ======================================================

export async function desenharResumo(
  formato,
  d,
  opcoes = {}
) {
  const [
    W,
    H
  ] =
    DIMENSOES[
    formato
    ];

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = W;

  canvas.height = H;

  const ctx =
    canvas.getContext(
      "2d"
    );

  if (!ctx) return "";


  // ====================================================
  // FUNDO
  // ====================================================

  const fundoSrc =
    opcoes.fundoForcado ||
    obterFundo(
      d?.modalidade ||
      d?.esporte ||
      "",
      formato
    );

  if (!fundoSrc) {
    throw new Error(
      `Não existe fundo cadastrado para "${d?.modalidade}" no formato "${formato}".`
    );
  }


  // ====================================================
  // CARREGAR IMAGENS
  // ====================================================

  const [
    emblemaA,
    emblemaB,
    fundoImg,
    bandeiraPais
  ] =
    await Promise.all([
      carregar(
        d.bandeiraA
      ),

      carregar(
        d.bandeiraB
      ),

      carregar(
        fundoSrc
      ),

      // NOVO:
      // bandeira do país
      carregar(
        d.bandeiraPais
      ),
    ]);


  // ====================================================
  // ESCALA
  // ====================================================

  const u = 1;

  const layout = LAYOUT[formato];

  const centro =
    W / 2;

  const margem =
    40 * u;


  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "alphabetic";


  // ====================================================
  // 1) FUNDO
  // ====================================================

  if (fundoImg) {
    desenharCover(
      ctx,
      fundoImg,
      0,
      0,
      W,
      H,
      1,
      0,
      0
    );
  } else {
    const fundoGrad =
      ctx.createLinearGradient(
        0,
        0,
        W,
        H
      );

    fundoGrad.addColorStop(
      0,
      "#3a3a3a"
    );

    fundoGrad.addColorStop(
      1,
      "#161616"
    );

    ctx.fillStyle =
      fundoGrad;

    ctx.fillRect(
      0,
      0,
      W,
      H
    );
  }


  // ====================================================
  // OVERLAY
  // ====================================================

  const overlayBase =
    ctx.createLinearGradient(
      0,
      H * 0.72,
      0,
      H
    );

  overlayBase.addColorStop(
    0,
    "rgba(8,8,8,0)"
  );

  overlayBase.addColorStop(
    1,
    "rgba(8,8,8,0.65)"
  );

  ctx.fillStyle =
    overlayBase;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  // ====================================================
  // VINHETA
  // ====================================================

  const vinheta =
    ctx.createRadialGradient(
      centro,
      H / 2,
      Math.min(
        W,
        H
      ) * 0.35,

      centro,
      H / 2,
      Math.max(
        W,
        H
      ) * 0.8
    );

  vinheta.addColorStop(
    0,
    "rgba(0,0,0,0)"
  );

  vinheta.addColorStop(
    1,
    "rgba(0,0,0,0.4)"
  );

  ctx.fillStyle =
    vinheta;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  // ====================================================
  // 2) CAIXA DO TOPO
  // ====================================================

  const boxX =
    margem;

  const boxW =
    W -
    margem * 2;

  const boxY =
    margem;

  const boxH =
    172 * u;


  ctx.save();

  arredondado(
    ctx,
    boxX,
    boxY,
    boxW,
    boxH,
    12 * u
  );

  ctx.restore();

  // Buscando as configurações do formato atual (ex: '9:16' ou '4:5')
  const conf = LAYOUT[formato]; // Substitua 'formatoAtual' pela sua variável de escopo que define o formato

  // ====================================================
  // MODALIDADE
  // ====================================================

  ctx.fillStyle = OURO;

  // Usa o fontSize definido na const LAYOUT
  ctx.font = `800 ${Math.round(conf.modalidade.fontSize * u)}px system-ui, sans-serif`;

  // Usa o yOffset definido na const LAYOUT
  ctx.fillText(d.modalidade.toUpperCase(), centro, boxY + conf.modalidade.yOffset * u);


  // ====================================================
  // FASE
  // ====================================================

  ctx.fillStyle = "#FFFFFF";

  // Usa o fontSize definido na const LAYOUT
  ctx.font = `700 ${Math.round(conf.fase.fontSize * u)}px system-ui, sans-serif`;

  // Usa o yOffset definido na const LAYOUT
  ctx.fillText(d.fase.toUpperCase(), centro, boxY + conf.fase.yOffset * u);


  // ====================================================
  // SITUAÇÃO
  // ====================================================

  ctx.fillStyle = "rgba(255,255,255,0.9)";

  // Usa o fontSize definido na const LAYOUT
  ctx.font = `600 ${Math.round(conf.situacao.fontSize * u)}px system-ui, sans-serif`;

  // Usa o yOffset e spacing definidos na const LAYOUT
  textoEspacado(
    ctx,
    d.situacao.toUpperCase(),
    centro,
    boxY + conf.situacao.yOffset * u,
    conf.situacao.spacing * u
  );


  // ====================================================
  // 3) CONTEÚDO CENTRAL
  // ====================================================

  const rodapeReservado =
    90 * u;

  const contentTop =
    boxY +
    boxH +
    44 * u;

  const contentBottom =
    H -
    rodapeReservado;

  const espaco =
    contentBottom -
    contentTop;

  // ====================================================
  // RESULTADO (Ex: Vitória de TURMA por W.O.)
  // ====================================================

  // Texto de "resultado" normal (ex.: "GOLEADA"), sem nenhuma lógica de W.O. embutida.
  const textoResultado = (d.resultado || "").trim().toUpperCase();
  if (textoResultado && !["-", "NENHUM", "NORMAL"].includes(textoResultado) && layout.resultado) {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `700 ${Math.round(layout.resultado.fontSize * u)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(textoResultado, centro, layout.resultado.y * u);
  }

  // Aviso de W.O. — só aparece se o jogo REALMENTE terminou por W.O. (d.wo === true).
  if (d.wo === true && layout.wo) {
    const placarA = Number(d.placarA) || 0;
    const placarB = Number(d.placarB) || 0;
    const vencedorWo = placarA > placarB ? d.turmaA : placarB > placarA ? d.turmaB : null;

    if (vencedorWo) {
      ctx.fillStyle = OURO;
      ctx.font = `800 ${Math.round(layout.wo.fontSize * u)}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(`VITÓRIA DO ${vencedorWo.toUpperCase()} POR W.O.`, centro, layout.wo.y * u);
    }
  }

  // ====================================================
  // PLACAR
  // ====================================================

  const scoreY =
    contentTop +
    espaco * 0.68;


  const duploDigito = String(d.placarA).length >= 2 || String(d.placarB).length >= 2;
  const confPlacar = duploDigito && layout.placarDuplo ? layout.placarDuplo : layout.placar;
  const confX = duploDigito && layout.xDuplo ? layout.xDuplo : layout.x;

  const numFont =
    `900 ${Math.round(
      confPlacar.fontSize * u
    )}px system-ui, sans-serif`;

  const xFont =
    `900 ${Math.round(
      confX.fontSize * u
    )}px system-ui, sans-serif`;

  const labelFont =
    `900 ${Math.round(
      layout.label.fontSize * u
    )}px system-ui, sans-serif`;


  const labelY =
    layout.label.y * u;

  const xY = confX.y * u;


  ctx.font =
    xFont;

  const xTexto =
    "x";

  const xW =
    ctx.measureText(
      xTexto
    ).width;

  const gapX =
    confX.gap * u;

  const gapLabel =
    58 * u;




  ctx.font =
    numFont;

  const placarATxt =
    `${d.placarA}`;

  const placarBTxt =
    `${d.placarB}`;

  const aW =
    ctx.measureText(
      placarATxt
    ).width;

  const bW =
    ctx.measureText(
      placarBTxt
    ).width;


  // ====================================================
  // NÚMERO A
  // ====================================================

  ctx.textAlign =
    "right";

  ctx.fillStyle =
    OURO;

  ctx.font =
    numFont;

  ctx.fillText(
    placarATxt,
    confPlacar.x * u - xW / 2 - gapX,  // ← era layout.placar.x
    confPlacar.y * u                    // ← era layout.placar.y
  );


  // ====================================================
  // NÚMERO B
  // ====================================================

  ctx.textAlign =
    "left";

  ctx.fillText(
    placarBTxt,
    confPlacar.x * u + xW / 2 + gapX,  // ← era layout.placar.x
    confPlacar.y * u                    // ← era layout.placar.y
  );

  // ====================================================
  // TIME A
  // ====================================================

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `900 ${Math.round(layout.turmaA.fontSize * u)}px system-ui, sans-serif`;
  ctx.textAlign = "right";

  ctx.fillText(
    d.turmaA.toUpperCase(),
    layout.turmaA.x * u,
    layout.turmaA.y * u
  );


  // ====================================================
  // TIME B
  // ====================================================

  ctx.font = `900 ${Math.round(layout.turmaB.fontSize * u)}px system-ui, sans-serif`;
  ctx.textAlign = "left";

  ctx.fillText(
    d.turmaB.toUpperCase(),
    layout.turmaB.x * u,
    layout.turmaB.y * u
  );

  // ====================================================
  // NOTA
  // ====================================================

  let notaY =
    scoreY +
    64 * u;

  if (d.nota) {

    ctx.fillStyle =
      "rgba(255,255,255,0.85)";

    ctx.font =
      `600 ${Math.round(
        20 * u
      )}px system-ui, sans-serif`;

    ctx.fillText(
      d.nota,
      centro,
      notaY
    );

    notaY +=
      32 * u;
  }


  // ====================================================
  // ESCUDOS DOS TIMES — X, Y e tamanho de cada um, isolados.
  // Mexa em qualquer um dos 6 números abaixo sem afetar o outro escudo.
  // ====================================================

  desenharEmblema(
    ctx,
    emblemaA,
    layout.bandeiraA.x * u,
    layout.bandeiraA.y * u,
    layout.bandeiraA.size * u,
  );

  desenharEmblema(
    ctx,
    emblemaB,
    layout.bandeiraB.x * u,
    layout.bandeiraB.y * u,
    layout.bandeiraB.size * u,
  );


  // ====================================================
  // 4) RODAPÉ
  // ====================================================

  const rodapeY =
    H -
    80 * u;


  ctx.fillStyle =
    "rgba(255,255,255,0.8)";

  ctx.font =
    `900 ${Math.round(
      36 * u
    )}px system-ui, sans-serif`;

  ctx.textAlign =
    "center";


  // ====================================================
  // DATA / HORA | LOCAL
  // ====================================================

  ctx.font = `900 ${Math.round(layout.rodape.fontSize * u)}px system-ui, sans-serif`;
  ctx.textAlign = "center";

  // AQUI ALTERADO: Passa o dado da API pela função para garantir o formato correto
  const dataFinalJogo = tratarDataAPI(d.quando || d.data);

  ctx.fillText(
    dataFinalJogo,
    layout.rodape.dataX * u,
    layout.rodape.dataY * u
  );

  ctx.fillText(
    d.local,
    layout.rodape.localX * u,
    layout.rodape.localY * u
  );


  // ====================================================
  // BANDEIRA DO PAÍS
  // ====================================================
  //
  // ADICIONADO:
  // d.bandeiraPais
  //
  // A bandeira fica acima do rodapé,
  // sem alterar a posição do restante do layout.
  // ====================================================

  if (bandeiraPais) {
    desenharBandeiraPais(
      ctx,
      bandeiraPais,
      layout.bandeiraPais.x * u,
      layout.bandeiraPais.y * u,
      layout.bandeiraPais.size * u,
    );
  }

  // ====================================================
  // DATA DO JOGO
  // ====================================================
  //
  // Se d.data existir, ela é mostrada acima
  // da linha principal do rodapé.
  //
  // Não altera o layout existente.
  // ====================================================

  if (d.data) {

    const dataY =
      rodapeY -
      15 * u;

    ctx.fillStyle =
      "rgba(255,255,255,0.9)";

    ctx.font =
      `700 ${Math.round(
        22 * u
      )}px system-ui, sans-serif`;

    ctx.textAlign =
      "center";

    ctx.fillText(
      d.data,
      centro,
      dataY
    );
  }


  // ====================================================
  // RETORNAR IMAGEM
  // ====================================================

  return canvas.toDataURL(
    "image/png"
  );
}


// ======================================================
// BAIXAR IMAGEM
// ======================================================

export function baixarImagem(
  dataUrl,
  nome
) {
  const a =
    document.createElement(
      "a"
    );

  a.href =
    dataUrl;

  a.download =
    nome;

  a.click();
}

