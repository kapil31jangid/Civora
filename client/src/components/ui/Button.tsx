import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'subtle'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm'
}

export const Button = forwardRef<HTMLButtonElement, Props>(({
  className,
  variant = 'primary',
  size = 'default',
  ...props
}, ref) => (
  <button
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-tight transition-all duration-150 active:scale-[0.98] select-none touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:scale-100',
      // Variants
      variant === 'primary' && 'bg-navy-900 text-white shadow-sm hover:bg-navy-800 hover:shadow active:bg-navy-950',
      variant === 'secondary' && 'border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50',
      variant === 'outline' && 'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100/80 hover:text-navy-900',
      variant === 'ghost' && 'text-slate-600 hover:bg-slate-100/90 hover:text-navy-900',
      variant === 'subtle' && 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-navy-900',
      variant === 'danger' && 'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800',
      // Sizes
      size === 'default' && 'min-h-10 px-4 py-2 text-sm',
      size === 'sm' && 'min-h-8 px-3 py-1.5 text-xs rounded-lg',
      size === 'lg' && 'min-h-12 px-5 py-3 text-base rounded-2xl',
      size === 'icon' && 'h-10 w-10 min-w-10 min-h-10 p-0 rounded-xl',
      size === 'icon-sm' && 'h-8 w-8 min-w-8 min-h-8 p-0 rounded-lg',
      className,
    )}
    {...props}
  />
))
Button.displayName = 'Button'
