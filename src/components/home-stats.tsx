"use client";

import { useTRPC } from "@/trpc/client";
import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";

export function HomeStats() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.stats.overview.queryOptions());

  return (
    <div className="flex items-center gap-6">
      <span className="font-plex text-xs text-text-tertiary">
        <NumberFlow value={data ? Number(data.totalRoasts) : 0} /> codes roasted
      </span>
      <span className="font-mono text-xs text-text-tertiary">·</span>
      <span className="font-plex text-xs text-text-tertiary">
        avg score:{" "}
        <NumberFlow
          value={data?.avgScore ?? 0}
          format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        />
        /10
      </span>
    </div>
  );
}
