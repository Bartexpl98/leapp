import mongoose, { Schema, model, models } from "mongoose"; /// needs work

export type Side = "affirmative" | "opposing" | "neutral";

const EvidenceSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },     // specific evidence
  url: String,
  title: String,
  quote: String,
  locator: String, // page/section/timecode/etc.
}, { _id: true });

const ArgumentSchema = new Schema({
  debateId: { type: Schema.Types.ObjectId, ref: "Debate", index: true, required: true },
  side: { type: String, enum: ["affirmative", "opposing", "neutral"], index: true, required: true },

  // Threads
  parentId: { type: Schema.Types.ObjectId, ref: "Argument", index: true },
  rootId:   { type: Schema.Types.ObjectId, ref: "Argument", index: true },
  ancestors: [{ type: Schema.Types.ObjectId, ref: "Argument", index: true }],   // materialized path
  depth: { type: Number, default: 0 },

  //Content
  title: String,
  body: { type: String, required: true },
  evidence: [EvidenceSchema],
  targetEvidenceId: { type: Schema.Types.ObjectId },

  summary: String,       // Short preview text for debate listing
  score: { type: Number, default: 0 },
  replyCount: { type: Number, default: 0 },

  authorId: { type: Schema.Types.ObjectId, ref: "User", index: true },
}, { timestamps: true });

ArgumentSchema.index({ debateId: 1, side: 1, depth: 1, createdAt: -1 }); // list top level per side
ArgumentSchema.index({ parentId: 1, createdAt: 1 });    // children by parent
ArgumentSchema.index({ rootId: 1, createdAt: 1 });     // whole thread
ArgumentSchema.index({ score: -1, createdAt: -1 });     // top sorting
ArgumentSchema.index({ "evidence._id": 1 });    // target by evidence id

export default models.Argument || model("Argument", ArgumentSchema);
