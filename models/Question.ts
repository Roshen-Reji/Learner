import mongoose, { Schema, models, model, Document } from "mongoose";

export interface IQuestion extends Document {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: "coding" | "numerical" | "verbal";
  difficulty: "easy" | "medium" | "hard";
  approved: boolean;
  aiGenerated: boolean;
  weeklyExamId: string | null;
  isQOTD: boolean;
  qotdDate: Date | null;
  attemptedBy: mongoose.Types.ObjectId[];
  correctBy: mongoose.Types.ObjectId[];
  isHighIQ: boolean;
  targetBranch?: string;
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctIndex: { type: Number, required: true },
    explanation: { type: String, default: "" },
    category: {
      type: String,
      enum: ["coding", "numerical", "verbal"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    approved: { type: Boolean, default: false },
    aiGenerated: { type: Boolean, default: false },
    weeklyExamId: { type: String, default: null },
    isQOTD: { type: Boolean, default: false },
    qotdDate: { type: Date, default: null },
    attemptedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    correctBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isHighIQ: { type: Boolean, default: false },
    targetBranch: { type: String, default: "General" },
  },
  { timestamps: true }
);

export default models.Question || model<IQuestion>("Question", QuestionSchema);
