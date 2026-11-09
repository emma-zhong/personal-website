import { GithubActivitySection } from '../misc/github-activity'

export default function WorkPage() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">
        work
      </h1>
      <div className="space-y-10">
        <GithubActivitySection />
      </div>
    </section>
  )
}
