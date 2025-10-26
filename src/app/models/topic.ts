import mongoose, { Schema, model, models } from "mongoose";
export interface ITopic {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
}

const TopicSchema = new Schema<ITopic>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
}, { timestamps: true });

export default models.Topic || model<ITopic>("Topic", TopicSchema);