import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const buttonVariants = tv({
  base: [
    "inline-flex items-center justify-center font-mono",
    "transition-colors cursor-pointer",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  variants: {
    variant: {
      primary: "bg-accent-green text-bg-page font-medium hover:bg-accent-green/80",
      secondary: "border border-border-primary text-text-primary hover:bg-bg-elevated",
      ghost:
        "border border-border-primary text-text-secondary hover:text-text-primary hover:border-border-focus",
    },
    size: {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-xs",
      lg: "px-6 py-2.5 text-sm",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "lg",
  },
});

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={buttonVariants({ variant, size, className })} {...props} />;
}

export { Button, type ButtonProps, buttonVariants };
