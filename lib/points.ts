import dbConnect from "@/lib/db";
import User from "@/models/User";
import PointEvent from "@/models/PointEvent";

export type PointEventType =
  | "quiz_correct"
  | "daily_login"
  | "streak_bonus"
  | "note_upload"
  | "note_read_milestone"
  | "roadmap_node_complete"
  | "sprint_complete"
  | "weekly_exam"
  | "qotd_correct";

const POINT_VALUES: Record<PointEventType, number> = {
  quiz_correct: 10,
  daily_login: 5,
  streak_bonus: 15,
  note_upload: 20,
  note_read_milestone: 10,
  roadmap_node_complete: 25,
  sprint_complete: 30,
  weekly_exam: 50,
  qotd_correct: 15,
};

export async function awardPoints(
  userId: string,
  event: PointEventType,
  metadata: Record<string, any> = {}
): Promise<number> {
  await dbConnect();
  const points = POINT_VALUES[event] || 0;

  await PointEvent.create({
    userId,
    event,
    points,
    metadata,
  });

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { points } },
    { new: true }
  );

  return user?.points || 0;
}

export async function resetMonthlyLeaderboard(): Promise<void> {
  await dbConnect();
  await User.updateMany({}, { points: 0 });
  console.log("Monthly leaderboard reset completed");
}

export { POINT_VALUES };
