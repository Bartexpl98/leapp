import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose, { Types } from "mongoose";
import { dbConnect } from "@/app/lib/mongoose";
import User from "@/app/models/user";
import Argument from "@/app/models/argument";
import Debate from "@/app/models/debate";

type PageProps = {
  params: Promise<{ userId: string }>;
  searchParams?: Promise<{ tab?: string }>;
};

type Author = {
  _id: Types.ObjectId;
  name?: string;
  nickname?: string;
  bio?: string;
};

type ArgLean = {
  _id: Types.ObjectId;
  debateId: Types.ObjectId;
  side: "affirmative" | "opposing" | "neutral";
  body: string;
  createdAt?: Date;
};

type DebateLean = {
  _id: Types.ObjectId;
  slug: string;
  question: string;
  createdAt?: Date;
  lastActivityAt?: Date;
  argsCountPro?: number;
  argsCountCon?: number;
  argsCountNeutral?: number;
  authorId?: Types.ObjectId;
};

export default async function ProfilePage({params, searchParams}: PageProps) {
  const {userId} = await params;
  const sp = searchParams ? await searchParams : undefined;

  if (!mongoose.Types.ObjectId.isValid(userId)) return notFound();

  const tab = sp?.tab === "debates" ? "debates" : "arguments";

  await dbConnect();

  const user = await User.findById(userId).select({_id: 1, name: 1, nickname: 1, bio: 1}).lean<Author | null>();

  if (!user) return notFound();

  const label = user.nickname ? `@${user.nickname}` : user.name ?? "User";

  // Loading both sets
  const [args, debates] = await Promise.all([
    Argument.find({authorId: user._id})
      .sort({ createdAt: -1 })
      .select({ _id: 1, debateId: 1, side: 1, body: 1, createdAt: 1 })
      .limit(50)
      .lean<ArgLean[]>(),

    Debate.find({authorId: user._id})
      .sort({lastActivityAt: -1, createdAt: -1})
      .select({
        _id: 1,
        slug: 1,
        question: 1,
        createdAt: 1,
        lastActivityAt: 1,
        argsCountPro: 1,
        argsCountCon: 1,
        argsCountNeutral: 1,
      })
      .limit(50)
      .lean<DebateLean[]>(),
  ]);

  //Debate lookup for argument cards
  const debateIds = [...new Set(args.map((a) => String(a.debateId)))];
  const debatesForArgs = debateIds.length === 0 ? [] : await Debate.find({_id: {$in: debateIds}}).select({_id: 1, slug: 1, question: 1}).lean<{_id: Types.ObjectId; slug: string; question: string}[]>();

  const debateById = new Map(debatesForArgs.map((d) => [String(d._id), d]));

  // quick stats
  const stats = {
    debates: debates.length,
    arguments: args.length,
  };

  return (
    <main className="mx-auto max-w-6xl px-4 md:px-6 py-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left column: profile card */}
        <aside className="col-span-12 md:col-span-4 space-y-4">
          <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 space-y-3">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold text-white">{label}</h1>
              <p className="text-sm text-zinc-400">
                {user.name && user.nickname ? user.name : ""}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">
                Bio
              </p>
              {user.bio ? (
                <p className="text-sm text-zinc-200 whitespace-pre-wrap">{user.bio}</p>
              ) : (
                <p className="text-sm text-zinc-400">
                  No bio yet.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-3">
                <p className="text-[11px] uppercase tracking-wide text-zinc-400">
                  Debates
                </p>
                <p className="text-lg font-semibold text-white">{stats.debates}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-3">
                <p className="text-[11px] uppercase tracking-wide text-zinc-400">
                  Arguments
                </p>
                <p className="text-lg font-semibold text-white">{stats.arguments}</p>
              </div>
            </div>
          </section>

          {/*future ideas*/}
          <section className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">
              Ideas to add later
            </p>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>- credibility score / “reputation”</li>
              <li>- top topics they post in</li>
            </ul>
          </section>
        </aside>

        {/*Right column tabs + content*/}
        <section className="col-span-12 md:col-span-8 space-y-4">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${userId}?tab=arguments`}
              className={[
                "rounded-xl px-3 py-2 text-sm ring-1 transition",
                tab === "arguments"
                  ? "bg-white/10 text-white ring-white/15"
                  : "bg-transparent text-zinc-300 ring-white/10 hover:bg-white/10",
              ].join(" ")}
            >
              Arguments
            </Link>
            <Link
              href={`/profile/${userId}?tab=debates`}
              className={[
                "rounded-xl px-3 py-2 text-sm ring-1 transition",
                tab === "debates"
                  ? "bg-white/10 text-white ring-white/15"
                  : "bg-transparent text-zinc-300 ring-white/10 hover:bg-white/10",
              ].join(" ")}
            >
              Debates
            </Link>
          </div>

          {tab === "arguments" ? (args.length === 0 ? (
            <p className="text-sm text-zinc-400">No arguments yet.</p>
            ) : (
              <div className="space-y-3">
                {args.map((a) => {
                  const debate = debateById.get(String(a.debateId));
                  return (
                    <div key={String(a._id)}
                      className="rounded-xl border border-white/10 bg-zinc-900/60 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] uppercase tracking-wide text-zinc-400">
                          {a.side}
                          {debate ? (
                            <>{" · "}
                              <Link
                                href={`/debate/${debate.slug}`}
                                className="text-zinc-200 hover:underline normal-case">
                                {debate.question}
                              </Link>
                            </>
                          ) : null}
                        </div>
                        {a.createdAt && (
                          <time className="text-[11px] text-zinc-500">
                            {new Date(a.createdAt).toLocaleString()}
                          </time>
                        )}
                      </div>

                      <p className="text-sm text-zinc-100 whitespace-pre-wrap">
                        {a.body.length > 240 ? a.body.slice(0, 240) + "…" : a.body}
                      </p>

                      {debate && (
                        <Link
                          href={`/debate/${debate.slug}/argument/${String(a._id)}`}
                          className="text-xs text-violet-300 hover:underline">
                          Open thread →
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : debates.length === 0 ? (
            <p className="text-sm text-zinc-400">No debates yet.</p>
          ) : (
            <div className="space-y-3">
              {debates.map((d) => {
                const total =
                  (d.argsCountPro ?? 0) +
                  (d.argsCountCon ?? 0) +
                  (d.argsCountNeutral ?? 0);

                return (
                  <div
                    key={String(d._id)}
                    className="rounded-xl border border-white/10 bg-zinc-900/60 p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/debate/${d.slug}`}
                        className="text-base font-semibold text-white hover:underline"
                      >
                        {d.question}
                      </Link>

                      <div className="text-[11px] text-zinc-500 whitespace-nowrap">
                      {d.createdAt && (
                        <>Created {new Date(d.createdAt).toLocaleDateString()}</>
                      )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                      <span className="rounded-full bg-white/5 ring-1 ring-white/10 px-2 py-1">
                        Total args: {total}
                      </span>
                      <span className="rounded-full bg-white/5 ring-1 ring-white/10 px-2 py-1">
                        Pro: {d.argsCountPro ?? 0}
                      </span>
                      <span className="rounded-full bg-white/5 ring-1 ring-white/10 px-2 py-1">
                        Con: {d.argsCountCon ?? 0}
                      </span>
                      <span className="rounded-full bg-white/5 ring-1 ring-white/10 px-2 py-1">
                        Neutral: {d.argsCountNeutral ?? 0}
                      </span>
                    </div>

                    <Link
                      href={`/debate/${d.slug}`}
                      className="text-xs text-violet-300 hover:underline"
                    >
                      Open debate →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
