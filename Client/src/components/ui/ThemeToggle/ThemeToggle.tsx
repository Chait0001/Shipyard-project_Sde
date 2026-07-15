import { useTheme } from '@/context/ThemeContext'
import { Sun, Moon } from 'lucide-react'
import './ThemeToggle.css'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon size={16} className="theme-toggle__icon" />
      ) : (
        <Sun size={16} className="theme-toggle__icon" />
      )}
    </button>
  )
}
export default ThemeToggle
