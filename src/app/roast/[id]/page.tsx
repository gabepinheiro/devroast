import type { Metadata } from "next";
import type { BundledLanguage } from "shiki";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockFilename,
  CodeBlockHeader,
} from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { ScoreRing } from "@/components/ui/score-ring";

type PageProps = {
  params: Promise<{ id: string }>;
};

type Verdict = "roasted" | "needs_serious_help" | "acceptable" | "chefs_kiss";
type IssueVariant = "critical" | "warning" | "good";

type Issue = {
  variant: IssueVariant;
  label: string;
  title: string;
  description: string;
};

type DiffEntry = {
  id: string;
  variant: "context" | "added" | "removed";
  content: string;
};

type Roast = {
  score: number;
  verdict: Verdict;
  quote: string;
  language: BundledLanguage;
  lineCount: number;
  submittedCode: string;
  issues: Issue[];
  diff: {
    fromFile: string;
    toFile: string;
    lines: DiffEntry[];
  };
};

const roast: Roast = {
  score: 3.5,
  verdict: "needs_serious_help",
  quote: '"this code looks like it was written during a power outage... in 2005."',
  language: "javascript",
  lineCount: 16,
  submittedCode: `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }

  if (total > 100) {
    console.log("discount applied");
    total = total * 0.9;
  }

  // TODO: handle tax calculation
  // TODO: handle currency conversion

  return total;
}`,
  issues: [
    {
      variant: "critical",
      label: "critical",
      title: "using var instead of const/let",
      description:
        "var is function-scoped and leads to hoisting bugs. use const by default, let when reassignment is needed.",
    },
    {
      variant: "warning",
      label: "warning",
      title: "imperative loop pattern",
      description:
        "for loops are verbose and error-prone. use .reduce() or .map() for cleaner, functional transformations.",
    },
    {
      variant: "good",
      label: "good",
      title: "clear naming conventions",
      description:
        "calculateTotal and items are descriptive, self-documenting names that communicate intent without comments.",
    },
    {
      variant: "good",
      label: "good",
      title: "single responsibility",
      description:
        "the function does one thing well — calculates a total. no side effects, no mixed concerns, no hidden complexity.",
    },
  ],
  diff: {
    fromFile: "your_code.ts",
    toFile: "improved_code.ts",
    lines: [
      { id: "ctx-1", variant: "context", content: "function calculateTotal(items) {" },
      { id: "rm-1", variant: "removed", content: "  var total = 0;" },
      { id: "rm-2", variant: "removed", content: "  for (var i = 0; i < items.length; i++) {" },
      { id: "rm-3", variant: "removed", content: "    total = total + items[i].price;" },
      { id: "rm-4", variant: "removed", content: "  }" },
      { id: "rm-5", variant: "removed", content: "  return total;" },
      {
        id: "add-1",
        variant: "added",
        content: "  return items.reduce((sum, item) => sum + item.price, 0);",
      },
      { id: "ctx-2", variant: "context", content: "}" },
    ],
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `roast ${id.slice(0, 8)} · DevRoast`,
    description: "Your code, brutally reviewed.",
  };
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm font-bold text-accent-green">{"//"}</span>
      <span className="font-mono text-sm font-bold text-text-primary">{children}</span>
    </div>
  );
}

async function RoastResultPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <main className="flex w-full flex-col gap-10 px-20 py-10">
      <section className="flex items-center gap-12">
        <ScoreRing score={roast.score} />

        <div className="flex flex-1 flex-col gap-4">
          <Badge variant="critical">verdict: {roast.verdict}</Badge>
          <p className="font-plex text-xl leading-relaxed text-text-primary">{roast.quote}</p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-text-tertiary">lang: {roast.language}</span>
            <span className="font-mono text-xs text-text-tertiary">·</span>
            <span className="font-mono text-xs text-text-tertiary">{roast.lineCount} lines</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="md">
              $ share_roast
            </Button>
          </div>
        </div>
      </section>

      <hr className="border-t border-border-primary" />

      <section className="flex flex-col gap-4">
        <SectionTitle>your_submission</SectionTitle>
        <CodeBlock>
          <CodeBlockContent lang={roast.language}>{roast.submittedCode}</CodeBlockContent>
        </CodeBlock>
      </section>

      <hr className="border-t border-border-primary" />

      <section className="flex flex-col gap-6">
        <SectionTitle>detailed_analysis</SectionTitle>
        <div className="grid grid-cols-2 gap-5">
          {roast.issues.map((issue) => (
            <Card key={issue.title}>
              <Badge variant={issue.variant}>{issue.label}</Badge>
              <CardTitle>{issue.title}</CardTitle>
              <CardDescription>{issue.description}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      <hr className="border-t border-border-primary" />

      <section className="flex flex-col gap-6">
        <SectionTitle>suggested_fix</SectionTitle>
        <CodeBlock>
          <CodeBlockHeader className="h-10 px-4">
            <CodeBlockFilename>
              {roast.diff.fromFile} → {roast.diff.toFile}
            </CodeBlockFilename>
          </CodeBlockHeader>
          <div className="flex flex-col py-1">
            {roast.diff.lines.map((line) => (
              <DiffLine key={line.id} variant={line.variant}>
                {line.content}
              </DiffLine>
            ))}
          </div>
        </CodeBlock>
      </section>

      <p className="font-mono text-2xs text-text-muted">roast_id: {id}</p>
    </main>
  );
}

export default RoastResultPage;
