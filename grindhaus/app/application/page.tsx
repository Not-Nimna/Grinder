import { AppShell } from "../components/app-shell";

export default function ApplicationPage() {
  return (
    <AppShell title="Application" eyebrow="Join Grindhaus">
      <form className="grid max-w-2xl gap-5 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <label className="grid gap-2 text-sm font-medium">
          Full name
          <input className="h-11 rounded-md border border-zinc-300 px-3 font-normal outline-none focus:border-emerald-600" name="name" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Email
          <input className="h-11 rounded-md border border-zinc-300 px-3 font-normal outline-none focus:border-emerald-600" name="email" type="email" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Goal
          <textarea className="min-h-32 rounded-md border border-zinc-300 px-3 py-3 font-normal outline-none focus:border-emerald-600" name="goal" />
        </label>
        <button className="h-11 w-fit rounded-md bg-zinc-950 px-5 text-sm font-semibold text-white" type="submit">
          Submit Application
        </button>
      </form>
    </AppShell>
  );
}
