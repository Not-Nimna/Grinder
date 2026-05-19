import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-8 text-zinc-950">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          Grindhaus
        </Link>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Link className="rounded-md px-3 py-2 hover:bg-white" href="/leaderboard">
            Leaderboard
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-white" href="/application">
            Apply
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-white" href="/profile">
            Profile
          </Link>
          <Link className="rounded-md bg-zinc-950 px-3 py-2 text-white" href="/login">
            Login
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-96px)] w-full max-w-6xl content-center gap-10 py-16 md:grid-cols-[1fr_420px] md:items-center">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-700">
            Member platform
          </p>
          <h1 className="text-5xl font-semibold leading-tight text-zinc-950 sm:text-6xl">
            Track applications, profiles, and leaderboard rank.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
            A simple starting structure for the Grindhaus app with Google login,
            public ranking, member applications, and user profiles.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-md bg-zinc-950 px-5 py-3 text-sm font-semibold text-white" href="/application">
              Start Application
            </Link>
            <Link className="rounded-md border border-zinc-300 px-5 py-3 text-sm font-semibold" href="/leaderboard">
              View Leaderboard
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold">App routes</h2>
          <div className="mt-4 grid gap-3 text-sm">
            {[
              ["/login", "Google login"],
              ["/leaderboard", "Member rankings"],
              ["/application", "Application form"],
              ["/profile", "User profile"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="flex items-center justify-between rounded-md border border-zinc-200 px-4 py-3 hover:border-emerald-500">
                <span>{label}</span>
                <span className="font-mono text-xs text-zinc-500">{href}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
