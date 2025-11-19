"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createArgument } from "../actions";
import type { Side } from "@/app/models/argument";

type EvidenceItem = { url: string; title: string; quote: string; locator: string };

type CreateArgumentResult = { ok: boolean; id?: string; error?: string };

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function NewArgumentForm({
  slug,
  initialSide,
  parentId,
}: {
  slug: string;
  initialSide: Side;
  parentId?: string;
}) {
  const router = useRouter();
  const [side, setSide] = useState<Side>(initialSide);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [evidence, setEvidence] = useState<EvidenceItem[]>([
    { url: "", title: "", quote: "", locator: "" },
  ]);

  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function setEv(i: number, key: keyof EvidenceItem, value: string) {
    setEvidence((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [key]: value };
      return copy;
    });
  }

  function addEv() {
    setEvidence((prev) => [...prev, { url: "", title: "", quote: "", locator: "" }]);
  }

  function removeEv(i: number) {
    setEvidence((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <form
      action={(fd: FormData) => {
        setError("");

        // require at least one evidence item with something filled
        const cleaned = evidence
          .map((e) => ({
            url: e.url.trim(),
            title: e.title.trim(),
            quote: e.quote.trim(),
            locator: e.locator.trim(),
          }))
          .filter((e) => e.url || e.title || e.quote); // at least one field present

        if (cleaned.length === 0) {
          setError("Please add at least one piece of evidence (URL, title, or quote).");
          return;
        }

        fd.set("slug", slug);
        fd.set("side", side); // Side is a string union; FormData expects string
        fd.set("title", title);
        fd.set("body", body);
        fd.set("evidence", JSON.stringify(cleaned));

        if (parentId) {
          fd.set("parentId", parentId);
        }

        startTransition(async () => {
          try {
            const res = (await createArgument(fd)) as CreateArgumentResult | undefined;
            if (res?.ok) {
              router.push(`/debate/${slug}/argument/${res.id}`);
            } else {
              setError(res?.error ?? "Failed to create argument");
            }
          } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Failed to create argument";
            setError(message);
          }
        });
      }}
      className="space-y-6"
    >
      {/* side */}
      <div className="flex gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="side"
            value="affirmative"
            checked={side === "affirmative"}
            onChange={() => setSide("affirmative")}
          />
          Affirmative
        </label>
        
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="side"
            value="opposing"
            checked={side === "opposing"}
            onChange={() => setSide("opposing")}
          />
          Opposing
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="side"
            value="neutral"
            checked={side === "neutral"}
            onChange={() => setSide("neutral")}
          />
          Neutral / Context
        </label>
      </div>

      {/* title / body */}
      <label className="block">
        <span className="mb-1 block text-sm text-zinc-300">Title (optional)</span>
        <input
          className="w-full rounded-lg bg-zinc-800 p-3 text-zinc-100"
          placeholder="Short headline for your argument"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-zinc-300">Argument</span>
        <textarea
          className="w-full rounded-lg bg-zinc-800 p-3 text-zinc-100"
          placeholder="Make your case and cite sources if possible…"
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
      </label>

      {/* evidence list */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-zinc-300">Evidence (at least one)</span>
          <button type="button" onClick={addEv} className="text-sm text-violet-300 hover:underline">
            + Add evidence
          </button>
        </div>

        <div className="space-y-3">
          {evidence.map((ev, i) => (
            <div key={i} className="rounded-lg border border-white/10 bg-zinc-900/60 p-3 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  placeholder="URL"
                  value={ev.url}
                  onChange={(e) => setEv(i, "url", e.target.value)}
                  className="rounded bg-zinc-800 p-2 text-sm text-zinc-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <input
                  placeholder="Title"
                  value={ev.title}
                  onChange={(e) => setEv(i, "title", e.target.value)}
                  className="rounded bg-zinc-800 p-2 text-sm text-zinc-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <textarea
                placeholder="Quote / excerpt"
                value={ev.quote}
                onChange={(e) => setEv(i, "quote", e.target.value)}
                className="w-full rounded bg-zinc-800 p-2 text-sm text-zinc-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500"
                rows={3}
              />
              <div className="flex items-center gap-3">
                <input
                  placeholder="Locator (page/section/timecode)"
                  value={ev.locator}
                  onChange={(e) => setEv(i, "locator", e.target.value)}
                  className="flex-1 rounded bg-zinc-800 p-2 text-sm text-zinc-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                {evidence.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEv(i)}
                    className="rounded bg-white/10 px-3 py-2 text-sm text-zinc-200 ring-1 ring-white/10 hover:bg-white/15"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-2 text-xs text-zinc-400">
          Include a link, a title, and/or a direct quote. You can add multiple items.
        </p>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-violet-600 px-4 py-2 text-white hover:bg-violet-500 disabled:opacity-60"
        >
          {isPending ? "Creating…" : "Create argument"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl bg-white/10 px-4 py-2 text-zinc-200 ring-1 ring-white/10 hover:bg-white/15"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
