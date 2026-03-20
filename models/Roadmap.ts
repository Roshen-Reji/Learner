import mongoose, { Schema, models, model, Document } from "mongoose";

export interface IRoadmapNode {
  title: string;
  description: string;
  resources: string[];
  questions: {
    text: string;
    options: string[];
    correctIndex: number;
  }[];
  order: number;
}

export interface IRoadmap extends Document {
  skill: string;
  icon: string;
  description: string;
  nodes: IRoadmapNode[];
  approved: boolean;
  proposedByAI: boolean;
  createdBy: mongoose.Types.ObjectId | null;
  createdAt: Date;
}

const RoadmapNodeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  resources: [{ type: String }],
  questions: [
    {
      text: { type: String, required: true },
      options: [{ type: String }],
      correctIndex: { type: Number, required: true },
    },
  ],
  order: { type: Number, required: true },
});

const RoadmapSchema = new Schema<IRoadmap>(
  {
    skill: { type: String, required: true },
    icon: { type: String, default: "📚" },
    description: { type: String, default: "" },
    nodes: [RoadmapNodeSchema],
    approved: { type: Boolean, default: false },
    proposedByAI: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default models.Roadmap || model<IRoadmap>("Roadmap", RoadmapSchema);
