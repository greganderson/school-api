import { useState, useEffect, useRef } from 'react'
import StudentsSection from './components/StudentsSection'
import InstructorsSection from './components/InstructorsSection'
import CoursesSection from './components/CoursesSection'

type Tab = 'students' | 'instructors' | 'courses'

const TABS: { id: Tab; label: string }[] = [
  { id: 'students', label: 'Students' },
  { id: 'instructors', label: 'Instructors' },
  { id: 'courses', label: 'Courses' },
]

type Theme = 'light' | 'dark' | 'system'

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system'
  })
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = window.document.documentElement
    const applyTheme = () => {
      const isDark =
        theme === 'dark' ||
        (theme === 'system' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    applyTheme()
    localStorage.setItem('theme', theme)

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = () => applyTheme()
      mediaQuery.addEventListener('change', listener)
      return () => mediaQuery.removeEventListener('change', listener)
    }
  }, [theme])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentIcon = () => {
    if (theme === 'light') {
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      )
    }
    if (theme === 'dark') {
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )
    }
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    )
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#6b7280] transition-all hover:bg-[#f5f5f5] hover:text-[#111111] dark:border-[#27272a] dark:bg-[#121212] dark:text-[#a1a1aa] dark:hover:bg-[#1c1c1e] dark:hover:text-white"
        aria-label="Select theme"
      >
        {currentIcon()}
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-32 origin-top-right rounded-lg border border-[#e5e7eb] bg-white p-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:border-[#27272a] dark:bg-[#1c1c1e] z-50">
          <button
            onClick={() => { setTheme('light'); setOpen(false); }}
            className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
              theme === 'light'
                ? 'bg-[#f5f5f5] text-[#111111] dark:bg-[#27272a] dark:text-white'
                : 'text-[#6b7280] hover:bg-[#f5f5f5] hover:text-[#111111] dark:text-[#a1a1aa] dark:hover:bg-[#27272a] dark:hover:text-white'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
            Light
          </button>
          <button
            onClick={() => { setTheme('dark'); setOpen(false); }}
            className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-[#f5f5f5] text-[#111111] dark:bg-[#27272a] dark:text-white'
                : 'text-[#6b7280] hover:bg-[#f5f5f5] hover:text-[#111111] dark:text-[#a1a1aa] dark:hover:bg-[#27272a] dark:hover:text-white'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
            Dark
          </button>
          <button
            onClick={() => { setTheme('system'); setOpen(false); }}
            className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
              theme === 'system'
                ? 'bg-[#f5f5f5] text-[#111111] dark:bg-[#27272a] dark:text-white'
                : 'text-[#6b7280] hover:bg-[#f5f5f5] hover:text-[#111111] dark:text-[#a1a1aa] dark:hover:bg-[#27272a] dark:hover:text-white'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="3" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            System
          </button>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState<Tab>('students')

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] dark:border-[#27272a] bg-white/90 dark:bg-[#09090b]/85 backdrop-blur-md transition-colors">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111111] dark:bg-white text-white dark:text-[#111111] transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 5h12M2 8h8M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span
                className="text-[16px] font-semibold text-[#111111] dark:text-white transition-colors"
                style={{ letterSpacing: '-0.3px' }}
              >
                Dixie Tech
              </span>
              <span
                className="rounded-full bg-[#f5f5f5] dark:bg-[#1c1c1e] px-2 py-0.5 text-[11px] font-medium text-[#6b7280] dark:text-[#a1a1aa] border border-[#e5e7eb] dark:border-[#27272a] transition-colors"
              >
                School Admin
              </span>
            </div>

            {/* Nav pill group — Desktop only */}
            <nav
              className="hidden sm:flex items-center gap-1 rounded-full p-1.5 bg-[#f8f9fa] dark:bg-[#1c1c1e] transition-colors"
            >
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`rounded-full px-4 py-1.5 text-[14px] font-medium transition-all ${
                    tab === id
                      ? 'bg-white dark:bg-[#27272a] text-[#111111] dark:text-white shadow-sm'
                      : 'text-[#6b7280] dark:text-[#a1a1aa] hover:text-[#374151] dark:hover:text-white'
                  }`}
                  style={
                    tab === id
                      ? { boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)' }
                      : undefined
                  }
                >
                  {label}
                </button>
              ))}
            </nav>

            {/* Right section — theme selector on desktop, theme selector on mobile */}
            <div className="flex sm:flex items-center justify-end sm:w-[160px]">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-12 pb-24 sm:pb-12">
        {tab === 'students' && <StudentsSection />}
        {tab === 'instructors' && <InstructorsSection />}
        {tab === 'courses' && <CoursesSection />}
      </main>

      {/* Bottom Nav — Mobile only */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 flex h-16 border-t border-[#e5e7eb] dark:border-[#27272a] bg-white/90 dark:bg-[#09090b]/85 backdrop-blur-md px-2 pb-safe sm:hidden transition-colors" 
        style={{ boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}
      >
        {TABS.map(({ id, label }) => {
          const isActive = tab === id
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-center"
            >
              {id === 'students' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive ? 'text-[#111111] dark:text-white' : 'text-[#6b7280] dark:text-[#a1a1aa]'}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              )}
              {id === 'instructors' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive ? 'text-[#111111] dark:text-white' : 'text-[#6b7280] dark:text-[#a1a1aa]'}>
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              )}
              {id === 'courses' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive ? 'text-[#111111] dark:text-white' : 'text-[#6b7280] dark:text-[#a1a1aa]'}>
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M6 6h10" />
                  <path d="M6 10h10" />
                </svg>
              )}
              <span className={`text-[11px] font-medium transition-colors ${isActive ? 'text-[#111111] dark:text-white font-semibold' : 'text-[#6b7280] dark:text-[#a1a1aa]'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <footer
        className="mt-auto mb-16 sm:mb-0 border-t border-transparent dark:border-[#27272a]"
        style={{ backgroundColor: '#101010', padding: '48px 0' }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 5h12M2 8h8M2 11h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-[14px] font-semibold text-white">Dixie Tech</span>
            </div>
            <p className="text-[13px]" style={{ color: '#a1a1aa' }}>
              School Management System
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
