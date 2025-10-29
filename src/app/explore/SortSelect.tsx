"use client";

import { useRouter } from "next/navigation";

export default function SortSelect({ current, topic }: { current: string; topic?: string }) {
  const router = useRouter();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const sort = e.target.value;
    const params = new URLSearchParams();
    if (topic) params.set("topic", topic);
    params.set("sort", sort);
    params.set("page", "1");
    router.push(`/explore?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-zinc-300">Sort</label>
      <select
        id="sort"
        name="sort"
        value={current}
        onChange={onChange}
        className="rounded-xl bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500"
      >
        <option value="trending">Trending</option>
        <option value="new">Newest</option>
        <option value="active">Most active</option>
        <option value="top">Top</option>
      </select>
    </div>
  );
}
