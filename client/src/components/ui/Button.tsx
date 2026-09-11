import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'default' | 'icon' }

export const Button = forwardRef<HTMLButtonElement, Props>(({ className, variant = 'primary', size = 'default', ...props }, ref) => (
  <button ref={ref} className={cn(
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    variant === 'primary' && 'bg-navy-900 px-4 text-white hover:bg-navy-800',
    variant === 'secondary' && 'border border-slate-200 bg-white px-4 text-slate-800 hover:bg-slate-50',
    variant === 'ghost' && 'px-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    variant === 'danger' && 'bg-red-600 px-4 text-white hover:bg-red-700',
    size === 'icon' && 'h-11 w-11 min-w-11 p-0', className,
  )} {...props} />
))
Button.displayName = 'Button'
