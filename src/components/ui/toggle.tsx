"use client";

import { Switch } from "@base-ui/react/switch";
import { type ComponentProps, useState } from "react";
import { tv } from "tailwind-variants";

const toggleTrackVariants = tv({
  base: "inline-flex h-5.5 w-10 shrink-0 cursor-pointer items-center rounded-[11px] p-0.75 transition-colors disabled:pointer-events-none disabled:opacity-50",
  variants: {
    checked: {
      true: "bg-accent-green",
      false: "bg-border-primary",
    },
  },
  defaultVariants: {
    checked: false,
  },
});

const toggleThumbVariants = tv({
  base: "size-4 rounded-full transition-transform",
  variants: {
    checked: {
      true: "translate-x-4.5 bg-bg-page",
      false: "translate-x-0 bg-text-secondary",
    },
  },
  defaultVariants: {
    checked: false,
  },
});

const toggleLabelVariants = tv({
  base: "font-mono text-xs",
  variants: {
    checked: {
      true: "text-accent-green",
      false: "text-text-secondary",
    },
  },
  defaultVariants: {
    checked: false,
  },
});

type ToggleProps = Omit<ComponentProps<typeof Switch.Root>, "className"> & {
  label?: string;
  className?: string;
};

function Toggle({
  className,
  label,
  checked,
  defaultChecked,
  onCheckedChange,
  ...props
}: ToggleProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;

  const handleCheckedChange: typeof onCheckedChange = (value, eventDetails) => {
    if (!isControlled) setInternalChecked(value);
    onCheckedChange?.(value, eventDetails);
  };

  return (
    <div className="inline-flex items-center gap-3">
      <Switch.Root
        checked={isChecked}
        onCheckedChange={handleCheckedChange}
        className={toggleTrackVariants({ checked: isChecked, className })}
        {...props}
      >
        <Switch.Thumb className={toggleThumbVariants({ checked: isChecked })} />
      </Switch.Root>
      {label && <span className={toggleLabelVariants({ checked: isChecked })}>{label}</span>}
    </div>
  );
}

export { Toggle, type ToggleProps, toggleTrackVariants };
