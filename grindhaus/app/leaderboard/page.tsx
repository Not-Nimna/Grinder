"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/app-shell";
import { getSupabaseClient } from "@/lib/supabase";

type Period = "week" | "month" | "today";
type SortKey = "points" | "applications" | "interviews" | "rejections";
type ApplicationStatus = "applied" | "rejected" | "interview" | "offer";

type ApplicationRow = {
  id: string;
  user_id: string;
  status: ApplicationStatus;
  applied_at: string;
  profiles?: {
    username?: string;
    avatar_url?: string;
  } | null;
};

type Leader = {
  id: string;
  name: string;
  avatarUrl: string;
  applications: number;
  rejections: number;
  interviews: number;
  points: number;
};

const periods: { label: string; value: Period }[] = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Today", value: "today" },
];

const sortOptions: { label: string; value: SortKey }[] = [
  { label: "Total points", value: "points" },
  { label: "Applications", value: "applications" },
  { label: "Interviews", value: "interviews" },
  { label: "Rejections", value: "rejections" },
];

function getPeriodStart(period: Period) {
  const now = new Date();

  if (period === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  if (period === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return start;
  }

  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getPoints(leader: Pick<Leader, "applications" | "interviews" | "rejections">) {
  return leader.applications * 1 + leader.interviews * 100 + leader.rejections * 10;
}

function aggregateApplications(rows: ApplicationRow[]) {
  const leadersByUser = new Map<string, Leader>();

  rows.forEach((row) => {
    const profile = row.profiles;
    const current =
      leadersByUser.get(row.user_id) ||
      ({
        id: row.user_id,
        name: profile?.username || "Unnamed applicant",
        avatarUrl: profile?.avatar_url || "",
        applications: 0,
        rejections: 0,
        interviews: 0,
        points: 0,
      } satisfies Leader);

    current.applications += 1;

    if (row.status === "rejected") {
      current.rejections += 1;
    }

    if (row.status === "interview" || row.status === "offer") {
      current.interviews += 1;
    }

    current.points = getPoints(current);
    leadersByUser.set(row.user_id, current);
  });

  return Array.from(leadersByUser.values());
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("week");
  const [sortKey, setSortKey] = useState<SortKey>("points");
  const [search, setSearch] = useState("");
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadLeaderboard() {
      setIsLoading(true);
      setError("");

      try {
        const supabase = getSupabaseClient();
        const startDate = getPeriodStart(period).toISOString();
        const { data, error: applicationsError } = await supabase.from("applications").select("id,user_id,status,applied_at,profiles(username,avatar_url)").gte("applied_at", startDate);

        if (!isMounted) {
          return;
        }

        if (applicationsError) {
          setError(applicationsError.message);
          setLeaders([]);
          return;
        }

        setLeaders(aggregateApplications((data || []) as ApplicationRow[]));
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Unable to load leaderboard.");
        setLeaders([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLeaderboard();

    return () => {
      isMounted = false;
    };
  }, [period]);

  const filteredLeaders = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return leaders;
    }

    return leaders.filter((leader) => leader.name.toLowerCase().includes(query));
  }, [leaders, search]);

  const sortedLeaders = useMemo(() => {
    return [...filteredLeaders].sort((first, second) => {
      if (sortKey === "rejections") {
        return first.rejections - second.rejections;
      }

      return second[sortKey] - first[sortKey];
    });
  }, [filteredLeaders, sortKey]);

  const topThree = sortedLeaders.slice(0, 3);

  return (
    <AppShell title="Leaderboard" eyebrow="Rankings" centered>
      <section className="mx-auto max-w-6xl rounded-lg border border-faded-copper-800 bg-vanilla-cream-900 p-6 text-left shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Current leaders</h2>
            <p className="mt-1 text-sm text-ash-brown">Applicants ranked by applications, interviews, rejections, and total points.</p>
          </div>

          <div className="inline-flex w-fit overflow-hidden rounded-lg border border-faded-copper-800 bg-vanilla-cream-800 p-1">
            {periods.map((item) => (
              <button
                key={item.value}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${period === item.value ? "bg-muted-olive-300 text-vanilla-cream-900 shadow-sm" : "text-ash-brown hover:bg-vanilla-cream-900"}`}
                onClick={() => setPeriod(item.value)}
                type="button">
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {error ? <div className="mt-6 rounded-md border border-faded-copper-800 bg-faded-copper-900 p-4 text-sm font-medium text-faded-copper-300">{error}</div> : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {topThree.map((leader, index) => (
            <article key={leader.id} className="overflow-hidden rounded-lg border border-faded-copper-800 bg-vanilla-cream-900 shadow-sm">
              <div className="flex items-center gap-4 p-5">
                <div
                  className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-tea-green-700 text-base font-semibold text-muted-olive-100"
                  style={
                    leader.avatarUrl
                      ? {
                          backgroundImage: `url(${leader.avatarUrl})`,
                          backgroundPosition: "center",
                          backgroundSize: "cover",
                        }
                      : undefined
                  }>
                  {leader.avatarUrl ? <span className="sr-only">{leader.name}</span> : getInitials(leader.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{leader.name}</h3>
                  <p className="mt-1 text-2xl font-semibold">{leader.points.toLocaleString()} pts.</p>
                </div>
                <div className="grid size-10 place-items-center rounded-full bg-muted-olive-700 text-sm font-bold text-muted-olive-100">#{index + 1}</div>
              </div>
              <div className="grid grid-cols-3 border-t border-faded-copper-800 text-center">
                <div className="border-r border-faded-copper-800 p-4">
                  <p className="text-xs font-semibold uppercase text-ash-brown">Applications</p>
                  <p className="mt-1 text-xl font-semibold">{leader.applications}</p>
                </div>
                <div className="border-r border-faded-copper-800 p-4">
                  <p className="text-xs font-semibold uppercase text-ash-brown">Rejections</p>
                  <p className="mt-1 text-xl font-semibold">{leader.rejections}</p>
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase text-ash-brown">Interviews</p>
                  <p className="mt-1 text-xl font-semibold">{leader.interviews}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Global ranking</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex items-center gap-2 text-sm font-medium text-ash-brown">
              Sort by
              <select className="h-10 rounded-md border border-faded-copper-800 bg-vanilla-cream-800 px-3 text-ash-brown-100 outline-none focus:border-muted-olive-300" onChange={(event) => setSortKey(event.target.value as SortKey)} value={sortKey}>
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <input
              className="h-10 rounded-md border border-faded-copper-800 bg-vanilla-cream-800 px-3 text-sm text-ash-brown-100 outline-none placeholder:text-faded-copper-500 focus:border-muted-olive-300"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by user name"
              value={search}
            />
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-faded-copper-800">
          <div className="grid grid-cols-[70px_1.4fr_repeat(4,110px)] bg-vanilla-cream-800 px-4 py-3 text-sm font-semibold text-ash-brown">
            <span>Rank</span>
            <span>User name</span>
            <span>Applications</span>
            <span>Rejections</span>
            <span>Interviews</span>
            <span>Total points</span>
          </div>
          {isLoading ? <div className="px-4 py-8 text-center text-sm font-medium text-ash-brown">Loading leaderboard...</div> : null}
          {!isLoading && sortedLeaders.length === 0 ? <div className="px-4 py-8 text-center text-sm font-medium text-ash-brown">No applications found for this period.</div> : null}
          {sortedLeaders.map((leader, index) => (
            <div key={leader.id} className="grid grid-cols-[70px_1.4fr_repeat(4,110px)] items-center border-t border-faded-copper-800 px-4 py-4 text-sm">
              <span className="font-mono text-faded-copper-400">#{index + 1}</span>
              <span className="flex min-w-0 items-center gap-3 font-semibold">
                <span
                  className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-tea-green-700 text-xs font-semibold text-muted-olive-100"
                  style={
                    leader.avatarUrl
                      ? {
                          backgroundImage: `url(${leader.avatarUrl})`,
                          backgroundPosition: "center",
                          backgroundSize: "cover",
                        }
                      : undefined
                  }>
                  {leader.avatarUrl ? <span className="sr-only">{leader.name}</span> : getInitials(leader.name)}
                </span>
                <span className="truncate">{leader.name}</span>
              </span>
              <span className="font-semibold">{leader.applications}</span>
              <span className="font-semibold">{leader.rejections}</span>
              <span className="font-semibold">{leader.interviews}</span>
              <span className="font-semibold">{leader.points.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
