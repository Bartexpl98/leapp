import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/mongoose";
import User, { IUser } from "@/app/models/user";

type ProfileUpdate = {
  id: string;
  name?: string;
  nickname?: string;
  phone?: string;
  onboardingStep?: number;
};

export async function POST(req: Request) {
  try {
    const { id, name, nickname, phone, onboardingStep }: ProfileUpdate =
      await req.json();

    console.log("Incoming profile update:", { id, name, nickname, phone });

    if (!id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // ✅ Use Partial<IUser> instead of 'any'
    const update: Partial<IUser> = {};

    if (name !== undefined) update.name = name;
    if (nickname !== undefined) update.nickname = nickname;
    if (phone !== undefined) update.phone = phone;
    if (onboardingStep !== undefined) update.onboardingStep = onboardingStep;
    update.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(id, update, { new: true });
    console.log("Updated user:", user);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Profile updated successfully", user },
      { status: 200 }
    );
  } catch (err) {
    // ✅ TypeScript-safe error handling
    const error = err instanceof Error ? err : new Error("Unknown error");
    console.error(error);

    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
