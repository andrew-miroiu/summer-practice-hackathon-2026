import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-body font-semibold transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none select-none cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-field-green text-field-base hover:bg-[#33ffaa] shadow-[0_0_20px_rgba(0,230,118,0.3)] hover:shadow-[0_0_30px_rgba(0,230,118,0.45)]",
        outline:
          "border border-white/10 text-field-text hover:bg-white/5 hover:border-white/20",
        ghost:
          "text-field-muted hover:text-field-text hover:bg-white/5",
        danger:
          "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
        cyan:
          "bg-field-cyan/10 text-field-cyan border border-field-cyan/20 hover:bg-field-cyan/20",
        amber:
          "bg-field-amber/10 text-field-amber border border-field-amber/20 hover:bg-field-amber/20",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-lg",
        default: "h-10 px-5 text-sm rounded-xl",
        lg: "h-12 px-6 text-base rounded-xl",
        xl: "h-14 px-8 text-base rounded-2xl",
        icon: "h-10 w-10 rounded-xl",
        "icon-sm": "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
}
