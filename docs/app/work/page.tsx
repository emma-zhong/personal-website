import { GithubActivitySection } from '../misc/github-activity'
import { InstagramUnsaveScript } from './unsave-script'

export default function WorkPage() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">
        work
      </h1>
      <div className="space-y-10">
        <GithubActivitySection />
        <InstagramUnsaveScript />
        <div className="text-sm">
          <a
            href="https://github.com/emma-zhong/pl-ucb-cs194"
            className="font-medium underline decoration-neutral-400 underline-offset-2 transition-all hover:text-neutral-600 dark:decoration-neutral-600 dark:hover:text-neutral-300"
          >
            english-to-code in prairielearn
          </a>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            a prairielearn element that uses an llm to turn english analysis plans into editable sql, pandas, or polars code - conducted a user study comparing the english-to-sql workflow with writing sql directly
          </p>
        </div>
        <div className="text-sm">
          <a
            href="https://github.com/emma-zhong/personal-website"
            className="font-medium underline decoration-neutral-400 underline-offset-2 transition-all hover:text-neutral-600 dark:decoration-neutral-600 dark:hover:text-neutral-300"
          >
            personal website
          </a>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            this site, built with next.js and tailwind css to share my work, courses, and interests
          </p>
        </div>
      </div>
    </section>
  )
}
