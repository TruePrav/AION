import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// ════════════════════════════════════════════════════════════════
// Badge — soft by default, brutal variants available
// ════════════════════════════════════════════════════════════════

const badgeVariants = cva(
  [
    "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap",
    "transition-colors",
    "[&>svg]:pointer-events-none [&>svg]:size-2.5!",
  ].join(" "),
  {
    variants: {
      variant: {
        // ── Soft glass (default) ───────────────────────────────
        default:
          "h-5 rounded-full px-2 text-[10px] font-semibold tracking-wide bg-primary/20 text-foreground border border-primary/40",
        secondary:
          "h-5 rounded-full px-2 text-[10px] font-semibold tracking-wide bg-secondary/30 text-foreground border border-secondary/50",
        destructive:
          "h-5 rounded-full px-2 text-[10px] font-semibold tracking-wide bg-destructive/20 text-foreground border border-destructive/40",
        outline:
          "h-5 rounded-full px-2 text-[10px] font-semibold tracking-wide bg-white/60 text-foreground/80 border border-foreground/15 backdrop-blur-md",
        ghost:
          "h-5 rounded-full px-2 text-[10px] font-semibold tracking-wide text-foreground/60",
        link:
          "h-5 rounded-full px-2 text-[10px] font-semibold tracking-wide text-foreground underline",

        // ── Brutal (opt-in) ────────────────────────────────────
        brutal:
          "h-5 border-[2px] border-border bg-primary text-primary-foreground px-1.5 py-0 text-[10px] font-black uppercase tracking-wider",
        "brutal-outline":
          "h-5 border-[2px] border-border bg-card text-foreground px-1.5 py-0 text-[10px] font-black uppercase tracking-wider",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
