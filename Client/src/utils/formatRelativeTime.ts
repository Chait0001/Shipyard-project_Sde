export function formatRelativeTime(date?: string | null): string {
  if (!date) return 'never'

  const diffMs = Date.now() - new Date(date).getTime()
  if (diffMs < 0) return 'just now'

  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
