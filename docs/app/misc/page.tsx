import { GithubActivitySection } from './github-activity'
import { LetterboxdSection } from './letterboxd'
import { SpotifySection } from './spotify'

export default function MiscPage() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">
        miscellaneous
      </h1>
      <div className="space-y-10">
        <GithubActivitySection />
        <LetterboxdSection />
        <SpotifySection />
      </div>
    </section>
  )
}
