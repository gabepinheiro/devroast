import type { ComponentProps } from "react";
import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
import { tv } from "tailwind-variants";

const codeBlockVariants = tv({
  base: "flex flex-col overflow-hidden border border-border-primary bg-bg-input",
});

const codeBlockHeaderVariants = tv({
  base: "flex items-center border-b border-border-primary",
});

const codeBlockFilenameVariants = tv({
  base: "font-mono text-xs text-text-tertiary",
});

const codeBlockContentVariants = tv({
  base: "flex bg-bg-input",
});

type CodeBlockProps = ComponentProps<"div">;
type CodeBlockHeaderProps = ComponentProps<"div">;
type CodeBlockFilenameProps = ComponentProps<"span">;
type CodeBlockContentProps = {
  children: string;
  lang: BundledLanguage;
  className?: string;
};

function CodeBlock({ className, ...props }: CodeBlockProps) {
  return <div className={codeBlockVariants({ className })} {...props} />;
}

function CodeBlockHeader({ className, ...props }: CodeBlockHeaderProps) {
  return <div className={codeBlockHeaderVariants({ className })} {...props} />;
}

function CodeBlockDots() {
  return (
    <div className="flex items-center gap-2">
      <span className="size-2.5 rounded-full bg-accent-red" />
      <span className="size-2.5 rounded-full bg-accent-amber" />
      <span className="size-2.5 rounded-full bg-accent-green" />
    </div>
  );
}

function CodeBlockFilename({ className, ...props }: CodeBlockFilenameProps) {
  return (
    <span className={codeBlockFilenameVariants({ className })} {...props} />
  );
}

async function CodeBlockContent({
  children,
  lang,
  className,
}: CodeBlockContentProps) {
  const code = children.trim();
  const html = await codeToHtml(code, { lang, theme: "vesper" });
  const lineCount = code.split("\n").length;

  return (
    <div className={codeBlockContentVariants({ className })}>
      <div className="flex w-10 shrink-0 flex-col items-end border-r border-border-primary bg-bg-surface px-2.5 py-3 font-mono text-xs leading-4.75 text-text-tertiary select-none">
        {Array.from({ length: lineCount }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static line number list
          <span key={i}>{i + 1}</span>
        ))}
      </div>
      <div
        className="min-w-0 flex-1 overflow-x-auto px-3 py-3 font-mono text-xs leading-4.75 [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!text-3.25 [&_code]:!leading-4.75"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki generates trusted HTML server-side
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export {
  CodeBlock,
  CodeBlockContent,
  CodeBlockDots,
  CodeBlockFilename,
  CodeBlockHeader,
  type CodeBlockContentProps,
  type CodeBlockFilenameProps,
  type CodeBlockHeaderProps,
  type CodeBlockProps,
};
