"use client";

import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase";

export default function LoginPage() {
  async function signInWithGoogle() {
    const supabase = getSupabaseClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/profile`,
      },
    });
  }

  return (
    <main className="grid min-h-screen place-items-center bg-stone-50 px-6 text-zinc-950">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <Link href="/" className="text-lg font-semibold">
          Grindhaus
        </Link>
        <div className="mt-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
            Member access
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Sign in with Google</h1>
          <p className="mt-3 leading-7 text-zinc-600">
            Use your Google account to continue to your Grindhaus profile and
            application dashboard.
          </p>
        </div>

        <button
          type="button"
          onClick={signInWithGoogle}
          className="mt-8 flex h-12 w-full items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold transition hover:bg-stone-100"
        >
          Continue with Google
        </button>
      </section>
    </main>
  );
}
