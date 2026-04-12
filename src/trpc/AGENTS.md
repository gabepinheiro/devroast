# tRPC Layer

## Architecture

All files live in `src/trpc/`, isolated by file — not by directory. Server-only files use `import "server-only"`; the client file uses `import type` for `AppRouter` so no server code leaks into the browser bundle.

| File | Env | Role |
|---|---|---|
| `init.ts` | server-only | `initTRPC`, context (`db`), `publicProcedure`, superjson transformer |
| `root.ts` | server-only | `appRouter` composition, `AppRouter` type export |
| `routers/*.ts` | server-only | Sub-routers. Each procedure delegates to `src/db/queries.ts` |
| `query-client.ts` | neutral | `makeQueryClient` with superjson serializer and `shouldDehydrateQuery` for pending queries |
| `server.tsx` | server-only | `caller`, `trpc` options proxy, `prefetch()` helper, `HydrateClient` |
| `client.tsx` | `"use client"` | `TRPCReactProvider`, `useTRPC` hook |

## Patterns

### Server Components — `caller`

The default for reading data in Server Components. Use `caller.router.procedure()` with `await` directly inside async Server Components. Wrap each visually independent block in its own `<Suspense>` for streaming.

```tsx
async function ScoreHero({ id }: { id: string }) {
  const roast = await caller.roast.byId({ id });
  return <ScoreRing score={roast.score} />;
}
```

### Client Components — `prefetch` + `HydrateClient` + `useQuery`

When a Client Component needs server data:

1. Server Component calls `prefetch(trpc.*.queryOptions())` — this prefetches into the query client cache without `await`.
2. Wrap the subtree in `<HydrateClient>` to dehydrate the cache into the HTML.
3. Client Component consumes via `useQuery(trpc.*.queryOptions())`.

```tsx
// Server Component (page.tsx)
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default function Page() {
  prefetch(trpc.stats.overview.queryOptions());
  return (
    <HydrateClient>
      <StatsWidget />
    </HydrateClient>
  );
}
```

```tsx
// Client Component
"use client";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function StatsWidget() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.stats.overview.queryOptions());
  // data starts undefined on first render, then resolves from hydrated cache
}
```

Use `useSuspenseQuery` + `<Suspense>` when the component must not render until data is available. Use `useQuery` when you need the loading→resolved transition (e.g. animated numbers starting from zero).

### Mutations

Always from Client Components via `useMutation`:

```tsx
const trpc = useTRPC();
const createRoast = useMutation(trpc.roast.create.mutationOptions());
```

## Adding a new procedure

1. Create or edit a router file in `src/trpc/routers/`.
2. Import and compose it into `appRouter` in `src/trpc/root.ts`.
3. The procedure delegates to a function in `src/db/queries.ts` — keep business logic there, not in the router.
4. Validate inputs with `zod` schemas via `.input()`.

## Rules

- **Never import `src/db/queries.ts` from components.** Always go through tRPC procedures.
- **`caller` is the default; `HydrateClient` + prefetch is the exception.** Only use the hydration path when a Client Component needs the data.
- **`prefetch()` over raw `queryClient.prefetchQuery()`** — the helper handles both regular and infinite queries automatically.
- **All procedures are `publicProcedure` for now.** `protectedProcedure` will be added when auth is implemented.
