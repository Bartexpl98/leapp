"use client";

import { useState } from "react";

type VoteValue = 1 | -1 | null;

type VoteAggregate = {
  soundness: { sum: number; count: number };
  factuality: { sum: number; count: number };
};
const emptyAggregate: VoteAggregate = {
  soundness: { sum: 0, count: 0 },
  factuality: { sum: 0, count: 0 },
};

export default function ArgumentVoteControls({
  argumentId,
  initialMyVote,
  initialVoteAggregate,
  disableFactuality,
}: {
  argumentId: string;
  initialMyVote: { soundness: VoteValue; factuality: VoteValue };
  initialVoteAggregate: VoteAggregate;
  disableFactuality?: boolean;
}) {
  const [myVote, setMyVote] = useState(initialMyVote ?? { soundness: null, factuality: null });
  const [voteAggregate, setVoteAggregate] = useState(initialVoteAggregate ?? emptyAggregate);
  const [loading, setLoading] = useState(false);

  function applyOptimistic(payload: { soundness?: VoteValue; factuality?: VoteValue }) {
    const previous = myVote;

    const nextSound = payload.soundness === undefined ? previous.soundness : payload.soundness === previous.soundness ? null : payload.soundness;

    const nextFact = payload.factuality === undefined ? previous.factuality : payload.factuality === previous.factuality ? null : payload.factuality;

    const deltaSoundSum = (nextSound ?? 0) - (previous.soundness ?? 0);
    const deltaFactSum = (nextFact ?? 0) - (previous.factuality ?? 0);

    const deltaSoundCount =previous.soundness === null && nextSound !== null ? 1 : previous.soundness !== null && nextSound === null ? -1 : 0;

    const deltaFactCount = previous.factuality === null && nextFact !== null ? 1 : previous.factuality !== null && nextFact === null ? -1 : 0;

    setMyVote({soundness: nextSound, factuality: nextFact});

    setVoteAggregate((cur) => ({
      soundness: {
        sum: (cur.soundness?.sum ?? 0) + deltaSoundSum,
        count: (cur.soundness?.count ?? 0) + deltaSoundCount,
      },
      factuality: {
        sum: (cur.factuality?.sum ?? 0) + deltaFactSum,
        count: (cur.factuality?.count ?? 0) + deltaFactCount,
      },
    }));

    return previous; // for rollback
  }

  function rollback(previousVote: { soundness: VoteValue; factuality: VoteValue }, previousAggregate: VoteAggregate) {
    setMyVote(previousVote);
    setVoteAggregate(previousAggregate);
  }

  async function submit(payload: { soundness?: VoteValue; factuality?: VoteValue }) {
    const previousVote = myVote;
    const previousAggregate = voteAggregate;

    applyOptimistic(payload);

    try {
      setLoading(true);
      const res = await fetch(`/api/arguments/${argumentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        rollback(previousVote, previousAggregate);
        alert(data?.message || "Vote failed");
        return;
      }

      if (data?.myVote) setMyVote(data.myVote);
      if (data?.voteAggregate) setVoteAggregate(data.voteAggregate);
    } catch {
      rollback(previousVote, previousAggregate);
      alert("Vote failed!");
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
        <span className="text-zinc-400">{voteAggregate.soundness.sum}</span>
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
        <span className="text-zinc-400">{voteAggregate.factuality.sum}</span>
      </div>
    </div>
  );
}
