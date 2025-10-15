// app/debate/layout.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { lusitana } from "@/app/components/ui/fonts";

export const metadata: Metadata = {
  title: "Debate | Discourse",
  description: "Structured debates with arguments, evidence, and rebuttals.",
};

export default function DebateLayout({ children }: { children: React.ReactNode }) {
  // If you want to fetch dynamic topics here, you can make this an async component
  // and load from DB. For now, a small static list:
  const topics = ["All Topics", "Tech & Society", "Education", "Health", "Policy"];

  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-900 text-zinc-100">

        {/* Page shell with sidebar */}
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-6 grid grid-cols-12 gap-6">
          {/* LEFT: Sidebar — Debate Topics */}
          <aside className="col-span-12 md:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-zinc-800/70 p-4">
              <h2 className="mb-3 text-sm font-semibold text-zinc-300">Debate Topics</h2>
              <ul className="space-y-1 text-sm">
                {topics.map((t) => (
                  <li key={t}>
                    <Link
                      href={`/topics?filter=${encodeURIComponent(t)}`}
                      className="block rounded-xl px-3 py-2 text-zinc-200 hover:bg-white/10"
                    >
                      {t}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <Link
                  href="/topics"
                  className="inline-block rounded-xl bg-violet-600/90 px-3 py-2 text-xs text-white hover:bg-violet-600"
                >
                  Explore topics
                </Link>
              </div>
            </div>
          </aside>

          {/* MAIN: debate content from nested pages */}
          <main className="col-span-12 md:col-span-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
