import Link from 'next/link';
import { ArrowRight, MessageSquare, CheckCircle2, Lightbulb } from 'lucide-react';

import { ArrowRightIcon } from '@heroicons/react/24/outline';
import DateCard from '@/app/components/ui/DateCard';

export default function Page() {
  return (
     <section
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-gray-100 p-6"
      style={{ backgroundImage: "url('/background1.jpg')" }}
    >
      {/**Joemon additon */}
      <div className="flex justify-center mb-2 sm:mb-4 mt-0">
        <DateCard className="mt-0" />
      </div>
      {/* Left text section */}
      <div className="flex flex-col justify-center gap-6 rounded-lg bg-white/70   p-4 sm:px-6 sm:py-6 -full h-screen">
        <p className="text-lg sm:text-xl text-gray-800 md:text-3xl md:leading-normal">
          <strong>Welcome to eDebator.</strong> here we argue for the{' '}
          <a href="https://nextjs.org/learn/" className="text-blue-800" target="_blank" rel="noopener noreferrer">
            Next.js Learn Course,
          </a> where we will argue with evidence
        </p>

        <Link
          href="/signin"
          className="flex items-center gap-4 self-start rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-400 sm:px-6 sm:py-3 sm:gap-5 md:text-base"
        aria-label="Log in to the dashboard">
          <span>Log in</span>
          <ArrowRightIcon className="w-5 md:w-6" />
        </Link>
      </div>


    </section>
  );
}

// date card above div text-lg sm:text-xl justify-start text-white md:text-3xl md:leading-normal

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