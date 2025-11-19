import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/app/lib/mongoose";
import Debate from "@/app/models/debate";
import Argument from "@/app/models/argument";
import { lusitana } from "@/app/components/ui/fonts";
import ArgumentCard, { Post } from "@/app/components/ui/ArgumentCard";
import type { Types } from "mongoose";

export const dynamic = "force-dynamic"; // fetch at runtime to avoid build-time DB connect errors

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ proPage?: string; conPage?: string; page?: string; neutralPage?: string }>;
};

const PAGE_SIZE = 10;

type DebateLean = {
  _id: Types.ObjectId;
  question: string;
  slug: string;
  argsCountPro?: number;
  argsCountCon?: number;
};

type ArgLean = {
  _id: Types.ObjectId;
  title?: string;
  body: string;
  summary?: string;
  authorId?: Types.ObjectId | string;
  createdAt?: Date | string;
};

export default async function DebateBySlugPage({ params, searchParams }: PageProps) {
  const p = await params;
  const sp = await searchParams;

  const { slug } = p;
  
  const proPage = Math.max(1, parseInt(sp.proPage || sp.page || "1", 10));
  const conPage = Math.max(1, parseInt(sp.conPage || sp.page || "1", 10));
  const neutralPage = Math.max(1, parseInt(sp.neutralPage || sp.page || "1", 10));

  await dbConnect();

  const debate = await Debate.findOne({ slug }).lean<DebateLean | null>();
  if (!debate) return notFound();

  const debateId = debate._id;

  const [proArgs, conArgs, neutralArgs, proTotal, conTotal, neutralTotal] = await Promise.all([
    Argument.find({ debateId, side: "affirmative", depth: 0 })
      .sort({ score: -1, createdAt: -1 })
      .skip((proPage - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean<ArgLean[]>(),

    Argument.find({ debateId, side: "opposing", depth: 0 })
      .sort({ score: -1, createdAt: -1 })
      .skip((conPage - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean<ArgLean[]>(),

    Argument.find({ debateId, side: "neutral", depth: 0 })
      .sort({ score: -1, createdAt: -1 })
      .skip((neutralPage - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean<ArgLean[]>(),

    Argument.countDocuments({ debateId, side: "affirmative", depth: 0 }),
    Argument.countDocuments({ debateId, side: "opposing", depth: 0 }),
    Argument.countDocuments({ debateId, side: "neutral", depth: 0 }),
  ]);

  const toPost = (a: ArgLean): Post => {
    const createdIso = a.createdAt
      ? a.createdAt instanceof Date
        ? a.createdAt.toISOString()
        : new Date(a.createdAt).toISOString()
      : new Date().toISOString();

    return {
      id: String(a._id),
      title: a.title || a.summary || (a.body?.slice(0, 80) + "…"),
      summary: a.summary || a.body?.slice(0, 200),
      author: a.authorId ? String(a.authorId) : "Anonymous",
      createdAt: createdIso,
    };
  };

  const affirmatives: Post[] = proArgs.map(toPost);
  const opposing: Post[] = conArgs.map(toPost);
  const neutrals: Post[] = neutralArgs.map(toPost);

  const basePath = `/debate/${debate.slug}`;
  const proPages = Math.max(1, Math.ceil(proTotal / PAGE_SIZE));
  const conPages = Math.max(1, Math.ceil(conTotal / PAGE_SIZE));
  const neutralPages = Math.max(1, Math.ceil(neutralTotal / PAGE_SIZE));

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-900 text-zinc-100">
      {/* Debate Question bar */}
      <section className="border-b border-white/10 bg-zinc-900/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-5">
          <h1 className={`${lusitana.className} text-xl md:text-2xl text-white`}>
            {debate.question}
          </h1>
        </div>
      </section>

      {/* Three-column layout */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-6 grid grid-cols-12 gap-6">
        {/* Affirmative */}
        <section className="col-span-12 md:col-span-4 space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Affirmative</h2>
            <div className="flex items-center gap-3">
              <Link
                href={`${basePath}/new-argument?side=affirmative`}
                className="text-sm rounded-xl bg-violet-600/90 px-3 py-2 text-white hover:bg-violet-600"
              >
                Add argument
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
                openHref={`${basePath}/argument/${p.id}`} // 🔹 thread page
              />
            ))
          )}

          <SidePager
            basePath={basePath}
            side="pro"
            current={proPage}
            totalPages={proPages}
            proPage={proPage}
            conPage={conPage}
            neutralPage={neutralPage}
          />
        </section>

        {/* Neutral */}
        <section className="col-span-12 md:col-span-4 space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Neutral / Context</h2>
            <div className="flex items-center gap-3">
              <Link
                href={`${basePath}/new-argument?side=neutral`}
                className="text-sm rounded-xl bg-violet-600/90 px-3 py-2 text-white hover:bg-violet-600"
              >
                Add argument
              </Link>
            </div>
          </header>

          {neutrals.length === 0 ? (
            <EmptySide label="No neutral/contextual arguments yet" />
          ) : (
            neutrals.map((p) => (
              <ArgumentCard
                key={p.id}
                post={p}
                openHref={`${basePath}/argument/${p.id}`}
              />
            ))
          )}

          <SidePager
            basePath={basePath}
            side="neutral"
            current={neutralPage}
            totalPages={neutralPages}
            proPage={proPage}
            conPage={conPage}
            neutralPage={neutralPage}
          />
        </section>

        {/* Opposing */}
        <section className="col-span-12 md:col-span-4 space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Opposing</h2>
            <div className="flex items-center gap-3">
              <Link
                href={`${basePath}/new-argument?side=opposing`}
                className="text-sm rounded-xl bg-violet-600/90 px-3 py-2 text-white hover:bg-violet-600"
              >
                Add argument
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
                openHref={`${basePath}/argument/${p.id}`}
              />
            ))
          )}

          <SidePager
            basePath={basePath}
            side="con"
            current={conPage}
            totalPages={conPages}
            proPage={proPage}
            conPage={conPage}
            neutralPage={neutralPage}
          />
        </section>
      </div>
    </div>
  );
}

// helpers

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
  proPage,
  conPage,
  neutralPage,
}: {
  basePath: string;
  side: "pro" | "con" | "neutral";
  current: number;
  totalPages: number;
  proPage: number;
  conPage: number;
  neutralPage: number;
}) {
  if (totalPages <= 1) return null;

  const prev = Math.max(1, current - 1);
  const next = Math.min(totalPages, current + 1);

  const makeHref = (target: number) => {
    const params = new URLSearchParams({
      proPage: String(proPage),
      conPage: String(conPage),
      neutralPage: String(neutralPage),
    });

    if (side === "pro") params.set("proPage", String(target));
    else if (side === "con") params.set("conPage", String(target));
    else params.set("neutralPage", String(target));

    return `${basePath}?${params.toString()}`;
  };

  return (
    <nav className="mt-2 flex items-center justify-between text-xs text-zinc-300">
      <Link
        aria-disabled={current <= 1}
        className={`rounded-xl px-3 py-1 ring-1 ${
          current <= 1
            ? "pointer-events-none ring-white/5 text-zinc-500"
            : "ring-white/10 hover:bg-white/10"
        }`}
        href={makeHref(prev)}
      >
        Prev
      </Link>
      <span>
        Page {current} / {totalPages}
      </span>
      <Link
        aria-disabled={current >= totalPages}
        className={`rounded-xl px-3 py-1 ring-1 ${
          current >= totalPages
            ? "pointer-events-none ring-white/5 text-zinc-500"
            : "ring-white/10 hover:bg-white/10"
        }`}
        href={makeHref(next)}
      >
        Next
      </Link>
    </nav>
  );
}

