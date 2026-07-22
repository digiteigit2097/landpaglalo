import * as React from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col rounded-3xl bg-white p-6 shadow-lg ring-1 ring-marinho/10",
        className
      )}
      {...props}
    />
  );
}
