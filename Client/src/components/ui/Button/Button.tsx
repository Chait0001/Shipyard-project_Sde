import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  iconLeft,
  iconRight,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const classNames = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    isLoading ? 'btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classNames} disabled={disabled || isLoading} {...props}>
      {isLoading && <span className="btn__spinner" aria-hidden="true" />}
      {!isLoading && iconLeft && <span className="btn__icon btn__icon--left">{iconLeft}</span>}
      {children && <span className="btn__label">{children}</span>}
      {!isLoading && iconRight && <span className="btn__icon btn__icon--right">{iconRight}</span>}
    </button>
  )
}
