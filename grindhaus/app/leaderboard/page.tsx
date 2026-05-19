import { AppShell } from "../components/app-shell";

const members = [
  { rank: 1, name: "Avery Stone", points: 2480, status: "Elite" },
  { rank: 2, name: "Jordan Lee", points: 2315, status: "Rising" },
  { rank: 3, name: "Maya Chen", points: 2190, status: "Active" },
  { rank: 4, name: "Noah Patel", points: 2045, status: "Active" },
];

export default function LeaderboardPage() {
  return (
    <AppShell title="Leaderboard" eyebrow="Rankings">
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="grid grid-cols-[72px_1fr_110px_110px] border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-600">
          <span>Rank</span>
          <span>Member</span>
          <span>Points</span>
          <span>Status</span>
        </div>
        {members.map((member) => (
          <div key={member.rank} className="grid grid-cols-[72px_1fr_110px_110px] items-center border-b border-zinc-100 px-4 py-4 last:border-b-0">
            <span className="font-mono text-sm text-zinc-500">#{member.rank}</span>
            <span className="font-medium">{member.name}</span>
            <span className="font-semibold">{member.points}</span>
            <span className="text-sm text-emerald-700">{member.status}</span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
