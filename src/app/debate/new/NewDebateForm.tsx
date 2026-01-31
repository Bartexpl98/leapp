"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Topic = { name: string; slug: string };

export default function NewDebateForm({ topics }: { topics: Topic[] }) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [summary, setSummary] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggle(slug: string) {
    setSelected((cur) =>
      cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          summary,
          topicSlugs: selected,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create debate");
      router.push(`/debate/${data.slug}`);
    } catch (err:unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className="mb-1 block text-sm text-zinc-300">Debate question</span>
        <input
          className="w-full rounded-lg bg-zinc-800 p-3 text-zinc-100"
          placeholder="e.g. Should social media require real-ID verification?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-zinc-300">Summary (optional)</span>
        <textarea
          className="w-full rounded-lg bg-zinc-800 p-3 text-zinc-100"
          placeholder="Give context, define terms, link to sources…"
          rows={4}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </label>

      <div>
        <span className="mb-2 block text-sm text-zinc-300">Topics</span>
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => {
            const active = selected.includes(t.slug);
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => toggle(t.slug)}
                aria-pressed={active}
                className={[
                  "rounded-full px-3 py-1 text-sm ring-1 transition",
                  active
                    ? "bg-violet-600 text-white ring-violet-500"
                    : "bg-white/5 text-zinc-200 ring-white/10 hover:bg-white/10",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={active}
                  readOnly
                  aria-label={t.name}
                />
                {t.name}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          Select one or more topics.
        </p>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-violet-600 px-4 py-2 text-white hover:bg-violet-500 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Debate"}
      </button>
    </form>
  );
}
