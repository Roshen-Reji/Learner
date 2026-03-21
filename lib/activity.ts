import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function recordActivity(userId: string): Promise<void> {
  await dbConnect();
  
  const user = await User.findById(userId);
  if (!user) return;

  const now = new Date();
  
  if (!user.lastActiveDate) {
    // First time ever doing an activity
    user.streakDays = 1;
    user.lastActiveDate = now;
    await user.save();
    return;
  }

  // Calculate calendar days difference
  // Strip time components to strictly compare YYYY-MM-DD
  const lastActive = new Date(user.lastActiveDate);
  const startOfLastActive = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = startOfToday.getTime() - startOfLastActive.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Activating on the very next calendar day
    user.streakDays += 1;
    user.lastActiveDate = now;
    await user.save();
  } else if (diffDays > 1) {
    // Missed at least one calendar day, reset streak to 1
    user.streakDays = 1;
    user.lastActiveDate = now;
    await user.save();
  } else if (diffDays === 0) {
    // Active again on the same calendar day, just update the timestamp
    user.lastActiveDate = now;
    await user.save();
  }
}
