'use client'

import { useState } from 'react'

export function InstagramUnsaveScript() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="text-sm">
      <div className="flex items-baseline gap-2">
        <button
          type="button"
          className="font-medium underline decoration-neutral-400 underline-offset-2 transition-all hover:text-neutral-600 dark:decoration-neutral-600 dark:hover:text-neutral-300"
          aria-expanded={isOpen}
          aria-controls="instagram-unsave-instructions"
          onClick={() => setIsOpen((open) => !open)}
        >
          instagram unsave script
        </button>
        <a
          href="/unsave-script.js"
          download
          className="text-neutral-600 underline decoration-neutral-400 underline-offset-2 transition-all hover:text-neutral-900 dark:text-neutral-400 dark:decoration-neutral-600 dark:hover:text-neutral-100"
        >
          download
        </a>
      </div>
      <p className="mt-1 text-neutral-600 dark:text-neutral-400">
        a browser-console script that completely unsaves every post in an instagram collection
      </p>

      {isOpen && (
        <div
          id="instagram-unsave-instructions"
          className="mt-4 border-l border-neutral-300 pl-4 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
        >
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            used muse to automatically sort all my saved posts into collections, and then i wanted to delete all of the posts in sepcific collections at once.
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-4">
            <li>download the script above.</li>
            <li>open instagram in your computer browser and open the collection you want to completely delete.</li>
            <li>open your browser&apos;s developer tools and select the console.</li>
            <li>open the downloaded file, copy all of its contents, and paste them into the console.</li>
            <li>press enter, then type <code>UNSAVE ALL</code> when prompted.</li>
            <li>press escape at any time to stop after the current action.</li>
          </ul>
          <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-500">
            last updated: nov 8, 2026
          </p>
        </div>
      )}
    </div>
  )
}
