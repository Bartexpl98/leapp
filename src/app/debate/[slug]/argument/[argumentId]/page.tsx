import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/app/lib/mongoose";
import Debate from "@/app/models/debate";
import Argument from "@/app/models/argument";
import NewArgumentForm from "../../new-argument/NewArgumentForm";
import type { Types } from "mongoose";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { slug: string; argumentId: string };
};

type ArgumentDoc = {
  _id: Types.ObjectId;
  debateId: Types.ObjectId;
  side: "affirmative" | "opposing" | "neutral";
  parentId?: Types.ObjectId | null;
  rootId?: Types.ObjectId | null;
  ancestors?: Types.ObjectId[];
  depth?: number;
  title?: string;
  body: string;
  createdAt?: Date;
  evidence?: {
    _id: Types.ObjectId;
    url?: string;
    title?: string;
    quote?: string;
    locator?: string;
  }[];
};

export default async function ArgumentThreadPage({ params }: PageProps) {
  const { slug, argumentId } = params;

  await dbConnect();

  const debate = await Debate.findOne({ slug })
    .select({ _id: 1, question: 1, slug: 1 })
    .lean<{ _id: Types.ObjectId; question: string; slug: string } | null>();

  if (!debate) return notFound();

  const node = await Argument.findById(argumentId).lean<ArgumentDoc | null>();
  if (!node) return notFound();

  if (String(node.debateId) !== String(debate._id)) return notFound();

  const rootId = node.rootId || node._id;

  const root =
    node.rootId && String(node.rootId) !== String(node._id)
      ? await Argument.findById(rootId).lean<ArgumentDoc | null>()
      : node;

  if (!root) return notFound();

  const thread = await Argument.find({
    $or: [{ _id: root._id }, { rootId }],
  })
    .sort({ createdAt: 1 })
    .lean<ArgumentDoc[]>();

  const replies = thread.filter((a) => String(a._id) !== String(root._id));

  const basePath = `/debate/${debate.slug}`;

  return (
    <main className="mx-auto max-w-3xl px-4 md:px-6 py-6 space-y-6">
      <header className="space-y-2">
        <Link
          href={basePath}
          className="text-sm text-zinc-400 hover:underline"
        >
          ← Back to debate
        </Link>
        <h1 className="text-xl font-semibold text-white">{debate.question}</h1>
      </header>

      {/* Root argument */}
      <section className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-400">
            {root.side === "affirmative"
              ? "Affirmative"
              : root.side === "opposing"
              ? "Opposing"
              : "Neutral / Context"}
          </p>
          <h2 className="text-lg font-semibold text-white">
            {root.title || "Argument"}
          </h2>
        </div>

        <p className="text-sm text-zinc-100 whitespace-pre-wrap">
          {root.body}
        </p>

        {/* Evidence list */}
        {root.evidence && root.evidence.length > 0 && (
          <div className="mt-3 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Evidence
            </h3>
            <ul className="space-y-2">
              {root.evidence.map((ev) => (
                <li
                  key={String(ev._id)}
                  className="rounded-lg bg-zinc-900/80 border border-white/10 p-2 text-xs text-zinc-200"
                >
                  {ev.title && <p className="font-semibold">{ev.title}</p>}
                  {ev.quote && (
                    <p className="mt-1 italic text-zinc-300">“{ev.quote}”</p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-zinc-400">
                    {ev.url && (
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        Source
                      </a>
                    )}
                    {ev.locator && <span>Locator: {ev.locator}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      

    {/* Replies */}
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-zinc-200 mb-1">
        Replies
      </h2>
      {replies.length === 0 ? (
        <p className="text-sm text-zinc-400">No replies yet.</p>
      ) : (
        replies.map((a) => (
          <div
            key={String(a._id)}
            className="rounded-xl border border-white/10 bg-zinc-900/60 p-3"
            style={{ marginLeft: (a.depth ?? 0) * 16 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase tracking-wide text-zinc-400">
                {a.side === "affirmative"
                  ? "Affirmative"
                  : a.side === "opposing"
                  ? "Opposing"
                  : "Neutral / Context"}
              </span>
              {a.createdAt && (
                <time className="text-[11px] text-zinc-500">
                  {new Date(a.createdAt).toLocaleString()}
                </time>
              )}
            </div>

            <p className="text-sm text-zinc-100 whitespace-pre-wrap">
              {a.body}
            </p>

            {a.evidence && a.evidence.length > 0 && (
              <details className="mt-2 rounded-lg border border-white/10 bg-zinc-900/70 p-2 text-[11px] text-zinc-200">
                <summary className="cursor-pointer font-semibold text-zinc-300">
                  Evidence ({a.evidence.length})
                </summary>
                <div className="mt-2 space-y-2">
                  {a.evidence.map((ev) => (
                    <div
                      key={String(ev._id)}
                      className="rounded bg-zinc-900/80 border border-white/10 p-2"
                    >
                      {ev.title && (
                        <p className="text-[11px] font-semibold text-zinc-100">
                          {ev.title}
                        </p>
                      )}
                      {ev.quote && (
                        <p className="mt-1 italic text-[11px] text-zinc-300">
                          “{ev.quote}”
                        </p>
                      )}
                      <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-zinc-400">
                        {ev.url && (
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            Source
                          </a>
                        )}
                        {ev.locator && <span>Locator: {ev.locator}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}
    
            
            <div className="mt-2">
              <Link
                href={`${basePath}/new-argument?side=${a.side}&parentId=${a._id}`}
                className="text-xs text-violet-300 hover:underline"
              >
                Reply to this
              </Link>
            </div>
          </div>
        ))
      )}
    </section>

      {/* Reply to root */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-zinc-200 mb-2">
          Reply to this argument
        </h2>
        <NewArgumentForm
          slug={debate.slug}
          initialSide={root.side}
          parentId={String(root._id)}
        />
      </section>
    </main>
  );
}
