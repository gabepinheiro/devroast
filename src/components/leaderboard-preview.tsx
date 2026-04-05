import Link from "next/link";

const leaderboardData = [
  {
    rank: 1,
    score: 1.2,
    code: ['eval(prompt("enter code"))', "document.write(response)", "// trust the user lol"],
    language: "javascript",
  },
  {
    rank: 2,
    score: 1.8,
    code: [
      "if (x == true) { return true; }",
      "else if (x == false) { return false; }",
      "else { return !false; }",
    ],
    language: "typescript",
  },
  {
    rank: 3,
    score: 2.1,
    code: ["SELECT * FROM users WHERE 1=1", "-- TODO: add authentication"],
    language: "sql",
  },
];

function LeaderboardPreview() {
  return (
    <section className="flex w-full max-w-content flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-accent-green">{"//"}</span>
          <span className="font-mono text-sm font-bold text-text-primary">shame_leaderboard</span>
        </div>
        <Link
          href="/leaderboard"
          className="border border-border-primary px-3 py-1.5 font-mono text-xs text-text-secondary transition-colors hover:text-text-primary"
        >
          $ view_all &gt;&gt;
        </Link>
      </div>

      <p className="font-plex text-2xs text-text-tertiary">
        {"// the worst code on the internet, ranked by shame"}
      </p>

      <div className="border border-border-primary">
        <div className="flex h-10 items-center bg-bg-surface px-5">
          <span className="w-12.5 font-mono text-xs text-text-tertiary">#</span>
          <span className="w-17.5 font-mono text-xs text-text-tertiary">score</span>
          <span className="flex-1 font-mono text-xs text-text-tertiary">code</span>
          <span className="w-25 text-right font-mono text-xs text-text-tertiary">lang</span>
        </div>

        {leaderboardData.map((row, i) => (
          <div
            key={row.rank}
            className={`flex px-5 py-4 ${i < leaderboardData.length - 1 ? "border-b border-border-primary" : ""}`}
          >
            <span className="w-12.5 font-mono text-xs text-text-secondary">{row.rank}</span>
            <span className="w-17.5 font-mono text-xs font-bold text-accent-red">{row.score}</span>
            <div className="flex flex-1 flex-col gap-0.75">
              {row.code.map((line) => (
                <span
                  key={line}
                  className={`font-mono text-xs ${line.startsWith("//") || line.startsWith("--") ? "text-text-comment" : "text-text-primary"}`}
                >
                  {line}
                </span>
              ))}
            </div>
            <span className="w-25 text-right font-mono text-xs text-text-secondary">
              {row.language}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-center py-4">
        <Link
          href="/leaderboard"
          className="font-plex text-xs text-text-tertiary transition-colors hover:text-text-primary"
        >
          showing top 3 of 2,847 · view full leaderboard &gt;&gt;
        </Link>
      </div>
    </section>
  );
}

export { LeaderboardPreview };
