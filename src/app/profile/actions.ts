"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth-options";
import { dbConnect } from "@/app/lib/mongoose";
import User from "@/app/models/user";

const s = (v: FormDataEntryValue | null) => (typeof v === "string" && v.trim().length ? v.trim() : undefined);

type UpdatePayload = {
  nickname?: string;
};

export async function saveProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) throw new Error("Not signed in");

  const update: UpdatePayload = {};
  const nickname = s(formData.get("nickname"));
  if (nickname !== undefined) update.nickname = nickname;

  await dbConnect();
  await User.findOneAndUpdate({ email }, { $set: update }, { new: true }).lean();

  return { ok: true };
}
