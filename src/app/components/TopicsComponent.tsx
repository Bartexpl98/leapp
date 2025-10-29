import Link from "next/link";

type TopicsProps = {
  topics?: string[];
};


// Make it so that whatever topic i'm on is the one being hihglighted?
// should i be getting the topics here?
export default function Topics({ topics = [] }: TopicsProps) {
  return (
    //potentially de-dupe?
    <aside className="col-span-12 md:col-span-2">
      <div className="rounded-2xl border border-white/10 bg-zinc-800/70 p-4">
        <h2 className="mb-3 text-sm font-semibold text-zinc-300">Debate Topics</h2>

        {topics.length === 0 ? (
          <p className="text-sm text-zinc-400">No topics yet.</p>
        ) : (
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
        )}

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
  );
}