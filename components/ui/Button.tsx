'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-[--forge-ember] text-[--forge-white] hover:opacity-80',
      ghost:   'text-[--forge-muted] hover:text-[--forge-white]',
      outline: 'border border-[--forge-border] text-[--forge-muted] hover:border-[--forge-ember] hover:text-[--forge-white]',
      danger:  'border border-[--forge-ember-dim] text-[--forge-ember] hover:bg-[--forge-ember] hover:text-[--forge-white]',
    }

    const sizes = {
      sm: 'text-xs tracking-widest px-4 py-2 font-mono rounded-sm',
      md: 'text-sm tracking-wide px-6 py-3 font-mono rounded-sm',
      lg: 'text-sm tracking-wide px-8 py-3.5 font-body font-medium rounded-sm',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
