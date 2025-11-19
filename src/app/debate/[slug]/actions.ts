"use server";

import { getServerSession } from "next-auth";
import { dbConnect } from "@/app/lib/mongoose";
import Debate from "@/app/models/debate";
import Argument from "@/app/models/argument";
import type { Types } from "mongoose";
import User from "@/app/models/user";


const s = (v: FormDataEntryValue | null) =>
  typeof v === "string" ? v.trim() : undefined;

type EvidenceItem = {
  url?: string;
  title?: string;
  quote?: string;
  locator?: string;
};

export async function createArgument(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Not signed in");

  const slug = s(formData.get("slug"));
  const side = s(formData.get("side"));
  const title = s(formData.get("title"));
  const body = s(formData.get("body"));
  const parentIdRaw = s(formData.get("parentId"));
  const evidenceRaw = formData.get("evidence");

  if (!slug || !side || !body) throw new Error("Missing fields");
  if (side !== "affirmative" && side !== "opposing" && side !== "neutral") {
    throw new Error("Invalid side");
  }

  let evidence: EvidenceItem[] = [];
  if (typeof evidenceRaw === "string" && evidenceRaw.trim()) {
    try {
      const parsed = JSON.parse(evidenceRaw);
      if (Array.isArray(parsed)) {
        evidence = parsed;
      }
    } catch {
      // ignore malformed evidence for now
    }
  }

  await dbConnect();

  const user = await User.findOne({ email: session.user.email }).select({ _id: 1 }).lean<{ _id: Types.ObjectId } | null>();

  const authorId = user?._id ?? null

  const debate = await Debate.findOne({ slug })
    .select({ _id: 1 })
    .lean<{ _id?: Types.ObjectId } | null>();

  if (!debate?._id) throw new Error("Debate not found");

  // ---- thread fields ----
  let parentId: Types.ObjectId | null = null;
  let rootId: Types.ObjectId | null = null;
  let ancestors: Types.ObjectId[] = [];
  let depth = 0;

  if (parentIdRaw) {
    const parent = await Argument.findById(parentIdRaw).lean<{
      _id: Types.ObjectId;
      debateId: Types.ObjectId;
      side: string;
      rootId?: Types.ObjectId | null;
      ancestors?: Types.ObjectId[];
      depth?: number;
    } | null>();

    if (!parent) throw new Error("Parent argument not found");

    if (String(parent.debateId) !== String(debate._id)) {
      throw new Error("Parent argument does not belong to this debate");
    }

    parentId = parent._id;
    rootId = parent.rootId || parent._id;
    ancestors = [...(parent.ancestors || []), parent._id];
    depth = (parent.depth ?? 0) + 1;
  }

  const created = await Argument.create({
    debateId: debate._id,
    side,
    parentId,
    rootId,
    ancestors,
    depth,
    title,
    body,
    evidence,
    authorId,
  });

  if (!parentIdRaw) {
    // top-level argument – bump debate side counters
    let incField: Record<string, 1>;
    if (side === "affirmative") {
      incField = { argsCountPro: 1 };
    } else if (side === "opposing") {
      incField = { argsCountCon: 1 };
    } else {
      incField = { argsCountNeutral: 1 };
    }

    await Debate.updateOne(
      { _id: debate._id },
      { $inc: incField, $set: { lastActivityAt: new Date() } }
    );
  } else {
    // reply, bump replyCount on parent (and root if different)
    await Argument.updateOne({ _id: parentId }, { $inc: { replyCount: 1 } });

    if (rootId && String(rootId) !== String(parentId)) {
      await Argument.updateOne(
        { _id: rootId },
        { $inc: { replyCount: 1 } }
      );
    }

    await Debate.updateOne(
      { _id: debate._id },
      { $set: { lastActivityAt: new Date() } }
    );
  }

  return { ok: true, id: String(created._id) };
}
