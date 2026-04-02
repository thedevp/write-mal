"use client";

import React, { useState } from "react";
import { computeDiff } from "@/lib/diff";

export interface CorrectionPair {
  original: string;
  corrected: string;
}

interface CorrectionPanelProps {
  currentText: string;
  correctionPair: CorrectionPair | null;
  isLoading: boolean;
  apiError?: string | null;
}

export function CorrectionPanel({
  currentText,
  correctionPair,
  isLoading,
  apiError,
}: CorrectionPanelProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!correctionPair) return;
    await navigator.clipboard.writeText(correctionPair.corrected);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (apiError) {
    return (
      <div className="flex-1 flex items-start justify-center p-8 pt-12">
        <div className="max-w-sm w-full rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 space-y-1">
          <p className="font-semibold">Could not reach the API</p>
          <p className="text-red-600/80">{apiError}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!currentText.trim() && !correctionPair) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-muted-foreground/40 text-sm select-none">
          corrections will appear here
        </p>
      </div>
    );
  }

  // First load — waiting for first correction
  if (!correctionPair && isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex gap-1.5 items-center text-muted-foreground/50 text-sm">
          <span className="animate-pulse">•</span>
          <span className="animate-pulse [animation-delay:150ms]">•</span>
          <span className="animate-pulse [animation-delay:300ms]">•</span>
        </div>
      </div>
    );
  }

  const parts = correctionPair
    ? computeDiff(correctionPair.original, correctionPair.corrected)
    : null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative min-h-0">
      {/* Copy button */}
      {correctionPair && (
        <button
          onClick={handleCopy}
          className="absolute top-4 right-4 z-10 text-[14px] px-2.5 py-1 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-all duration-150 bg-background/80 backdrop-blur-sm cursor-pointer"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      )}

      {/* Floating re-checking indicator — centered, overlays text without shifting layout */}
      {isLoading && correctionPair && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-background/90 backdrop-blur-sm border border-border/60 rounded-full px-3 py-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:300ms]" />
          </div>
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto p-4 sm:p-8 text-[1.05rem] leading-[1.85] tracking-[0.01em] break-words"
        style={{ fontFamily: "var(--font-geist-sans)", whiteSpace: "pre-wrap" }}
      >
        {parts ? (
          parts.map((part, i) => {
            if (part.removed) {
              return (
                <span key={i} className="line-through text-red-400">
                  {part.value}
                </span>
              );
            }
            if (part.added) {
              return (
                <span
                  key={i}
                  className="inline border border-dashed border-border rounded px-1 py-0.5 text-foreground/80 bg-muted/50 text-[0.92em] mx-0.5"
                >
                  {part.value}
                </span>
              );
            }
            return (
              <React.Fragment key={i}>
                {part.value.split("\n").map((line, j, arr) => (
                  <React.Fragment key={j}>
                    {line}
                    {j < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </React.Fragment>
            );
          })
        ) : (
          // No correction yet but text exists — show plain text
          <span className="text-muted-foreground/50">{currentText}</span>
        )}
      </div>
    </div>
  );
}
