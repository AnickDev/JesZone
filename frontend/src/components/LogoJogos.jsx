import { useEffect, useRef } from "react";
import "./LogoJogos.css";
import tacaJES from "../assets/tacaJES.png";

const TEXTO =
   "ACOMPANHE CADA MOMENTO • VIVA CADA DISPUTA • TUDO NA PALMA DE SUA MÃO • JESZONE •";

const CORES = {
  vermelho: [215, 25, 32],
  amarelo: [242, 193, 46],
  azul: [43, 89, 219],
  verde: [34, 161, 95],
  base: [244, 245, 248],
};

function limitar(valor, minimo, maximo) {
  return Math.max(minimo, Math.min(maximo, valor));
}

/*
 * Calcula a influência de uma cor de acordo com a posição
 * da letra na tela.
 *
 * Isso reproduz a lógica do seu .home-background:
 *
 * superior esquerdo  = vermelho
 * superior direito   = amarelo
 * inferior esquerdo  = azul
 * inferior direito   = verde
 */
function calcularCor(x, y) {
  const largura = window.innerWidth;
  const altura = window.innerHeight;

  /*
   * Normalizamos a posição da letra.
   */
  const nx = limitar(x / largura, 0, 1);
  const ny = limitar(y / altura, 0, 1);

  /*
   * Distância em relação aos quatro cantos.
   */
  const distanciaVermelho = Math.sqrt(
    nx * nx + ny * ny
  );

  const distanciaAmarelo = Math.sqrt(
    (1 - nx) * (1 - nx) + ny * ny
  );

  const distanciaAzul = Math.sqrt(
    nx * nx + (1 - ny) * (1 - ny)
  );

  const distanciaVerde = Math.sqrt(
    (1 - nx) * (1 - nx) +
      (1 - ny) * (1 - ny)
  );

  /*
   * Quanto menor a distância, maior a influência.
   */
  const raio = 0.7;

  function influencia(distancia) {
    const valor = 1 - distancia / raio;

    if (valor <= 0) {
      return 0;
    }

    return valor * valor;
  }

const pesos = {
  vermelho: influencia(distanciaVermelho) * 1,
  amarelo: influencia(distanciaAmarelo) * 1.85,
  azul: influencia(distanciaAzul) * 1,
  verde: influencia(distanciaVerde) * 2.20,
};

  /*
   * Intensidade parecida com o seu CSS:
   *
   * rgba(..., 0.48)
   */
  const intensidade = 3.5;

  pesos.vermelho *= intensidade;
  pesos.amarelo *= intensidade;
  pesos.azul *= intensidade;
  pesos.verde *= intensidade;

  const soma =
    pesos.vermelho +
    pesos.amarelo +
    pesos.azul +
    pesos.verde;

  /*
   * Começa com a cor base do seu background.
   */
  let r = CORES.base[0];
  let g = CORES.base[1];
  let b = CORES.base[2];

  /*
   * Mistura cada uma das cores.
   */
  if (soma > 0) {
    const cores = [
      {
        cor: CORES.vermelho,
        peso: pesos.vermelho,
      },
      {
        cor: CORES.amarelo,
        peso: pesos.amarelo,
      },
      {
        cor: CORES.azul,
        peso: pesos.azul,
      },
      {
        cor: CORES.verde,
        peso: pesos.verde,
      },
    ];

    let influenciaTotal = 0;

    for (const item of cores) {
      r +=
        (item.cor[0] - CORES.base[0]) *
        item.peso;

      g +=
        (item.cor[1] - CORES.base[1]) *
        item.peso;

      b +=
        (item.cor[2] - CORES.base[2]) *
        item.peso;

      influenciaTotal += item.peso;
    }

    /*
     * Evita exagerar a saturação.
     */
    if (influenciaTotal > 1) {
      r = CORES.base[0] +
        (r - CORES.base[0]) /
          influenciaTotal;

      g = CORES.base[1] +
        (g - CORES.base[1]) /
          influenciaTotal;

      b = CORES.base[2] +
        (b - CORES.base[2]) /
          influenciaTotal;
    }
  }

  return `rgb(
    ${Math.round(limitar(r, 0, 255))},
    ${Math.round(limitar(g, 0, 255))},
    ${Math.round(limitar(b, 0, 255))}
  )`;
}

export default function LogoJogos() {
  const letrasRef = useRef([]);

  useEffect(() => {
    let animationFrame;
    let ativo = true;

    function atualizarCores() {
      if (!ativo) return;

      /*
       * Cada letra é analisada separadamente.
       */
      letrasRef.current.forEach((letra) => {
        if (!letra) return;

        const rect = letra.getBoundingClientRect();

        /*
         * Centro visual da letra.
         */
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        const cor = calcularCor(x, y);

        letra.style.fill = cor;
      });

      animationFrame =
        requestAnimationFrame(atualizarCores);
    }

    atualizarCores();

    return () => {
      ativo = false;

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  /*
   * Quebra o texto em caracteres.
   *
   * A bolinha também é um caractere.
   *
   * Portanto temos:
   *
   * JOGOS ESTUDANTIS DO SESI • JOGOS...
   *
   * sem criar dois textos independentes.
   */
  const caracteres = Array.from(TEXTO);

  return (
    <div className="logo-jogos">

      {/* =====================================================
          CÍRCULO + TAÇA
      ====================================================== */}

      <div className="logo-circular">

        <svg
          className="texto-circular"
          viewBox="0 0 600 600"
          aria-hidden="true"
        >

          <defs>

            <path
              id="caminho-logo"
              d="
                M 300 300
                m -235 0
                a 235 235 0 1 1 470 0
                a 235 235 0 1 1 -470 0
              "
              fill="none"
            />

          </defs>

          {/* =================================================
              UM ÚNICO TEXTO

              Cada caractere possui sua própria referência
              para que a cor possa ser calculada.
          ================================================== */}

          <g className="texto-rotacao">

            <text className="texto-logo">

              <textPath
  href="#caminho-logo"
  startOffset="0%"
  textLength="1476"
  lengthAdjust="spacing"
>
  {caracteres.map((caractere, index) => (
    <tspan
      key={`${caractere}-${index}`}
      ref={(elemento) => {
        letrasRef.current[index] = elemento;
      }}
    >
      {caractere === " " ? "\u00A0" : caractere}
    </tspan>
  ))}
</textPath>

            </text>

          </g>

        </svg>


        {/* =====================================================
            TAÇA

            É UMA IMAGEM NORMAL.
            NENHUMA MÁSCARA É APLICADA.
        ====================================================== */}

        <img
          src={tacaJES}
          alt="Taça dos Jogos Estudantis do SESI"
          className="taca-logo"
        />

      </div>


      {/* =====================================================
          TEXTO GRANDE AO LADO
      ====================================================== */}

      <div className="nome-jogos">

        <span className="linha-jogos">
          JOGOS
        </span>

        <span className="linha-estudantis">
          ESTUDANTIS
        </span>

        <span className="linha-sesi">
          DO SESI
        </span>

      </div>

    </div>
  );
}