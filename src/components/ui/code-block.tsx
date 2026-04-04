import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";

type CodeBlockProps = {
  children: string;
  lang: BundledLanguage;
  filename?: string;
};

async function CodeBlock({ children, lang, filename }: CodeBlockProps) {
  const code = children.trim();
  const html = await codeToHtml(code, { lang, theme: "vesper" });
  const lineCount = code.split("\n").length;

  return (
    <div className="overflow-hidden border border-border-primary bg-bg-input">
      <div className="flex h-10 items-center gap-3 border-b border-border-primary px-4">
        <span className="size-2.5 rounded-full bg-accent-red" />
        <span className="size-2.5 rounded-full bg-accent-amber" />
        <span className="size-2.5 rounded-full bg-accent-green" />
        {filename && (
          <>
            <span className="flex-1" />
            <span className="font-mono text-xs text-text-tertiary">{filename}</span>
          </>
        )}
      </div>
      <div className="flex">
        <div className="flex w-10 shrink-0 flex-col items-end border-r border-border-primary bg-bg-surface px-2.5 py-3 font-mono text-3.25 leading-4.75 text-text-tertiary select-none">
          {Array.from({ length: lineCount }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static line number list
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        <div
          className="flex-1 overflow-x-auto px-3 py-3 font-mono text-3.25 leading-4.75 [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!text-3.25 [&_code]:!leading-4.75"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki generates trusted HTML server-side
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

export { CodeBlock, type CodeBlockProps };
