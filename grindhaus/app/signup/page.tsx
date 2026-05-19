"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  );
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);

  async function signUpWithEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const displayName = String(formData.get("displayName") || "");
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const supabase = getSupabaseClient();

    await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });
  }

  async function signUpWithGoogle() {
    const supabase = getSupabaseClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/profile`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-vanilla-cream-800 px-4 py-8 text-ash-brown-100">
      <section className="mx-auto grid h-auto min-h-[640px] w-full max-w-[calc(100vw-2rem)] gap-8 rounded-lg bg-vanilla-cream-900 p-4 shadow-[0_18px_45px_rgba(35,26,19,0.12)] md:h-[70vh] md:min-h-[560px] md:w-[70vw] md:grid-cols-[0.85fr_1.15fr] md:p-7">
        <div className="relative order-2 hidden h-full min-h-0 overflow-hidden rounded-lg bg-tea-green-700 md:block">
          <div className="animate-signup-image-slide absolute inset-0">
            <Image src="/login_image.svg" alt="Signup illustration" fill priority className="object-cover" sizes="(min-width: 768px) 46vw, 100vw" />
          </div>
        </div>

        <div className="relative order-1 flex min-h-[520px] flex-col items-center justify-center px-4 py-8 md:h-full md:min-h-0 md:px-10">
          <div className="animate-auth-copy-out pointer-events-none absolute inset-x-4 top-1/2 flex -translate-y-1/2 flex-col items-center md:inset-x-10">
            <Link href="/" aria-label="Go to Grindhaus home" className="grid size-11 grid-cols-2 gap-1 rounded-full">
              <span className="rounded-full border-4 border-muted-olive-300" />
              <span className="rounded-full border-4 border-muted-olive-300" />
              <span className="rounded-full border-4 border-muted-olive-300" />
              <span className="rounded-full border-4 border-muted-olive-300" />
            </Link>
            <h1 className="mt-7 text-center text-4xl font-semibold tracking-tight">Welcome back</h1>
            <p className="mt-3 text-center text-sm text-ash-brown">
              Don&apos;t have an account? <span className="font-semibold text-muted-olive-200">Sign up for free</span>
            </p>
            <div className="mt-8 grid w-full max-w-xs gap-3">
              <div className="h-12 rounded-full border border-faded-copper-800 bg-vanilla-cream-800 px-7 py-3 text-sm font-medium text-ash-brown shadow-inner">Email</div>
              <div className="h-12 rounded-full border border-faded-copper-800 bg-vanilla-cream-800 px-7 py-3 text-sm font-medium text-faded-copper-500 shadow-inner">Password</div>
            </div>
          </div>

          <div className="animate-auth-form-in flex w-full max-w-xs flex-col items-center">
            <Link href="/" aria-label="Go to Grindhaus home" className="grid size-11 grid-cols-2 gap-1 rounded-full">
              <span className="rounded-full border-4 border-muted-olive-300" />
              <span className="rounded-full border-4 border-muted-olive-300" />
              <span className="rounded-full border-4 border-muted-olive-300" />
              <span className="rounded-full border-4 border-muted-olive-300" />
            </Link>

            <div className="mt-7 w-full text-center">
              <h1 className="text-4xl font-semibold tracking-tight">Create account</h1>
              <p className="mt-3 text-sm text-ash-brown">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-muted-olive-200">
                  Log in
                </Link>
              </p>
            </div>

            <form className="mt-8 grid w-full gap-3" onSubmit={signUpWithEmail}>
              <label className="sr-only" htmlFor="displayName">
                Display name
              </label>
              <input id="displayName" name="displayName" type="text" className="h-12 rounded-full border border-faded-copper-800 bg-vanilla-cream-800 px-7 text-sm font-medium text-ash-brown shadow-inner outline-none placeholder:text-faded-copper-500 focus:border-muted-olive-300" placeholder="Display name" />

              <label className="sr-only" htmlFor="email">
                Email
              </label>
              <input id="email" name="email" type="email" className="h-12 rounded-full border border-faded-copper-800 bg-vanilla-cream-800 px-7 text-sm font-medium text-ash-brown shadow-inner outline-none placeholder:text-faded-copper-500 focus:border-muted-olive-300" placeholder="Email" />

              <label className="sr-only" htmlFor="password">
                Password
              </label>
              <div className="flex h-12 items-center rounded-full border border-faded-copper-800 bg-vanilla-cream-800 px-7 shadow-inner focus-within:border-muted-olive">
                <input id="password" name="password" type={showPassword ? "text" : "password"} className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ash-brown outline-none placeholder:text-faded-copper-500" placeholder="Password" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="ml-3 text-xs font-semibold text-faded-copper-400 hover:text-ash-brown-100" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button type="submit" className="mt-1 h-12 rounded-full bg-muted-olive-300 px-6 text-sm font-semibold text-vanilla-cream-900 shadow-sm transition hover:bg-muted-olive-200">
                Sign up
              </button>

              <button type="button" onClick={signUpWithGoogle} className="flex h-12 items-center justify-center gap-3 rounded-full border border-faded-copper-800 bg-vanilla-cream-900 px-6 text-sm font-semibold text-ash-brown transition hover:bg-vanilla-cream-800">
                <GoogleMark />
                Sign up with Google
              </button>
            </form>
          </div>

          <p className="absolute bottom-6 left-1/2 w-full -translate-x-1/2 px-4 text-center text-[11px] text-faded-copper-400">
            By creating an account, you agree to our{" "}
            <Link href="/" className="underline underline-offset-2">
              terms of use
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
