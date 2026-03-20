import mongoose, { Schema, Document } from "mongoose";

export interface IGlobalChat extends Document {
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  text: string;
  createdAt: Date;
}

const GlobalChatSchema: Schema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderName: { type: String, required: true },
    text: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.models.GlobalChat || mongoose.model<IGlobalChat>("GlobalChat", GlobalChatSchema);
