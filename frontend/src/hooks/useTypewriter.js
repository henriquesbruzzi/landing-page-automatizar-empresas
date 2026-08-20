import { useState, useEffect, useRef, useCallback } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const TYPING_SPEED = 30; // ms por letra
const CURSOR_VISIBLE_AFTER = 1000; // cursor some 1s após terminar

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
  const reduzido = usePrefersReducedMotion();
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

    timeoutRef.current = setTimeout(typeNextChar, 250);
  }, []);

  useEffect(() => {
    clearTimer();

    // Animações reduzidas: título completo de imediato, sem escrita nem cursor.
    if (reduzido) {
      setDisplayedText(fullText);
      setShowCursor(false);
      setIsTypingDone(true);
      return clearTimer;
    }

    startTypewriter(fullText);

    return clearTimer;
  }, [fullText, lang, reduzido, clearTimer, startTypewriter]);

  return { displayedText, showCursor, isTypingDone };
}
