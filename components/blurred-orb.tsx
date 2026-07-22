import { cn } from "@/lib/utils";

export function BlurredOrb({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute rounded-full blur-3xl",
        className
      )}
    />
  );
}
