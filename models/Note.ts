import mongoose, { Schema, models, model, Document } from "mongoose";

export interface INote extends Document {
  title: string;
  description: string;
  fileUrl: string;
  publicId: string;
  uploadedBy: mongoose.Types.ObjectId;
  uploaderName: string;
  subject: string;
  branch: string;
  year: number;
  readers: mongoose.Types.ObjectId[];
  readerCount: number;
  createdAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    uploaderName: { type: String, required: true },
    subject: { type: String, required: true },
    branch: { type: String, default: "General" },
    year: { type: Number, default: 0 },
    readers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    readerCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Note || model<INote>("Note", NoteSchema);
