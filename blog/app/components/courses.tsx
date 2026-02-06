type Term = {
  term: string
  courses: string[]
}

const COURSE_TERMS: Term[] = [
  {
    term: "spring 2026",
    courses: [
      "cs 168: introduction to the internet: architecture and protocols",
      "cs 189: introduction to machine learning",
      "data 140: probability for data science",
      "music 141a: philharmonia orchestra",
      "cs 370: adaptive instruction methods in computer science",
      "cs 399: cs 61a ta",
    ],
  },
  {
    term: "fall 2025",
    courses: [
      "cs 70: discrete mathematics and probability theory",
      "data 101: data engineering",
      "eecs 127: optimization models in engineering",
      "music 141a: philharmonia orchestra",
      "cs 197: cs 61a tutor",
    ],
  },
  {
    term: "summer 2025",
    courses: ["cs 61c: great ideals of computer architecture", "cs 197: cs 61a tutor"],
  },
  {
    term: "spring 2025",
    courses: [
      "cs 61b: data structures",
      "data 100: principles and techniques of data science",
      "data 104: human contexts and ethics of data",
      "integbi 35ac: human biological variation",
      "music 141: university symphony orchestra",
      "cs 365: cs 61a academic intern",
      "ugis 192c: supervised research: biological sciences",
    ],
  },
  {
    term: "fall 2024",
    courses: [
      "astron 10: introduction to general astronomy",
      "cs 61a: structure and interpretation of computer programs",
      "data 8: foundations of data science",
      "music 141: university symphony orchestra",
    ],
  },
  {
    term: "transferred courses",
    courses: ["multivariable calculus", "linear algebra and differential equations", "introduction to sociology"],
  },
]

export default function Courses() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Courses</h1>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800" />

        <div className="space-y-8">
          {COURSE_TERMS.map(({ term, courses }) => (
            <div key={term} className="flex items-start">
              <div className="flex flex-col items-center mr-6">
                <div className="w-3 h-3 rounded-full bg-neutral-900 mt-1" />
              </div>

              <div className="flex-1">
                <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                  {term}
                </div>
                <ul className="mt-2 list-disc pl-5 text-neutral-800 dark:text-neutral-200 space-y-1">
                  {courses.map((course) => (
                    <li key={course} className="leading-snug">
                      {course}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
