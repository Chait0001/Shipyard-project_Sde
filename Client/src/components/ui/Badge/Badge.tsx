import type { ReactNode } from 'react'
import './Badge.css'

export type BadgeTone =
  'pending' | 'syncing' | 'complete' | 'failed' | 'neutral' | 'active' | 'closed'

interface BadgeProps {
  tone: BadgeTone
  icon?: ReactNode
  children: ReactNode
}

export function Badge({ tone, icon, children }: BadgeProps) {
  return (
    <span className={`badge badge--${tone}`}>
      {icon}
      {children}
    </span>
  )
}
