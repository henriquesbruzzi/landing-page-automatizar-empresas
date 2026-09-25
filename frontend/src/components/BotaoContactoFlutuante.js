import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { EVENTO_AVISO, consentimentoDado } from '../utils/avisoCookies';

/**
 * Botão de contacto que acompanha o scroll.
 *
 * Só existe no intervalo em que não há outro convite ao contacto no ecrã:
 * aparece quando o "Falar connosco" do hero sai de vista, e desaparece quando
 * a secção final de contacto entra. Ter os dois ao mesmo tempo são dois botões
 * iguais a competir pelo mesmo clique.
 *
 * Quem decide é um IntersectionObserver sobre os próprios elementos, e não uma
 * posição de scroll em pixels: o hero muda de altura entre o telemóvel e o
 * computador, e com as origens do esquema muda outra vez. Uma medida fixa
 * partia-se ao primeiro ajuste.
 *
 * No telemóvel divide o canto de baixo com o aviso de cookies. Enquanto o
 * aviso estiver no ecrã este botão não aparece: o aviso é uma decisão a tomar
 * primeiro, já traz dois botões seus, e é temporário.
 */

// Ids dos elementos que mandam neste botão. Se algum deles for renomeado, o
// botão deixa de aparecer em silêncio, sem partir nada: daí estarem aqui.
const ID_BOTAO_HERO = 'cta-hero';
const ID_SECCAO_FINAL = 'contacto-final';

/**
 * Observa um elemento e diz se está à vista.
 *
 * O `inicial` é o que se assume enquanto o observador não responde, e tem de
 * ser sempre o valor que mantém o botão escondido. Se um observador nunca
 * disparar, por o browser não o suportar ou por a página estar num contexto
 * que o suspende, o pior que acontece é o botão não aparecer. O contrário,
 * aparecer sempre, punha-o em cima do botão do hero logo no topo da página.
 */
function useEstaNoEcra(id, margem, inicial) {
  const [noEcra, setNoEcra] = useState(inicial);
  const [existe, setExiste] = useState(false);

  useEffect(() => {
    const alvo = document.getElementById(id);
    if (!alvo) return undefined;
    setExiste(true);

    // Sem IntersectionObserver o botão fica quieto, em vez de aparecer sempre
    if (typeof IntersectionObserver === 'undefined') return undefined;

    const observador = new IntersectionObserver(
      ([entrada]) => setNoEcra(entrada.isIntersecting),
      { root: null, rootMargin: margem, threshold: 0 }
    );
    observador.observe(alvo);
    return () => observador.disconnect();
  }, [id, margem]);

  return { noEcra, existe };
}

function BotaoContactoFlutuante() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const semAnimacao = usePrefersReducedMotion();

  // Até o observador falar, assume-se que o botão do hero está à vista e que a
  // secção final não está: as duas coisas que mantêm este botão escondido.
  const heroNoEcra = useEstaNoEcra(ID_BOTAO_HERO, '0px', true);
  // Antecipa a secção final: começa a sair antes de ela chegar ao fundo do ecrã
  const finalNoEcra = useEstaNoEcra(ID_SECCAO_FINAL, '0px 0px -25% 0px', false);

  // Enquanto não houver resposta ao aviso, conta-se com ele no ecrã
  const [avisoNoEcra, setAvisoNoEcra] = useState(() => !consentimentoDado());

  useEffect(() => {
    const ouvir = (evento) => setAvisoNoEcra(!!evento.detail);
    window.addEventListener(EVENTO_AVISO, ouvir);
    return () => window.removeEventListener(EVENTO_AVISO, ouvir);
  }, []);

  const visivel =
    heroNoEcra.existe && !heroNoEcra.noEcra && !finalNoEcra.noEcra && !avisoNoEcra;

  return (
    <button
      type="button"
      onClick={() => navigate(lang === 'pt' ? '/contacto' : '/us/contact')}
      aria-hidden={!visivel}
      tabIndex={visivel ? 0 : -1}
      className={`
        fixed bottom-5 right-5 z-40 rounded-full bg-azul-medio px-5 py-3 text-xs
        font-semibold tracking-[0.06em] text-white shadow-azul-lg
        hover:bg-azul-profundo active:scale-95
        sm:bottom-8 sm:right-8 sm:px-9 sm:py-4 sm:text-sm md:text-base
        ${semAnimacao ? '' : 'transition-all duration-300'}
        ${visivel ? 'pointer-events-auto opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-3'}
      `}
    >
      {t.hero.cta}
    </button>
  );
}

export default BotaoContactoFlutuante;
