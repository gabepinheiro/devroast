import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const cardVariants = tv({
  base: "flex flex-col gap-3 border border-border-primary p-5",
});

const cardTitleVariants = tv({
  base: "font-mono text-3.25 text-text-primary",
});

const cardDescriptionVariants = tv({
  base: "text-xs leading-relaxed text-text-secondary",
});

type CardProps = ComponentProps<"div"> & VariantProps<typeof cardVariants>;
type CardTitleProps = ComponentProps<"p">;
type CardDescriptionProps = ComponentProps<"p">;

function Card({ className, ...props }: CardProps) {
  return <div className={cardVariants({ className })} {...props} />;
}

function CardTitle({ className, ...props }: CardTitleProps) {
  return <p className={cardTitleVariants({ className })} {...props} />;
}

function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <p className={cardDescriptionVariants({ className })} {...props} />;
}

export {
  Card,
  CardDescription,
  type CardDescriptionProps,
  type CardProps,
  CardTitle,
  type CardTitleProps,
  cardVariants,
};
