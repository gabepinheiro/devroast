"use client";

import type { LanguageId } from "@/components/language-selector";
import {
  LANGUAGES,
  LanguageSelector,
  mapHljsToShiki,
} from "@/components/language-selector";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type BundledLanguage,
  type BundledTheme,
  createHighlighter,
  type HighlighterGeneric,
} from "shiki";

const MAX_LINES = 2000;
const DETECT_DEBOUNCE_MS = 300;
const TAB = "  ";
const SHIKI_THEME = "vesper";

// Singleton highlighter — created once, reused across renders.
// Starts with theme only; grammars are loaded on demand.
let highlighterPromise: Promise<
  HighlighterGeneric<BundledLanguage, BundledTheme>
> | null = null;
const loadedLangs = new Set<string>();

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [SHIKI_THEME],
      langs: [],
    });
  }
  return highlighterPromise;
}

async function highlightCode(text: string, lang: string): Promise<string> {
  const highlighter = await getHighlighter();

  let resolvedLang: BundledLanguage | "text" = "text";
  if (lang !== "text") {
    const bundledLang = lang as BundledLanguage;
    if (!loadedLangs.has(lang)) {
      try {
        await highlighter.loadLanguage(bundledLang);
        loadedLangs.add(lang);
        resolvedLang = bundledLang;
      } catch {
        // fallback to text
      }
    } else {
      resolvedLang = bundledLang;
    }
  }

  return highlighter.codeToHtml(text, {
    lang: resolvedLang,
    theme: SHIKI_THEME,
  });
}

type CodeEditorProps = {
  onChange?: (code: string) => void;
  onLanguageChange?: (language: LanguageId | null) => void;
};

function CodeEditor({ onChange, onLanguageChange }: CodeEditorProps) {
  const [code, setCode] = useState("");
  const [highlightedHtml, setHighlightedHtml] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState<LanguageId | null>(
    null,
  );
  const [userLanguage, setUserLanguage] = useState<LanguageId | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const detectDebounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  // Track the latest highlight request to discard stale results
  const highlightSeqRef = useRef(0);
  // Ref to access current code in effects without triggering them
  const codeRef = useRef("");

  const activeLanguage = userLanguage ?? detectedLanguage;
  const lineCount = Math.max(code.split("\n").length, 1);

  // Eagerly start loading the highlighter + hljs on mount
  useEffect(() => {
    getHighlighter();
    import("highlight.js/lib/core");
  }, []);

  // Sync scroll between textarea, overlay, and line numbers
  const handleScroll = useCallback(() => {
    const textarea = textareaRef.current;
    const overlay = overlayRef.current;
    const lineNumbers = lineNumbersRef.current;
    if (!textarea) return;
    if (overlay) {
      overlay.scrollTop = textarea.scrollTop;
      overlay.scrollLeft = textarea.scrollLeft;
    }
    if (lineNumbers) {
      lineNumbers.scrollTop = textarea.scrollTop;
    }
  }, []);

  // Highlight code with the singleton Shiki highlighter
  const highlight = useCallback(
    async (text: string, lang: LanguageId | null) => {
      if (!text.trim()) {
        setHighlightedHtml("");
        return;
      }

      const seq = ++highlightSeqRef.current;
      try {
        const shikiLang =
          lang && LANGUAGES.some((l) => l.id === lang) ? lang : "text";
        const html = await highlightCode(text, shikiLang);
        // Only apply if this is still the latest request
        if (seq === highlightSeqRef.current) {
          setHighlightedHtml(html);
        }
      } catch {
        if (seq === highlightSeqRef.current) {
          const escaped = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          setHighlightedHtml(`<pre><code>${escaped}</code></pre>`);
        }
      }
    },
    [],
  );

  // Auto-detect language with highlight.js (lazy-loaded)
  const detectLanguage = useCallback(async (text: string) => {
    if (!text.trim()) {
      setDetectedLanguage(null);
      return;
    }
    try {
      const hljs = (await import("highlight.js/lib/core")).default;
      if (!hljs.getLanguage("javascript")) {
        const [
          javascript,
          typescript,
          python,
          java,
          c,
          cpp,
          csharp,
          go,
          rust,
          ruby,
          php,
          swift,
          kotlin,
          dart,
          xml,
          css,
          sql,
          bash,
          json,
          yaml,
          markdown,
          lua,
          r,
          scala,
          elixir,
        ] = await Promise.all([
          import("highlight.js/lib/languages/javascript"),
          import("highlight.js/lib/languages/typescript"),
          import("highlight.js/lib/languages/python"),
          import("highlight.js/lib/languages/java"),
          import("highlight.js/lib/languages/c"),
          import("highlight.js/lib/languages/cpp"),
          import("highlight.js/lib/languages/csharp"),
          import("highlight.js/lib/languages/go"),
          import("highlight.js/lib/languages/rust"),
          import("highlight.js/lib/languages/ruby"),
          import("highlight.js/lib/languages/php"),
          import("highlight.js/lib/languages/swift"),
          import("highlight.js/lib/languages/kotlin"),
          import("highlight.js/lib/languages/dart"),
          import("highlight.js/lib/languages/xml"),
          import("highlight.js/lib/languages/css"),
          import("highlight.js/lib/languages/sql"),
          import("highlight.js/lib/languages/bash"),
          import("highlight.js/lib/languages/json"),
          import("highlight.js/lib/languages/yaml"),
          import("highlight.js/lib/languages/markdown"),
          import("highlight.js/lib/languages/lua"),
          import("highlight.js/lib/languages/r"),
          import("highlight.js/lib/languages/scala"),
          import("highlight.js/lib/languages/elixir"),
        ]);
        hljs.registerLanguage("javascript", javascript.default);
        hljs.registerLanguage("typescript", typescript.default);
        hljs.registerLanguage("python", python.default);
        hljs.registerLanguage("java", java.default);
        hljs.registerLanguage("c", c.default);
        hljs.registerLanguage("cpp", cpp.default);
        hljs.registerLanguage("csharp", csharp.default);
        hljs.registerLanguage("go", go.default);
        hljs.registerLanguage("rust", rust.default);
        hljs.registerLanguage("ruby", ruby.default);
        hljs.registerLanguage("php", php.default);
        hljs.registerLanguage("swift", swift.default);
        hljs.registerLanguage("kotlin", kotlin.default);
        hljs.registerLanguage("dart", dart.default);
        hljs.registerLanguage("xml", xml.default);
        hljs.registerLanguage("css", css.default);
        hljs.registerLanguage("sql", sql.default);
        hljs.registerLanguage("bash", bash.default);
        hljs.registerLanguage("json", json.default);
        hljs.registerLanguage("yaml", yaml.default);
        hljs.registerLanguage("markdown", markdown.default);
        hljs.registerLanguage("lua", lua.default);
        hljs.registerLanguage("r", r.default);
        hljs.registerLanguage("scala", scala.default);
        hljs.registerLanguage("elixir", elixir.default);
      }
      const result = hljs.highlightAuto(text);
      if (result.language) {
        const mapped = mapHljsToShiki(result.language);
        setDetectedLanguage(mapped);
      }
    } catch {
      // Detection failed silently
    }
  }, []);

  // Schedule debounced language detection
  const scheduleDetection = useCallback(
    (text: string) => {
      if (detectDebounceRef.current) clearTimeout(detectDebounceRef.current);
      detectDebounceRef.current = setTimeout(() => {
        detectLanguage(text);
      }, DETECT_DEBOUNCE_MS);
    },
    [detectLanguage],
  );

  // Re-highlight when the resolved language changes.
  // Code changes are handled directly in handleChange — codeRef avoids
  // adding `code` as a dependency (which would cause double highlights).
  useEffect(() => {
    if (codeRef.current.trim()) {
      highlight(codeRef.current, activeLanguage);
    }
  }, [activeLanguage, highlight]);

  function enforceLineLimit(text: string): string {
    const lines = text.split("\n");
    if (lines.length > MAX_LINES) {
      return lines.slice(0, MAX_LINES).join("\n");
    }
    return text;
  }

  function handleChange(newCode: string) {
    const limited = enforceLineLimit(newCode);
    setCode(limited);
    codeRef.current = limited;
    onChange?.(limited);
    // Highlight immediately with current language
    highlight(limited, userLanguage ?? detectedLanguage);
    // Debounce only the language detection
    if (!userLanguage) {
      scheduleDetection(limited);
    }
  }

  function handleLanguageChange(lang: LanguageId | null) {
    setUserLanguage(lang);
    onLanguageChange?.(lang);
    if (code.trim()) {
      highlight(code, lang ?? detectedLanguage);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const textarea = e.currentTarget;

    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart, selectionEnd, value } = textarea;

      if (e.shiftKey) {
        const beforeSelection = value.substring(0, selectionStart);
        const lineStart = beforeSelection.lastIndexOf("\n") + 1;
        const afterSelection = value.substring(selectionEnd);
        const nextNewline = afterSelection.indexOf("\n");
        const lineEnd =
          nextNewline === -1 ? value.length : selectionEnd + nextNewline;
        const selectedText = value.substring(lineStart, lineEnd);
        const dedented = selectedText
          .split("\n")
          .map((line) => (line.startsWith(TAB) ? line.slice(TAB.length) : line))
          .join("\n");
        const diff = selectedText.length - dedented.length;
        const newValue =
          value.substring(0, lineStart) + dedented + value.substring(lineEnd);
        textarea.value = newValue;
        textarea.selectionStart = Math.max(
          lineStart,
          selectionStart -
            (selectedText.split("\n")[0].startsWith(TAB) ? TAB.length : 0),
        );
        textarea.selectionEnd = selectionEnd - diff;
        handleChange(newValue);
      } else {
        insertText(textarea, TAB);
        handleChange(textarea.value);
      }
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const { selectionStart, value } = textarea;
      const beforeCursor = value.substring(0, selectionStart);
      const currentLineStart = beforeCursor.lastIndexOf("\n") + 1;
      const currentLine = beforeCursor.substring(currentLineStart);
      const indent = currentLine.match(/^(\s*)/)?.[1] ?? "";
      insertText(textarea, `\n${indent}`);
      handleChange(textarea.value);
      return;
    }
  }

  return (
    <div className="flex h-80 w-full max-w-editor flex-col overflow-hidden border border-border-primary bg-bg-input">
      {/* Toolbar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border-primary px-4">
        <div className="flex gap-2">
          <div className="size-3 rounded-full bg-accent-red" />
          <div className="size-3 rounded-full bg-accent-amber" />
          <div className="size-3 rounded-full bg-accent-green" />
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-text-muted">
            {lineCount}/{MAX_LINES}
          </span>
          <LanguageSelector
            value={userLanguage}
            autoDetected={detectedLanguage}
            onChange={handleLanguageChange}
          />
        </div>
      </div>

      {/* Editor area */}
      <div className="flex min-h-0 flex-1">
        {/* Line numbers — overflow hidden, scroll synced with textarea */}
        <div
          ref={lineNumbersRef}
          className="w-12 shrink-0 overflow-hidden border-r border-border-primary bg-bg-surface select-none"
          aria-hidden="true"
        >
          <div className="px-3 py-4">
            {Array.from({ length: lineCount }, (_, i) => {
              const key = `ln-${i + 1}`;
              return (
                <span
                  key={key}
                  className="block text-right font-mono text-xs leading-5 text-text-tertiary"
                >
                  {i + 1}
                </span>
              );
            })}
          </div>
        </div>

        {/* Textarea overlay container */}
        <div className="relative min-h-0 flex-1">
          {/* Highlighted overlay (behind) */}
          <div
            ref={overlayRef}
            className="pointer-events-none absolute inset-0 overflow-hidden p-4 font-mono text-xs leading-5 [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!text-xs [&_code]:!leading-5"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki generates trusted HTML
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            aria-hidden="true"
          />

          {/* Transparent textarea (in front) */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => handleChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            placeholder="// paste your code ..."
            spellCheck={false}
            className="absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent p-4 font-mono text-xs leading-5 text-transparent caret-text-primary placeholder:text-text-muted outline-none"
          />
        </div>
      </div>

      {/* Line limit warning */}
      {lineCount >= MAX_LINES && (
        <div className="shrink-0 border-t border-border-primary px-4 py-1.5">
          <span className="font-mono text-xs text-accent-amber">
            Line limit reached ({MAX_LINES} lines max)
          </span>
        </div>
      )}
    </div>
  );
}

function insertText(textarea: HTMLTextAreaElement, text: string) {
  if (document.execCommand("insertText", false, text)) {
    return;
  }
  const { selectionStart, selectionEnd } = textarea;
  textarea.setRangeText(text, selectionStart, selectionEnd, "end");
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

export { CodeEditor };
