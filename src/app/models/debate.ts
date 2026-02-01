import mongoose, { Schema, model, models } from "mongoose";
export interface IDebate {
  _id: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  question: string;
  slug: string;
  summary?: string;
  lastActivityAt?: Date;
  argsCountPro: number;
  argsCountCon: number;
  argsCountNeutral: number;
  topics: string[];
  authorId: mongoose.Types.ObjectId;

}

const DebateSchema = new Schema<IDebate>({
  topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true, index: true },
  question: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  summary: { type: String },                       
  lastActivityAt: { type: Date, index: true },   
  argsCountPro: { type: Number, default: 0, index: true },
  argsCountCon: { type: Number, default: 0, index: true },
  argsCountNeutral: {type: Number, default: 0, index: true},
  
  topics: [{ type: String, index: true }],

  authorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false, // false for now to not break old debates.
    index: true,
  },
}, { timestamps: true });

DebateSchema.index({ topicId: 1, createdAt: -1 });
DebateSchema.index({ createdAt: -1 });
DebateSchema.index({ lastActivityAt: -1 });
DebateSchema.index({ argsCountPro: -1, argsCountCon: -1, lastActivityAt: -1 });

DebateSchema.index({ authorId: 1, createdAt: -1 }); // to show debates by user


export default models.Debate || model<IDebate>("Debate", DebateSchema);