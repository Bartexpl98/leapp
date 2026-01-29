import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose, { Types } from "mongoose";
import { dbConnect } from "@/app/lib/mongoose";
import User from "@/app/models/user";
import Argument from "@/app/models/argument";
import Debate from "@/app/models/debate";

type PageProps = {
  params: Promise<{ userId: string }>;
};

type Author = {
  _id: Types.ObjectId;
  name?: string;
  nickname?: string;
};

type ArgLean = {
  _id: Types.ObjectId;
  debateId: Types.ObjectId;
  side: "affirmative" | "opposing" | "neutral";
  body: string;
  createdAt?: Date;
};

export default async function ProfilePage({params}: PageProps) {
  const {userId} = await params;

  if (!mongoose.Types.ObjectId.isValid(userId)) return notFound();

  await dbConnect();

  const user = await User.findById(userId)
    .select({_id: 1, name: 1, nickname: 1})
    .lean<Author | null>();

  if (!user) return notFound();

  const args = await Argument.find({authorId: user._id})
    .sort({ createdAt: -1 })
    .select({ _id: 1, debateId: 1, side: 1, body: 1, createdAt: 1 })
    .limit(50)
    .lean<ArgLean[]>();

  //get debate slugs/questions so we can link back
  const debateIds = [...new Set(args.map((a) => String(a.debateId)))];
  const debates = await Debate.find({_id: {$in: debateIds}})
    .select({_id: 1, slug: 1, question: 1})
    .lean<{_id: Types.ObjectId; slug: string; question: string}[]>();

  const debateById = new Map(debates.map((d) => [String(d._id),d]));

  const label = user.nickname ? `@${user.nickname}` : user.name ?? "User";

  return (
    <main className="mx-auto max-w-3xl px-4 md:px-6 py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-white">{label}</h1>
        <p className="text-sm text-zinc-400">Recent arguments</p>
      </header>

      {args.length === 0 ? (
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
      )}
    </main>
  );
}
