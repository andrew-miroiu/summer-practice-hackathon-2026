import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: React.ReactNode
}

export function Input({ className, label, icon, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-widest text-field-muted">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-field-muted">
            {icon}
          </span>
        )}
        <input
          id={id}
          className={cn(
            "w-full h-11 bg-white/[0.04] border border-white/8 rounded-xl px-4 text-sm text-field-text placeholder:text-field-muted",
            "outline-none focus:border-field-green/50 focus:bg-white/[0.06] transition-all duration-200",
            icon && "pl-10",
            className
          )}
          {...props}
        />
      </div>
    </div>
  )
}
