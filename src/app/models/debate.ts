import mongoose, { Schema, model, models } from "mongoose";
export interface IDebate {
  _id: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  question: string;
  slug: string;
}

const DebateSchema = new Schema<IDebate>({
  topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true, index: true },
  question: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
}, { timestamps: true });

// For topic listing by recency:
DebateSchema.index({ topicId: 1, createdAt: -1 });

export default models.Debate || model<IDebate>("Debate", DebateSchema);