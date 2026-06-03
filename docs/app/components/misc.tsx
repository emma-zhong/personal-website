const FAVORITE_FILMS = [
    {
        title: "La La Land",
        year: "2016",
        href: "https://letterboxd.com/film/la-la-land/",
        poster: "/letterboxd-posters/la-la-land.jpg",
    },
    {
        title: "Little Women",
        year: "2019",
        href: "https://letterboxd.com/film/little-women-2019/",
        poster: "/letterboxd-posters/little-women.jpg",
    },
    {
        title: "Set It Up",
        year: "2018",
        href: "https://letterboxd.com/film/set-it-up/",
        poster: "/letterboxd-posters/set-it-up.jpg",
    },
    {
        title: "Top Gun: Maverick",
        year: "2022",
        href: "https://letterboxd.com/film/top-gun-maverick/",
        poster: "/letterboxd-posters/top-gun-maverick.jpg",
    },
]

export default function Misc() {
    return (
        <section>
            <h1 className="font-semibold text-2xl mb-8 tracking-tighter">miscellaneous</h1>
            <div className="space-y-4">
                <div>
                    <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                        letterboxd
                    </h2>
                    <a
                        href="https://letterboxd.com/solidenigma/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-neutral-600 underline decoration-neutral-400 underline-offset-2 transition-all hover:text-neutral-900 dark:text-neutral-400 dark:decoration-neutral-600 dark:hover:text-neutral-100"
                    >
                        @solidenigma
                    </a>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {FAVORITE_FILMS.map((film) => (
                        <a
                            key={film.href}
                            href={film.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block"
                            aria-label={`${film.title} on Letterboxd`}
                        >
                            <div className="aspect-[2/3] overflow-hidden rounded border border-neutral-200 bg-neutral-100 shadow-sm transition-all group-hover:-translate-y-1 group-hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                                <img
                                    src={film.poster}
                                    alt={`${film.title} poster`}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                            <div className="mt-2 text-sm leading-tight text-neutral-900 dark:text-neutral-100">
                                {film.title}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-500">
                                {film.year}
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    )
}
