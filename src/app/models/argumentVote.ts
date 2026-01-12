import { Schema, model, models } from "mongoose";

type VoteValue = -1 | 1;

const ArgumentVoteSchema = new Schema(
  {
    argumentId: { type: Schema.Types.ObjectId, ref: "Argument", required: true, index: true },
    debateId: { type: Schema.Types.ObjectId, ref: "Debate", required: true, index: true }, // might be useful for analytics
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    soundness: { type: Number, enum: [-1, 1], default: null},
    factuality: { type: Number, enum: [-1, 1], default: null },

  },
  { timestamps: true }
);

ArgumentVoteSchema.index({ argumentId: 1, userId: 1 }, { unique: true }); // one vote per user per argument
ArgumentVoteSchema.index({ userId: 1, createdAt: -1}); // My votes pretty sure

export default models.ArgumentVote || model("ArgumentVote", ArgumentVoteSchema);