import mongoose, { Schema, models, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "student" | "moderator";
  branch: string;
  year: number;
  points: number;
  streakDays: number;
  lastActiveDate: Date | null;
  badges: string[];
  roadmapCap: number;
  isPremium: boolean;
  lastSprintStart: Date | null;
  ieeeMembershipCard: string;
  ieeeVerified: boolean;
  ieeeVerifiedAt: Date | null;
  githubUsername: string;
  githubConnected: boolean;
  githubAccessToken: string;
  githubPoints: number;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["student", "moderator"], default: "student" },
    branch: { type: String, default: "CSE" },
    year: { type: Number, default: 1 },
    points: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
    badges: [{ type: String }],
    roadmapCap: { type: Number, default: 3 },
    isPremium: { type: Boolean, default: false },
    lastSprintStart: { type: Date, default: null },
    ieeeMembershipCard: { type: String, default: "" },
    ieeeVerified: { type: Boolean, default: false },
    ieeeVerifiedAt: { type: Date, default: null },
    githubUsername: { type: String, default: "" },
    githubConnected: { type: Boolean, default: false },
    githubAccessToken: { type: String, default: "" },
    githubPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", UserSchema);
