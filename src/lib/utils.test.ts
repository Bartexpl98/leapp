import { describe, expect, it } from "vitest";
import {
  applyVoteUpdate,
  buildThreadOrder,
  emptyAggregate,
  parseEvidence,
  requireEvidence,
  slugify,
  validateArgumentInput,
  VoteValue,
} from "@/lib/utils";

describe("utils", () => {
  it("vote aggregate computes correctly", () => {
    const current = emptyAggregate;
    const previousVote = { soundness: null as VoteValue, factuality: null as VoteValue };
    const { nextAggregate, nextVote } = applyVoteUpdate(current, previousVote, { soundness: 1 });

    expect(nextVote.soundness).toBe(1);
    expect(nextVote.factuality).toBeNull();
    expect(nextAggregate.soundness).toEqual({ sum: 1, count: 1 });
    expect(nextAggregate.factuality).toEqual({ sum: 0, count: 0 });
  });

  it("vote aggregate handles empty votes", () => {
    const current = emptyAggregate;
    const previousVote = { soundness: null as VoteValue, factuality: null as VoteValue };
    const { nextAggregate, nextVote } = applyVoteUpdate(current, previousVote, {});

    expect(nextVote).toEqual(previousVote);
    expect(nextAggregate).toEqual(emptyAggregate);
  });

  it("vote change updates totals correctly", () => {
    const current = {
      soundness: { sum: 1, count: 1 },
      factuality: { sum: 0, count: 0 },
    };
    const previousVote = { soundness: 1 as VoteValue, factuality: null as VoteValue };

    const { nextAggregate, nextVote } = applyVoteUpdate(current, previousVote, { soundness: -1 });

    expect(nextVote.soundness).toBe(-1);
    expect(nextAggregate.soundness).toEqual({ sum: -1, count: 1 });
  });

  it("vote toggle disables an existing vote", () => {
    const current = {
      soundness: { sum: 1, count: 1 },
      factuality: { sum: 0, count: 0 },
    };
    const previousVote = { soundness: 1 as VoteValue, factuality: null as VoteValue };

    const { nextAggregate, nextVote } = applyVoteUpdate(current, previousVote, { soundness: 1 });

    expect(nextVote.soundness).toBeNull();
    expect(nextAggregate.soundness).toEqual({ sum: 0, count: 0 });
  });

  it("invalid evidence JSON fails", () => {
    expect(() => requireEvidence("not valid json")).toThrow("Evidence is required");
  });

  it("evidence filtering removes invalid entries", () => {
    const evidenceJson = JSON.stringify([
      { evidenceType: "article", url: "", title: "", quote: "" },
      { evidenceType: "report", url: "https://example.com", title: "Example" },
    ]);

    const result = parseEvidence(evidenceJson);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ evidenceType: "report", url: "https://example.com", title: "Example" });
  });

  it("slug edge case normalizes special characters and trims hyphens", () => {
    expect(slugify("  -- Hello___World!!  ")).toBe("hello-world");
  });

  it("thread builder ignores nodes whose parent is missing", () => {
    const rootId = "root";
    const nodes = [
      { _id: "orphan", parentId: "missing" },
      { _id: "child", parentId: "root" },
    ];

    const ordered = buildThreadOrder(rootId, nodes);

    expect(ordered.map((item) => item._id)).toEqual(["child"]);
  });

  it("validation trims correctly", () => {
    expect(
      validateArgumentInput({ slug: "  slug ", side: " opposing ", body: " body " })
    ).toEqual({ slug: "slug", side: "opposing", body: "body" });
  });

  it("valid argument input passes", () => {
    const result = validateArgumentInput({
      slug: " debate/one ",
      side: "affirmative",
      body: " This is a claim.",
    });

    expect(result).toEqual({ slug: "debate/one", side: "affirmative", body: "This is a claim." });
  });

  it("missing body fails", () => {
    expect(() => validateArgumentInput({ slug: "one", side: "affirmative", body: "" })).toThrow(
      "Missing fields"
    );
  });

  it("invalid side fails", () => {
    expect(() => validateArgumentInput({ slug: "one", side: "bad", body: "Hello" })).toThrow("Invalid side");
  });

  it("evidence with meaningful content passes", () => {
    const evidenceJson = JSON.stringify([
      {
        evidenceType: "article",
        title: "Test title",
        url: "https://example.com",
        quote: "Important quote.",
      },
    ]);

    const result = parseEvidence(evidenceJson);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ evidenceType: "article", url: "https://example.com", title: "Test title" });
  });

  it("empty evidence fails", () => {
    expect(() => requireEvidence("[]")).toThrow("Evidence is required");
  });

  it("slug helper works", () => {
    expect(slugify("  Hello World! This is x  ")).toBe("hello-world-this-is-x");
  });

  it("thread builder nests replies correctly", () => {
    const rootId = "root";
    const nodes = [
      { _id: "a", parentId: "root" },
      { _id: "b", parentId: "a" },
      { _id: "c", parentId: "root" },
      { _id: "d", parentId: "b" },
    ];

    const ordered = buildThreadOrder(rootId, nodes);

    expect(ordered.map((item) => item._id)).toEqual(["a", "b", "d", "c"]);
  });
});
