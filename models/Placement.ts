import mongoose, { Schema, models, model, Document } from "mongoose";

export interface IPlacement extends Document {
  company: string;
  role: string;
  skills: string[];
  ctcRange: string;
  deadline: Date;
  applyLink: string;
  branches: string[];
  eligibleYears: number[];
  description: string;
  driveType: "On-Campus" | "Off-Campus" | "Pooled";
  minCgpa: number;
  backlogsAllowed: boolean;
  createdAt: Date;
}

const PlacementSchema = new Schema<IPlacement>(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    skills: [{ type: String }],
    ctcRange: { type: String, default: "" },
    deadline: { type: Date },
    applyLink: { type: String, default: "" },
    branches: [{ type: String }],
    eligibleYears: [{ type: Number }],
    description: { type: String, default: "" },
    driveType: { type: String, enum: ["On-Campus", "Off-Campus", "Pooled"], default: "Off-Campus" },
    minCgpa: { type: Number, default: 0 },
    backlogsAllowed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Placement || model<IPlacement>("Placement", PlacementSchema);
