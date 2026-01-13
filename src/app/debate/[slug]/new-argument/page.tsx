import { notFound } from "next/navigation";
import { dbConnect } from "@/app/lib/mongoose";
import Debate from "@/app/models/debate";
import NewArgumentForm from "./NewArgumentForm";
import Argument from "@/app/models/argument";


export const dynamic = "force-dynamic";

export default async function NewArgumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : undefined;

  const sideParam =
    typeof sp?.side === "string"
      ? sp.side.toLowerCase()
      : "";

  const parentId =
    typeof sp?.parentId === "string"
      ? sp.parentId
      : undefined;



  await dbConnect();

  const d = await Debate.findOne({ slug })
    .select({ question: 1, slug: 1, _id: 1 })
    .lean<{_id: string; question: string; slug: string } | null>();

  if (!d) return notFound();

  let parentArg: { title?: string; body: string } | null = null;
  if (parentId) {
    const raw = await Argument.findById(parentId)
      .select({ title: 1, body: 1, debateId: 1 })
      .lean<{ title?: string; body: string; debateId: unknown } | null>();

    if (raw && String(raw.debateId) === String(d._id)) {
      parentArg = { title: raw.title, body: raw.body };
    } else {
      // parent not found / not in this debate → ignore, treat as top-level
      parentArg = null;
    }
  }

  const initialSide: "affirmative" | "opposing" | "neutral" =
  sideParam === "opposing"
    ? "opposing"
    : sideParam === "neutral"
    ? "neutral"
    : "affirmative";

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold mb-2">Add a new argument</h1>
        <p className="mb-2 text-zinc-300">Debate: {d.question}</p>
      </header>

      {parentArg && (
        <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Replying to:
          </p>
          {parentArg.title && (
            <p className="text-sm font-semibold text-zinc-100">
              {parentArg.title}
            </p>
          )}
          <p className="text-sm text-zinc-200 whitespace-pre-wrap">
            {parentArg.body}
          </p>
        </section>
      )}

      {/* Pass only primitives to the client */}
      <NewArgumentForm slug={d.slug} initialSide={initialSide} parentId={parentId} />
    </main>
  );
}
