import Link from 'next/link';
import { ArrowRight, MessageSquare, CheckCircle2, Lightbulb } from 'lucide-react';
import DateCard from './components/ui/DateCard'

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <main className="min-h-screen bg-zinc-800 text-zinc-100">
      {/* Hero */}
      <section className="relative isolate overflow-hidden px-6 pt-24 pb-16 sm:pt-28 sm:pb-24 lg:px-8 bg-zinc-900 border-b border-zinc-700">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-zinc-50">
            Engage in <span className="text-violet-400">Evidence-Based Discourse</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-300">
            Join structured debates built on verified sources and sound reasoning. Strengthen your arguments with evidence, credibility, and collaboration.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-400"
            >
              Start debating
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-600 px-5 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-400"
            >
              Explore topics
            </Link>
          </div>
        </div>
      </section>

    {/**Joemon additon */} <div className="flex justify-center mb-2 sm:mb-4 mt-0"> <DateCard className="mt-0" /> </div>


      {/* Features */}
      <section className="px-6 py-16 lg:px-8 bg-zinc-800">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<MessageSquare className="h-5 w-5 text-violet-400" />}
              title="Structured Discussions"
              desc="placeholder"
            />
            <FeatureCard
              icon={<CheckCircle2 className="h-5 w-5 text-violet-400" />}
              title="Verified Sources"
              desc="placeholder"
            />
            <FeatureCard
              icon={<Lightbulb className="h-5 w-5 text-violet-400" />}
              title="Collaborative Learning"
              desc="placeholder"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 lg:px-8 bg-zinc-900 border-t border-zinc-700">
        <div className="mx-auto max-w-5xl rounded-xl bg-zinc-800 p-8 sm:p-10 text-center shadow-md">
          <h2 className="text-2xl font-semibold sm:text-3xl text-zinc-50">
            Help shape a healthier online discourse
          </h2>
          <p className="mt-3 text-zinc-300">
            Join debates that value accuracy, reasoning, and collaboration. Build arguments that stand on evidence.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500">
              Get started <ArrowRight size={18} />
            </Link>
            <Link href="/about" className="inline-flex items-center gap-2 rounded-lg border border-zinc-600 px-5 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-700">
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-700 bg-zinc-900 px-6 py-10 text-sm text-zinc-400 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <p>© {new Date().getFullYear()} Evidence Discourse. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-zinc-200">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-200">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-md">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-violet-900/30 text-violet-400">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-zinc-50">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-zinc-300">{desc}</p>
    </div>
  );
}