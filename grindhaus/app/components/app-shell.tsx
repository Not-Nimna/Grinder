import Link from "next/link";

const navItems = [
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/application", label: "Application" },
  { href: "/profile", label: "Profile" },
];

export function AppShell({
  children,
  title,
  eyebrow,
}: Readonly<{
  children: React.ReactNode;
  title: string;
  eyebrow?: string;
}>) {
  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="text-lg font-semibold">
            Grindhaus
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
            {navItems.map((item) => (
              <Link key={item.href} className="rounded-md px-3 py-2 hover:bg-stone-100" href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link className="rounded-md bg-zinc-950 px-3 py-2 text-white" href="/login">
              Login
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="mb-8">
          {eyebrow ? (
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-700">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        </div>
        {children}
      </section>
    </main>
  );
}
