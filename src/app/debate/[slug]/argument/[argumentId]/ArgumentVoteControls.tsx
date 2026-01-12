"use client";

import { useState } from "react";

type VoteValue = 1 | -1 | null;

type VoteAgg = {
  soundness: { sum: number; count: number };
  factuality: { sum: number; count: number };
};

export default function ArgumentVoteControls({
  argumentId,
  initialMyVote,
  initialVoteAgg,
  disableFactuality,
}: {
  argumentId: string;
  initialMyVote: { soundness: VoteValue; factuality: VoteValue };
  initialVoteAgg: VoteAgg;
  disableFactuality?: boolean;
}) {
  const [myVote, setMyVote] = useState(initialMyVote);
  const [voteAgg, setVoteAgg] = useState(initialVoteAgg);
  const [loading, setLoading] = useState(false);

  async function submit(payload: { soundness?: VoteValue; factuality?: VoteValue }) {
    try {
      setLoading(true);
      const res = await fetch(`/api/arguments/${argumentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "Vote failed");
        return;
      }

      setMyVote(data.myVote);
      setVoteAgg(data.voteAgg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-3 text-xs text-zinc-300">
      <div className="flex items-center gap-2">
        <span className="text-zinc-400">Soundness</span>
        <button
          disabled={loading}
          onClick={() => submit({ soundness: 1 })}
          className={`rounded px-2 py-1 border border-white/10 ${myVote.soundness === 1 ? "bg-white/10" : "bg-transparent"}`}>
          +1
        </button>
        <button
          disabled={loading}
          onClick={() => submit({ soundness: -1 })}
          className={`rounded px-2 py-1 border border-white/10 ${myVote.soundness === -1 ? "bg-white/10" : "bg-transparent"}`}>
          -1
        </button>
        <span className="text-zinc-400">{voteAgg.soundness.sum}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-zinc-400">Factuality</span>
        <button
          disabled={loading || disableFactuality}
          onClick={() => submit({ factuality: 1 })}
          className={`rounded px-2 py-1 border border-white/10 ${myVote.factuality === 1 ? "bg-white/10" : "bg-transparent"} ${disableFactuality ? "opacity-40 cursor-not-allowed" : ""}`}
          title={disableFactuality ? "Add evidence to vote on factuality" : ""}>
          +1
        </button>
        <button
          disabled={loading || disableFactuality}
          onClick={() => submit({ factuality: -1 })}
          className={`rounded px-2 py-1 border border-white/10 ${myVote.factuality === -1 ? "bg-white/10" : "bg-transparent"} ${disableFactuality ? "opacity-40 cursor-not-allowed" : ""}`}
          title={disableFactuality ? "Add evidence to vote on factuality" : ""}>
          -1
        </button>
        <span className="text-zinc-400">{voteAgg.factuality.sum}</span>
      </div>
    </div>
  );
}
