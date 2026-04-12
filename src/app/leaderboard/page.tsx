import type { Metadata } from "next";
import type { BundledLanguage } from "shiki";
import { CodeBlock, CodeBlockContent, CodeBlockHeader } from "@/components/ui/code-block";

export const metadata: Metadata = {
  title: "shame_leaderboard · DevRoast",
  description: "The most roasted code on the internet, ranked by shame.",
};

type Entry = {
  rank: number;
  score: number;
  language: BundledLanguage;
  code: string;
};

const entries: Entry[] = [
  {
    rank: 1,
    score: 1.2,
    language: "javascript",
    code: `eval(prompt("enter code"))
document.write(response)
// trust the user lol`,
  },
  {
    rank: 2,
    score: 1.8,
    language: "typescript",
    code: `if (x == true) { return true; }
else if (x == false) { return false; }
else { return !false; }`,
  },
  {
    rank: 3,
    score: 2.1,
    language: "sql",
    code: `SELECT * FROM users WHERE 1=1
-- TODO: add authentication`,
  },
  {
    rank: 4,
    score: 2.3,
    language: "java",
    code: `catch (e) {
  // ignore
}`,
  },
  {
    rank: 5,
    score: 2.5,
    language: "javascript",
    code: `const sleep = (ms) =>
  new Date(Date.now() + ms)
  while(new Date() < end) {}`,
  },
];

const TOTAL_SUBMISSIONS = 2847;
const AVG_SCORE = 4.2;

function LeaderboardEntry({ entry }: { entry: Entry }) {
  const lineCount = entry.code.split("\n").length;

  return (
    <CodeBlock>
      <CodeBlockHeader className="h-12 justify-between px-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-2xs text-text-tertiary">#</span>
            <span className="font-mono text-2xs font-bold text-accent-amber">{entry.rank}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs text-text-tertiary">score</span>
            <span className="font-mono text-2xs font-bold text-accent-red">
              {entry.score.toFixed(1)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-text-secondary">{entry.language}</span>
          <span className="font-mono text-xs text-text-tertiary">
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </span>
        </div>
      </CodeBlockHeader>

      <CodeBlockContent lang={entry.language}>{entry.code}</CodeBlockContent>
    </CodeBlock>
  );
}

function LeaderboardPage() {
  return (
    <main className="flex w-full max-w-content flex-col gap-10 px-20 py-10">
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-3xl font-bold text-accent-green">&gt;</span>
          <h1 className="font-mono text-3xl font-bold text-text-primary">shame_leaderboard</h1>
        </div>
        <p className="font-plex text-sm text-text-secondary">
          {"// the most roasted code on the internet"}
        </p>
        <div className="flex items-center gap-2">
          <span className="font-plex text-xs text-text-tertiary">
            {TOTAL_SUBMISSIONS.toLocaleString("en-US")} submissions
          </span>
          <span className="font-plex text-xs text-text-tertiary">·</span>
          <span className="font-plex text-xs text-text-tertiary">avg score: {AVG_SCORE}/10</span>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        {entries.map((entry) => (
          <LeaderboardEntry key={entry.rank} entry={entry} />
        ))}
      </section>
    </main>
  );
}

export default LeaderboardPage;
