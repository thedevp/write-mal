"use client";

import { useRef, useEffect, useState } from "react";
import type { Language } from "@/lib/prompts";

type MascotType = "cat" | "dog";

interface MascotProps {
  type: MascotType;
  isAlerted: boolean;
  onClick: () => void;
  speechBubble: string | null; // external (click-triggered)
  language: Language;
}

const ENCOURAGEMENTS: Record<Language, Record<MascotType, string[]>> = {
  FR: {
    cat: [
      "Miaou ! Tu t'en sors très bien !",
      "Continue comme ça, petit écrivain !",
      "Bravo ! Tu fais de beaux progrès !",
      "Tu écris de mieux en mieux !",
    ],
    dog: [
      "Ouaf ! Tu es fantastique !",
      "Allez, tu peux le faire !",
      "Waouh ! Quel beau travail !",
      "Ouaf ouaf ! Je suis fier de toi !",
    ],
  },
  NL: {
    cat: [
      "Miauw! Je doet het geweldig!",
      "Blijf oefenen, schrijver!",
      "Bravo! Je maakt mooie vooruitgang!",
      "Je schrijft steeds beter!",
    ],
    dog: [
      "Woef! Je bent fantastisch!",
      "Vooruit, je kunt het!",
      "Wauw! Wat een mooi werk!",
      "Woef woef! Ik ben trots op je!",
    ],
  },
  ES: {
    cat: [
      "¡Miau! ¡Lo estás haciendo muy bien!",
      "¡Sigue así, pequeño escritor!",
      "¡Bravo! ¡Estás progresando mucho!",
      "¡Cada vez escribes mejor!",
    ],
    dog: [
      "¡Guau! ¡Eres fantástico!",
      "¡Vamos, puedes hacerlo!",
      "¡Guau! ¡Qué trabajo tan bonito!",
      "¡Guau guau! ¡Estoy orgulloso de ti!",
    ],
  },
};

// Idle walk-by phrases — shorter, casual
const AUTO_PHRASES: Record<Language, string[]> = {
  FR: [
    "Tu vas y arriver !",
    "Écris encore !",
    "Quel courage !",
    "Magnifique !",
    "Tu progresses !",
    "Super boulot !",
    "Je crois en toi !",
    "C'est bien !",
  ],
  NL: [
    "Ga zo door!",
    "Je kunt het!",
    "Goed bezig!",
    "Geweldig!",
    "Doorzetten!",
    "Top gedaan!",
    "Je doet het!",
    "Ik geloof in jou!",
  ],
  ES: [
    "¡Puedes lograrlo!",
    "¡Sigue escribiendo!",
    "¡Qué valentía!",
    "¡Magnífico!",
    "¡Estás progresando!",
    "¡Excelente trabajo!",
    "¡Creo en ti!",
    "¡Muy bien!",
  ],
};

export function getEncouragement(lang: Language, type: MascotType): string {
  const list = ENCOURAGEMENTS[lang][type];
  return list[Math.floor(Math.random() * list.length)];
}

function CatSVG({ isAlerted }: { isAlerted: boolean }) {
  return (
    <>
      <style>{`
        @keyframes wagTailCat {
          0%, 100% { transform: rotate(0deg); }
          30% { transform: rotate(18deg); }
          70% { transform: rotate(-8deg); }
        }
        @keyframes catBounce {
          0%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
          70% { transform: translateY(-3px); }
        }
        @keyframes walkBobCat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes blinkCat {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        .cat-tail { transform-origin: 62px 72px; animation: wagTailCat 2s ease-in-out infinite; }
        .cat-wrap {
          animation: ${isAlerted
            ? "catBounce 0.5s ease-in-out"
            : "walkBobCat 0.38s ease-in-out infinite"
          };
        }
        .cat-leye { transform-origin: 37px 40px; animation: blinkCat 4s ease-in-out infinite; }
        .cat-reye { transform-origin: 53px 40px; animation: blinkCat 4s ease-in-out infinite; }
      `}</style>
      <svg width="90" height="82" viewBox="0 0 90 82" fill="none" className="cat-wrap">
        <g className="cat-tail">
          <path d="M 62 72 C 82 62 88 44 74 38" stroke="#ea7c2b" strokeWidth="6" strokeLinecap="round" />
        </g>
        <ellipse cx="44" cy="68" rx="26" ry="16" fill="#f97316" />
        <circle cx="44" cy="38" r="22" fill="#f97316" />
        <polygon points="25,22 18,4 36,17" fill="#f97316" />
        <polygon points="26,21 21,9 33,18" fill="#fbbf24" />
        <polygon points="63,22 70,4 52,17" fill="#f97316" />
        <polygon points="62,21 67,9 55,18" fill="#fbbf24" />
        <g className="cat-leye">
          <ellipse cx="37" cy="37" rx="4.5" ry="5.5" fill="white" />
          <circle cx="37.8" cy="37.8" r="2.8" fill="#1c1c1e" />
          <circle cx="39" cy="36.5" r="1" fill="white" />
        </g>
        <g className="cat-reye">
          <ellipse cx="53" cy="37" rx="4.5" ry="5.5" fill="white" />
          <circle cx="53.8" cy="37.8" r="2.8" fill="#1c1c1e" />
          <circle cx="55" cy="36.5" r="1" fill="white" />
        </g>
        <path d="M 43 46 L 45 46 L 44 48 Z" fill="#fb7185" />
        <path d="M 41 49 Q 44 52 47 49" stroke="#c2410c" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <line x1="20" y1="44" x2="38" y2="46" stroke="#d1d5db" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="20" y1="48" x2="38" y2="48" stroke="#d1d5db" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="68" y1="44" x2="50" y2="46" stroke="#d1d5db" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="68" y1="48" x2="50" y2="48" stroke="#d1d5db" strokeWidth="0.9" strokeLinecap="round" />
        <ellipse cx="30" cy="81" rx="9" ry="5" fill="#ea7c2b" />
        <ellipse cx="58" cy="81" rx="9" ry="5" fill="#ea7c2b" />
        <ellipse cx="26" cy="80" rx="2.5" ry="2" fill="#c2651e" />
        <ellipse cx="30" cy="79" rx="2.5" ry="2" fill="#c2651e" />
        <ellipse cx="34" cy="80" rx="2.5" ry="2" fill="#c2651e" />
        <ellipse cx="54" cy="80" rx="2.5" ry="2" fill="#c2651e" />
        <ellipse cx="58" cy="79" rx="2.5" ry="2" fill="#c2651e" />
        <ellipse cx="62" cy="80" rx="2.5" ry="2" fill="#c2651e" />
      </svg>
    </>
  );
}

function DogSVG({ isAlerted }: { isAlerted: boolean }) {
  return (
    <>
      <style>{`
        @keyframes wagTailDog {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(22deg); }
          75% { transform: rotate(-12deg); }
        }
        @keyframes dogBounce {
          0%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
          70% { transform: translateY(-3px); }
        }
        @keyframes walkBobDog {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes blinkDog {
          0%, 88%, 100% { transform: scaleY(1); }
          93% { transform: scaleY(0.1); }
        }
        .dog-tail { transform-origin: 64px 64px; animation: wagTailDog 1.2s ease-in-out infinite; }
        .dog-wrap {
          animation: ${isAlerted
            ? "dogBounce 0.5s ease-in-out"
            : "walkBobDog 0.36s ease-in-out infinite"
          };
        }
        .dog-leye { transform-origin: 35px 34px; animation: blinkDog 3.5s ease-in-out infinite; }
        .dog-reye { transform-origin: 53px 34px; animation: blinkDog 3.5s ease-in-out infinite; }
      `}</style>
      <svg width="90" height="82" viewBox="0 0 90 82" fill="none" className="dog-wrap">
        <g className="dog-tail">
          <path d="M 64 64 C 78 50 84 38 72 32" stroke="#a05a28" strokeWidth="6" strokeLinecap="round" />
        </g>
        <ellipse cx="44" cy="68" rx="26" ry="16" fill="#c87941" />
        <ellipse cx="23" cy="40" rx="9" ry="17" fill="#9a5020" transform="rotate(-8 23 40)" />
        <ellipse cx="65" cy="40" rx="9" ry="17" fill="#9a5020" transform="rotate(8 65 40)" />
        <circle cx="44" cy="36" r="21" fill="#c87941" />
        <ellipse cx="44" cy="44" rx="11" ry="8" fill="#d4956a" />
        <ellipse cx="44" cy="38.5" rx="5.5" ry="3.5" fill="#1c1c1e" />
        <ellipse cx="41.5" cy="39" rx="1.2" ry="0.8" fill="#3a3a3a" />
        <ellipse cx="46.5" cy="39" rx="1.2" ry="0.8" fill="#3a3a3a" />
        <g className="dog-leye">
          <ellipse cx="35" cy="32" rx="4" ry="4.5" fill="white" />
          <circle cx="35.8" cy="32.8" r="2.5" fill="#1c1c1e" />
          <circle cx="37" cy="31.5" r="0.9" fill="white" />
        </g>
        <g className="dog-reye">
          <ellipse cx="53" cy="32" rx="4" ry="4.5" fill="white" />
          <circle cx="53.8" cy="32.8" r="2.5" fill="#1c1c1e" />
          <circle cx="55" cy="31.5" r="0.9" fill="white" />
        </g>
        <ellipse cx="44" cy="51" rx="5" ry="4.5" fill="#f43f5e" />
        <line x1="44" y1="46.5" x2="44" y2="55.5" stroke="#dc2626" strokeWidth="1.2" />
        <ellipse cx="30" cy="81" rx="9" ry="5" fill="#b5693a" />
        <ellipse cx="58" cy="81" rx="9" ry="5" fill="#b5693a" />
        <ellipse cx="26" cy="80" rx="2.5" ry="2" fill="#9a4f28" />
        <ellipse cx="30" cy="79" rx="2.5" ry="2" fill="#9a4f28" />
        <ellipse cx="34" cy="80" rx="2.5" ry="2" fill="#9a4f28" />
        <ellipse cx="54" cy="80" rx="2.5" ry="2" fill="#9a4f28" />
        <ellipse cx="58" cy="79" rx="2.5" ry="2" fill="#9a4f28" />
        <ellipse cx="62" cy="80" rx="2.5" ry="2" fill="#9a4f28" />
      </svg>
    </>
  );
}

export function Mascot({ type, isAlerted, onClick, speechBubble, language }: MascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(16);
  const dirRef = useRef(1);
  const langRef = useRef(language);
  const [autoPhrase, setAutoPhrase] = useState<string | null>(null);
  const autoPhraseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // scheduleRef avoids stale closure on recursive setTimeout
  const scheduleRef = useRef<() => void>(() => {});

  useEffect(() => { langRef.current = language; }, [language]);

  // Reschedule auto-phrases
  useEffect(() => {
    scheduleRef.current = () => {
      if (autoPhraseTimerRef.current) clearTimeout(autoPhraseTimerRef.current);
      const delay = 9000 + Math.random() * 8000;
      autoPhraseTimerRef.current = setTimeout(() => {
        const list = AUTO_PHRASES[langRef.current];
        setAutoPhrase(list[Math.floor(Math.random() * list.length)]);
        setTimeout(() => {
          setAutoPhrase(null);
          scheduleRef.current();
        }, 3200);
      }, delay);
    };
  });

  useEffect(() => {
    scheduleRef.current();
    return () => { if (autoPhraseTimerRef.current) clearTimeout(autoPhraseTimerRef.current); };
  }, []);

  // Clear auto-phrase when language or type changes
  useEffect(() => { setAutoPhrase(null); }, [language, type]);

  // Walking — direct DOM manipulation, no React re-renders
  useEffect(() => {
    let animFrame: number;
    let lastTime = 0;
    const MIN_X = 0;
    const MAX_X = 130;

    function animate(time: number) {
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;

      xRef.current += 42 * delta * dirRef.current;

      if (xRef.current >= MAX_X) { xRef.current = MAX_X; dirRef.current = -1; }
      else if (xRef.current <= MIN_X) { xRef.current = MIN_X; dirRef.current = 1; }

      if (containerRef.current) {
        containerRef.current.style.left = `${xRef.current}px`;
      }
      if (svgWrapperRef.current) {
        // Flip when walking left; keep speech bubble outside flip wrapper
        svgWrapperRef.current.style.transform = `scaleX(${dirRef.current})`;
      }

      animFrame = requestAnimationFrame(animate);
    }

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  const displayPhrase = speechBubble || autoPhrase;

  return (
    <div
      ref={containerRef}
      className="absolute bottom-3 group"
      style={{ left: 0 }}
    >
      {/* Speech bubble — outside svgWrapperRef so it never flips */}
      {displayPhrase && (
        <div className="absolute bottom-[88px] left-0 bg-white border border-border/70 rounded-2xl px-3 py-2 text-[13px] leading-snug shadow-lg max-w-[200px] z-20 pointer-events-none">
          {displayPhrase}
          <div
            className="absolute -bottom-[7px] left-5 w-3.5 h-3.5 bg-white border-b border-r border-border/70 rotate-45"
            style={{ borderBottomRightRadius: "2px" }}
          />
        </div>
      )}

      {/* Animal SVG — this div flips for direction */}
      <div ref={svgWrapperRef} style={{ display: "inline-block", transformOrigin: "center bottom" }}>
        <button
          onClick={onClick}
          className="cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150 block select-none"
          aria-label={type === "cat" ? "Switch to dog" : "Switch to cat"}
        >
          {type === "cat" ? <CatSVG isAlerted={isAlerted} /> : <DogSVG isAlerted={isAlerted} />}
        </button>
      </div>

      {/* Hint — fades in on hover */}
      <div className="absolute -bottom-4 left-0 w-[90px] flex justify-center pointer-events-none">
        <span className="text-[9px] text-muted-foreground/25 select-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 whitespace-nowrap">
          pet to change
        </span>
      </div>
    </div>
  );
}
