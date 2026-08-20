import { useState, useEffect, useRef, useCallback } from 'react';

const TYPING_SPEED = 60; // ms por letra
const CURSOR_VISIBLE_AFTER = 2000; // cursor some 2s após terminar

/**
 * Hook de efeito typewriter sem persistência.
 * - Sempre digita letra por letra
 * - Troca de idioma/texto: repete o efeito typewriter
 *
 * @param {string} fullText - Texto completo para digitar
 * @param {string} lang - Idioma atual (para detectar mudança)
 * @returns {{ displayedText: string, showCursor: boolean, isTypingDone: boolean }}
 */
export function useTypewriter(fullText, lang) {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const [isTypingDone, setIsTypingDone] = useState(false);
  const timeoutRef = useRef(null);
  const fallbackRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (fallbackRef.current) {
      clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }
  }, []);

  const startTypewriter = useCallback((text) => {
    if (!text) {
      setDisplayedText('');
      setShowCursor(false);
      setIsTypingDone(true);
      return;
    }

    setShowCursor(true);
    setIsTypingDone(false);
    setDisplayedText('');

    // Fallback: se o timer principal não avançar, mostra o texto inteiro.
    fallbackRef.current = setTimeout(() => {
      setDisplayedText(text);
      setIsTypingDone(true);
      setShowCursor(false);
    }, Math.max(text.length * TYPING_SPEED + 2000, 4000));

    let charIndex = 0;

    const typeNextChar = () => {
      charIndex++;
      setDisplayedText(text.substring(0, charIndex));

      if (charIndex >= text.length) {
          if (fallbackRef.current) {
            clearTimeout(fallbackRef.current);
            fallbackRef.current = null;
          }

        setIsTypingDone(true);

        timeoutRef.current = setTimeout(() => {
          setShowCursor(false);
        }, CURSOR_VISIBLE_AFTER);
        return;
      }

      timeoutRef.current = setTimeout(typeNextChar, TYPING_SPEED);
    };

    timeoutRef.current = setTimeout(typeNextChar, 500);
  }, []);

  useEffect(() => {
    clearTimer();

    startTypewriter(fullText);

    return clearTimer;
  }, [fullText, lang, clearTimer, startTypewriter]);

  return { displayedText, showCursor, isTypingDone };
}
