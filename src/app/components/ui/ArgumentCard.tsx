import Link from "next/link";

export type Post = {
    id: string;
    title: string;
    summary: string;
    author?: string;
    createdAt?: string;
}
//todo - add author's name
type ArgumentCardProps = {
  post: Post;
  openHref: string;
  
  //remove?
  evidenceHref?: string;
  rebuttalsHref?: string;
};

export default function ArgumentCard({
  post,
  openHref,
  evidenceHref,
  rebuttalsHref,
}: ArgumentCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-zinc-800/70 p-5 shadow">
      <header className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-white">{post.title}</h3>
        <time className="whitespace-nowrap text-xs text-zinc-400">
          {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
        </time>
      </header>

      <p className="mt-2 text-sm text-zinc-300 leading-6">
        {post.summary}
      </p>

      <footer className="mt-4 flex flex-wrap items-center gap-2">
        {/* Always shown */}
        <Link
          href={openHref}
          className="rounded-xl bg-violet-600/90 px-3 py-2 text-xs font-medium text-white hover:bg-violet-600"
        >
          Open full argument
        </Link>

        {/* Only shown if provided */}
        {evidenceHref && (
          <Link
            href={evidenceHref}
            className="rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-zinc-100 ring-1 ring-white/10 hover:bg-white/10"
          >
            Evidence
          </Link>
        )}

        {/* Only shown if provided */}
        {rebuttalsHref && (
          <Link
            href={rebuttalsHref}
            className="rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-zinc-100 ring-1 ring-white/10 hover:bg-white/10"
          >
            Replies
          </Link>
        )}

        {post.author && (
          <span className="ml-auto text-xs text-zinc-400">by {post.author}</span>
        )}
      </footer>
    </article>
  );
}