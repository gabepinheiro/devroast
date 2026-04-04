import type { ComponentProps } from "react";

type ScoreRingProps = Omit<ComponentProps<"div">, "children"> & {
  score: number;
  max?: number;
  size?: number;
};

function ScoreRing({ score, max = 10, size = 180, className, ...props }: ScoreRingProps) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score / max, 0), 1);
  const dashOffset = circumference * (1 - progress);

  return (
    <div
      className={className}
      style={{ width: size, height: size, position: "relative" }}
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
        role="img"
        aria-label={`Score ${score} out of ${max}`}
      >
        <defs>
          <linearGradient id={`score-gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-accent-green)" />
            <stop offset="100%" stopColor="var(--color-accent-amber)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border-primary)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#score-gradient-${score})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="font-mono text-5xl font-bold leading-none text-text-primary">{score}</span>
        <span className="font-mono text-base leading-none text-text-tertiary">/{max}</span>
      </div>
    </div>
  );
}

export { ScoreRing, type ScoreRingProps };
