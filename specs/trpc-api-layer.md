# tRPC como Camada de API

> Spec criada em 2026-04-11 | Status: **Rascunho**

## Contexto

O DevRoast precisa de uma camada de API type-safe entre os Server/Client Components e a camada de dados (Drizzle, já configurada em `src/db/`). Hoje os componentes chamam funções de `src/db/queries.ts` diretamente, o que funciona no servidor mas não oferece um contrato único para quando formos expor operações a Client Components (ex.: submeter código, votar, paginar leaderboard no cliente).

Objetivo: adotar **tRPC v11** com `@trpc/tanstack-react-query` integrado ao App Router do Next.js, de forma que:

- Server Components resolvam dados via um "server caller" e sejam fatiados em fronteiras `<Suspense>` para permitir streaming progressivo de HTML.
- Client Components usem `useSuspenseQuery`/`useMutation` com inferência total de tipos, pareados com as mesmas fronteiras `<Suspense>` no servidor.
- Tanto leitura (listar leaderboard, obter roast por id) quanto escrita (criar roast) passem pelos mesmos procedures.

Referências:

- https://trpc.io/docs/client/tanstack-react-query/setup
- https://trpc.io/docs/client/tanstack-react-query/server-components

---

## Stack

| Pacote | Papel |
|---|---|
| `@trpc/server` | Definição de routers, procedures e context |
| `@trpc/client` | Cliente HTTP (`createTRPCClient`, `httpBatchLink`) |
| `@trpc/tanstack-react-query` | Integração com React Query v5 (`createTRPCContext`, `createTRPCOptionsProxy`) |
| `@tanstack/react-query` | Cache / state dos dados no cliente |
| `server-only` / `client-only` | Guardar módulos para o ambiente certo |
| `superjson` | Serialização de `Date`, `Map`, `Set` entre server e client (transformer global) |

`zod` já está no projeto (usado via Drizzle) e será usado como validador de input dos procedures.

---

## Arquitetura

Tudo vive em `src/trpc/`, separado por arquivo. A proteção contra vazamento de código de servidor para o bundle do cliente é feita pela combinação de `server-only`/`"use client"` nos arquivos e `import type` do `AppRouter` no lado do cliente — não por diretório.

```
src/
├── trpc/
│   ├── init.ts                  # initTRPC, context, helpers (server-only)
│   ├── root.ts                  # appRouter (server-only)
│   ├── routers/
│   │   ├── roast.ts
│   │   ├── leaderboard.ts
│   │   └── stats.ts
│   ├── query-client.ts          # makeQueryClient (neutro)
│   ├── server.tsx               # caller, trpc proxy, HydrateClient (server-only)
│   └── client.tsx               # TRPCReactProvider, useTRPC ("use client")
└── app/
    ├── api/
    │   └── trpc/
    │       └── [trpc]/
    │           └── route.ts     # fetchRequestHandler (GET/POST)
    └── layout.tsx               # <TRPCReactProvider>
```

**Garantias de isolamento:**

- `init.ts`, `root.ts`, `routers/*` e `server.tsx` começam com `import "server-only"` — qualquer tentativa de importá-los em um Client Component gera erro de build.
- `client.tsx` usa `import type { AppRouter } from "./root"` — import de tipo é apagado pelo TypeScript, então o runtime do cliente nunca carrega o router nem o Drizzle.

---

## Especificação Técnica

### 1. Context e init (`src/trpc/init.ts`)

```typescript
import "server-only";

import { initTRPC } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { db } from "@/db";

export const createTRPCContext = cache(async () => {
  // futuramente: ler sessão, feature flags, headers, etc.
  return { db };
});

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
```

- `cache()` do React garante que o context seja criado uma vez por request no servidor.
- `transformer: superjson` precisa ser o mesmo no cliente (ver `client.tsx`).
- Futuramente criaremos `protectedProcedure` baseado em sessão — por enquanto só `publicProcedure`.

### 2. AppRouter (`src/trpc/root.ts`)

```typescript
import "server-only";

import { createTRPCRouter } from "./init";
import { leaderboardRouter } from "./routers/leaderboard";
import { roastRouter } from "./routers/roast";
import { statsRouter } from "./routers/stats";

export const appRouter = createTRPCRouter({
  roast: roastRouter,
  leaderboard: leaderboardRouter,
  stats: statsRouter,
});

export type AppRouter = typeof appRouter;
```

Os sub-routers delegam para as funções já existentes em `src/db/queries.ts`, mantendo a spec de Drizzle intacta. Exemplo:

```typescript
// src/trpc/routers/roast.ts
import { z } from "zod";
import { getRoastById } from "@/db/queries";
import { createTRPCRouter, publicProcedure } from "../init";

export const roastRouter = createTRPCRouter({
  byId: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ input }) => getRoastById(input.id)),
});
```

### 3. Route handler (`src/app/api/trpc/[trpc]/route.ts`)

```typescript
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/root";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });

export { handler as GET, handler as POST };
```

O endpoint HTTP existe para o caso minoritário: Client Components que precisam disparar requests do navegador (mutations ou queries que dependem de estado do cliente). O padrão default é chamar tudo via `caller` no servidor.

### 4. Query client compartilhado (`src/trpc/query-client.ts`)

```typescript
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import superjson from "superjson";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30 * 1000 },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
        serializeData: superjson.serialize,
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
}
```

`shouldDehydrateQuery` com `pending` permite fazer *streaming* de dados do server para o client — o Server Component dispara `prefetchQuery` sem `await`, e o Next entrega o HTML enquanto o dado resolve.

### 5. Server helper (`src/trpc/server.tsx`)

```tsx
import "server-only";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./root";

export const getQueryClient = cache(makeQueryClient);

export const caller = appRouter.createCaller(createTRPCContext);

// Usado apenas quando precisamos prefetchar algo para um Client Component
// consumir via useQuery. Padrão do projeto é chamar `caller` diretamente.
export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}
```

**Regra do projeto:** sempre prefira `caller` no servidor. `HydrateClient` + prefetch é a exceção, usada só quando já existe um Client Component interativo que precisa do mesmo dado (ex.: lista paginada com filtro controlado pelo usuário).

### 6. Client provider (`src/trpc/client.tsx`)

```tsx
"use client";

import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import superjson from "superjson";
import type { AppRouter } from "./root";
import { makeQueryClient } from "./query-client";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

function getUrl() {
  const base =
    typeof window !== "undefined"
      ? ""
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
  return `${base}/api/trpc`;
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [httpBatchLink({ url: getUrl(), transformer: superjson })],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
```

O `import type { AppRouter }` garante que nenhum código de servidor vaze para o bundle do cliente — só o shape dos tipos.

### 7. Integração no `app/layout.tsx`

```tsx
import { TRPCReactProvider } from "@/trpc/client";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>
          <Navbar />
          <div className="mx-auto w-full max-w-page">{children}</div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
```

---

## Padrões de uso

### Padrão default — `caller` + `<Suspense>` streaming

A forma canônica é fatiar a página em sub-componentes `async` que chamam `caller` diretamente, cada um isolado por uma fronteira `<Suspense>`. O Next entrega o shell HTML imediatamente e faz *streaming* de cada bloco quando a query resolve — o usuário vê score antes de ver análise, sem esperar pelo dado mais lento.

```tsx
import { Suspense } from "react";
import { caller } from "@/trpc/server";

export default async function RoastPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="flex flex-col gap-10">
      <Suspense fallback={<ScoreHeroSkeleton />}>
        <ScoreHero id={id} />
      </Suspense>
      <Suspense fallback={<AnalysisSkeleton />}>
        <Analysis id={id} />
      </Suspense>
    </main>
  );
}

async function ScoreHero({ id }: { id: string }) {
  const roast = await caller.roast.byId({ id });
  return <ScoreRing score={roast.score} />;
}

async function Analysis({ id }: { id: string }) {
  const roast = await caller.roast.byId({ id });
  return <IssueGrid issues={roast.issues} />;
}
```

Se dois blocos precisam do mesmo dado, ambos chamam `caller.roast.byId({ id })` — o `cache()` do React garante que só uma query roda por request.

Para queries independentes que devem resolver em paralelo dentro do **mesmo** `<Suspense>`, use `Promise.all`:

```tsx
async function Overview() {
  const [stats, preview] = await Promise.all([
    caller.stats.overview(),
    caller.leaderboard.preview(),
  ]);
  return <OverviewView stats={stats} preview={preview} />;
}
```

A regra: **um `<Suspense>` por bloco visualmente independente**. Se o usuário pode ver score antes de análise, são dois blocos. Se score e verdict aparecem juntos, é um bloco.

### Exceção — `HydrateClient` + `useSuspenseQuery`

Quando um Client Component precisa do dado para alimentar estado interativo (lista paginada, filtro controlado), o Server Component faz prefetch e o Client Component consome com `useSuspenseQuery`. A fronteira `<Suspense>` fica no Server Component, então o mesmo padrão de streaming se aplica.

```tsx
import { Suspense } from "react";
import { HydrateClient, getQueryClient, trpc } from "@/trpc/server";
import { LeaderboardList } from "./leaderboard-list";

export default function LeaderboardPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.leaderboard.list.queryOptions({ page: 0 }));

  return (
    <HydrateClient>
      <Suspense fallback={<LeaderboardListSkeleton />}>
        <LeaderboardList />
      </Suspense>
    </HydrateClient>
  );
}
```

```tsx
"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function LeaderboardList() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.leaderboard.list.queryOptions({ page: 0 }));
  // `data` nunca é undefined — Suspense já garantiu a resolução.
}
```

O `shouldDehydrateQuery` com `pending` (ver `query-client.ts`) permite que o Server Component dispare `prefetchQuery` sem `await` — o Next envia o HTML do skeleton, e o chunk hidratado chega quando a query resolve no servidor.

### Mutations

Mutations vêm do cliente por natureza (reagem a eventos do usuário). Usam `useTRPC` + `useMutation` via HTTP.

```tsx
"use client";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function RoastForm() {
  const trpc = useTRPC();
  const createRoast = useMutation(trpc.roast.create.mutationOptions());
  // ...
}
```

---

## Procedures iniciais

Mapeamento 1:1 com as queries já existentes em `src/db/queries.ts`:

| Procedure | Tipo | Input | Delegação |
|---|---|---|---|
| `stats.overview` | query | — | `getStats()` |
| `leaderboard.preview` | query | — | `getLeaderboardPreview()` |
| `leaderboard.list` | query | `{ page: number }` | `getLeaderboard(page)` |
| `roast.byId` | query | `{ id: string.uuid() }` | `getRoastById(id)` |
| `roast.create` | mutation | `{ code, language, roastMode }` | `createRoast(input)` |

A lógica de negócio continua nas funções de `src/db/queries.ts`. O router tRPC só faz validação de input com Zod e encaminha a chamada.

---

## Decisões

1. **`superjson` como transformer global** — precisamos enviar `Date` (timestamps do Drizzle) sem serializá-los manualmente em cada procedure.
2. **Tudo sob `src/trpc/`, separado por arquivo** — `init.ts`, `root.ts`, `routers/*` e `server.tsx` levam `import "server-only"`; `client.tsx` usa `import type` para o `AppRouter`. Isolamento por arquivo, não por diretório.
3. **`caller` é o default; `HydrateClient` é exceção** — rodar o máximo possível no servidor. `HydrateClient` + prefetch só entra quando um Client Component precisa de `useSuspenseQuery` para estado interativo.
4. **`<Suspense>` como unidade de streaming** — páginas são fatiadas em blocos async isolados por `<Suspense>`. O shell HTML sai imediatamente e cada bloco é streamado quando sua query resolve, eliminando waterfalls visuais. No cliente, sempre `useSuspenseQuery` (nunca `useQuery`) para manter a mesma fronteira de loading entre server e client.
5. **Manter `src/db/queries.ts`** — a camada de acesso a dados não muda; tRPC é só o transporte/contrato.
6. **Sem autenticação ainda** — todos os procedures são `publicProcedure`. `protectedProcedure` fica para uma spec futura quando houver auth.

---

## TODOs de Implementação

- [ ] Instalar dependências
  - [ ] `pnpm add @trpc/server @trpc/client @trpc/tanstack-react-query @tanstack/react-query superjson server-only client-only`
- [ ] Criar routers e contexto em `src/trpc/`
  - [ ] `src/trpc/init.ts` com `server-only`, context, `initTRPC` + superjson e helpers
  - [ ] `src/trpc/routers/stats.ts`
  - [ ] `src/trpc/routers/leaderboard.ts`
  - [ ] `src/trpc/routers/roast.ts`
  - [ ] `src/trpc/root.ts` compondo o `appRouter` e exportando `type AppRouter`
- [ ] Camada de integração Next.js (mesma pasta)
  - [ ] `src/trpc/query-client.ts` com `makeQueryClient` + transformer superjson
  - [ ] `src/trpc/server.tsx` com `caller`, `trpc` proxy e `HydrateClient` (`server-only`)
  - [ ] `src/trpc/client.tsx` com `TRPCReactProvider` e `useTRPC` (`"use client"`)
- [ ] Criar route handler em `src/app/api/trpc/[trpc]/route.ts`
- [ ] Integrar `TRPCReactProvider` em `src/app/layout.tsx`
- [ ] Validar DX
  - [ ] Confirmar inferência de tipos ponta a ponta (hover no resultado de `caller.*` e de `useQuery`)
  - [ ] Confirmar que `AppRouter` não traz código de servidor para o bundle do cliente (checar `next build` e analisar bundle se necessário)
- [ ] Documentar no `AGENTS.md` do projeto o padrão "caller no servidor por default"
