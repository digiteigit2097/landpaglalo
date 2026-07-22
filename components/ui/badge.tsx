import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full font-display text-xs font-bold uppercase tracking-wide",
  {
    variants: {
      variant: {
        amarelo: "bg-amarelo px-4 py-1.5 text-sm text-marinho",
        tag: "bg-vermelho-texto px-3 py-1 text-creme",
      },
    },
    defaultVariants: {
      variant: "amarelo",
    },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}
