import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Placement from "@/models/Placement";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "moderator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch("https://remotive.com/api/remote-jobs?category=software-dev&limit=100");
    if (!res.ok) throw new Error("Failed to fetch from Remotive API");
    
    const data = await res.json();
    const jobs = data.jobs || [];

    // Filter tightly for India or Global remote Software roles
    const relevantJobs = jobs.filter((j: any) => {
      const loc = j.candidate_required_location?.toLowerCase() || "";
      const title = j.title?.toLowerCase() || "";
      
      const isIndiaOrGlobal = loc.includes("india") || loc.includes("worldwide") || loc.includes("anywhere");
      const isSoftware = title.includes("engineer") || title.includes("developer") || title.includes("tech") || title.includes("intern") || title.includes("fresher");
      
      return isIndiaOrGlobal && isSoftware;
    });

    if (relevantJobs.length === 0) {
      return NextResponse.json({ message: "No relevant India/Global jobs available to sync right now." });
    }

    await dbConnect();

    // Clean up extremely old auto-imported jobs (e.g. > 15 days)
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    await Placement.deleteMany({ driveType: "Off-Campus", description: { $regex: /Auto-Sourced API/i }, createdAt: { $lt: fifteenDaysAgo } });

    let newJobsCount = 0;

    for (const job of relevantJobs.slice(0, 10)) { // Limit to top 10 most recent relevant
      const exists = await Placement.findOne({
        company: job.company_name,
        role: job.title,
      });

      if (!exists) {
        const skills = job.tags ? job.tags.slice(0, 5) : ["Software Development", "Programming"];
        
        const deadlineDate = new Date();
        deadlineDate.setDate(deadlineDate.getDate() + 30);

        let plainDesc = job.description ? job.description.replace(/<[^>]+>/g, ' ').substring(0, 200) + "..." : "Remote Software Engineering Opportunity.";

        await Placement.create({
          company: job.company_name,
          role: job.title,
          skills: skills,
          ctcRange: job.salary ? job.salary : "Competitive",
          deadline: deadlineDate,
          applyLink: job.url,
          branches: ["CSE", "IT", "ECE", "AI&DS"],
          eligibleYears: [3, 4],
          description: `Location: ${job.candidate_required_location} (Auto-Sourced API)\n\n${plainDesc}`,
          driveType: "Off-Campus", // Mapped for our Kerala schema
          minCgpa: 0, // General remote jobs typically don't have KTU CGPA strictness
          backlogsAllowed: true, // Often true for off-campus general drives
        });

        newJobsCount++;
      }
    }

    return NextResponse.json({ 
      message: `Synced successfully. Filtered ${relevantJobs.length} potential roles. Added ${newJobsCount} new relevant jobs.`,
      added: newJobsCount
    });

  } catch (error: any) {
    console.error("Placement Sync Error:", error);
    return NextResponse.json({ error: error.message || "Failed to sync jobs" }, { status: 500 });
  }
}
