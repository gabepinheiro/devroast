import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const badgeVariants = tv({
  base: "inline-flex items-center gap-2 font-mono text-xs",
  variants: {
    variant: {
      good: "text-accent-green",
      warning: "text-accent-amber",
      critical: "text-accent-red",
    },
  },
  defaultVariants: {
    variant: "good",
  },
});

const badgeDotVariants = tv({
  base: "size-2 shrink-0 rounded-full",
  variants: {
    variant: {
      good: "bg-accent-green",
      warning: "bg-accent-amber",
      critical: "bg-accent-red",
    },
  },
  defaultVariants: {
    variant: "good",
  },
});

type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={badgeVariants({ variant, className })} {...props}>
      <span className={badgeDotVariants({ variant })} />
      {children}
    </span>
  );
}

export { Badge, type BadgeProps, badgeVariants };
