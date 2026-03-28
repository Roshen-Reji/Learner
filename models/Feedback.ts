import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  text: string;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    text: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
);

export default mongoose.models.Feedback || mongoose.model<IFeedback>("Feedback", FeedbackSchema);
