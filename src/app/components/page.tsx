import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { LeaderboardRow } from "@/components/ui/leaderboard-row";
import { ScoreRing } from "@/components/ui/score-ring";
import { Toggle } from "@/components/ui/toggle";

const buttonVariants = ["primary", "secondary", "ghost"] as const;
const buttonSizes = ["sm", "md", "lg"] as const;

const codeExample = `function roast(code) {
  const score = analyze(code);
  if (score < 3) {
    return "needs_serious_help";
  }
  return "acceptable";
}`;

export default function ComponentsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-[1440px] space-y-[60px] px-20 py-[60px]">
      <h1 className="flex items-center gap-2 font-mono text-2xl font-bold">
        <span className="text-accent-green">{"// "}</span>
        <span className="text-text-primary">component_library</span>
      </h1>

      {/* Button */}
      <section className="space-y-6">
        <h2 className="flex items-center gap-2 font-mono text-sm font-bold">
          <span className="text-accent-green">{"// "}</span>
          <span className="text-text-primary">buttons</span>
        </h2>
        <div className="flex items-center gap-4">
          {buttonVariants.map((variant) =>
            buttonSizes.map((size) => (
              <Button key={`${variant}-${size}`} variant={variant} size={size}>
                $ {variant}_{size}
              </Button>
            )),
          )}
        </div>
      </section>

      {/* Badge */}
      <section className="space-y-6">
        <h2 className="flex items-center gap-2 font-mono text-sm font-bold">
          <span className="text-accent-green">{"// "}</span>
          <span className="text-text-primary">badge_status</span>
        </h2>
        <div className="flex items-center gap-6">
          <Badge variant="good">passing</Badge>
          <Badge variant="warning">slow</Badge>
          <Badge variant="critical">failing</Badge>
        </div>
      </section>

      {/* Toggle */}
      <section className="space-y-6">
        <h2 className="flex items-center gap-2 font-mono text-sm font-bold">
          <span className="text-accent-green">{"// "}</span>
          <span className="text-text-primary">toggle</span>
        </h2>
        <div className="flex items-center gap-8">
          <Toggle label="roast_mode" defaultChecked />
          <Toggle label="dark_mode" />
          <Toggle disabled label="disabled" />
        </div>
      </section>

      {/* Card */}
      <section className="space-y-6">
        <h2 className="flex items-center gap-2 font-mono text-sm font-bold">
          <span className="text-accent-green">{"// "}</span>
          <span className="text-text-primary">cards</span>
        </h2>
        <div className="flex gap-6">
          <Card className="w-[480px]">
            <Badge variant="critical">critical</Badge>
            <CardTitle>using var instead of const/let</CardTitle>
            <CardDescription>
              the var keyword is function-scoped rather than block-scoped, which can lead to
              unexpected behavior and bugs. modern javascript uses const for immutable bindings and
              let for mutable ones.
            </CardDescription>
          </Card>
          <Card className="w-[480px]">
            <Badge variant="warning">warning</Badge>
            <CardTitle>missing error handling in async call</CardTitle>
            <CardDescription>
              the fetch call has no try/catch block or .catch() handler. if the request fails, the
              error will propagate silently and could crash the application or leave it in an
              inconsistent state.
            </CardDescription>
          </Card>
          <Card className="w-[480px]">
            <Badge variant="good">good</Badge>
            <CardTitle>proper use of semantic html elements</CardTitle>
            <CardDescription>
              using semantic elements like section, article, and nav improves accessibility and seo.
              screen readers can navigate the page structure more effectively when proper landmarks
              are in place.
            </CardDescription>
          </Card>
        </div>
      </section>

      {/* CodeBlock */}
      <section className="space-y-6">
        <h2 className="flex items-center gap-2 font-mono text-sm font-bold">
          <span className="text-accent-green">{"// "}</span>
          <span className="text-text-primary">code_block</span>
        </h2>
        <div className="w-[560px]">
          <CodeBlock lang="javascript" filename="roast.js">
            {codeExample}
          </CodeBlock>
        </div>
      </section>

      {/* DiffLine */}
      <section className="space-y-6">
        <h2 className="flex items-center gap-2 font-mono text-sm font-bold">
          <span className="text-accent-green">{"// "}</span>
          <span className="text-text-primary">diff_line</span>
        </h2>
        <div className="w-[560px] overflow-hidden">
          <DiffLine variant="context">{"for (let i = 0; i < items.length; i++) {"}</DiffLine>
          <DiffLine variant="removed">var total = 0;</DiffLine>
          <DiffLine variant="added">const total = 0;</DiffLine>
          <DiffLine variant="context">{"}"}</DiffLine>
        </div>
      </section>
      {/* LeaderboardRow */}
      <section className="space-y-6">
        <h2 className="flex items-center gap-2 font-mono text-sm font-bold">
          <span className="text-accent-green">{"// "}</span>
          <span className="text-text-primary">table_row</span>
        </h2>
        <div>
          <LeaderboardRow
            rank={1}
            score={2.1}
            codePreview="function calculateTotal(items) { var total = 0; ..."
            language="javascript"
          />
          <LeaderboardRow
            rank={2}
            score={4.8}
            codePreview="async function fetchData() { const res = await fetch(url); ..."
            language="typescript"
          />
          <LeaderboardRow
            rank={3}
            score={8.5}
            codePreview="const sum = items.reduce((acc, item) => acc + item.value, 0);"
            language="javascript"
          />
        </div>
      </section>

      {/* ScoreRing */}
      <section className="space-y-6">
        <h2 className="flex items-center gap-2 font-mono text-sm font-bold">
          <span className="text-accent-green">{"// "}</span>
          <span className="text-text-primary">score_ring</span>
        </h2>
        <div className="flex items-center gap-10">
          <ScoreRing score={3.5} />
          <ScoreRing score={7} />
          <ScoreRing score={10} />
        </div>
      </section>
    </main>
  );
}
