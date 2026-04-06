"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "c", label: "C" },
  { id: "cpp", label: "C++" },
  { id: "csharp", label: "C#" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "ruby", label: "Ruby" },
  { id: "php", label: "PHP" },
  { id: "swift", label: "Swift" },
  { id: "kotlin", label: "Kotlin" },
  { id: "dart", label: "Dart" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "sql", label: "SQL" },
  { id: "shellscript", label: "Shell" },
  { id: "json", label: "JSON" },
  { id: "yaml", label: "YAML" },
  { id: "markdown", label: "Markdown" },
  { id: "lua", label: "Lua" },
  { id: "r", label: "R" },
  { id: "scala", label: "Scala" },
  { id: "elixir", label: "Elixir" },
] as const;

type LanguageId = (typeof LANGUAGES)[number]["id"];

// Map hljs language names to shiki language IDs
const HLJS_TO_SHIKI: Record<string, LanguageId> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
  csharp: "csharp",
  go: "go",
  rust: "rust",
  ruby: "ruby",
  php: "php",
  swift: "swift",
  kotlin: "kotlin",
  dart: "dart",
  xml: "html",
  html: "html",
  css: "css",
  sql: "sql",
  bash: "shellscript",
  shell: "shellscript",
  json: "json",
  yaml: "yaml",
  markdown: "markdown",
  lua: "lua",
  r: "r",
  scala: "scala",
  elixir: "elixir",
};

function mapHljsToShiki(hljsLang: string): LanguageId | null {
  return HLJS_TO_SHIKI[hljsLang] ?? null;
}

type LanguageSelectorProps = {
  value: LanguageId | null;
  autoDetected: LanguageId | null;
  onChange: (lang: LanguageId | null) => void;
};

function LanguageSelector({ value, autoDetected, onChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayLang = value ?? autoDetected;
  const isAuto = value === null && autoDetected !== null;
  const displayLabel = displayLang
    ? (LANGUAGES.find((l) => l.id === displayLang)?.label ?? displayLang)
    : "plain text";

  const filtered = LANGUAGES.filter((l) => l.label.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = useCallback(
    (langId: LanguageId | null) => {
      onChange(langId);
      setOpen(false);
      setSearch("");
    },
    [onChange],
  );

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 font-mono text-xs text-text-tertiary transition-colors hover:text-text-secondary"
      >
        <span>{displayLabel}</span>
        {isAuto && <span className="text-text-muted">(auto)</span>}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden border border-border-primary bg-bg-elevated shadow-lg">
          <div className="border-b border-border-primary p-1.5">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent font-mono text-xs text-text-primary placeholder:text-text-muted outline-none"
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {value !== null && (
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className="flex w-full items-center gap-2 px-2 py-1 text-left font-mono text-xs text-text-tertiary hover:bg-bg-surface hover:text-text-secondary"
              >
                Auto-detect
              </button>
            )}
            {filtered.map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => handleSelect(lang.id)}
                className={`flex w-full items-center gap-2 px-2 py-1 text-left font-mono text-xs hover:bg-bg-surface hover:text-text-secondary ${
                  displayLang === lang.id ? "text-accent-green" : "text-text-tertiary"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export type { LanguageId };
export { HLJS_TO_SHIKI, LANGUAGES, LanguageSelector, mapHljsToShiki };
