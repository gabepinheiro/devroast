import { Button } from "@/components/ui/button";

const variants = ["primary", "secondary", "ghost"] as const;
const sizes = ["sm", "md", "lg"] as const;

export default function ComponentsPage() {
  return (
    <main className="min-h-screen p-spacing-xl space-y-spacing-xl">
      <h1 className="text-2xl font-bold font-mono text-text-primary">Component Library</h1>

      <section className="space-y-spacing-lg">
        <h2 className="text-lg font-semibold text-text-primary font-mono">
          <span className="text-accent-green">{"// "}</span>Button
        </h2>

        {variants.map((variant) => (
          <div key={variant} className="space-y-spacing-sm">
            <h3 className="text-sm text-text-secondary font-mono capitalize">{variant}</h3>
            <div className="flex items-center gap-spacing-md">
              {sizes.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  $ {variant}_{size}
                </Button>
              ))}
              <Button variant={variant} size="md" disabled>
                $ disabled
              </Button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
