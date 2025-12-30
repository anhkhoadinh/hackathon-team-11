import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'primary'
  size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-[10px] font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25C9D0] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 button-ripple",
          {
            'bg-gradient-to-r from-[#25C9D0] to-[#14B8A6] text-white hover:from-[#1BA1A8] hover:to-[#0F9488] shadow-lg hover:shadow-xl hover:shadow-[#25C9D0]/30 hover:-translate-y-0.5': variant === 'default' || variant === 'primary',
            'border-2 border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-900': variant === 'outline',
            'hover:bg-slate-100 text-slate-700': variant === 'ghost',
            'h-10 px-5 py-2 text-sm': size === 'default',
            'h-9 px-4 text-xs': size === 'sm',
            'h-12 px-8 text-base': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

