import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
import User, { IUser } from "@/app/models/user"; // ✅ correct import
import { dbConnect } from "@/app/lib/mongoose";  // ✅ consistent import
import { authOptions } from "@/app/lib/auth";

export async function POST(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ typed request body (partial user)
  const body: Partial<IUser> = await req.json();

  // ✅ allowed updates
  const allowedUpdates = [
    "name",
    "preferences.theme",
    "preferences.language",
    "preferences.notifications",
  ] as const;

  // ✅ avoid `any`
  const update: Record<string, unknown> = {};

  for (const key of allowedUpdates) {
    const value = key.split(".").reduce<unknown>(
      (obj, k) =>
        obj && typeof obj === "object" ? (obj as Record<string, unknown>)[k] : undefined,
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
