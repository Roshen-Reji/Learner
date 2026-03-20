import mongoose, { Schema, models, model, Document } from "mongoose";

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  roadmapId: mongoose.Types.ObjectId;
  completedNodes: number[];
  answeredQuestions: {
    questionId: string;
    correct: boolean;
    answeredAt: Date;
  }[];
  createdAt: Date;
}

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    roadmapId: { type: Schema.Types.ObjectId, ref: "Roadmap", required: true },
    completedNodes: [{ type: Number }],
    answeredQuestions: [
      {
        questionId: { type: String },
        correct: { type: Boolean },
        answeredAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

UserProgressSchema.index({ userId: 1, roadmapId: 1 }, { unique: true });

export default models.UserProgress || model<IUserProgress>("UserProgress", UserProgressSchema);
