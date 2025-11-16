"use server";

import { getServerSession } from "next-auth";
import { dbConnect } from "@/app/lib/mongoose";
import Debate from "@/app/models/debate";
import Argument from "@/app/models/argument";

const s = (v: FormDataEntryValue | null) =>
  typeof v === "string" ? v.trim() : undefined;

export async function createArgument(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Not signed in");

  const slug = s(formData.get("slug"));
  const side = s(formData.get("side"));
  const title = s(formData.get("title"));
  const body = s(formData.get("body"));

  if (!slug || !side || !body) throw new Error("Missing fields");
  if (side !== "affirmative" && side !== "opposing" && side !== "neutral") {
    throw new Error("Invalid side");}

  await dbConnect();

  const debate = await Debate.findOne({ slug }).select({ _id: 1 }).lean() as { _id?: unknown } | null;
  if (!debate?._id) throw new Error("Debate not found");

  await Argument.create({
    debateId: debate._id,
    side,
    parentId: null,
    rootId: null,
    ancestors: [],
    depth: 0,
    title,
    body,
    authorId: null,
  });

    let incField: Record<string, 1>;
    if (side === "affirmative") {
      incField = { argsCountPro: 1 };
    } else if (side === "opposing") {
      incField = { argsCountCon: 1 };
    } else {
      incField = { argsCountNeutral: 1 };
    }
    
    await Debate.updateOne({ _id: debate._id }, { $inc: incField, $set: { lastActivityAt: new Date() } });

  return { ok: true };
}
