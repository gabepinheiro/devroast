import { asc, avg, count, desc, eq } from "drizzle-orm";
import { db } from ".";
import { issues, roasts } from "./schema";

export async function getStats() {
  const [row] = await db
    .select({
      totalRoasts: count(),
      avgScore: avg(roasts.score),
    })
    .from(roasts);

  return {
    totalRoasts: row.totalRoasts,
    avgScore: row.avgScore ? Number.parseFloat(row.avgScore) : 0,
  };
}

export async function getLeaderboardPreview() {
  return db
    .select({
      slug: roasts.slug,
      score: roasts.score,
      code: roasts.code,
      language: roasts.language,
      lineCount: roasts.lineCount,
    })
    .from(roasts)
    .orderBy(asc(roasts.score), desc(roasts.createdAt))
    .limit(3);
}

export async function getLeaderboard(page: number, pageSize = 20) {
  return db
    .select({
      slug: roasts.slug,
      score: roasts.score,
      code: roasts.code,
      language: roasts.language,
      lineCount: roasts.lineCount,
      roastComment: roasts.roastComment,
      verdict: roasts.verdict,
      createdAt: roasts.createdAt,
    })
    .from(roasts)
    .orderBy(asc(roasts.score), desc(roasts.createdAt))
    .limit(pageSize)
    .offset(page * pageSize);
}

export async function getRoastBySlug(slug: string) {
  const rows = await db
    .select({
      roast: roasts,
      issue: issues,
    })
    .from(roasts)
    .leftJoin(issues, eq(issues.roastId, roasts.id))
    .where(eq(roasts.slug, slug))
    .orderBy(asc(issues.order));

  if (rows.length === 0) return null;

  const roast = rows[0].roast;
  return {
    ...roast,
    issues: rows.filter((r) => r.issue !== null).map((r) => r.issue as NonNullable<typeof r.issue>),
  };
}

export async function getOgData(slug: string) {
  const [row] = await db
    .select({
      score: roasts.score,
      verdict: roasts.verdict,
      roastComment: roasts.roastComment,
      language: roasts.language,
      lineCount: roasts.lineCount,
    })
    .from(roasts)
    .where(eq(roasts.slug, slug));

  return row ?? null;
}

export async function createRoast(input: {
  slug: string;
  code: string;
  language: string;
  lineCount: number;
  roastMode: boolean;
  score: number;
  verdict: (typeof roasts.$inferInsert)["verdict"];
  roastComment: string;
  improvedCode?: string;
  issues: {
    severity: (typeof issues.$inferInsert)["severity"];
    title: string;
    description: string;
    order: number;
  }[];
}) {
  const { issues: issueInputs, ...roastData } = input;

  return db.transaction(async (tx) => {
    const [roast] = await tx.insert(roasts).values(roastData).returning();

    if (issueInputs.length > 0) {
      await tx.insert(issues).values(
        issueInputs.map((issue) => ({
          ...issue,
          roastId: roast.id,
        })),
      );
    }

    return roast;
  });
}
