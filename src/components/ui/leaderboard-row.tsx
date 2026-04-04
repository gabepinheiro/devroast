import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const leaderboardRowVariants = tv({
  base: "flex w-full items-center gap-6 border-b border-border-primary px-5 py-4",
});

type LeaderboardRowProps = ComponentProps<"div"> &
  VariantProps<typeof leaderboardRowVariants> & {
    rank: number;
    score: number;
    codePreview: string;
    language: string;
  };

function scoreColor(score: number) {
  if (score >= 7) return "text-accent-green";
  if (score >= 4) return "text-accent-amber";
  return "text-accent-red";
}

function LeaderboardRow({
  className,
  rank,
  score,
  codePreview,
  language,
  ...props
}: LeaderboardRowProps) {
  return (
    <div className={leaderboardRowVariants({ className })} {...props}>
      <span className="w-10 shrink-0 font-mono text-3.25 text-text-tertiary">#{rank}</span>
      <span className={`w-15 shrink-0 font-mono text-3.25 font-bold ${scoreColor(score)}`}>
        {score}
      </span>
      <span className="min-w-0 flex-1 truncate font-mono text-xs text-text-secondary">
        {codePreview}
      </span>
      <span className="w-25 shrink-0 text-right font-mono text-xs text-text-tertiary">
        {language}
      </span>
    </div>
  );
}

export { LeaderboardRow, type LeaderboardRowProps, leaderboardRowVariants };
