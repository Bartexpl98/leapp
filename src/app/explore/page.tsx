import Link from "next/link";
import { dbConnect } from "@/app/lib/mongoose";
import Debate from "@/app/models/debate";
import Topic from "@/app/models/topic";
import { Types } from "mongoose";
import SortSelect from "./SortSelect";

//export const dynamic = 'force-dynamic';
export const revalidate = 30;
//should these be separate files?
type TopicLean = {
  _id: Types.ObjectId;
  name: string;
  slug: string;
};

type ChipLean = {
  name: string;
  slug: string;
};

// should i be using args count or the number of likes per side or something else?


type DebateLean = {
  _id: Types.ObjectId;
  topicId: Types.ObjectId;
  question: string;
  slug: string;
  summary?: string;
  lastActivityAt?: Date;
  argsCountPro?: number;
  argsCountCon?: number;
  argsCountNeutral?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

type SortKey = "trending" | "new" | "active" | "top";
type SearchParams = { topic?: string; sort?: SortKey; page?: string };

const PAGE_SIZE = 12;

export default async function ExplorePage({ searchParams,}: { searchParams: Promise<SearchParams>;}) {
  await dbConnect();

  const sp = await searchParams;
  const sort: SortKey = (sp.sort as SortKey) || "trending";
  const page = Math.max(1, parseInt(sp.page || "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const topicSlug = (sp.topic || "").trim();
  let topicFilter: Types.ObjectId | undefined;
  if (topicSlug) {
    const t = await Topic.findOne({ slug: topicSlug })
      .select({ _id: 1 })
      .lean<{ _id: Types.ObjectId } | null>();
    if (t?._id) topicFilter = t._id;
  }

  const filter: Record<string, unknown> = {};
  if (topicFilter) filter.topicId = topicFilter;

  let sortStage: Record<string, 1 | -1>;
  switch (sort) {
    case "new":
      sortStage = { createdAt: -1 };
      break;
    case "active":
      sortStage = { argsCountPro: -1 as -1, argsCountCon: -1 as -1, createdAt: -1 as -1 };
      break;
    case "top":
      sortStage = { createdAt: -1 };
      break;
    case "trending":
    default:
      // falls back to createdAt if lastActivityAt is missing
      sortStage = { lastActivityAt: -1 as -1, createdAt: -1 as -1 };
      break;
  }

  const debates = await Debate.find(filter)
    .sort(sortStage)
    .skip(skip)
    .limit(PAGE_SIZE)
    .lean<DebateLean[]>();
  
  const total = await Debate.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  let heading = "Explore debates";
  if (topicSlug) {
    const t = await Topic.findOne({ slug: topicSlug })
      .select({ name: 1 })
      .lean<{ name: string } | null>();
    if (t?.name) heading = `Explore: ${t.name}`;
  }

  const topicDocs = await Topic.find({})
    .select({ name: 1, slug: 1 })
    .sort({ name: 1 })
    .lean<ChipLean[]>();
  const chips = topicDocs.map((t) => ({ name: t.name, slug: t.slug }));

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100">{heading}</h1>
          <p className="text-sm text-zinc-400">Browse by topic and sort order.</p>
        </div>
        <SortSelect current={sort} topic={topicSlug} />
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        <Chip href="/explore" active={!topicSlug}>All</Chip>
        {chips.map((c) => (
          <Chip
            key={c.slug}
            href={`/explore?${new URLSearchParams({ topic: c.slug, sort }).toString()}`}
            active={topicSlug === c.slug}
          >
            {c.name}
          </Chip>
        ))}
      </div>

      {debates.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {debates.map((d) => (
            <li key={d._id.toString()} className="rounded-2xl border border-white/10 bg-zinc-800/70 p-4">
              <h3 className="line-clamp-2 text-lg font-medium text-zinc-100">
                <Link href={`/debate/${d.slug}`} className="hover:underline">
                  {d.question}
                </Link>
              </h3>

              {d.summary && (
                <p className="mt-2 line-clamp-3 text-sm text-zinc-400">{d.summary}</p>
              )}

              <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                <span>
                  Pro {d.argsCountPro ?? 0} · Neutral {d.argsCountNeutral ?? 0} · Con {d.argsCountCon ?? 0}
                </span>
                <span>
                  {formatWhen(d.lastActivityAt || d.updatedAt || d.createdAt)}
                </span>
              </div>

              <div className="mt-3">
                <Link
                  href={`/debate/${d.slug}`}
                  className="inline-block rounded-xl bg-violet-600/90 px-3 py-2 text-white hover:bg-violet-600"
                >
                  Open debate
                </Link>
              </div>
            </li>
          ))}
        </ul>)}

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2">
          <PageBtn page={page - 1} disabled={page <= 1} topic={topicSlug} sort={sort}>
            Prev
          </PageBtn>
          <span className="text-sm text-zinc-400">
            Page {page} / {totalPages}
          </span>
          <PageBtn page={page + 1} disabled={page >= totalPages} topic={topicSlug} sort={sort}>
            Next
          </PageBtn>
        </nav>
      )}
    </main>
  );
}

// helpers

function formatWhen(d?: Date) {
  return d ? new Date(d).toLocaleDateString() : "—";
}

function Chip({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={[
        "rounded-full px-3 py-1 text-sm ring-1 transition",
        active
          ? "bg-violet-600 text-white ring-violet-500"
          : "bg-white/5 text-zinc-200 ring-white/10 hover:bg-white/10",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

function PageBtn({
  page,
  disabled,
  topic,
  sort,
  children,
}: {
  page: number;
  disabled?: boolean;
  topic?: string;
  sort: string;
  children: React.ReactNode;
}) {
  const params = new URLSearchParams();
  if (topic) params.set("topic", topic);
  if (sort) params.set("sort", sort);
  params.set("page", String(Math.max(1, page)));
  return (
    <Link
      aria-disabled={disabled}
      className={[
        "rounded-xl px-3 py-2 text-sm ring-1",
        disabled
          ? "pointer-events-none text-zinc-500 ring-white/5"
          : "text-zinc-100 ring-white/10 hover:bg-white/10",
      ].join(" ")}
      href={`/explore?${params.toString()}`}
    >
      {children}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-800/30 p-8 text-center text-zinc-300">
      <p className="text-sm">No debates yet.</p>
      <p className="mt-2 text-xs text-zinc-400">
        Try another topic or create a new debate.
      </p>
    </div>
  );
}
