import { CodeSection } from "@/components/code-section";
import { HomeStats } from "@/components/home-stats";
import { LeaderboardPreview } from "@/components/leaderboard-preview";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default function Home() {
  prefetch(trpc.stats.overview.queryOptions());

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

      <HydrateClient>
        <HomeStats />
      </HydrateClient>

      <div className="h-15" />

      <LeaderboardPreview />

      <div className="h-15" />
    </main>
  );
}
