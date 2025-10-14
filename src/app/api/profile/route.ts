import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/mongoose";
import User from "@/app/models/user";

export async function POST(req: Request) {
  try {
    const { email, name,nickname,phone,onboardingStep } = await req.json();
    
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    await dbConnect();
 
    const update: Record<string, unknown> = {};
    if (name !== undefined) update.name = name;
    if (nickname !== undefined) update.nickname = nickname;
    if (phone !== undefined) update.phone = phone;
    if (onboardingStep !== undefined) update.onboardingStep = onboardingStep;
    
    /*
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }*/

    
    const user = await User.findOneAndUpdate(
      { email },                                  // filter
      { $set: update, $setOnInsert: { email } },  // update
      { new: true, upsert: true }                 // options
    ).lean();

    return NextResponse.json({ message: "User updated", user });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}



