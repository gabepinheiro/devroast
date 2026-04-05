"use client";

import { useState } from "react";

function CodeEditor({ onChange }: { onChange?: (code: string) => void }) {
  const [code, setCode] = useState("");
  const lineCount = Math.max(code.split("\n").length, 1);

  function handleChange(value: string) {
    setCode(value);
    onChange?.(value);
  }

  return (
    <div className="flex w-full max-w-editor flex-col overflow-hidden border border-border-primary bg-bg-input">
      <div className="flex h-10 items-center border-b border-border-primary px-4">
        <div className="flex gap-2">
          <div className="size-3 rounded-full bg-accent-red" />
          <div className="size-3 rounded-full bg-accent-amber" />
          <div className="size-3 rounded-full bg-accent-green" />
        </div>
      </div>
      <div className="flex flex-1">
        <div className="flex w-12 flex-col gap-2 border-r border-border-primary bg-bg-surface px-3 py-4">
          {Array.from({ length: lineCount }, (_, i) => {
            const key = `ln-${i + 1}`;
            return (
              <span key={key} className="text-right font-mono text-xs leading-5 text-text-tertiary">
                {i + 1}
              </span>
            );
          })}
        </div>
        <textarea
          value={code}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="// paste your code ..."
          spellCheck={false}
          className="h-80 flex-1 resize-none bg-bg-input p-4 font-mono text-xs leading-5 text-text-code placeholder:text-text-muted outline-none"
        />
      </div>
    </div>
  );
}

export { CodeEditor };
