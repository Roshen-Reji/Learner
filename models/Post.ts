import mongoose, { Schema, models, model, Document } from "mongoose";

export interface IPost extends Document {
  title: string;
  body: string;
  author: mongoose.Types.ObjectId;
  authorName: string;
  replies: {
    body: string;
    author: mongoose.Types.ObjectId;
    authorName: string;
    createdAt: Date;
  }[];
  upvotes: mongoose.Types.ObjectId[];
  tags: string[];
  createdAt: Date;
}

const ReplySchema = new Schema({
  body: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  authorName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    replies: [ReplySchema],
    upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default models.Post || model<IPost>("Post", PostSchema);
