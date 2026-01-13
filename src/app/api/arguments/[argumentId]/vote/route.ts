import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { dbConnect } from "@/app/lib/mongoose";
import Argument from "@/app/models/argument";
import ArgumentVote from "@/app/models/argumentVote";
import User from "@/app/models/user";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth-options";

type VoteValue = 1 | -1 | null;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ argumentId: string }> }
) {
  const { argumentId: argumentIdParam } = await params;
  try {
    await dbConnect();

    // Auth
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Figure out Mongo user id (prefer session.user.id, fallback to email lookup)
    let userObjectId: mongoose.Types.ObjectId | null = null;

    const sessionId = authSession.user.id;
    if (typeof sessionId === "string" && mongoose.Types.ObjectId.isValid(sessionId)) {
      userObjectId = new mongoose.Types.ObjectId(sessionId);
    } else {
      const user = await User.findOne({ email: authSession.user.email })
        .select("_id")
        .lean<{ _id: mongoose.Types.ObjectId } | null>();

      if (!user?._id) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      userObjectId = user._id;
    }

    // Validate argumentId
    if (!mongoose.Types.ObjectId.isValid(argumentIdParam)) {
      return NextResponse.json({ message: "Invalid argument id" }, { status: 400 });
    }
    const argumentId = new mongoose.Types.ObjectId(argumentIdParam);

    // Parse JSON
    const body = await req.json().catch(() => null) as
      | { soundness?: VoteValue; factuality?: VoteValue }
      | null;

    if (!body) {
      return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }

    const { soundness, factuality } = body;

    const isValid = (v: unknown) => v === 1 || v === -1 || v === null;

    if (
      (soundness !== undefined && !isValid(soundness)) ||
      (factuality !== undefined && !isValid(factuality))
    ) {
      return NextResponse.json({ message: "Invalid vote value" }, { status: 400 });
    }

    if (soundness === undefined && factuality === undefined) {
      return NextResponse.json({ message: "No vote provided" }, { status: 400 });
    }

    const mongoSession = await mongoose.startSession();

    // Transaction is an all or nothing approach to avoid half-updates
    try {
      const result = await mongoSession.withTransaction(async () => {
        const argument = await Argument.findById(argumentId)
          .session(mongoSession)
          .select("_id debateId evidence voteAggregate");

        if (!argument) {
          return { status: 404, data: { message: "Argument not found" } };
        }

        const existing = await ArgumentVote.findOne({
          argumentId: argument._id,
          userId: userObjectId,
        }).session(mongoSession);

        const prevSound: VoteValue = existing?.soundness ?? null;
        const prevFact: VoteValue = existing?.factuality ?? null;

        const nextSound: VoteValue = soundness === undefined ? prevSound : soundness === prevSound ? null : soundness;
        const nextFact: VoteValue = factuality === undefined ? prevFact : factuality === prevFact ? null : factuality;

      
        const deltaSoundSum = (nextSound ?? 0) - (prevSound ?? 0);
        const deltaFactSum = (nextFact ?? 0) - (prevFact ?? 0);

        const deltaSoundCount =
          prevSound === null && nextSound !== null ? 1 :
          prevSound !== null && nextSound === null ? -1 : 0;

        const deltaFactCount =
          prevFact === null && nextFact !== null ? 1 :
          prevFact !== null && nextFact === null ? -1 : 0;

        if (nextSound === null && nextFact === null) {
          if (existing) {
            await ArgumentVote.deleteOne({ _id: existing._id }).session(mongoSession);
          }
        } else if (!existing) {
          await ArgumentVote.create(
            [{
              argumentId: argument._id,
              debateId: argument.debateId,
              userId: userObjectId,
              soundness: nextSound,
              factuality: nextFact,
            }],
            { session: mongoSession }
          );
        } else {
          existing.soundness = nextSound;
          existing.factuality = nextFact;
          await existing.save({ session: mongoSession });
        }

        const inc: Record<string, number> = {};
        if (deltaSoundSum !== 0) inc["voteAggregate.soundness.sum"] = deltaSoundSum;
        if (deltaSoundCount !== 0) inc["voteAggregate.soundness.count"] = deltaSoundCount;
        if (deltaFactSum !== 0) inc["voteAggregate.factuality.sum"] = deltaFactSum;
        if (deltaFactCount !== 0) inc["voteAggregate.factuality.count"] = deltaFactCount;

        if (Object.keys(inc).length > 0) {
          await Argument.updateOne({ _id: argument._id }, { $inc: inc }).session(mongoSession);
        }

        const updated = await Argument.findById(argument._id)
          .session(mongoSession)
          .select("voteAggregate");

        const safeVoteAggregate = updated?.voteAggregate ?? {
            soundness: { sum: 0, count: 0 },
            factuality: { sum: 0, count: 0 },};
        
        return {
          status: 200,
          data: {
            myVote: { soundness: nextSound, factuality: nextFact },
            voteAggregate: safeVoteAggregate,
          },
        };
      });

      return NextResponse.json(result.data, { status: result.status });
    } finally {
      mongoSession.endSession();
    }

  } catch (err: unknown) {
    console.error("Vote error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ message }, { status: 500 });
  }

}
