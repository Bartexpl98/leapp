import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth-options";
import { dbConnect } from "@/app/lib/mongoose";
import Debate from "@/app/models/debate";
import Topic from "@/app/models/topic";
import User from "@/app/models/user";
import type { Types } from "mongoose";

type CreateDebateBody = {
  question: string;
  summary?: string;
  topicSlugs: string[];
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlug(base: string) {
  let s = base;
  let i = 2;

  while (true) {                                                            // not a great solution, perhaps make my own slugifier file?
    const exists = await Debate.findOne({ slug: s }).select("_id").lean();
    if (!exists) return s;
    s = `${base}-${i++}`;
  }
}

export async function POST(req: Request) {
  try {

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Not signed in" }, { status: 401 });
    }

    await dbConnect();
    const body = (await req.json()) as Partial<CreateDebateBody>;


    const question = String(body?.question || "").trim();
    const summary = typeof body?.summary === "string" ? body.summary.trim() : "";
    const topicSlugs: string[] = Array.isArray(body?.topicSlugs) ? body.topicSlugs : [];

    if (!question) {
      return NextResponse.json({ message: "Question is needed" }, { status: 400 });
    }
    if (!topicSlugs.length) {
      return NextResponse.json({ message: "Select at least one topic" }, { status: 400 });
    }


    const user = await User.findOne({ email: session.user.email })
      .select({ _id: 1 })
      .lean<{ _id: Types.ObjectId } | null>();

    if (!user?._id) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    const firstSlug = topicSlugs[0];
    const primaryTopic = await Topic.findOne({ slug: firstSlug }).select("_id").lean<{ _id: Types.ObjectId } | null>();

    if (!primaryTopic?._id) {
      return NextResponse.json({ message: `Topic not found: ${firstSlug}` }, { status: 400 });
    }

    const base = slugify(question);
    const slug = await uniqueSlug(base);

    const created = await Debate.create({
      topicId: primaryTopic._id,
      question,
      slug,
      summary: summary || undefined,
      topics: topicSlugs,          
      lastActivityAt: new Date(),
      authorId: user._id,       
    // argsCountPro/Con  ? defaults (0)?
    });

    return NextResponse.json({ id: String(created._id), slug: created.slug }, { status: 201 });
  } catch (err: unknown) {
      console.error("Create debate error:", err);
      const message = err instanceof Error ? err.message : "Server error";
      return NextResponse.json({ message }, { status: 500 });
}
}

// GET Handler?
// export async function GET(req: Request) { ... } ?
