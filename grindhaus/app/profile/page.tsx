import { AppShell } from "../components/app-shell";

export default function ProfilePage() {
  return (
    <AppShell title="Profile" eyebrow="Member account">
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <aside className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="grid size-20 place-items-center rounded-full bg-emerald-100 text-2xl font-semibold text-emerald-800">
            GH
          </div>
          <h2 className="mt-4 text-xl font-semibold">Guest Member</h2>
          <p className="mt-1 text-sm text-zinc-600">Sign in to load your profile.</p>
        </aside>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Profile details</h2>
          <dl className="mt-5 grid gap-4 text-sm">
            <div className="grid gap-1">
              <dt className="font-medium text-zinc-500">Application status</dt>
              <dd className="font-semibold">Not submitted</dd>
            </div>
            <div className="grid gap-1">
              <dt className="font-medium text-zinc-500">Leaderboard points</dt>
              <dd className="font-semibold">0</dd>
            </div>
            <div className="grid gap-1">
              <dt className="font-medium text-zinc-500">Membership tier</dt>
              <dd className="font-semibold">Pending</dd>
            </div>
          </dl>
        </section>
      </div>
    </AppShell>
  );
}
