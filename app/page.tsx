"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Language } from "@/lib/prompts";
import { Mascot, getEncouragement } from "@/components/Mascot";
import {
  CorrectionPanel,
  type CorrectionPair,
} from "@/components/CorrectionPanel";
import { AssistPanel } from "@/components/AssistPanel";
import { WritingEditor } from "@/components/WritingEditor";

type MascotType = "cat" | "dog";
type MobileTab = "write" | "correct" | "assist";

const LANGUAGES: Language[] = ["FR", "NL", "ES"];
const LANG_LABELS: Record<Language, string> = {
  FR: "Français",
  NL: "Nederlands",
  ES: "Español",
};
const DEBOUNCE_MS = 1800;

export default function Home() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState<Language>("FR");
  const [correctionPair, setCorrectionPair] = useState<CorrectionPair | null>(
    null,
  );
  const [correctionError, setCorrectionError] = useState<string | null>(null);
  const [isCorreecting, setIsCorreecting] = useState(false);
  const [isAlerted, setIsAlerted] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [mascotType, setMascotType] = useState<MascotType>("cat");
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [assistHeightPct, setAssistHeightPct] = useState(33);
  const [leftWidthPct, setLeftWidthPct] = useState(50);
  const [mobileTab, setMobileTab] = useState<MobileTab>("write");
  const [isMobile, setIsMobile] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Detect mobile breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Load from localStorage
  useEffect(() => {
    const savedText = localStorage.getItem("writemal-text");
    const savedLang = localStorage.getItem("writemal-lang") as Language | null;
    const savedMascot = localStorage.getItem(
      "writemal-mascot",
    ) as MascotType | null;
    const savedAssistH = localStorage.getItem("writemal-assist-h");
    const savedLeftW = localStorage.getItem("writemal-left-w");
    if (savedText) setText(savedText);
    if (savedLang && LANGUAGES.includes(savedLang)) setLanguage(savedLang);
    if (savedMascot === "cat" || savedMascot === "dog")
      setMascotType(savedMascot);
    if (savedAssistH) setAssistHeightPct(Number(savedAssistH));
    if (savedLeftW) setLeftWidthPct(Number(savedLeftW));
  }, []);

  useEffect(() => {
    localStorage.setItem("writemal-text", text);
  }, [text]);
  useEffect(() => {
    localStorage.setItem("writemal-lang", language);
  }, [language]);
  useEffect(() => {
    localStorage.setItem("writemal-mascot", mascotType);
  }, [mascotType]);
  useEffect(() => {
    localStorage.setItem("writemal-assist-h", String(assistHeightPct));
  }, [assistHeightPct]);
  useEffect(() => {
    localStorage.setItem("writemal-left-w", String(leftWidthPct));
  }, [leftWidthPct]);

  // Debounced correction
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text.trim()) {
      setCorrectionPair(null);
      setIsCorreecting(false);
      return;
    }

    setIsCorreecting(true);
    const textSnapshot = text;

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      try {
        const res = await fetch("/api/correct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textSnapshot, language }),
          signal: abortRef.current.signal,
        });
        const data = await res.json();
        if (data.error) {
          setCorrectionError(data.error);
        } else {
          setCorrectionError(null);
          setCorrectionPair({
            original: textSnapshot,
            corrected: data.corrected,
          });
          setIsAlerted(true);
          setTimeout(() => setIsAlerted(false), 600);
        }
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
      } finally {
        setIsCorreecting(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, language]);

  // Text selection — only update when there's an actual selection
  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    const selected = sel?.toString().trim() ?? "";
    if (selected.length > 2) {
      // Ignore selections inside the assist panel itself
      const anchor = sel?.anchorNode;
      const el =
        anchor?.nodeType === Node.ELEMENT_NODE
          ? (anchor as Element)
          : anchor?.parentElement;
      if (el?.closest("[data-assist-panel]")) return;
      setSelectedText(selected);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [handleSelectionChange]);

  function handleLanguageSwitch(lang: Language) {
    if (lang === language) return;
    if (abortRef.current) abortRef.current.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLanguage(lang);
    setText("");
    setCorrectionPair(null);
    setCorrectionError(null);
    setIsCorreecting(false);
    setSelectedText("");
  }

  function handleApplyCorrections() {
    if (!correctionPair) return;
    setText(correctionPair.corrected);
    setCorrectionPair(null);
    // WritingEditor's useEffect will focus + place cursor at end
  }

  function handleEditorKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleApplyCorrections();
    }
  }

  function handleMascotClick() {
    const next: MascotType = mascotType === "cat" ? "dog" : "cat";
    setMascotType(next);
    setSpeechBubble(getEncouragement(language, next));
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    speechTimerRef.current = setTimeout(() => setSpeechBubble(null), 3500);
  }

  // Horizontal resize between left/right panes (pointer events — works on touch too)
  function handleHorizResizeStart(e: React.PointerEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startW = leftWidthPct;

    function onMove(e: PointerEvent) {
      const totalW = mainRef.current?.clientWidth ?? window.innerWidth;
      const delta = e.clientX - startX;
      const next = Math.min(75, Math.max(25, startW + (delta / totalW) * 100));
      setLeftWidthPct(next);
    }

    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  // Resize handle for assist pane (pointer events)
  function handleResizeStart(e: React.PointerEvent) {
    e.preventDefault();
    const startY = e.clientY;
    const startH = assistHeightPct;

    function onMove(e: PointerEvent) {
      const paneH = rightPaneRef.current?.clientHeight ?? 600;
      const delta = -(e.clientY - startY);
      const next = Math.min(70, Math.max(12, startH + (delta / paneH) * 100));
      setAssistHeightPct(next);
    }

    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  const hasCorrections =
    !!correctionPair && correctionPair.corrected !== correctionPair.original;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-3 border-b border-border/60 shrink-0">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.svg"
            alt="write-mal cat"
            width={22}
            height={22}
            className="select-none"
          />
          <span className="text-sm sm:text-base font-semibold tracking-tight text-foreground/80 select-none">
            Write⍤mal
          </span>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1 bg-muted rounded-full p-0.5">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageSwitch(lang)}
              className={`text-xs px-3 sm:px-4 py-2 sm:py-1.5 rounded-full font-medium transition-all duration-200 cursor-pointer ${
                language === lang
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {LANG_LABELS[lang]}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3">
          {isCorreecting && (
            <span className="hidden sm:block text-[11px] text-muted-foreground/50 animate-pulse">
              checking…
            </span>
          )}
          <a
            href="https://github.com/thedevp/write-mal"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-muted-foreground/40 hover:text-foreground/70 transition-colors duration-150"
            aria-label="View source on GitHub"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.562 21.8 24 17.302 24 12 24 5.373 18.627 0 12 0z" />
            </svg>
            <span className="hidden sm:block text-[11px] font-medium">GitHub</span>
          </a>
        </div>
      </header>

      {/* Main split */}
      <main ref={mainRef} className="flex-1 overflow-hidden min-h-0 flex flex-col md:flex-row">
        {/* Left — editor */}
        <div
          className={`flex flex-col border-border/60 relative min-w-0 md:shrink-0 border-b md:border-b-0 md:border-r ${
            mobileTab !== "write" ? "hidden md:flex md:flex-col" : "flex-1 md:flex-none"
          }`}
          style={{ width: `${leftWidthPct}%` }}
        >
          <WritingEditor
            value={text}
            onChange={setText}
            onKeyDown={handleEditorKeyDown}
            editorRef={editorRef}
            placeholder={`Start writing in ${LANG_LABELS[language]}…\n\nTip: wrap English words in {curly braces} to translate them inline.`}
          />

          {hasCorrections && (
            <div className="absolute bottom-5 right-4 flex items-center gap-2">
              <span className="text-xl text-muted-foreground/50 hidden sm:block">
                ⌘↵
              </span>
              <button
                onClick={handleApplyCorrections}
                className="text-xs px-4 py-2.5 sm:px-3 sm:py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all duration-150 font-medium cursor-pointer"
              >
                Apply corrections
              </button>
            </div>
          )}

          {/* Mascot walks within this container — hidden on mobile to preserve editor space */}
          <div className="hidden md:block absolute bottom-0 left-0 right-0 h-[110px] pointer-events-none">
            <div className="pointer-events-auto">
              <Mascot
                type={mascotType}
                isAlerted={isAlerted}
                onClick={handleMascotClick}
                speechBubble={speechBubble}
                language={language}
              />
            </div>
          </div>
        </div>

        {/* Horizontal resize handle — desktop only */}
        <div
          className="hidden md:flex w-1.5 shrink-0 cursor-col-resize group items-center justify-center hover:bg-muted/60 transition-colors z-20"
          onPointerDown={handleHorizResizeStart}
          title="Drag to resize"
        >
          <div className="w-px h-10 rounded-full bg-border/60 group-hover:bg-border transition-colors" />
        </div>

        {/* Right — corrections + resizable assist */}
        <div
          ref={rightPaneRef}
          className={`flex-1 flex flex-col min-w-0 overflow-hidden ${
            mobileTab === "write" ? "hidden md:flex" : ""
          }`}
        >
          {/* Correction panel */}
          <div className={`flex flex-col overflow-hidden min-h-0 ${
            mobileTab === "assist" ? "hidden md:flex md:flex-1" : "flex-1"
          }`}>
            <CorrectionPanel
              currentText={text}
              correctionPair={correctionPair}
              isLoading={isCorreecting}
              apiError={correctionError}
            />
          </div>

          {/* Vertical drag handle — desktop only */}
          <div
            className="hidden md:flex h-2.5 shrink-0 cursor-row-resize group items-center justify-center border-t border-border/60 hover:border-border transition-colors"
            onPointerDown={handleResizeStart}
            title="Drag to resize"
          >
            <div className="w-10 h-0.5 rounded-full bg-border/50 group-hover:bg-border transition-colors" />
          </div>

          {/* Assist panel */}
          <div
            className={`overflow-hidden flex flex-col ${
              mobileTab === "assist"
                ? "flex-1 md:flex-none md:shrink-0"
                : "hidden md:flex md:flex-col md:shrink-0"
            }`}
            style={isMobile ? undefined : { height: `${assistHeightPct}%` }}
          >
            <AssistPanel
              selectedText={selectedText}
              context={text}
              language={language}
              isLoading={isCorreecting}
            />
          </div>
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden flex border-t border-border/60 shrink-0 bg-background">
        {(["write", "correct", "assist"] as const).map((tab) => {
          const labels: Record<MobileTab, string> = {
            write: "Write",
            correct: "Corrections",
            assist: "Assist",
          };
          return (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                mobileTab === tab
                  ? "text-foreground border-t-2 border-foreground -mt-px"
                  : "text-muted-foreground"
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
