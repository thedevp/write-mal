"use client";

interface CatMascotProps {
  isAlerted: boolean;
}

export function CatMascot({ isAlerted }: CatMascotProps) {
  return (
    <>
      <style>{`
        @keyframes wagTail {
          0%, 100% { transform: rotate(0deg); }
          30% { transform: rotate(18deg); }
          70% { transform: rotate(-8deg); }
        }
        @keyframes catBounce {
          0%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
          70% { transform: translateY(-3px); }
        }
        @keyframes blinkEyes {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        .cat-tail {
          transform-origin: 62px 72px;
          animation: wagTail 2s ease-in-out infinite;
        }
        .cat-body {
          animation: ${isAlerted ? "catBounce 0.5s ease-in-out" : "none"};
        }
        .cat-left-eye {
          transform-origin: 37px 40px;
          animation: blinkEyes 4s ease-in-out infinite;
        }
        .cat-right-eye {
          transform-origin: 53px 40px;
          animation: blinkEyes 4s ease-in-out infinite;
        }
      `}</style>
      <div className="select-none pointer-events-none" aria-hidden>
        <svg
          width="90"
          height="82"
          viewBox="0 0 90 82"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="cat-body"
        >
          {/* Tail */}
          <g className="cat-tail">
            <path
              d="M 62 72 C 82 62 88 44 74 38"
              stroke="#ea7c2b"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </g>

          {/* Body */}
          <ellipse cx="44" cy="68" rx="26" ry="16" fill="#f97316" />

          {/* Head */}
          <circle cx="44" cy="38" r="22" fill="#f97316" />

          {/* Left ear outer */}
          <polygon points="25,22 18,4 36,17" fill="#f97316" />
          {/* Left ear inner */}
          <polygon points="26,21 21,9 33,18" fill="#fbbf24" />

          {/* Right ear outer */}
          <polygon points="63,22 70,4 52,17" fill="#f97316" />
          {/* Right ear inner */}
          <polygon points="62,21 67,9 55,18" fill="#fbbf24" />

          {/* Left eye white */}
          <g className="cat-left-eye">
            <ellipse cx="37" cy="37" rx="4.5" ry="5.5" fill="white" />
            <circle cx="37.8" cy="37.8" r="2.8" fill="#1c1c1e" />
            <circle cx="39" cy="36.5" r="1" fill="white" />
          </g>

          {/* Right eye white */}
          <g className="cat-right-eye">
            <ellipse cx="53" cy="37" rx="4.5" ry="5.5" fill="white" />
            <circle cx="53.8" cy="37.8" r="2.8" fill="#1c1c1e" />
            <circle cx="55" cy="36.5" r="1" fill="white" />
          </g>

          {/* Nose */}
          <path d="M 43 46 L 45 46 L 44 48 Z" fill="#fb7185" />

          {/* Mouth */}
          <path
            d="M 41 49 Q 44 52 47 49"
            stroke="#c2410c"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Whiskers left */}
          <line
            x1="20"
            y1="44"
            x2="38"
            y2="46"
            stroke="#d1d5db"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          <line
            x1="20"
            y1="48"
            x2="38"
            y2="48"
            stroke="#d1d5db"
            strokeWidth="0.9"
            strokeLinecap="round"
          />

          {/* Whiskers right */}
          <line
            x1="68"
            y1="44"
            x2="50"
            y2="46"
            stroke="#d1d5db"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          <line
            x1="68"
            y1="48"
            x2="50"
            y2="48"
            stroke="#d1d5db"
            strokeWidth="0.9"
            strokeLinecap="round"
          />

          {/* Front paws */}
          <ellipse cx="30" cy="81" rx="9" ry="5" fill="#ea7c2b" />
          <ellipse cx="58" cy="81" rx="9" ry="5" fill="#ea7c2b" />

          {/* Paw toes */}
          <ellipse cx="26" cy="80" rx="2.5" ry="2" fill="#c2651e" />
          <ellipse cx="30" cy="79" rx="2.5" ry="2" fill="#c2651e" />
          <ellipse cx="34" cy="80" rx="2.5" ry="2" fill="#c2651e" />
          <ellipse cx="54" cy="80" rx="2.5" ry="2" fill="#c2651e" />
          <ellipse cx="58" cy="79" rx="2.5" ry="2" fill="#c2651e" />
          <ellipse cx="62" cy="80" rx="2.5" ry="2" fill="#c2651e" />
        </svg>
      </div>
    </>
  );
}
