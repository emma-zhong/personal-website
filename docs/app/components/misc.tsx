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

type SpotifyArtist = {
    name: string
    href: string
    image: string
}

async function getSpotifyTopArtists(): Promise<SpotifyArtist[]> {
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

    if (!clientId || !clientSecret || !refreshToken) {
        return []
    }

    try {
        const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            }),
            cache: "no-store",
        })

        if (!tokenResponse.ok) {
            return []
        }

        const tokenData = await tokenResponse.json()
        const artistsResponse = await fetch(
            "https://api.spotify.com/v1/me/top/artists?limit=4&time_range=short_term",
            {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                },
                next: {
                    revalidate: 60 * 60 * 12,
                },
            }
        )

        if (!artistsResponse.ok) {
            return []
        }

        const artistsData = await artistsResponse.json()

        return artistsData.items.map((artist) => ({
            name: artist.name,
            href: artist.external_urls.spotify,
            image: artist.images[0]?.url ?? "",
        }))
    } catch {
        return []
    }
}

export default async function Misc() {
    const topArtists = await getSpotifyTopArtists()

    return (
        <section>
            <h1 className="font-semibold text-2xl mb-8 tracking-tighter">miscellaneous</h1>
            <div className="space-y-10">
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

                <div className="space-y-4">
                    <div>
                        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                            spotify
                        </h2>
                        <a
                            href="https://open.spotify.com/user/yxdlsrj5m4asp0s9ka9p7l8s8?si=0f60f8d627724eda"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-neutral-600 underline decoration-neutral-400 underline-offset-2 transition-all hover:text-neutral-900 dark:text-neutral-400 dark:decoration-neutral-600 dark:hover:text-neutral-100"
                        >
                            my top artists this month
                        </a>
                    </div>

                    {topArtists.length > 0 && (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {topArtists.map((artist) => (
                                <a
                                    key={artist.href}
                                    href={artist.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group block"
                                    aria-label={`${artist.name} on Spotify`}
                                >
                                    <div className="aspect-[2/3] overflow-hidden rounded border border-neutral-200 bg-neutral-100 shadow-sm transition-all group-hover:-translate-y-1 group-hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                                        {artist.image && (
                                            <img
                                                src={artist.image}
                                                alt={`${artist.name} artist photo`}
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                            />
                                        )}
                                    </div>
                                    <div className="mt-2 text-sm leading-tight text-neutral-900 dark:text-neutral-100">
                                        {artist.name}
                                    </div>
                                    <div className="text-xs text-neutral-500 dark:text-neutral-500">
                                        last 4 weeks
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
