import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-display font-extrabold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-amarelo text-marinho shadow-lg hover:scale-105 focus-visible:ring-creme focus-visible:ring-offset-marinho",
        outline:
          "border-2 border-creme/40 text-creme hover:border-amarelo hover:text-amarelo focus-visible:ring-amarelo focus-visible:ring-offset-marinho",
        dark: "bg-marinho text-creme hover:scale-105 focus-visible:ring-marinho focus-visible:ring-offset-creme",
        whatsapp:
          "bg-[#25D366] text-white shadow-2xl hover:scale-[1.02] focus-visible:ring-white/80 focus-visible:ring-offset-0",
      },
      size: {
        default: "px-8 py-4 text-lg",
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

type ButtonBaseProps = VariantProps<typeof buttonVariants> & {
  className?: string;
  children?: React.ReactNode;
};

type ButtonAsAnchor = ButtonBaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type ButtonAsButton = ButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

export type ButtonProps = ButtonAsAnchor | ButtonAsButton;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, className }));

  if (props.href !== undefined) {
    const { href, ...anchorProps } =
      props as React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    return <a href={href} className={classes} {...anchorProps} />;
  }

  return (
    <button
      className={classes}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    />
  );
}
