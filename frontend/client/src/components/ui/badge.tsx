import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "green" | "cyan" | "amber" | "red" | "muted"
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  green: "bg-field-green/10 text-field-green border-field-green/20",
  cyan: "bg-field-cyan/10 text-field-cyan border-field-cyan/20",
  amber: "bg-field-amber/10 text-field-amber border-field-amber/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  muted: "bg-white/5 text-field-muted border-white/10",
}

export function Badge({ className, variant = "green", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}
