# Drizzle ORM + PostgreSQL

> Spec criada em 2026-04-06 | Status: **Rascunho**

## Contexto

O DevRoast precisa persistir as submissoes de codigo ("roasts"), seus resultados de analise e o leaderboard. Atualmente todos os dados sao hardcoded nos componentes. Esta spec define o schema do banco, a configuracao do Drizzle ORM e o setup do Docker Compose para Postgres local.

---

## Stack

| Tecnologia | Versao | Motivo |
|---|---|---|
| **PostgreSQL** | 16 | Banco principal, suporte a enums nativos, JSONB, full-text search |
| **Drizzle ORM** | latest | Type-safe, SQL-like, leve, excelente DX com Next.js |
| **drizzle-kit** | latest | Migrations e introspeccao de schema |
| **Docker Compose** | v2 | Subir Postgres localmente sem instalar nada |

---

## Schema

### Enums

```typescript
// src/db/schema.ts

import { pgEnum } from "drizzle-orm/pg-core";

export const verdictEnum = pgEnum("verdict", [
  "disaster",          // 0-1.9
  "needs_serious_help", // 2-3.9
  "mediocre",          // 4-5.9
  "decent",            // 6-7.9
  "impressive",        // 8-9.9
  "flawless",          // 10
]);

export const issueSeverityEnum = pgEnum("issue_severity", [
  "critical",
  "warning",
  "good",
]);
```

### Tabela: `roasts`

Entidade central. Cada submissao de codigo gera um roast.

```typescript
import { pgTable, text, real, boolean, integer, timestamp, uuid } from "drizzle-orm/pg-core";

export const roasts = pgTable("roasts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(), // URL-friendly ID para compartilhamento (ex: "aB3kQ9")

  // Input
  code: text("code").notNull(),
  language: text("language").notNull(),  // "javascript", "python", etc.
  lineCount: integer("line_count").notNull(),
  roastMode: boolean("roast_mode").notNull().default(true),

  // Output da AI
  score: real("score").notNull(),          // 0.0 a 10.0
  verdict: verdictEnum("verdict").notNull(),
  roastComment: text("roast_comment").notNull(), // one-liner sarcastico exibido no hero
  improvedCode: text("improved_code"),           // versao melhorada do codigo (para o diff)

  // Metadata
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

**Campos derivados do design:**
- `slug` — Screen 4 (OG Image) e feature "shareable results" precisam de URL unica
- `score` + `verdict` — Score Ring na Screen 2, OG Image na Screen 4
- `roastComment` — One-liner na Screen 2 ("this code looks like it was written during a power outage...")
- `language` + `lineCount` — Meta info na Screen 2 e entries do leaderboard
- `improvedCode` — Diff Section na Screen 2 (comparacao original vs melhorado)
- `roastMode` — Toggle na Screen 1

### Tabela: `issues`

Cada roast tem multiplos issues (a secao "detailed_analysis" da Screen 2).

```typescript
export const issues = pgTable("issues", {
  id: uuid("id").primaryKey().defaultRandom(),
  roastId: uuid("roast_id").notNull().references(() => roasts.id, { onDelete: "cascade" }),

  severity: issueSeverityEnum("severity").notNull(), // "critical", "warning", "good"
  title: text("title").notNull(),                     // ex: "using var instead of const/let"
  description: text("description").notNull(),         // ex: "var is function-scoped and leads to..."

  order: integer("order").notNull(), // posicao no grid de issues (1, 2, 3, 4...)
});
```

**Campos derivados do design:**
- `severity` — Badge colorido no Issue Card (critical=red, warning=amber, good=green)
- `title` + `description` — Issue Card na Analysis Section (Screen 2)
- `order` — Ordem dos cards no grid (Row 1: issues 1-2, Row 2: issues 3-4)

### Relations

```typescript
import { relations } from "drizzle-orm";

export const roastsRelations = relations(roasts, ({ many }) => ({
  issues: many(issues),
}));

export const issuesRelations = relations(issues, ({ one }) => ({
  roast: one(roasts, {
    fields: [issues.roastId],
    references: [roasts.id],
  }),
}));
```

---

## Queries derivadas das telas

### Screen 1 — Footer stats

```sql
-- "2,847 codes roasted" e "avg score: 4.2/10"
SELECT COUNT(*) AS total_roasts, ROUND(AVG(score), 1) AS avg_score FROM roasts;
```

### Screen 1 — Leaderboard Preview (top 3 piores)

```sql
SELECT slug, score, code, language, line_count
FROM roasts
ORDER BY score ASC, created_at DESC
LIMIT 3;
```

### Screen 2 — Roast Results (por slug)

```sql
-- Roast completo com issues
SELECT r.*, json_agg(i.* ORDER BY i.order) AS issues
FROM roasts r
LEFT JOIN issues i ON i.roast_id = r.id
WHERE r.slug = $1
GROUP BY r.id;
```

### Screen 3 — Shame Leaderboard (paginado)

```sql
SELECT slug, score, code, language, line_count, roast_comment, verdict, created_at
FROM roasts
ORDER BY score ASC, created_at DESC
LIMIT 20 OFFSET $1;
```

### Screen 4 — OG Image (por slug)

```sql
SELECT score, verdict, roast_comment, language, line_count
FROM roasts
WHERE slug = $1;
```

---

## Indixes

```typescript
import { index } from "drizzle-orm/pg-core";

// Na definicao da tabela roasts, adicionar:
// - Index no score para ordenacao do leaderboard
// - Index no slug para lookups rapidos
// - Index no created_at para ordenacao temporal

export const roastsScoreIdx = index("roasts_score_idx").on(roasts.score);
export const roastsSlugIdx = index("roasts_slug_idx").on(roasts.slug); // ja tem unique, mas explicito
export const roastsCreatedAtIdx = index("roasts_created_at_idx").on(roasts.createdAt);

// Na tabela issues:
export const issuesRoastIdIdx = index("issues_roast_id_idx").on(issues.roastId);
```

---

## Estrutura de arquivos

```
src/
  db/
    index.ts          -- cliente Drizzle (pool + drizzle instance)
    schema.ts         -- enums, tabelas, relations
    migrations/       -- geradas pelo drizzle-kit
docker-compose.yml    -- Postgres 16
drizzle.config.ts     -- config do drizzle-kit
.env.local            -- DATABASE_URL
```

---

## Docker Compose

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: devroast
      POSTGRES_PASSWORD: devroast
      POSTGRES_DB: devroast
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## Configuracao do Drizzle

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

```typescript
// src/db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export const db = drizzle(process.env.DATABASE_URL!, { schema });
```

```bash
# .env.local
DATABASE_URL=postgresql://devroast:devroast@localhost:5432/devroast
```

---

## Geracao de slug

Para URLs compartilhaveis, usar `nanoid` com alfabeto URL-safe:

```typescript
import { nanoid } from "nanoid";

// Gera slugs curtos de 8 caracteres (ex: "aB3kQ9xZ")
const slug = nanoid(8);
```

- 8 caracteres com alfabeto padrao do nanoid (A-Za-z0-9_-) = ~10^14 combinacoes
- Suficiente para o caso de uso, colisao desprezivel

---

## TODOs de Implementacao

- [ ] Instalar dependencias
  - [ ] `pnpm add drizzle-orm pg`
  - [ ] `pnpm add -D drizzle-kit @types/pg`
  - [ ] `pnpm add nanoid`
- [ ] Criar `docker-compose.yml` na raiz do projeto
- [ ] Criar `.env.local` com `DATABASE_URL`
  - [ ] Adicionar `.env.local` ao `.gitignore` (se ja nao estiver)
- [ ] Criar `drizzle.config.ts` na raiz
- [ ] Criar `src/db/schema.ts` com enums, tabelas e relations
- [ ] Criar `src/db/index.ts` com cliente Drizzle
- [ ] Gerar migration inicial: `pnpm drizzle-kit generate`
- [ ] Aplicar migration: `pnpm drizzle-kit migrate`
- [ ] Adicionar scripts no `package.json`
  - [ ] `"db:generate": "drizzle-kit generate"`
  - [ ] `"db:migrate": "drizzle-kit migrate"`
  - [ ] `"db:studio": "drizzle-kit studio"`
  - [ ] `"db:up": "docker compose up -d"`
  - [ ] `"db:down": "docker compose down"`
- [ ] Testar conexao: criar um script ou rota simples que insere e le um roast
- [ ] Implementar funcao `generateSlug()` com nanoid
- [ ] Criar funcoes de query reutilizaveis (ou usar diretamente nos Server Components/Actions)
  - [ ] `getStats()` — count + avg score
  - [ ] `getLeaderboardPreview()` — top 3
  - [ ] `getLeaderboard(page)` — paginado
  - [ ] `getRoastBySlug(slug)` — roast completo com issues
  - [ ] `createRoast(input)` — insere roast + issues em transacao
