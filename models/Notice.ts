import mongoose, { Schema, Document } from "mongoose";

export interface INotice extends Document {
  title: string;
  body: string;
  imageUrl: string;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  pinned: boolean;
  createdAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Notice || mongoose.model<INotice>("Notice", NoticeSchema);
