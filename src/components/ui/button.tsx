"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// ════════════════════════════════════════════════════════════════
// Button — supports soft (glass, default) and brutal variants
// The brutal variants are used on the dashboard hero.
// Non-hero pages use the glass default for better legibility.
// ════════════════════════════════════════════════════════════════

const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap",
    "transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        // ── Soft glass variants ────────────────────────────────
        default:
          "rounded-lg font-semibold bg-primary/90 text-[hsl(0_0%_8%)] border border-foreground/15 shadow-[0_4px_16px_-6px_hsl(var(--primary)/0.45)] hover:bg-primary hover:-translate-y-px active:translate-y-0",
        outline:
          "rounded-lg font-semibold bg-foreground/[0.06] text-foreground border border-foreground/15 hover:bg-foreground/[0.1] hover:border-foreground/25 hover:-translate-y-px active:translate-y-0",
        secondary:
          "rounded-lg font-semibold bg-secondary/80 text-[hsl(0_0%_8%)] border border-foreground/15 hover:bg-secondary hover:-translate-y-px active:translate-y-0",
        ghost:
          "rounded-lg font-semibold text-foreground/70 hover:text-foreground hover:bg-foreground/[0.08]",
        destructive:
          "rounded-lg font-semibold bg-destructive/90 text-[hsl(0_0%_8%)] border border-foreground/15 shadow-[0_4px_16px_-6px_hsl(var(--destructive)/0.45)] hover:bg-destructive hover:-translate-y-px active:translate-y-0",
        link:
          "font-semibold text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground",

        // ── Brutal variants (opt-in, for dashboard hero) ───────
        brutal:
          "border-[3px] border-border bg-primary text-foreground font-black uppercase tracking-wide shadow-[4px_4px_0_0_hsl(var(--border))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_hsl(var(--border))] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        "brutal-outline":
          "border-[3px] border-border bg-card text-foreground font-black uppercase tracking-wide shadow-[4px_4px_0_0_hsl(var(--border))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_hsl(var(--border))] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
      },
      size: {
        default: "h-9 px-3.5 text-xs",
        xs: "h-6 px-2 text-[10px] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 px-3 text-[11px] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 px-5 text-sm",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
