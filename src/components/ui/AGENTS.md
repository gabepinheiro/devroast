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
9. **Classes canônicas do Tailwind** — sempre prefira a forma canônica em vez de valores arbitrários com `[Npx]`. No Tailwind v4, qualquer valor em px pode ser convertido dividindo por 4 (base de spacing). Exemplos:
```
// ERRADO
text-[13px]    leading-[19px]    h-[22px]    p-[3px]    translate-x-[18px]

// CERTO
text-3.25      leading-4.75      h-5.5       p-0.75     translate-x-4.5
```
Use valores arbitrários `[Npx]` **apenas** quando não há equivalente canônico (ex: `rounded-[11px]` para border-radius fora da escala padrão).

## Composition Pattern

Prefira composição (subcomponentes) em vez de props para conteúdo interno. Componentes compostos dão ao consumidor controle total sobre estrutura, ordem e conteúdo sem inflar a API com props opcionais.

### Quando usar composição

- O componente tem **2+ áreas de conteúdo** (header, body, footer, etc.)
- O conteúdo interno é **variável** (pode ser texto, ícone, outro componente, ou nada)
- O consumidor pode querer **reordenar, omitir ou adicionar** elementos internos

### Quando usar props

- O componente tem **comportamento interno** que depende do valor (ex: `score` no ScoreRing calcula o arco SVG)
- O valor é um **dado primitivo** que não faz sentido como children (ex: `rank`, `score`, `language`)

### Composição vs Props

```tsx
// ERRADO — props infladas, componente rígido
<Card
  badge="critical"
  badgeVariant="critical"
  title="using var instead of const"
  description="the var keyword is..."
/>

// CERTO — composição, flexível e extensível
<Card>
  <Badge variant="critical">critical</Badge>
  <CardTitle>using var instead of const</CardTitle>
  <CardDescription>the var keyword is...</CardDescription>
</Card>
```

### Benefícios da composição

1. **Flexibilidade** — o consumidor escolhe o que renderizar, em qual ordem, sem precisar de props como `headerSlot`, `footerSlot`, `icon`, etc.
2. **Extensibilidade** — adicionar conteúdo novo não requer alterar a API do componente.
3. **Tipagem simples** — cada subcomponente tem suas próprias props tipadas via `ComponentProps`, sem tipos union ou condicionais.
4. **Reutilização** — subcomponentes (`CardTitle`, `CardDescription`) podem ser usados fora do `Card` ou em outros contextos.
5. **Leitura** — o JSX declara visualmente a estrutura, sem precisar ler a implementação para entender o que cada prop faz.

### Estrutura de um componente composto

```tsx
// Cada subcomponente é simples e independente
function CardTitle({ className, ...props }: ComponentProps<"p">) {
  return <p className={cardTitleVariants({ className })} {...props} />;
}

// O container define layout, não conteúdo
function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cardVariants({ className })} {...props} />;
}

// Exports nomeados para tudo
export { Card, CardTitle, CardDescription };
```

### Quando props de dados são aceitáveis

Componentes com **lógica interna** que transforma dados em UI podem receber props de dados. Ex:

```tsx
// OK — score é um dado que o componente usa para calcular o arco SVG
<ScoreRing score={3.5} max={10} />

// OK — dados tabulares com layout fixo, sem variação de estrutura
<LeaderboardRow rank={1} score={2.1} codePreview="..." language="javascript" />
```

A regra geral: **se o valor vira `children` direto, use composição. Se o valor passa por lógica/cálculo, use props.**
