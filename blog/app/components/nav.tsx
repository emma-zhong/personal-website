// import Link from 'next/link'

// const navItems = {
//   '/': {
//     name: '–',
//   },
//   '/courses': {
//     name: 'courses',
//   },
//   '/misc': {
//     name: 'misc',
//   }
// }

// export function Navbar() {
//   return (
//     <aside className="-ml-[8px] mb-16 tracking-tight">
//       <div className="lg:sticky lg:top-20">
//         <nav
//           className="flex flex-row items-start relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative"
//           id="nav"
//         >
//           <div className="flex flex-row space-x-0 pr-10">
//             {Object.entries(navItems).map(([path, { name }]) => {
//               return (
//                 <Link
//                   key={path}
//                   href={path}
//                   className="transition-all hover:text-neutral-800 dark:hover:text-neutral-200 flex align-middle relative py-1 px-2 m-1"
//                 >
//                   {name}
//                 </Link>
//               )
//             })}
//           </div>
//         </nav>
//       </div>
//     </aside>
//   )
// }

'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const navItems = {
  '/': { name: '–' },
  '/courses': { name: 'courses' },
  '/misc': { name: 'misc' },
}

const THEME_KEY = 'theme'

export function Navbar() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const nextTheme = stored ?? (prefersDark ? 'dark' : 'light')

    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
    setTheme(nextTheme)
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
    localStorage.setItem(THEME_KEY, nextTheme)
    setTheme(nextTheme)
  }

  return (
    <aside className="-ml-[8px] mb-16 tracking-tight">
      <div className="lg:sticky lg:top-20">
        <nav
          className="flex flex-row items-start justify-between relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative"
          id="nav"
        >
          <div className="flex flex-row space-x-0 pr-10">
            {Object.entries(navItems).map(([path, { name }]) => (
              <Link
                key={path}
                href={path}
                className="transition-all hover:text-neutral-800 dark:hover:text-neutral-200 flex align-middle relative py-1 px-2 m-1"
              >
                {name}
              </Link>
            ))}
          </div>

          <button
            aria-label="Toggle color theme"
            aria-pressed={theme === 'dark'}
            className="transition-all hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center justify-center h-8 w-8 m-1"
            onClick={toggleTheme}
            type="button"
          >
            {theme === 'dark' ? (
              // moon
              <svg
                aria-hidden="true"
                fill="none"
                height="18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
                viewBox="0 0 24 24"
                width="18"
              >
                <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
              </svg>
            ) : (
              // sun
              <svg
                aria-hidden="true"
                fill="none"
                height="18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
                viewBox="0 0 24 24"
                width="18"
              >
                <circle cx="12" cy="12" r="4.5" />
                <path d="M12 2v3M12 19v3M22 12h-3M5 12H2M19.8 4.2l-2.1 2.1M6.3 17.7l-2.1 2.1M19.8 19.8l-2.1-2.1M6.3 6.3L4.2 4.2" />
              </svg>
            )}
          </button>
        </nav>
      </div>
    </aside>
  )
}
