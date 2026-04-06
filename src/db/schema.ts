import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const verdictEnum = pgEnum("verdict", [
  "disaster",
  "needs_serious_help",
  "mediocre",
  "decent",
  "impressive",
  "flawless",
]);

export const issueSeverityEnum = pgEnum("issue_severity", ["critical", "warning", "good"]);

export const roasts = pgTable(
  "roasts",
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull().unique(),

    // Input
    code: text().notNull(),
    language: text().notNull(),
    lineCount: integer().notNull(),
    roastMode: boolean().notNull().default(true),

    // AI output
    score: real().notNull(),
    verdict: verdictEnum().notNull(),
    roastComment: text().notNull(),
    improvedCode: text(),

    // Metadata
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("roasts_score_idx").on(t.score)],
);

export const issues = pgTable(
  "issues",
  {
    id: uuid().primaryKey().defaultRandom(),
    roastId: uuid()
      .notNull()
      .references(() => roasts.id, { onDelete: "cascade" }),

    severity: issueSeverityEnum().notNull(),
    title: text().notNull(),
    description: text().notNull(),
    order: integer().notNull(),
  },
  (t) => [index("issues_roast_id_idx").on(t.roastId)],
);
