import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const diffLineVariants = tv({
  base: "flex items-center gap-2 px-4 py-2 font-mono text-3.25 w-full",
  variants: {
    variant: {
      added: "bg-diff-added-bg text-text-primary",
      removed: "bg-diff-removed-bg text-text-secondary",
      context: "text-text-secondary",
    },
  },
  defaultVariants: {
    variant: "context",
  },
});

const diffPrefixVariants = tv({
  base: "shrink-0 select-none",
  variants: {
    variant: {
      added: "text-accent-green",
      removed: "text-accent-red",
      context: "text-text-tertiary",
    },
  },
  defaultVariants: {
    variant: "context",
  },
});

const prefixMap = { added: "+", removed: "-", context: " " } as const;

type DiffLineProps = ComponentProps<"div"> & VariantProps<typeof diffLineVariants>;

function DiffLine({ className, variant = "context", children, ...props }: DiffLineProps) {
  return (
    <div className={diffLineVariants({ variant, className })} {...props}>
      <span className={diffPrefixVariants({ variant })}>{prefixMap[variant ?? "context"]}</span>
      <span>{children}</span>
    </div>
  );
}

export { DiffLine, type DiffLineProps, diffLineVariants };
