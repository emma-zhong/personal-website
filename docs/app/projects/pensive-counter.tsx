'use client'

import { useState } from 'react'

export function PensiveSlipDayCounter() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="text-sm">
      <div className="flex items-baseline gap-2">
        <button
          type="button"
          className="font-medium underline decoration-neutral-400 underline-offset-2 transition-all hover:text-neutral-600 dark:decoration-neutral-600 dark:hover:text-neutral-300"
          aria-expanded={isOpen}
          aria-controls="pensive-counter-instructions"
          onClick={() => setIsOpen((open) => !open)}
        >
          pensive slip day counter
        </button>
        <a
          href="/pensive-counter.js"
          download
          className="text-neutral-600 underline decoration-neutral-400 underline-offset-2 transition-all hover:text-neutral-900 dark:text-neutral-400 dark:decoration-neutral-600 dark:hover:text-neutral-100"
        >
          download
        </a>
      </div>
      <p className="mt-1 text-neutral-600 dark:text-neutral-400">
        a browser-console script for exporting pensive submission times and rounded-up slip days as a csv
      </p>

      {isOpen && (
        <div
          id="pensive-counter-instructions"
          className="mt-4 border-l border-neutral-300 pl-4 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
        >
          <ul className="list-disc space-y-2 pl-4">
            <li>download the script above.</li>
            <li>open the pensive course&apos;s main assignments page while logged in.</li>
            <li>open your browser&apos;s developer tools and select the console.</li>
            <li>open the downloaded file, copy all of its contents, and paste them into the console.</li>
            <li>press enter and wait for done; the script prints a table and downloads a csv.</li>
          </ul>
          <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-500">
            last updated: nov 22, 2026
          </p>
        </div>
      )}
    </div>
  )
}
