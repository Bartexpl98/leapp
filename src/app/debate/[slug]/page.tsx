import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/app/lib/mongoose";
import Debate from "@/app/models/debate";
import Argument from "@/app/models/argument";
import { lusitana } from "@/app/components/ui/fonts";
import ArgumentCard, { Post } from "@/app/components/ui/ArgumentCard";

export const dynamic = "force-dynamic"; // fetch at runtime. this way we avoid build-time DB connect errors

type PageProps = {
  params: { slug: string };
  searchParams: { proPage?: string; conPage?: string; page?: string };
};

const PAGE_SIZE = 10;

export default async function DebateBySlugPage({ params, searchParams }: PageProps) {
  const { slug } = params;
  const proPage = Math.max(1, parseInt(searchParams.proPage || searchParams.page || "1", 10));
  const conPage = Math.max(1, parseInt(searchParams.conPage || searchParams.page || "1", 10));

  await dbConnect();

  const debate = await Debate.findOne({ slug }).lean<{
    _id: any;
    question: string;
    slug: string;
    argsCountPro?: number;
    argsCountCon?: number;
  } | null>();

  if (!debate) return notFound();

  const debateId = debate._id;

  

  const [proArgs, conArgs, proTotal, conTotal] = await Promise.all([
    Argument.find({ debateId, side: "affirmative", depth: 0 })
      .sort({ score: -1, createdAt: -1 })
      .skip((proPage - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean<{
        _id: any;
        title?: string;
        body: string;
        summary?: string;
        authorId?: any;
        createdAt?: Date;
      }[]>(),

    Argument.find({ debateId, side: "opposing", depth: 0 })
      .sort({ score: -1, createdAt: -1 })
      .skip((conPage - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean<{
        _id: any;
        title?: string;
        body: string;
        summary?: string;
        authorId?: any;
        createdAt?: Date;
      }[]>(),

    Argument.countDocuments({ debateId, side: "affirmative", depth: 0 }),
    Argument.countDocuments({ debateId, side: "opposing", depth: 0 }),
  ]);

  


  const toPost = (a: any): Post => ({
    id: String(a._id),
    title: a.title || a.summary || (a.body?.slice(0, 80) + "…"),
    summary: a.summary || a.body?.slice(0, 200),
    author: a.authorId ? String(a.authorId) : "Anonymous",
    createdAt: a.createdAt ? a.createdAt.toISOString() : new Date().toISOString(),
  });

  const affirmatives: Post[] = proArgs.map(toPost);
  const opposing: Post[] = conArgs.map(toPost);

  const basePath = `/debate/${debate.slug}`;
  const proPages = Math.max(1, Math.ceil(proTotal / PAGE_SIZE));
  const conPages = Math.max(1, Math.ceil(conTotal / PAGE_SIZE));

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-900 text-zinc-100">
      {/* Debate Question bar */}
      <section className="border-b border-white/10 bg-zinc-900/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-5">
          <h1 className={`${lusitana.className} text-xl md:text-2xl text-white`}>{debate.question}</h1>
        </div>
      </section>

      {/* Two-column layout */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-6 grid grid-cols-12 gap-6">
        {/* Affirmative */}
        <section className="col-span-12 md:col-span-6 space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Affirmative</h2>
              <div className="flex items-center gap-3">
                <Link href={`${basePath}/new-argument?side=affirmative`}
                      className="text-sm rounded-xl bg-violet-600/90 px-3 py-2 text-white hover:bg-violet-600">
                  Add argument
                </Link>
                <Link href={`${basePath}/affirmative`} className="text-sm text-violet-300 hover:underline">
                  View all
                </Link>
              </div>
          </header>

          {affirmatives.length === 0 ? (
            <EmptySide label="No arguments yet on this side" />
          ) : (
            affirmatives.map((p) => (
              <ArgumentCard
                key={p.id}
                post={p}
                openHref={`${basePath}/argument/${p.id}?side=affirmative`}
                evidenceHref={`${basePath}/evidence/${p.id}?side=affirmative`}
                rebuttalsHref={`${basePath}/rebuttals/${p.id}?side=affirmative`}
              />
            ))
          )}

          <SidePager
            basePath={basePath}
            side="pro"
            current={proPage}
            totalPages={proPages}
            otherSidePage={conPage}
          />
        </section>

        {/* Opposing */}
        <section className="col-span-12 md:col-span-6 space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Opposing</h2>
              <div className="flex items-center gap-3">
                <Link href={`${basePath}/new-argument?side=affirmative`}
                      className="text-sm rounded-xl bg-violet-600/90 px-3 py-2 text-white hover:bg-violet-600">
                  Add argument
                </Link>
                <Link href={`${basePath}/affirmative`} className="text-sm text-violet-300 hover:underline">
                  View all
                </Link>
              </div>
          </header>

          {opposing.length === 0 ? (
            <EmptySide label="No arguments yet on this side" />
          ) : (
            opposing.map((p) => (
              <ArgumentCard
                key={p.id}
                post={p}
                openHref={`${basePath}/argument/${p.id}?side=opposing`}
                evidenceHref={`${basePath}/evidence/${p.id}?side=opposing`}
                rebuttalsHref={`${basePath}/rebuttals/${p.id}?side=opposing`}
              />
            ))
          )}

          <SidePager
            basePath={basePath}
            side="con"
            current={conPage}
            totalPages={conPages}
            otherSidePage={proPage}
          />
        </section>
      </div>
    </div>
  );
}

//export metadate? 

//helpers. need refactor

function EmptySide({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-800/30 p-6 text-sm text-zinc-300">
      {label}
    </div>
  );
}

function SidePager({
  basePath,
  side, 
  current,
  totalPages,
  otherSidePage,
}: {
  basePath: string;
  side: "pro" | "con";
  current: number;
  totalPages: number;
  otherSidePage: number;
}) {
  if (totalPages <= 1) return null;
  const paramName = side === "pro" ? "proPage" : "conPage";
  const otherName = side === "pro" ? "conPage" : "proPage";
  const prev = Math.max(1, current - 1);
  const next = Math.min(totalPages, current + 1);

  return (
    <nav className="mt-2 flex items-center justify-between text-xs text-zinc-300">
      <Link
        aria-disabled={current <= 1}
        className={`rounded-xl px-3 py-1 ring-1 ${
          current <= 1 ? "pointer-events-none ring-white/5 text-zinc-500" : "ring-white/10 hover:bg-white/10"
        }`}
        href={`${basePath}?${new URLSearchParams({
          [paramName]: String(prev),
          [otherName]: String(otherSidePage),
        }).toString()}`}
      >
        Prev
      </Link>
      <span>
        Page {current} / {totalPages}
      </span>
      <Link
        aria-disabled={current >= totalPages}
        className={`rounded-xl px-3 py-1 ring-1 ${
          current >= totalPages ? "pointer-events-none ring-white/5 text-zinc-500" : "ring-white/10 hover:bg-white/10"
        }`}
        href={`${basePath}?${new URLSearchParams({
          [paramName]: String(next),
          [otherName]: String(otherSidePage),
        }).toString()}`}
      >
        Next
      </Link>
    </nav>
  );
}
