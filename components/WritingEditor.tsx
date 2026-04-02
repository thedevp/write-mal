"use client";

import { useRef, useEffect, useCallback, useState } from "react";

interface WritingEditorProps {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  editorRef?: React.RefObject<HTMLDivElement | null>;
}

interface CursorPos {
  top: number;
  left: number;
  height: number;
}

export function WritingEditor({
  value,
  onChange,
  placeholder,
  onKeyDown,
  editorRef: externalRef,
}: WritingEditorProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const editorRef = externalRef ?? internalRef;
  const lastSyncedRef = useRef(value);
  const [isFocused, setIsFocused] = useState(false);
  const [cursorPos, setCursorPos] = useState<CursorPos | null>(null);

  // Sync external value changes (apply corrections, language switch, localStorage load)
  useEffect(() => {
    const el = editorRef.current;
    if (!el || value === lastSyncedRef.current) return;
    lastSyncedRef.current = value;
    el.textContent = value;

    // Restore focus and place cursor at end of content
    el.focus();
    const sel = window.getSelection();
    const range = document.createRange();
    const lastChild = el.lastChild;
    if (lastChild?.nodeType === Node.TEXT_NODE) {
      // Place cursor at end of the text node (correct for pre-wrap content)
      range.setStart(lastChild, (lastChild as Text).length);
    } else if (lastChild) {
      range.setStartAfter(lastChild);
    } else {
      range.setStart(el, 0);
    }
    range.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, [value, editorRef]);

  const updateCursor = useCallback(() => {
    requestAnimationFrame(() => {
      const el = editorRef.current;
      if (!el) return;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) {
        setCursorPos(null);
        return;
      }
      const range = sel.getRangeAt(0);
      if (!el.contains(range.commonAncestorContainer)) {
        setCursorPos(null);
        return;
      }
      const collapsed = range.cloneRange();
      collapsed.collapse(true);
      const rects = collapsed.getClientRects();
      if (!rects.length) {
        const editorRect = el.getBoundingClientRect();
        setCursorPos({
          top: editorRect.top + 32,
          left: editorRect.left + 32,
          height: 24,
        });
        return;
      }
      const r = rects[0];
      setCursorPos({ top: r.top, left: r.left, height: r.height || 24 });
    });
  }, [editorRef]);

  function handleInput(e: React.FormEvent<HTMLDivElement>) {
    const text = e.currentTarget.textContent || "";
    lastSyncedRef.current = text;
    onChange(text);
    updateCursor();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    // Only insert newline for plain Enter — not ⌘/Ctrl+Enter (that's apply corrections)
    if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      insertAtCursor("\n");
    }
    onKeyDown?.(e);
    setTimeout(updateCursor, 0);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    insertAtCursor(e.clipboardData.getData("text/plain"));
  }

  function insertAtCursor(text: string) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    const full = editorRef.current?.textContent || "";
    lastSyncedRef.current = full;
    onChange(full);
    updateCursor();
  }

  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
      {/* Placeholder */}
      {!value && (
        <div
          className="absolute top-4 left-4 right-4 sm:top-8 sm:left-8 sm:right-8 text-muted-foreground/30 pointer-events-none select-none whitespace-pre-wrap text-[1.05rem] leading-[1.85]"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          {placeholder}
        </div>
      )}

      {/* Block cursor — desktop only; mobile uses native cursor */}
      {isFocused && cursorPos && (
        <div
          className="hidden sm:block fixed pointer-events-none z-50"
          style={{
            top: cursorPos.top,
            left: cursorPos.left,
            width: 10,
            height: cursorPos.height,
            backgroundColor: "white",
            mixBlendMode: "difference",
            animation: "cursorBlink 1s step-start infinite",
          }}
        />
      )}

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={() => { setIsFocused(true); updateCursor(); }}
        onBlur={() => { setIsFocused(false); setCursorPos(null); }}
        onKeyUp={updateCursor}
        onMouseUp={updateCursor}
        onClick={updateCursor}
        onScroll={updateCursor}
        spellCheck={false}
        className="flex-1 overflow-y-auto p-4 pb-20 sm:p-8 sm:pb-28 text-[1.05rem] leading-[1.85] tracking-[0.01em] focus:outline-none break-words"
        style={{
          fontFamily: "var(--font-geist-mono)",
          caretColor: "transparent",
          whiteSpace: "pre-wrap",
        }}
      />
    </div>
  );
}
