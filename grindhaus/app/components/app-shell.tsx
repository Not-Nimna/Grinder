"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

const navItems = [
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/application", label: "Applications" },
];

function getInitials(name?: string) {
  if (!name) {
    return "GH";
  }

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AppShell({
  children,
  title,
  eyebrow,
  centered = false,
}: Readonly<{
  children: React.ReactNode;
  title: string;
  eyebrow?: string;
  centered?: boolean;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<{ avatarUrl?: string; name?: string }>({});

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseClient();

    supabase.auth.getUser().then((response: { data: { user: User | null } }) => {
      if (!isMounted) {
        return;
      }

      const user = response.data.user;

      if (!user) {
        router.replace("/signup");
        return;
      }

      const metadata = user?.user_metadata;

      setProfile({
        avatarUrl: metadata?.custom_avatar_url || metadata?.avatar_url || metadata?.picture,
        name: metadata?.custom_display_name || metadata?.display_name || metadata?.full_name || metadata?.name || user?.email,
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      const user = session?.user;

      if (!user) {
        setProfile({});
        router.replace("/signup");
        return;
      }

      const metadata = user?.user_metadata;

      setProfile({
        avatarUrl: metadata?.custom_avatar_url || metadata?.avatar_url || metadata?.picture,
        name: metadata?.custom_display_name || metadata?.display_name || metadata?.full_name || metadata?.name || user?.email,
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const initials = useMemo(() => getInitials(profile.name), [profile.name]);

  return (
    <main className="min-h-screen bg-vanilla-cream-800 text-ash-brown-100">
      <header className="border-b border-ash-brown-400 bg-ash-brown-200 text-vanilla-cream-900">
        <div className="mx-auto grid min-h-20 w-full max-w-7xl grid-cols-1 gap-4 px-6 pb-4 pt-5 sm:grid-cols-[1fr_auto_1fr] sm:items-end lg:px-8 lg:pb-5 lg:pt-7">
          <Link href="/" className="leading-none text-[clamp(1.15rem,1.4vw,1.6rem)] font-semibold sm:justify-self-start">
            Grinder
          </Link>
          <nav className="flex flex-wrap items-end justify-center gap-2 text-[clamp(0.95rem,1vw,1.15rem)] font-medium sm:justify-self-center">
            {navItems.map((item) => {
              const isSelected = pathname === item.href;

              return (
                <Link key={item.href} className={`rounded-md px-3 py-2 leading-none transition lg:px-4 ${isSelected ? "bg-muted-olive-500 text-ash-brown-100 shadow-sm" : "text-vanilla-cream-800 hover:bg-ash-brown-200"}`} href={item.href}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex justify-center sm:justify-self-end">
            <Link
              aria-label="Open profile"
              className={`grid size-10 place-items-center overflow-hidden rounded-full border bg-tea-green-700 text-sm font-semibold text-muted-olive-100 shadow-sm transition hover:border-vanilla-cream-900 lg:size-12 lg:text-base ${
                pathname === "/profile" ? "border-vanilla-cream-900 ring-2 ring-muted-olive-500" : "border-faded-copper-700"
              }`}
              href="/profile"
              style={
                profile.avatarUrl
                  ? {
                      backgroundImage: `url(${profile.avatarUrl})`,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                    }
                  : undefined
              }>
              {profile.avatarUrl ? <span className="sr-only">{profile.name || "Profile"}</span> : initials}
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className={`mb-8 ${centered ? "text-center" : ""}`}>
          {eyebrow ? <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-olive-200">{eyebrow}</p> : null}
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        </div>
        <div className={centered ? "mx-auto w-full" : ""}>{children}</div>
      </section>
    </main>
  );
}
