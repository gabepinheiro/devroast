import { CodeSection } from "@/components/code-section";
import { LeaderboardPreview } from "@/components/leaderboard-preview";

export default function Home() {
  return (
    <main className="flex flex-col items-center gap-8 px-10 pt-20">
      <section className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-4xl font-bold text-accent-green">$</span>
          <h1 className="font-mono text-4xl font-bold text-text-primary">
            paste your code. get roasted.
          </h1>
        </div>
        <p className="font-plex text-sm text-text-secondary">
          {"// drop your code below and we'll rate it — brutally honest or full roast mode"}
        </p>
      </section>

      <CodeSection />

      <div className="flex items-center gap-6">
        <span className="font-plex text-xs text-text-tertiary">2,847 codes roasted</span>
        <span className="font-mono text-xs text-text-tertiary">·</span>
        <span className="font-plex text-xs text-text-tertiary">avg score: 4.2/10</span>
      </div>

      <div className="h-15" />

      <LeaderboardPreview />

      <div className="h-15" />
    </main>
  );
}
