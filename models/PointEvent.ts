import mongoose, { Schema, models, model, Document } from "mongoose";

export interface IPointEvent extends Document {
  userId: mongoose.Types.ObjectId;
  event: string;
  points: number;
  metadata: Record<string, any>;
  createdAt: Date;
}

const PointEventSchema = new Schema<IPointEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: String, required: true },
    points: { type: Number, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default models.PointEvent || model<IPointEvent>("PointEvent", PointEventSchema);
