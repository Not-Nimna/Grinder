import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-ash-brown-900 p-3 text-ash-brown-100 sm:p-4">
      <section className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-8xl flex-col overflow-hidden rounded-lg border border-faded-copper-800 bg-vanilla-cream-900 shadow-xl">
        <header className="flex items-center justify-between gap-4 border-b border-faded-copper-800 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3 text-lg font-semibold">
            <span className="grid size-6 grid-cols-2 gap-1">
              <span className="rounded-full bg-muted-olive-300" />
              <span className="rounded-full bg-tea-green-300" />
              <span className="rounded-full bg-ash-brown-100" />
              <span className="rounded-full bg-faded-copper-500" />
            </span>
            Grinder
          </Link>

          <div className="flex items-center gap-2 text-sm font-semibold">
            <Link className="hidden rounded-md px-4 py-2 transition hover:bg-vanilla-cream-800 sm:inline-flex" href="/login">
              Sign in
            </Link>
            <Link className="rounded-md border border-faded-copper-800 bg-vanilla-cream-900 px-4 py-2 transition hover:border-muted-olive-300 hover:bg-vanilla-cream-800" href="/signup">
              Create account
            </Link>
          </div>
        </header>

        <div className="relative grid flex-1 place-items-center overflow-hidden px-5 py-16 sm:px-8 lg:min-h-[720px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(108,88,76,0.16)_1px,transparent_0)] bg-[length:18px_18px]" />
          <div className="absolute left-6 top-10 hidden w-56 rotate-[-5deg] rounded-md border border-faded-copper-800 bg-tea-green-700 p-4 shadow-xl md:block">
            <p className="font-mono text-sm leading-6 text-ash-brown-100">Log each role, save proof, and make the job hunt measurable.</p>
          </div>
          <div className="absolute right-8 top-12 hidden w-48 rotate-[8deg] rounded-lg border border-faded-copper-800 bg-vanilla-cream-900 p-4 shadow-xl lg:block">
            <p className="text-sm font-semibold">Current focus</p>
            <div className="mt-4 space-y-3 text-xs text-ash-brown-500">
              <div className="flex items-center justify-between">
                <span>Applications</span>
                <span className="font-semibold text-muted-olive-200">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Interviews</span>
                <span className="font-semibold text-muted-olive-200">3</span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-8 left-8 hidden w-64 rounded-lg border border-faded-copper-800 bg-vanilla-cream-900 p-4 shadow-xl lg:block">
            <p className="text-sm font-semibold">Recent proof</p>
            <div className="mt-4 space-y-3">
              <div className="h-2 rounded-full bg-muted-olive-500" />
              <div className="h-2 w-4/5 rounded-full bg-tea-green-600" />
              <div className="h-2 w-2/3 rounded-full bg-faded-copper-700" />
            </div>
          </div>
          <div className="absolute bottom-4 right-8 hidden w-72 rotate-[-4deg] overflow-hidden rounded-lg border border-faded-copper-800 bg-vanilla-cream-900 shadow-xl md:block">
            <div className="relative h-44">
              <Image src="/login_image.svg" alt="Grinder app illustration" fill className="object-cover" sizes="288px" />
            </div>
          </div>

          <div className="relative z-10 max-w-4xl text-center">
            <div className="mx-auto mb-8 grid size-16 grid-cols-2 gap-2 rounded-xl border border-faded-copper-800 bg-vanilla-cream-900 p-3 shadow-lg">
              <span className="rounded-full bg-muted-olive-300" />
              <span className="rounded-full bg-tea-green-400" />
              <span className="rounded-full bg-ash-brown-100" />
              <span className="rounded-full bg-faded-copper-500" />
            </div>
            <h1 className="text-[clamp(3rem,7vw,6.75rem)] font-semibold leading-[0.95] tracking-normal">
              Track applications
              <span className="block text-ash-brown-700">and prove progress</span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-ash-brown-500 sm:text-lg">Grinder helps members log job applications, upload proof screenshots, update outcomes, and rank progress from real application activity.</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link className="w-full rounded-md bg-muted-olive-300 px-6 py-3 text-sm font-semibold text-vanilla-cream-900 shadow-sm transition hover:bg-muted-olive-200 sm:w-auto" href="/signup">
                Get started
              </Link>
              <Link className="w-full rounded-md border border-faded-copper-800 bg-vanilla-cream-900 px-6 py-3 text-sm font-semibold transition hover:border-muted-olive-300 hover:bg-vanilla-cream-800 sm:w-auto sm:hidden" href="/login">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
