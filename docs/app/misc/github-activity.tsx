const GITHUB_USERNAME = process.env.GITHUB_USERNAME ?? "emma-zhong"
const GITHUB_SEARCH_PAGE_LIMIT = 10
const DAY_MS = 24 * 60 * 60 * 1000
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
const LEVEL_CLASSES = [
    "bg-neutral-100 dark:bg-neutral-900",
    "bg-neutral-300 dark:bg-neutral-700",
    "bg-neutral-500 dark:bg-neutral-500",
    "bg-neutral-700 dark:bg-neutral-300",
    "bg-neutral-950 dark:bg-neutral-50",
]

type GithubCommit = {
    html_url: string
    commit: {
        author?: {
            date?: string
        }
    }
}

type GithubActivityDay = {
    date: Date
    key: string
    count: number
    level: number
}

type GithubActivity = {
    days: GithubActivityDay[]
    monthLabels: {
        week: number
        label: string
    }[]
    totalContributions: number
    activeDays: number
}

type GithubCommitSearchResponse = {
    items: GithubCommit[]
}

type GithubContributionCalendarResponse = {
    data?: {
        user?: {
            contributionsCollection?: {
                contributionCalendar?: {
                    totalContributions: number
                    weeks: {
                        contributionDays: {
                            date: string
                            contributionCount: number
                        }[]
                    }[]
                }
            }
        }
    }
}

function formatDateKey(date: Date) {
    return date.toISOString().slice(0, 10)
}

function getGithubHeaders(): HeadersInit {
    return {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    }
}

function getActivityLevel(count: number) {
    if (count === 0) return 0
    if (count === 1) return 1
    if (count <= 3) return 2
    if (count <= 6) return 3
    return 4
}

function buildGithubActivity(commitsByDate: Map<string, number>): GithubActivity {
    const today = new Date()
    const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
    const yearAgo = new Date(end.getTime() - 364 * DAY_MS)
    const start = new Date(yearAgo)
    start.setUTCDate(start.getUTCDate() - start.getUTCDay())

    const days: GithubActivityDay[] = []

    for (let time = start.getTime(); time <= end.getTime(); time += DAY_MS) {
        const date = new Date(time)
        const key = formatDateKey(date)
        const count = commitsByDate.get(key) ?? 0

        days.push({
            date,
            key,
            count,
            level: getActivityLevel(count),
        })
    }

    const monthLabels: GithubActivity["monthLabels"] = []
    let previousMonth = -1

    for (let week = 0; week < Math.ceil(days.length / 7); week += 1) {
        const firstOfMonth = days
            .slice(week * 7, week * 7 + 7)
            .find((day) => day.date.getUTCDate() <= 7 && day.date.getUTCMonth() !== previousMonth)

        if (firstOfMonth) {
            previousMonth = firstOfMonth.date.getUTCMonth()
            monthLabels.push({
                week: week + 1,
                label: MONTHS[firstOfMonth.date.getUTCMonth()],
            })
        }
    }

    return {
        days,
        monthLabels,
        totalContributions: Array.from(commitsByDate.values()).reduce((total, count) => total + count, 0),
        activeDays: Array.from(commitsByDate.values()).filter(Boolean).length,
    }
}

async function getGithubContributionCalendar(): Promise<GithubActivity | null> {
    if (!process.env.GITHUB_TOKEN) {
        return null
    }

    const today = new Date()
    const until = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
    const from = new Date(until.getTime() - 364 * DAY_MS)
    const query = `
        query GithubContributionCalendar($login: String!, $from: DateTime!, $to: DateTime!) {
            user(login: $login) {
                contributionsCollection(from: $from, to: $to) {
                    contributionCalendar {
                        totalContributions
                        weeks {
                            contributionDays {
                                date
                                contributionCount
                            }
                        }
                    }
                }
            }
        }
    `

    const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
        body: JSON.stringify({
            query,
            variables: {
                login: GITHUB_USERNAME,
                from: from.toISOString(),
                to: until.toISOString(),
            },
        }),
        next: {
            revalidate: 60 * 60 * 12,
        },
    })

    if (!response.ok) {
        return null
    }

    const result = (await response.json()) as GithubContributionCalendarResponse
    const calendar = result.data?.user?.contributionsCollection?.contributionCalendar

    if (!calendar) {
        return null
    }

    const commitsByDate = new Map<string, number>()

    calendar.weeks.forEach((week) => {
        week.contributionDays.forEach((day) => {
            commitsByDate.set(day.date, day.contributionCount)
        })
    })

    return {
        ...buildGithubActivity(commitsByDate),
        totalContributions: calendar.totalContributions,
    }
}

async function getGithubCommitSearchActivity(): Promise<GithubActivity> {
    const commitsByDate = new Map<string, number>()
    const today = new Date()
    const since = new Date(Date.UTC(today.getUTCFullYear() - 1, today.getUTCMonth(), today.getUTCDate()))
    const until = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))

    try {
        for (let page = 1; page <= GITHUB_SEARCH_PAGE_LIMIT; page += 1) {
            const params = new URLSearchParams({
                q: `author:${GITHUB_USERNAME} author-date:${formatDateKey(since)}..${formatDateKey(until)}`,
                sort: "author-date",
                order: "desc",
                per_page: "100",
                page: page.toString(),
            })
            const response = await fetch(`https://api.github.com/search/commits?${params}`, {
                headers: getGithubHeaders(),
                next: {
                    revalidate: 60 * 60 * 12,
                },
            })

            if (!response.ok) {
                break
            }

            const searchResults = (await response.json()) as GithubCommitSearchResponse

            searchResults.items.forEach((commit) => {
                const date = commit.commit.author?.date

                if (!date) {
                    return
                }

                const key = date.slice(0, 10)
                commitsByDate.set(key, (commitsByDate.get(key) ?? 0) + 1)
            })

            if (searchResults.items.length < 100) {
                break
            }
        }
    } catch {
        return buildGithubActivity(commitsByDate)
    }

    return buildGithubActivity(commitsByDate)
}

async function getGithubActivity(): Promise<GithubActivity> {
    try {
        const contributionCalendar = await getGithubContributionCalendar()

        if (contributionCalendar) {
            return contributionCalendar
        }
    } catch {
        return getGithubCommitSearchActivity()
    }

    return getGithubCommitSearchActivity()
}

export async function GithubActivitySection() {
    const githubActivity = await getGithubActivity()
    const activityWeeks = Math.ceil(githubActivity.days.length / 7)

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                    github activity
                </h2>
                <a
                    href={`https://github.com/${GITHUB_USERNAME}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-neutral-600 underline decoration-neutral-400 underline-offset-2 transition-all hover:text-neutral-900 dark:text-neutral-400 dark:decoration-neutral-600 dark:hover:text-neutral-100"
                >
                    {githubActivity.totalContributions > 0
                        ? `${githubActivity.totalContributions} contributions across ${githubActivity.activeDays} days`
                        : `@${GITHUB_USERNAME}`}
                </a>
            </div>

            <div className="pb-2">
                <div
                    className="grid w-full grid-rows-[1.125rem_repeat(7,minmax(0,1fr))] gap-px"
                    style={{
                        gridTemplateColumns: `2rem repeat(${activityWeeks}, minmax(0, 1fr))`,
                    }}
                    aria-label={`${GITHUB_USERNAME} GitHub contribution activity over the past year`}
                >
                    <div />
                    {githubActivity.monthLabels.map((month) => (
                        <div
                            key={`${month.label}-${month.week}`}
                            className="overflow-hidden whitespace-nowrap text-xs leading-3 text-neutral-500"
                            style={{
                                gridColumn: `${month.week + 1} / span 4`,
                            }}
                        >
                            {month.label}
                        </div>
                    ))}

                    {["mon", "wed", "fri"].map((day, index) => (
                        <div
                            key={day}
                            className="h-0 overflow-visible whitespace-nowrap text-[10px] leading-none text-neutral-500 sm:text-xs"
                            style={{
                                gridColumn: 1,
                                gridRow: index * 2 + 3,
                            }}
                        >
                            {day}
                        </div>
                    ))}

                    {githubActivity.days.map((day, index) => {
                        const week = Math.floor(index / 7)
                        const weekday = day.date.getUTCDay()

                        return (
                            <div
                                key={day.key}
                                className={`aspect-square w-full rounded-[2px] ${LEVEL_CLASSES[day.level]}`}
                                style={{
                                    gridColumn: week + 2,
                                    gridRow: weekday + 2,
                                }}
                                title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.key}`}
                                aria-label={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.key}`}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
