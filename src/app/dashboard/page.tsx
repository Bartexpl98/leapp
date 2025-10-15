import Image from "next/image";
import Link from "next/link";
import { lusitana } from "@/app/components/ui/fonts";
import { dbConnect } from "@/app/lib/mongoose";
import Entry from "@/app/models/entry";

// Types local to this file so we don't leak Mongoose types to the client
interface EntryData {
  _id: string;
  userId: string;
  title: string;
  description: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

function formatDate(d?: string | Date) {
  if (!d) return "No date";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function DashboardPage() {
  await dbConnect();

  const raw = await Entry.find().sort({ createdAt: -1 }).limit(20).lean();
  const entries: EntryData[] = raw.map((e: any) => ({
    _id: e._id.toString(),
    userId: e.userId,
    title: e.title,
    description: e.description,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }));

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-900 p-4 md:p-8 text-zinc-100">
      {/* Header */}
      <header className="mb-6 md:mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className={`${lusitana.className} text-3xl md:text-5xl text-white`}>Dashboard</h1>
          <p className="mt-1 text-zinc-300">Your workspace for entries, claims, and debates.</p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Link href="/debates/new" className="rounded-xl bg-violet-600/90 px-4 py-2 text-white shadow-lg shadow-violet-600/20 hover:bg-violet-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-500">
            Start a Debate
          </Link>
          <Link href="/entries/new" className="rounded-xl bg-white/10 px-4 py-2 text-zinc-100 ring-1 ring-white/10 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-500">
            New Entry
          </Link>
          <Link href="/explore" className="rounded-xl bg-white/10 px-4 py-2 text-zinc-100 ring-1 ring-white/10 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-500">
            Explore
          </Link>
        </div>
      </header>

      {/* Grid Layout */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Hero / Illustration */}
        <div className="relative md:col-span-7 overflow-hidden rounded-2xl border border-white/10 bg-zinc-800/70">
          <Image
            src="/flower.jpg"
            alt="App illustration"
            width={1400}
            height={600}
            priority
            className="h-56 w-full object-cover md:h-64 opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <h3 className="text-xl font-semibold text-white">Keep discourse focused & sourced</h3>
            <p className="text-sm text-zinc-200/90">Create claims, attach evidence, and move debates forward.</p>
          </div>
        </div>

        {/* Latest Entries */}
        <div className="md:col-span-5 rounded-2xl border border-white/10 bg-zinc-800/70 p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Latest Entries</h3>
            <Link href="/entries" className="text-sm text-violet-300 hover:underline">View all</Link>
          </div>
          {entries.length === 0 ? (
            <EmptyState
              title="No entries yet"
              actionHref="/entries/new"
              actionText="Create your first entry"
              description="Entries are notes, claims, or outlines you can turn into debate points."
            />
          ) : (
            <ul className="divide-y divide-white/5">
              {entries.map((entry) => (
                <li key={entry._id} className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-violet-500" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="truncate text-base font-medium text-white">{entry.title}</h4>
                        <time className="whitespace-nowrap text-xs text-zinc-400">{formatDate(entry.createdAt)}</time>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-300">{entry.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                        <span className="rounded-full bg-zinc-900/50 px-2 py-1 ring-1 ring-white/10">User: {entry.userId}</span>
                        <Link href={`/entries/${entry._id}`} className="rounded-full bg-violet-600/20 px-2 py-1 text-violet-200 ring-1 ring-violet-600/30 hover:bg-violet-600/30">Open</Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right rail: Guidance */}
        <aside className="md:col-span-12 lg:col-span-12 xl:col-span-12 grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="md:col-span-7 rounded-2xl border border-white/10 bg-zinc-800/70 p-5 shadow-xl">
            <h3 className="mb-3 text-lg font-semibold text-white">How to use this space</h3>
            <ol className="list-inside list-decimal space-y-2 text-sm text-zinc-300">
              <li>Create an <span className="font-medium text-zinc-100">Entry</span> for each claim or idea.</li>
              <li>Attach <span className="font-medium text-zinc-100">evidence</span> (links, PDFs, quotes).</li>
              <li>Group entries into a <span className="font-medium text-zinc-100">Debate</span> with pro/con sides.</li>
              <li>Invite reviewers to evaluate credibility and sources.</li>
            </ol>
          </div>

          <div className="md:col-span-5 rounded-2xl border border-violet-500/20 bg-violet-600/10 p-5">
            <h3 className="mb-2 text-lg font-semibold text-violet-200">Next step</h3>
            <p className="text-sm text-violet-100/90">Turn your latest entry into a structured claim and add at least one source.</p>
            <div className="mt-3">
              <Link href="/claims/new" className="rounded-xl bg-violet-600/90 px-4 py-2 text-white shadow shadow-violet-600/30 hover:bg-violet-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-500">Create Claim</Link>
            </div>
          </div>
        </aside>
      </section>


      {/* Recent Activity (lightweight timeline pulled from entries) */}
      <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-800/70 p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <Link href="/activity" className="text-sm text-violet-300 hover:underline">Open activity</Link>
        </div>
        {entries.length === 0 ? (
          <p className="text-sm text-zinc-300">No recent activity.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {entries.slice(0, 6).map((e) => (
              <li key={`activity-${e._id}`} className="rounded-xl border border-white/10 bg-zinc-900/40 p-4">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Entry</span>
                  <time>{formatDate(e.createdAt)}</time>
                </div>
                <h4 className="mt-1 line-clamp-1 font-medium text-white">{e.title}</h4>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-300">{e.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Link href={`/entries/${e._id}`} className="rounded-full bg-violet-600/90 px-3 py-1 text-xs text-white hover:bg-violet-600">View</Link>
                  <Link href={`/claims/new?from=${e._id}`} className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-100 ring-1 ring-white/10 hover:bg-white/10">Make Claim</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

//TODO: Make into components
function Shortcut({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-800/70 px-3 py-2 text-zinc-200 hover:bg-white/10">
        <span>{label}</span>
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </Link>
    </li>
  );
}

/* shortcut examples
<div className="md:col-span-5 rounded-2xl border border-white/10 bg-zinc-800/70 p-5 shadow-xl">
  <h3 className="mb-3 text-lg font-semibold text-white">Shortcuts</h3>
  <ul className="grid gap-2 text-sm">
    <Shortcut href="/debates" label="My Debates" />
    <Shortcut href="/claims" label="My Claims" />
    <Shortcut href="/sources" label="Saved Sources" />
    <Shortcut href="/explore" label="Explore Topics" />
  </ul>
</div>

*/

function EmptyState({ title, description, actionHref, actionText }: { title: string; description?: string; actionHref?: string; actionText?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-zinc-900/40 p-8 text-center">
      <h4 className="text-base font-semibold text-white">{title}</h4>
      {description ? <p className="mt-2 max-w-md text-sm text-zinc-300">{description}</p> : null}
      {actionHref && actionText ? (
        <Link href={actionHref} className="mt-4 rounded-xl bg-violet-600/90 px-4 py-2 text-sm text-white shadow hover:bg-violet-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-500">{actionText}</Link>
      ) : null}
    </div>
  );
}
