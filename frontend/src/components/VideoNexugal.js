import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/**
 * O vídeo da Nexugal, ao lado do cabeçalho dos exemplos (Exemplos.js). Há um
 * por língua (translations.js, `video`).
 *
 * Capa: parado, mostra a capa (uma imagem por cima do vídeo, e não o poster do
 * próprio vídeo: depois de tocado, o browser mostrava o primeiro frame em vez
 * dela). A caixa inteira é um botão; ao clicar, toca do início, com som.
 *
 * Controlos: são do site, não do browser. O atributo `controls` saiu porque é
 * a única maneira de tirar os três pontos e o ecrã inteiro em todos os
 * browsers, o Safari do iPhone incluído. Em baixo: reproduzir ou pausar, o som
 * (com a barra do volume ao passar o rato, só no computador) e a barra do
 * tempo, que mostra a parte já descarregada e, por cima, o tempo do ponto onde
 * está o rato (no telemóvel, enquanto se arrasta). Em cima à direita,
 * aumentar. Um clique no vídeo, fora deles, pausa ou retoma. A tocar,
 * escondem-se ao fim de 2 s sem mexer o rato, mas não com o rato em cima
 * deles nem a arrastar. O volume começa a 25%; no iPhone o volume é dos botões
 * do telemóvel e o browser ignora-o.
 *
 * Teclas, com o foco no leitor (depois de clicar nele, ou de lá chegar com o
 * Tab) e sempre na vista grande: espaço e K pausa ou retoma, setas para os
 * lados 5 s, setas para cima e para baixo o volume em 10%, M o som, F a vista
 * grande, Esc fecha-a, 0 a 9 saltam para 0% a 90%, Home e End o início e o
 * fim. Na barra do volume as quatro setas mexem no volume. Fora do leitor as
 * teclas são da página, como sempre.
 *
 * Pausa grande: em pausa (fora da capa), o ícone pausa-nexugal.svg ao centro,
 * a 40% da largura, com um véu azul-marinho por cima do vídeo. Ao retomar, as
 * duas barras afastam-se e rodam como uma fita. Para as mexer em separado sem
 * mudar o ficheiro, a imagem entra duas vezes, cada uma cortada a meio (a
 * barra da esquerda acaba a 41% da largura e a da direita começa a 59%).
 *
 * Vista grande: o botão de aumentar põe o MESMO vídeo por cima da página, a
 * 90% da altura do ecrã. Não é outro elemento de vídeo, é a mesma caixa que
 * passa a fixa ao ecrã, por isso não para nem recomeça. Cresce a partir do
 * sítio que tinha na secção (a técnica chama-se FLIP: mede-se antes e depois e
 * anima-se a diferença) e, ao fechar, encolhe de volta para lá; só então
 * aparece a capa. O lugar dela na página fica reservado, para nada saltar.
 * Fecha com o X, a tecla Esc, um clique fora ou no fim do vídeo. Com "reduzir
 * movimento", só um fade. As medidas são do CSS, por isso acompanham a janela
 * e a rotação do telemóvel.
 *
 * Também: um sinal de carregamento discreto quando o vídeo demora a arrancar
 * ou a saltar; as teclas multimédia (Media Session, com o título "Nexugal" e a
 * capa); e, se o vídeo falhar, volta à capa em vez de ficar preso. Mudar de
 * língua troca de vídeo e volta à capa.
 *
 * Os ficheiros estão em public/video, fora do src, para não entrarem no
 * JavaScript do site. Com preload="none" nada do vídeo se descarrega até
 * alguém clicar: só a capa.
 *
 * Tamanho: no computador quem decide é o Exemplos.js, que mede o espaço e
 * passa `tamanho` (largura e altura em píxeis inteiros). No telemóvel, LARGURA.
 *
 * Versões: hoje há só a vertical (9:16). Uma deitada (16:9) entra em
 * `video.versoes.larga` no translations.js e passa a ser a dos ecrãs a partir
 * de 1024px.
 */

const ECRA_LARGO = '(min-width: 1024px)';
const ICONE_PAUSA = '/video/pausa-nexugal.svg';
const VOLUME_INICIAL = 0.25;
const PASSO_VOLUME = 0.1;
const PASSO_TEMPO = 5;
const ESCONDER_CONTROLOS_MS = 2000;
// O sinal de carregamento só aparece se a espera passar disto: um salto
// rápido não pisca nada.
const CARREGAR_MS = 250;
const PAUSA_SAIDA_MS = 400;
const VISTA_MS = 400;
const VISTA_MS_SEM_MOVIMENTO = 200;
const VISTA_CURVA = 'cubic-bezier(0.22, 1, 0.36, 1)';
// Cantos da caixa, nos dois tamanhos (rounded-2xl)
const RAIO = 16;

function useEcraLargo() {
  const [largo, setLargo] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(ECRA_LARGO).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia(ECRA_LARGO);
    const aoMudar = (evento) => setLargo(evento.matches);
    setLargo(mql.matches);
    mql.addEventListener('change', aoMudar);
    return () => mql.removeEventListener('change', aoMudar);
  }, []);

  return largo;
}

// Espera que as animações acabem, mas nunca mais do que `ms`: num separador
// escondido o browser não as faz andar, e a vista grande ficaria presa. Quem
// chama salta as que ficaram por acabar para o fim (finish ou cancel).
function quandoAcabarem(animacoes, ms) {
  const todas = Promise.all(animacoes.map((a) => a.finished)).catch(() => {});
  return Promise.race([todas, new Promise((r) => setTimeout(r, ms))]);
}

function minutos(segundos) {
  const s = Number.isFinite(segundos) && segundos > 0 ? Math.floor(segundos) : 0;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function entre(valor, minimo, maximo) {
  return Math.min(maximo, Math.max(minimo, valor));
}

// Pede ao vídeo que toque, sem deixar a recusa do browser virar erro. Se o
// vídeo já tinha falhado, o browser recusa o play sem novo aviso de erro: é
// o NotSupportedError, e aí chama `aoFalhar`.
function reproduzir(video, aoFalhar) {
  const promessa = video.play();
  if (promessa && typeof promessa.catch === 'function') {
    promessa.catch((erro) => {
      if (aoFalhar && erro && erro.name === 'NotSupportedError') aoFalhar();
    });
  }
}

// Classes escritas por extenso: o Tailwind só gera as que encontra no código.
const LARGURA = {
  vertical: 'w-full max-w-[240px] lg:w-[160px]',
  larga: 'lg:w-[380px]',
};

const BOTAO_CONTROLO =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-colors duration-200 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white';

// O que cada estado da pausa grande pede ao véu, ao ícone e a cada barra
const PAUSA = {
  oculta: { veu: 'opacity-0', icone: 'opacity-0', esq: '', dir: '' },
  visivel: {
    veu: 'animate-aparecer',
    icone: 'animate-pausa-entra motion-reduce:animate-aparecer',
    esq: '',
    dir: '',
  },
  'a-sair': {
    veu: 'animate-desaparecer',
    icone: '',
    esq: 'animate-pausa-sai-esq motion-reduce:animate-desaparecer',
    dir: 'animate-pausa-sai-dir motion-reduce:animate-desaparecer',
  },
};

function IconeReproduzir() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
    </svg>
  );
}

function IconePausar() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1.2" />
      <rect x="14" y="5" width="4" height="14" rx="1.2" />
    </svg>
  );
}

function IconeSom({ ligado }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5L6 9H3v6h3l5 4V5z" fill="currentColor" />
      {ligado ? (
        <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
      ) : (
        <path d="M16 9l5 6M21 9l-5 6" />
      )}
    </svg>
  );
}

function IconeExpandir() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

function IconeFechar() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export default function VideoNexugal({ tamanho = null, className = '' }) {
  const { t } = useLanguage();
  const v = t.video;
  const { vertical, larga } = v.versoes;

  const ecraLargo = useEcraLargo();
  const tipo = larga && ecraLargo ? 'larga' : 'vertical';
  const versao = tipo === 'larga' ? larga : vertical;
  const proporcao = `${versao.largura} / ${versao.altura}`;

  const semMovimento = usePrefersReducedMotion();
  const semMovimentoRef = useRef(semMovimento);
  semMovimentoRef.current = semMovimento;

  const lugarRef = useRef(null);
  const caixaRef = useRef(null);
  const videoRef = useRef(null);
  const fundoRef = useRef(null);
  const capaRef = useRef(null);
  const fecharRef = useRef(null);
  const reproduzirRef = useRef(null);
  const barraRef = useRef(null);
  const preenchimentoRef = useRef(null);
  const pegaRef = useRef(null);

  // 'capa' até alguém carregar no play; 'video' a partir daí. Serve para
  // distinguir a pausa de quem vê da pausa de voltar à capa.
  const modoRef = useRef('capa');
  const temporizadorRef = useRef(null);
  const carregarRef = useRef(null);
  const arrastoRef = useRef(false);
  const sobreControlosRef = useRef(false);
  const antesDeAbrirRef = useRef(null);
  const fecharDepoisRef = useRef(false);
  const teclasRef = useRef(null);

  const [aTocar, setATocar] = useState(false); // false: capa
  const [emPausa, setEmPausa] = useState(true);
  const [pausa, setPausa] = useState('oculta'); // 'oculta' | 'visivel' | 'a-sair'
  const [controlosVisiveis, setControlosVisiveis] = useState(true);
  const [aCarregar, setACarregar] = useState(false);
  const [volume, setVolume] = useState(VOLUME_INICIAL);
  const [mudo, setMudo] = useState(false);
  const [tempo, setTempo] = useState(0);
  const [duracao, setDuracao] = useState(0);
  const [carregado, setCarregado] = useState([]); // partes já descarregadas, de 0 a 1
  const [dica, setDica] = useState(null); // tempo por cima da barra: { x, texto }
  // 'normal' | 'abrindo' | 'grande' | 'fechando'
  const [fase, setFase] = useState('normal');
  const faseRef = useRef(fase);
  faseRef.current = fase;
  const grande = fase !== 'normal';

  // ---------------------------------------------------------------- vídeo

  // A barra do tempo pinta-se direto no DOM, a cada frame enquanto toca: pelo
  // estado do React, só mexia quatro vezes por segundo, aos saltos.
  const pintarTempo = useCallback(() => {
    const video = videoRef.current;
    if (!video || !preenchimentoRef.current) return;
    const d = video.duration;
    const fracao = Number.isFinite(d) && d > 0 ? entre(video.currentTime / d, 0, 1) : 0;
    preenchimentoRef.current.style.transform = `scaleX(${fracao})`;
    if (pegaRef.current) pegaRef.current.style.left = `${fracao * 100}%`;
  }, []);

  const atualizarCarregado = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const d = video.duration;
    const partes = [];
    if (Number.isFinite(d) && d > 0) {
      for (let i = 0; i < video.buffered.length; i += 1) {
        partes.push([video.buffered.start(i) / d, video.buffered.end(i) / d]);
      }
    }
    setCarregado((antes) => (JSON.stringify(antes) === JSON.stringify(partes) ? antes : partes));
  }, []);

  const comecarACarregar = useCallback(() => {
    clearTimeout(carregarRef.current);
    carregarRef.current = setTimeout(() => setACarregar(true), CARREGAR_MS);
  }, []);

  const pararDeCarregar = useCallback(() => {
    clearTimeout(carregarRef.current);
    setACarregar(false);
  }, []);

  const mostrarControlos = useCallback(() => {
    setControlosVisiveis(true);
    clearTimeout(temporizadorRef.current);
    const esconder = () => {
      const video = videoRef.current;
      // A arrastar a barra do tempo, ou com o rato em cima, os controlos ficam
      if (arrastoRef.current || sobreControlosRef.current) {
        temporizadorRef.current = setTimeout(esconder, ESCONDER_CONTROLOS_MS);
        return;
      }
      if (video && !video.paused) setControlosVisiveis(false);
    };
    temporizadorRef.current = setTimeout(esconder, ESCONDER_CONTROLOS_MS);
  }, []);

  // Para, volta ao início e mostra a capa. O load() larga o que já se
  // descarregou e põe o vídeo no estado de antes do primeiro clique.
  const voltarACapa = useCallback(() => {
    modoRef.current = 'capa';
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.load();
    }
    clearTimeout(temporizadorRef.current);
    clearTimeout(carregarRef.current);
    setATocar(false);
    setEmPausa(true);
    setPausa('oculta');
    setControlosVisiveis(true);
    setACarregar(false);
    setTempo(0);
    setCarregado([]);
    setDica(null);
  }, []);

  const tocar = () => {
    const video = videoRef.current;
    if (!video) return;
    modoRef.current = 'video';
    setATocar(true);
    setPausa('oculta');
    // Se falhou da última vez, tenta de raiz (uma falha de rede pode já ter passado)
    if (video.error) video.load();
    video.currentTime = 0;
    reproduzir(video, falhou);
  };

  const alternar = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) reproduzir(video, falhou);
    else video.pause();
    mostrarControlos();
  };

  const alternarSom = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.muted || video.volume === 0) {
      if (video.volume === 0) video.volume = VOLUME_INICIAL;
      video.muted = false;
    } else {
      video.muted = true;
    }
    mostrarControlos();
  };

  const mudarVolume = (evento) => {
    const video = videoRef.current;
    if (!video) return;
    const novo = Number(evento.target.value);
    video.volume = novo;
    video.muted = novo === 0;
    mostrarControlos();
  };

  // Teclas: o volume anda em 10%. Sem som, baixar não volta a ligar o som.
  const mudarVolumePor = (passo) => {
    const video = videoRef.current;
    if (!video) return;
    const novo = Math.round(entre(video.volume + passo, 0, 1) * 100) / 100;
    video.volume = novo;
    if (novo === 0) video.muted = true;
    else if (passo > 0) video.muted = false;
  };

  const irParaTempo = (segundos) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    video.currentTime = entre(segundos, 0, video.duration);
    setTempo(Math.floor(video.currentTime));
    pintarTempo();
  };

  // O ponto da barra que está debaixo do rato (ou do dedo), de 0 a 1
  const fracaoNaBarra = (clienteX) => {
    const barra = barraRef.current;
    if (!barra) return 0;
    const caixa = barra.getBoundingClientRect();
    return entre((clienteX - caixa.left) / caixa.width, 0, 1);
  };

  const irPara = (clienteX) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    irParaTempo(fracaoNaBarra(clienteX) * video.duration);
  };

  const mostrarDica = (clienteX) => {
    const video = videoRef.current;
    const barra = barraRef.current;
    if (!video || !barra || !Number.isFinite(video.duration) || video.duration <= 0) return;
    const fracao = fracaoNaBarra(clienteX);
    const largura = barra.getBoundingClientRect().width;
    // A etiqueta não sai da barra pelos lados
    setDica({ x: entre(fracao * largura, 16, largura - 16), texto: minutos(fracao * video.duration) });
  };

  const falhou = () => {
    // Na capa um erro não interessa: o load() de voltar à capa também os dá
    if (modoRef.current !== 'video') return;
    if (faseRef.current === 'normal') voltarACapa();
    else if (faseRef.current === 'grande') setFase('fechando');
    else fecharDepoisRef.current = true;
  };

  // O volume começa a 25%
  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = VOLUME_INICIAL;
  }, [versao.ficheiro]);

  // Outro vídeo (outra língua, ou a janela passou o corte de uma versão
  // larga): volta à capa do novo. O antigo sai da página e o browser para-o.
  useEffect(() => {
    modoRef.current = 'capa';
    clearTimeout(temporizadorRef.current);
    clearTimeout(carregarRef.current);
    setATocar(false);
    setFase('normal');
    setPausa('oculta');
    setEmPausa(true);
    setACarregar(false);
    setTempo(0);
    setDuracao(0);
    setCarregado([]);
    setDica(null);
  }, [versao.ficheiro]);

  // A barra do tempo, a cada frame, enquanto o vídeo toca
  useEffect(() => {
    if (!aTocar || emPausa) return undefined;
    let pedido;
    const passo = () => {
      pintarTempo();
      pedido = window.requestAnimationFrame(passo);
    };
    pedido = window.requestAnimationFrame(passo);
    return () => window.cancelAnimationFrame(pedido);
  }, [aTocar, emPausa, pintarTempo]);

  // A saída da pausa grande dura 0,4 s; depois, some de vez.
  useEffect(() => {
    if (pausa !== 'a-sair') return undefined;
    const fim = setTimeout(() => setPausa((p) => (p === 'a-sair' ? 'oculta' : p)), PAUSA_SAIDA_MS);
    return () => clearTimeout(fim);
  }, [pausa]);

  // Ao sair da capa, o foco passa para o botão de reproduzir: quem usa o
  // teclado fica logo nos controlos. Na vista grande o foco é do X.
  useEffect(() => {
    if (aTocar && faseRef.current === 'normal' && reproduzirRef.current) {
      reproduzirRef.current.focus({ preventScroll: true });
    }
  }, [aTocar]);

  // Teclas multimédia do teclado e dos auscultadores, e o cartão do sistema
  // (o que aparece no ecrã bloqueado do telemóvel, por exemplo).
  useEffect(() => {
    if (!aTocar || typeof navigator === 'undefined' || !('mediaSession' in navigator)) return undefined;
    const sessao = navigator.mediaSession;
    try {
      sessao.metadata = new window.MediaMetadata({
        title: 'Nexugal',
        artwork: [
          {
            src: new URL(versao.capa, window.location.origin).href,
            sizes: `${versao.largura}x${versao.altura}`,
            type: 'image/jpeg',
          },
        ],
      });
    } catch (erro) {
      // Browser sem MediaMetadata: as teclas funcionam na mesma
    }
    const saltar = (segundos) => {
      const video = videoRef.current;
      if (video && Number.isFinite(video.duration)) {
        video.currentTime = entre(video.currentTime + segundos, 0, video.duration);
      }
    };
    const acoes = {
      play: () => videoRef.current && reproduzir(videoRef.current),
      pause: () => videoRef.current && videoRef.current.pause(),
      seekbackward: () => saltar(-PASSO_TEMPO),
      seekforward: () => saltar(PASSO_TEMPO),
      seekto: (detalhe) => {
        if (videoRef.current && Number.isFinite(detalhe.seekTime)) videoRef.current.currentTime = detalhe.seekTime;
      },
    };
    Object.entries(acoes).forEach(([acao, fazer]) => {
      try {
        sessao.setActionHandler(acao, fazer);
      } catch (erro) {
        // Ação que este browser não conhece
      }
    });
    return () => {
      Object.keys(acoes).forEach((acao) => {
        try {
          sessao.setActionHandler(acao, null);
        } catch (erro) {
          // idem
        }
      });
      try {
        sessao.metadata = null;
        sessao.playbackState = 'none';
      } catch (erro) {
        // idem
      }
    };
  }, [aTocar, versao.capa, versao.largura, versao.altura]);

  useEffect(() => {
    const temporizador = temporizadorRef;
    const carregar = carregarRef;
    return () => {
      clearTimeout(temporizador.current);
      clearTimeout(carregar.current);
    };
  }, []);

  // ------------------------------------------------------- vista grande

  const abrirGrande = () => {
    if (faseRef.current !== 'normal' || !caixaRef.current) return;
    antesDeAbrirRef.current = caixaRef.current.getBoundingClientRect();
    if (!aTocar) tocar();
    setFase('abrindo');
  };

  const fecharGrande = useCallback(() => {
    if (faseRef.current === 'grande') setFase('fechando');
    else if (faseRef.current === 'abrindo') fecharDepoisRef.current = true;
  }, []);

  const aoAcabar = () => {
    if (faseRef.current === 'normal') voltarACapa();
    else fecharGrande();
  };

  // A página por trás não desliza. O scrollbar-gutter guarda o lugar da barra
  // de deslocamento, para a página não alargar e o vídeo não saltar de lado.
  useLayoutEffect(() => {
    if (!grande) return undefined;
    const html = document.documentElement;
    const antes = {
      overflow: html.style.overflow,
      gutter: html.style.scrollbarGutter,
      corpo: document.body.style.overflow,
    };
    if (window.innerWidth > html.clientWidth) html.style.scrollbarGutter = 'stable';
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = antes.overflow;
      html.style.scrollbarGutter = antes.gutter;
      document.body.style.overflow = antes.corpo;
    };
  }, [grande]);

  // Abrir: a caixa já está no centro do ecrã; começa desenhada no sítio e com
  // o tamanho que tinha na secção e anima até ao lugar novo.
  useLayoutEffect(() => {
    if (fase !== 'abrindo') return undefined;
    const caixa = caixaRef.current;
    const de = antesDeAbrirRef.current;
    if (!caixa || !de) return undefined;
    const para = caixa.getBoundingClientRect();
    const ms = semMovimentoRef.current ? VISTA_MS_SEM_MOVIMENTO : VISTA_MS;

    const animacoes = [];
    if (semMovimentoRef.current) {
      animacoes.push(caixa.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms, easing: 'ease-out' }));
    } else {
      const sx = de.width / para.width;
      const sy = de.height / para.height;
      animacoes.push(
        caixa.animate(
          [
            {
              transformOrigin: '0 0',
              transform: `translate(${de.left - para.left}px, ${de.top - para.top}px) scale(${sx}, ${sy})`,
              borderRadius: `${RAIO / sx}px / ${RAIO / sy}px`,
            },
            { transformOrigin: '0 0', transform: 'none', borderRadius: `${RAIO}px` },
          ],
          { duration: ms, easing: VISTA_CURVA }
        )
      );
    }
    [fundoRef.current, fecharRef.current].forEach((el) => {
      if (el) animacoes.push(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms, easing: 'ease-out' }));
    });
    if (fecharRef.current) fecharRef.current.focus({ preventScroll: true });

    let ativo = true;
    quandoAcabarem(animacoes, ms + 100).then(() => {
      if (!ativo) return;
      // Se o browser não as fez andar, salta para o fim: a caixa fica grande
      animacoes.forEach((a) => {
        if (a.playState !== 'finished') a.finish();
      });
      if (fecharDepoisRef.current) {
        fecharDepoisRef.current = false;
        setFase('fechando');
      } else {
        setFase('grande');
      }
    });
    return () => {
      ativo = false;
    };
  }, [fase]);

  // Fechar: o caminho inverso, até ao lugar na secção. Só no fim a caixa
  // volta para lá de verdade e aparece a capa, tudo no mesmo frame.
  useLayoutEffect(() => {
    if (fase !== 'fechando') return undefined;
    const caixa = caixaRef.current;
    const lugar = lugarRef.current;
    if (!caixa || !lugar) return undefined;
    const de = caixa.getBoundingClientRect();
    const para = lugar.getBoundingClientRect();
    const ms = semMovimentoRef.current ? VISTA_MS_SEM_MOVIMENTO : VISTA_MS;
    const ate = { duration: ms, easing: VISTA_CURVA, fill: 'forwards' };

    const animacoes = [];
    if (semMovimentoRef.current) {
      animacoes.push(caixa.animate([{ opacity: 1 }, { opacity: 0 }], { ...ate, easing: 'ease-in' }));
    } else {
      const sx = para.width / de.width;
      const sy = para.height / de.height;
      animacoes.push(
        caixa.animate(
          [
            { transformOrigin: '0 0', transform: 'none', borderRadius: `${RAIO}px` },
            {
              transformOrigin: '0 0',
              transform: `translate(${para.left - de.left}px, ${para.top - de.top}px) scale(${sx}, ${sy})`,
              borderRadius: `${RAIO / sx}px / ${RAIO / sy}px`,
            },
          ],
          ate
        )
      );
    }
    [fundoRef.current, fecharRef.current].forEach((el) => {
      if (el) animacoes.push(el.animate([{ opacity: 1 }, { opacity: 0 }], { ...ate, easing: 'ease-in' }));
    });

    let ativo = true;
    quandoAcabarem(animacoes, ms + 100).then(() => {
      if (!ativo) return;
      flushSync(() => {
        setFase('normal');
        voltarACapa();
      });
      animacoes.forEach((a) => a.cancel());
      if (capaRef.current) capaRef.current.focus({ preventScroll: true });
    });
    return () => {
      ativo = false;
    };
  }, [fase, voltarACapa]);

  // ------------------------------------------------------------- teclas

  // Na vista grande o Tab anda só entre o X e os controlos
  const prenderTab = (evento) => {
    const ordem = [
      fecharRef.current,
      ...caixaRef.current.querySelectorAll('button, input, [tabindex="0"]'),
    ].filter((el) => el && el.getClientRects().length > 0);
    if (ordem.length === 0) return;
    const i = ordem.indexOf(document.activeElement);
    const seguinte = evento.shiftKey ? ordem[(i - 1 + ordem.length) % ordem.length] : ordem[(i + 1) % ordem.length];
    evento.preventDefault();
    seguinte.focus();
  };

  // Refeita a cada desenho, para ver sempre o estado atual. Quem a chama é
  // um só ouvinte no documento, ligado uma vez (logo abaixo).
  teclasRef.current = (evento) => {
    const lugar = lugarRef.current;
    const video = videoRef.current;
    if (!lugar || !video) return;
    const aberta = faseRef.current !== 'normal';
    const foco = document.activeElement;
    // Fora da vista grande, só com o foco no leitor: o resto é da página
    if (!aberta && !lugar.contains(foco)) return;
    if (evento.ctrlKey || evento.metaKey || evento.altKey) return;

    const tecla = evento.key.length === 1 ? evento.key.toLowerCase() : evento.key;
    if (tecla === 'Escape') {
      if (aberta) {
        evento.preventDefault();
        fecharGrande();
      }
      return;
    }
    if (tecla === 'Tab') {
      if (aberta && caixaRef.current) prenderTab(evento);
      return;
    }
    const noBotao = foco && foco.tagName === 'BUTTON';
    const noVolume = foco && foco.tagName === 'INPUT' && foco.type === 'range';
    // Espaço e Enter num botão são do botão (é assim que se carrega nele)
    if (tecla === 'Enter' || (tecla === ' ' && noBotao)) return;

    // Na capa só se pode começar; as setas continuam a deslizar a página
    if (!aTocar) {
      if (tecla === ' ' || tecla === 'k') {
        evento.preventDefault();
        tocar();
      } else if (tecla === 'f') {
        evento.preventDefault();
        abrirGrande();
      }
      return;
    }

    const d = video.duration;
    let feito = true;
    switch (tecla) {
      case ' ':
      case 'k':
        alternar();
        break;
      case 'm':
        alternarSom();
        break;
      case 'f':
        if (aberta) fecharGrande();
        else abrirGrande();
        break;
      case 'ArrowLeft':
        if (noVolume) mudarVolumePor(-PASSO_VOLUME);
        else irParaTempo(video.currentTime - PASSO_TEMPO);
        break;
      case 'ArrowRight':
        if (noVolume) mudarVolumePor(PASSO_VOLUME);
        else irParaTempo(video.currentTime + PASSO_TEMPO);
        break;
      case 'ArrowUp':
        mudarVolumePor(PASSO_VOLUME);
        break;
      case 'ArrowDown':
        mudarVolumePor(-PASSO_VOLUME);
        break;
      case 'Home':
        irParaTempo(0);
        break;
      case 'End':
        // Uma décima antes do fim: a tocar, acaba logo a seguir; em pausa,
        // fica no último frame em vez de saltar para a capa.
        irParaTempo(d - 0.1);
        break;
      default:
        if (/^[0-9]$/.test(tecla) && Number.isFinite(d)) irParaTempo((Number(tecla) / 10) * d);
        else feito = false;
    }
    if (feito) {
      evento.preventDefault();
      mostrarControlos();
    }
  };

  useEffect(() => {
    const aoTeclar = (evento) => {
      if (teclasRef.current) teclasRef.current(evento);
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, []);

  // ------------------------------------------------------------- desenho

  // O lugar na página. No computador tem as medidas que o Exemplos.js passa;
  // no telemóvel, a largura de LARGURA e a altura da proporção.
  const estiloLugar =
    ecraLargo && tamanho
      ? { width: tamanho.largura, height: tamanho.altura, maxWidth: 'none' }
      : { aspectRatio: proporcao };

  // A caixa, na vista grande: centrada no ecrã, a 90% da altura, sem passar
  // 95% da largura. As duas medidas por extenso, para o centrar com margin
  // auto (um transform fixo aqui atrapalhava a animação de crescer).
  const estiloGrande = {
    width: `min(95vw, calc(90dvh * ${versao.largura} / ${versao.altura}))`,
    height: `min(90dvh, calc(95vw * ${versao.altura} / ${versao.largura}))`,
  };

  // A tocar, os controlos somem ao fim de 2 s; em pausa ficam sempre.
  const comControlos = !aTocar || emPausa || controlosVisiveis;
  const escondido = 'pointer-events-none opacity-0';
  const estadoPausa = PAUSA[pausa];
  const semSom = mudo || volume === 0;

  return (
    <div ref={lugarRef} className={`relative ${LARGURA[tipo]} ${className}`} style={estiloLugar}>
      {grande && (
        <div
          ref={fundoRef}
          className="fixed inset-0 z-[100] bg-azul-profundo/70 backdrop-blur-md"
          onClick={fecharGrande}
          aria-hidden="true"
        />
      )}

      {/* tabIndex -1: não entra na ordem do Tab (os botões lá de dentro
          entram), mas recebe o foco ao clicar no vídeo, e é isso que liga as
          teclas do leitor. */}
      <div
        ref={caixaRef}
        tabIndex={-1}
        className={`${
          grande
            ? 'fixed inset-0 z-[101] m-auto shadow-azul-lg'
            : 'group absolute inset-0 shadow-azul'
        } overflow-hidden rounded-2xl outline-none [container-type:inline-size] ${
          aTocar && !comControlos ? 'cursor-none' : ''
        }`}
        style={grande ? estiloGrande : undefined}
        role={grande ? 'dialog' : 'group'}
        aria-modal={grande ? 'true' : undefined}
        aria-label={v.rotuloVideo}
        onPointerMove={aTocar ? mostrarControlos : undefined}
        onPointerDown={() => {
          // O Safari não dá o foco aos botões ao clicar: fica no leitor
          const caixa = caixaRef.current;
          if (caixa && !caixa.contains(document.activeElement)) caixa.focus({ preventScroll: true });
          if (aTocar) mostrarControlos();
        }}
      >
        <video
          ref={videoRef}
          key={versao.ficheiro}
          className={`block h-full w-full ${grande ? 'object-contain' : 'object-cover'}`}
          src={versao.ficheiro}
          poster={versao.capa}
          preload="none"
          playsInline
          disablePictureInPicture
          aria-label={v.rotuloVideo}
          onPlay={() => {
            setEmPausa(false);
            setPausa((p) => (p === 'visivel' ? 'a-sair' : p));
            mostrarControlos();
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
          }}
          onPause={() => {
            setEmPausa(true);
            const video = videoRef.current;
            if (video && !video.seeking) pararDeCarregar();
            if (modoRef.current === 'capa' || (video && video.ended)) return;
            setPausa('visivel');
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
          }}
          onLoadStart={() => {
            if (modoRef.current === 'video') comecarACarregar();
          }}
          onWaiting={comecarACarregar}
          onSeeking={comecarACarregar}
          onPlaying={pararDeCarregar}
          onCanPlay={pararDeCarregar}
          onSeeked={() => {
            pararDeCarregar();
            pintarTempo();
            atualizarCarregado();
          }}
          onProgress={atualizarCarregado}
          onTimeUpdate={() => {
            if (videoRef.current) setTempo(Math.floor(videoRef.current.currentTime));
            pintarTempo();
          }}
          onDurationChange={() => {
            const d = videoRef.current && videoRef.current.duration;
            setDuracao(Number.isFinite(d) ? d : 0);
            pintarTempo();
            atualizarCarregado();
          }}
          onVolumeChange={() => {
            const video = videoRef.current;
            if (!video) return;
            setVolume(video.volume);
            setMudo(video.muted);
          }}
          onError={() => {
            pararDeCarregar();
            falhou();
          }}
          onEnded={aoAcabar}
        />

        {aTocar && (
          <>
            {/* Pausa grande, por cima do vídeo e por baixo de tudo o resto */}
            <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
              <div className={`absolute inset-0 bg-azul-profundo/35 ${estadoPausa.veu}`} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`relative w-[40%] ${estadoPausa.icone}`}
                  style={{
                    aspectRatio: '200 / 220',
                    filter: 'drop-shadow(0 0 3.5cqw rgba(64, 228, 255, 0.6))',
                  }}
                >
                  <img
                    src={ICONE_PAUSA}
                    alt=""
                    className={`absolute inset-0 h-full w-full origin-[25.5%_50%] [clip-path:inset(0_50%_0_0)] ${estadoPausa.esq}`}
                  />
                  <img
                    src={ICONE_PAUSA}
                    alt=""
                    className={`absolute inset-0 h-full w-full origin-[74.5%_50%] [clip-path:inset(0_0_0_50%)] ${estadoPausa.dir}`}
                  />
                </div>
              </div>
            </div>

            {/* Sinal de carregamento. Com a pausa grande no ecrã, desce, para
                não ficar por cima do ícone. */}
            {aCarregar && (
              <div
                role="status"
                aria-label={v.aCarregar}
                className={`pointer-events-none absolute left-1/2 z-[15] w-[12%] -translate-x-1/2 -translate-y-1/2 ${
                  pausa === 'visivel' ? 'top-[72%]' : 'top-1/2'
                }`}
              >
                <div className="aspect-square w-full animate-spin rounded-full border-[3px] border-white/30 border-t-white" />
              </div>
            )}

            {/* Um clique no vídeo, fora dos controlos, pausa ou retoma. Para o
                teclado há o botão de reproduzir e as teclas. */}
            <div
              className="absolute inset-0 z-20"
              onClick={() => {
                if (caixaRef.current) caixaRef.current.focus({ preventScroll: true });
                alternar();
              }}
              aria-hidden="true"
            />

            {/* A faixa escura não apanha cliques: um clique nela é um clique
                no vídeo. Só a fila dos controlos os apanha. */}
            <div
              className={`pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-2 pb-1.5 pt-10 transition-opacity duration-300 ${
                comControlos ? 'opacity-100' : 'opacity-0 has-[:focus-visible]:opacity-100'
              }`}
            >
              <div
                className={`flex items-center ${comControlos ? 'pointer-events-auto' : 'pointer-events-none'}`}
                onPointerEnter={() => {
                  sobreControlosRef.current = true;
                }}
                onPointerLeave={() => {
                  sobreControlosRef.current = false;
                  mostrarControlos();
                }}
              >
                <button
                  ref={reproduzirRef}
                  type="button"
                  onClick={alternar}
                  aria-label={emPausa ? v.reproduzir : v.pausar}
                  className={BOTAO_CONTROLO}
                >
                  {emPausa ? <IconeReproduzir /> : <IconePausar />}
                </button>

                <div className="group/som flex items-center">
                  <button
                    type="button"
                    onClick={alternarSom}
                    aria-label={semSom ? v.ligarSom : v.desligarSom}
                    className={BOTAO_CONTROLO}
                  >
                    <IconeSom ligado={!semSom} />
                  </button>
                  {/* Só no computador: no telemóvel o volume é dos botões dele */}
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={mudo ? 0 : volume}
                    onChange={mudarVolume}
                    aria-label={v.volume}
                    className="m-0 h-1 w-0 cursor-pointer rounded opacity-0 accent-azul-vivo transition-all duration-200 focus:outline-none group-hover/som:mx-1.5 group-hover/som:w-14 group-hover/som:opacity-100 focus-visible:mx-1.5 focus-visible:w-14 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white [@media(hover:none)]:hidden"
                  />
                </div>

                <div
                  ref={barraRef}
                  role="slider"
                  tabIndex={0}
                  aria-label={v.tempo}
                  aria-valuemin={0}
                  aria-valuemax={Math.floor(duracao)}
                  aria-valuenow={tempo}
                  aria-valuetext={`${minutos(tempo)} ${v.de} ${minutos(duracao)}`}
                  className="group/barra relative ml-1.5 mr-1 flex h-7 min-w-0 flex-1 cursor-pointer touch-none items-center rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  onPointerDown={(evento) => {
                    if (evento.pointerType === 'mouse' && evento.button !== 0) return;
                    // Segura o ponteiro: o arrasto continua mesmo fora da barra
                    try {
                      evento.currentTarget.setPointerCapture(evento.pointerId);
                    } catch (erro) {
                      // Sem captura, o arrasto vale só por cima da barra
                    }
                    arrastoRef.current = true;
                    irPara(evento.clientX);
                    mostrarDica(evento.clientX);
                  }}
                  onPointerMove={(evento) => {
                    if (arrastoRef.current) irPara(evento.clientX);
                    // Rato: basta passar por cima. Dedo: só a arrastar.
                    if (arrastoRef.current || evento.pointerType === 'mouse') mostrarDica(evento.clientX);
                  }}
                  onPointerUp={(evento) => {
                    arrastoRef.current = false;
                    if (evento.pointerType !== 'mouse') setDica(null);
                  }}
                  onPointerCancel={() => {
                    arrastoRef.current = false;
                    setDica(null);
                  }}
                  onPointerLeave={() => {
                    if (!arrastoRef.current) setDica(null);
                  }}
                >
                  <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/25 transition-[height] duration-150 group-hover/barra:h-1.5">
                    {carregado.map(([inicio, fim]) => (
                      <div
                        key={inicio}
                        className="absolute inset-y-0 bg-white/45"
                        style={{ left: `${inicio * 100}%`, width: `${(fim - inicio) * 100}%` }}
                      />
                    ))}
                    <div
                      ref={preenchimentoRef}
                      className="absolute inset-0 origin-left bg-azul-vivo"
                      style={{ transform: 'scaleX(0)' }}
                    />
                  </div>
                  <div
                    ref={pegaRef}
                    className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 transition-opacity duration-150 group-hover/barra:opacity-100"
                    style={{ left: '0%' }}
                  />
                  {dica && (
                    <div
                      className="pointer-events-none absolute bottom-full mb-1 -translate-x-1/2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white"
                      style={{ left: dica.x }}
                      aria-hidden="true"
                    >
                      {dica.texto}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {!aTocar && (
          <button
            ref={capaRef}
            type="button"
            onClick={tocar}
            aria-label={v.aria}
            className="absolute inset-0 z-40 h-full w-full cursor-pointer overflow-hidden rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-azul-vivo"
          >
            <img
              src={versao.capa}
              alt=""
              width={versao.largura}
              height={versao.altura}
              className="block h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </button>
        )}

        {!grande && (
          <button
            type="button"
            onClick={abrirGrande}
            aria-label={v.aumentar}
            className={`absolute right-2.5 top-2.5 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-azul-profundo/70 text-white transition-opacity duration-300 hover:bg-azul-profundo focus:outline-none focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white ${
              aTocar
                ? comControlos
                  ? 'opacity-100'
                  : escondido
                : `${escondido} group-hover:pointer-events-auto group-hover:opacity-100`
            }`}
          >
            <IconeExpandir />
          </button>
        )}
      </div>

      {grande && (
        <button
          ref={fecharRef}
          type="button"
          onClick={fecharGrande}
          aria-label={v.fechar}
          className="fixed right-4 top-4 z-[102] flex h-12 w-12 items-center justify-center rounded-full bg-white text-azul-profundo shadow-azul-lg transition-colors duration-300 hover:bg-neve focus:outline-none focus-visible:ring-4 focus-visible:ring-azul-vivo"
        >
          <IconeFechar />
        </button>
      )}
    </div>
  );
}
