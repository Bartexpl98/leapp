import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import User, { IUser } from "@/app/models/user"; // ✅ import both properly
import { dbConnect } from "@/app/lib/mongoose";  // ✅ consistent import
import { authOptions } from "@/app/lib/auth";

export async function POST(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ explicitly type request body
  const body: Partial<IUser> = await req.json();

  // ✅ define allowed keys
  const allowedUpdates = [
    "name",
    "preferences.theme",
    "preferences.language",
    "preferences.notifications",
  ] as const;

  // ✅ use safer typing — avoid `any`
  const update: Record<string, unknown> = {};

  for (const key of allowedUpdates) {
    // use type-safe access (optional chaining)
    const value = key.split(".").reduce<unknown>(
      (obj, k) => (obj && typeof obj === "object" ? (obj as Record<string, unknown>)[k] : undefined),
      body
    );

    if (value !== undefined) {
      update[key] = value;
    }
  }

  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    { $set: update },
    { new: true, runValidators: true }
  );

  return NextResponse.json(user);
}
