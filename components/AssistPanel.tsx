"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { AssistMode, Language } from "@/lib/prompts";

interface AssistPanelProps {
  selectedText: string;
  context: string;
  language: Language;
  isLoading: boolean; // correction is being re-checked
}

const MODES: AssistMode[] = ["Recommend", "Explain", "Words"];

export function AssistPanel({ selectedText, context, language, isLoading }: AssistPanelProps) {
  const [activeMode, setActiveMode] = useState<AssistMode | null>(null);
  const [content, setContent] = useState("");
  const [isAssisting, setIsAssisting] = useState(false);
  const [translation, setTranslation] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (selectedText) {
      setActiveMode(null);
      setContent("");
    }
  }, [selectedText]);

  // Auto-translate whenever selection changes
  useEffect(() => {
    if (!selectedText) {
      setTranslation("");
      return;
    }
    setIsTranslating(true);
    setTranslation("");
    const controller = new AbortController();
    fetch("/api/assist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selected: selectedText, context, language, mode: "Translate" }),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => { if (!data.error) setTranslation(data.content || ""); })
      .catch(() => {})
      .finally(() => setIsTranslating(false));
    return () => controller.abort();
  }, [selectedText, language]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleMode(mode: AssistMode) {
    if (!selectedText) return;
    if (activeMode === mode && content) return;
    setActiveMode(mode);
    setContent("");
    setIsAssisting(true);
    try {
      const res = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selected: selectedText, context, language, mode }),
      });
      const data = await res.json();
      setContent(data.error ? `Error: ${data.error}` : (data.content || ""));
    } catch {
      setContent("Something went wrong. Try again.");
    } finally {
      setIsAssisting(false);
    }
  }

  return (
    <div className="h-full flex flex-col border-t border-border/60" data-assist-panel>
      {/* Header */}
      <div className="flex items-center gap-1.5 px-3 sm:px-4 py-2 border-b border-border/40 shrink-0">
        <span className="text-xs text-muted-foreground/50 font-medium uppercase tracking-wider mr-1.5">
          assist
        </span>
        {MODES.map((mode) => (
          <button
            key={mode}
            onClick={() => handleMode(mode)}
            disabled={!selectedText}
            className={`text-xs px-3 py-2 sm:py-1 rounded-full transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed ${
              activeMode === mode
                ? "bg-foreground text-background font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {mode}
          </button>
        ))}

        {/* Re-checking indicator lives here — no layout shift in correction panel */}
        {isLoading && (
          <span className="ml-auto text-xs text-muted-foreground/40 animate-pulse">
            re-checking…
          </span>
        )}
      </div>

      {/* Selected text label + inline translation */}
      <div className="px-4 py-1.5 text-[12px] text-muted-foreground/50 italic border-b border-border/30 shrink-0 break-words">
        {selectedText ? (
          <>
            &ldquo;{selectedText}&rdquo;
            {isTranslating && (
              <span className="not-italic text-muted-foreground/30 ml-1.5">…</span>
            )}
            {translation && !isTranslating && (
              <span className="not-italic text-muted-foreground/35 ml-1.5">({translation})</span>
            )}
          </>
        ) : (
          <span className="not-italic text-muted-foreground/30">
            highlight text in either panel for assistance
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 text-[14px] leading-relaxed text-foreground/90">
        {isAssisting ? (
          <div className="flex gap-1.5 items-center text-muted-foreground/40 mt-1">
            <span className="animate-pulse">•</span>
            <span className="animate-pulse [animation-delay:150ms]">•</span>
            <span className="animate-pulse [animation-delay:300ms]">•</span>
          </div>
        ) : content ? (
          <ReactMarkdown
            components={{
              h1: ({ children }) => <p className="font-semibold text-[14px] mb-1">{children}</p>,
              h2: ({ children }) => <p className="font-semibold text-[13px] mb-1">{children}</p>,
              h3: ({ children }) => <p className="font-medium text-[13px] mb-1">{children}</p>,
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              ul: ({ children }) => <ul className="space-y-1.5 mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="space-y-1.5 mb-2 list-decimal list-inside">{children}</ol>,
              li: ({ children }) => <li className="leading-snug">{children}</li>,
              code: ({ children }) => (
                <code className="bg-muted border border-border/60 rounded px-1 py-0.5 text-[12px]">
                  {children}
                </code>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        ) : (
          <p className="text-muted-foreground/30 text-[13px] italic mt-1">
            {selectedText ? "pick a mode above" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
