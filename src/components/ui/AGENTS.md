# UI Components — Padrões de Criação

## Estrutura de um componente

```tsx
import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const fooVariants = tv({
  base: ["...classes base"],
  variants: {
    variant: { ... },
    size: { ... },
  },
  defaultVariants: {
    variant: "...",
    size: "...",
  },
});

type FooProps = ComponentProps<"element"> & VariantProps<typeof fooVariants>;

function Foo({ className, variant, size, ...props }: FooProps) {
  return <element className={fooVariants({ variant, size, className })} {...props} />;
}

export { Foo, type FooProps, fooVariants };
```

## Regras

1. **Named exports apenas** — nunca use `export default`.
2. **Extensão nativa** — sempre estenda `ComponentProps<"element">` do React para herdar atributos HTML nativos.
3. **tailwind-variants para variantes** — use `tv()` para definir variantes. Passe `className` diretamente dentro da chamada `tv()` (`fooVariants({ variant, size, className })`). O `tailwind-variants` faz o merge internamente, **não use `twMerge` separadamente**.
4. **Tokens do design system** — use as classes do Tailwind geradas pelo `@theme` em `globals.css` (ex: `bg-bg-page`, `text-text-primary`, `border-border-primary`, `accent-green`). Nunca hardcode cores hex.
5. **NUNCA use interpolação de string** para unir `className`:
```tsx
// ERRADO
className={`base-classes ${className ?? ""}`}

// CERTO
className={fooVariants({ variant, size, className })}
```
6. **Exporte a função de variantes** — exporte `fooVariants` além do componente para permitir composição externa.
7. **Nomenclatura de arquivos** — kebab-case para arquivos (`button.tsx`, `text-input.tsx`).
8. **Fontes** — use `font-sans` para texto padrão (fonte do sistema) e `font-mono` para texto monospaced (JetBrains Mono). Nunca use classes customizadas como `font-primary` ou `font-secondary`.
