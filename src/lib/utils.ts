export type VoteValue = -1 | 1 | null;

export type VoteAggregate = {
  soundness: { sum: number; count: number };
  factuality: { sum: number; count: number };
};

export const emptyAggregate: VoteAggregate = {
  soundness: { sum: 0, count: 0 },
  factuality: { sum: 0, count: 0 },
};

export type VoteUpdatePayload = {
  soundness?: VoteValue;
  factuality?: VoteValue;
};

export type ArgumentInput = {
  slug?: string;
  side?: string;
  body?: string;
  evidence?: string;
};

export type EvidenceItem = {
  evidenceType: string;
  url?: string;
  title?: string;
  quote?: string;
  locator?: string;
};

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function isVoteValue(value: unknown): value is VoteValue {
  return value === 1 || value === -1 || value === null;
}

export function normalizeVoteValue(value: unknown): VoteValue {
  return isVoteValue(value) ? value : null;
}

export function computeNextVote(prev: VoteValue, payloadValue: VoteValue | undefined): VoteValue {
  if (payloadValue === undefined) return prev;
  return payloadValue === prev ? null : payloadValue;
}

export function computeVoteDelta(prev: VoteValue, next: VoteValue) {
  const deltaSum = (next ?? 0) - (prev ?? 0);
  const deltaCount =
    prev === null && next !== null ? 1 : prev !== null && next === null ? -1 : 0;
  return { deltaSum, deltaCount };
}

export function applyVoteUpdate(
  current: VoteAggregate,
  previousVote: { soundness: VoteValue; factuality: VoteValue },
  payload: VoteUpdatePayload
) {
  const nextSoundness = computeNextVote(previousVote.soundness, payload.soundness);
  const nextFactuality = computeNextVote(previousVote.factuality, payload.factuality);

  const soundDelta = computeVoteDelta(previousVote.soundness, nextSoundness);
  const factDelta = computeVoteDelta(previousVote.factuality, nextFactuality);

  return {
    nextVote: {
      soundness: nextSoundness,
      factuality: nextFactuality,
    },
    nextAggregate: {
      soundness: {
        sum: current.soundness.sum + soundDelta.deltaSum,
        count: current.soundness.count + soundDelta.deltaCount,
      },
      factuality: {
        sum: current.factuality.sum + factDelta.deltaSum,
        count: current.factuality.count + factDelta.deltaCount,
      },
    },
  };
}

export function validateArgumentInput(input: ArgumentInput) {
  const slug = input.slug?.trim();
  const side = input.side?.trim();
  const body = input.body?.trim();

  if (!slug || !side || !body) {
    throw new Error("Missing fields");
  }

  if (side !== "affirmative" && side !== "opposing" && side !== "neutral") {
    throw new Error("Invalid side");
  }

  return { slug, side, body };
}

export function parseEvidence(raw?: string): EvidenceItem[] {
  if (!raw || !raw.trim()) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item): EvidenceItem | null => {
        const evidence = item as Record<string, unknown>;
        const url = typeof evidence.url === "string" ? evidence.url.trim() : undefined;
        const title = typeof evidence.title === "string" ? evidence.title.trim() : undefined;
        const quote = typeof evidence.quote === "string" ? evidence.quote.trim() : undefined;
        const locator = typeof evidence.locator === "string" ? evidence.locator.trim() : undefined;

        if (!url && !title && !quote) return null;

        const evidenceType =
          typeof evidence.evidenceType === "string"
            ? evidence.evidenceType
            : typeof evidence.type === "string"
            ? evidence.type
            : "other";

        return {
          evidenceType,
          url,
          title,
          quote,
          locator,
        };
      })
      .filter((item): item is EvidenceItem => item !== null);
  } catch {
    return [];
  }
}

export function requireEvidence(raw?: string): EvidenceItem[] {
  const evidence = parseEvidence(raw);
  if (!evidence.length) {
    throw new Error("Evidence is required");
  }
  return evidence;
}

export type ThreadNode = {
  _id: string;
  parentId?: string | null;
};

export function buildThreadOrder(rootId: string, nodes: ThreadNode[]) {
  const childrenMap = new Map<string, ThreadNode[]>();

  for (const node of nodes) {
    if (node._id === rootId) continue;
    const parentKey = node.parentId ? node.parentId : rootId;
    const bucket = childrenMap.get(parentKey) ?? [];
    bucket.push(node);
    childrenMap.set(parentKey, bucket);
  }

  const orderedReplies: ThreadNode[] = [];

  function dfs(parentKey: string) {
    const children = childrenMap.get(parentKey);
    if (!children) return;
    for (const child of children) {
      orderedReplies.push(child);
      dfs(child._id);
    }
  }

  dfs(rootId);
  return orderedReplies;
}
