import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Placement from "@/models/Placement";

export const dynamic = "force-dynamic";

// Expanded to allow inclusive global/remote and India-wide roles
const LOCATION_KEYWORDS = ["kerala", "kochi", "trivandrum", "technopark", "infopark", "ernakulam", "thiruvananthapuram", "calicut", "remote", "worldwide", "anywhere", "india", "global"];
const ROLE_KEYWORDS = ["fresher", "b.tech", "entry level", "associate", "graduate", "junior", "trainee", "intern", "internship", "apprentice"];
const EXCLUSION_KEYWORDS = ["senior", "manager", "director", "lead", "staff", "5+ years", "4+ years", "3+ years", "experienced", "principal"];

const MOCK_JOBS_FALLBACK = [
  {
    company: "TCS",
    title: "System Engineer Trainee",
    location: "Kochi, Kerala",
    description: "Looking for fresh B.Tech graduates for our Kochi Infopark campus. Must have good logical skills.",
    link: "https://www.tcs.com/careers/fresher",
  },
  {
    company: "IBS Software",
    title: "Software Engineer Intern",
    location: "Trivandrum",
    description: "6 month paid internship for Kerala engineering college students. C++ or Java required.",
    link: "https://www.ibsplc.com/careers",
  },
  {
    company: "Google",
    title: "Software Engineering Intern",
    location: "Bangalore",
    description: "Summer internship for pre-final year students. Strong DSA skills required.",
    link: "https://careers.google.com/",
  },
  {
    company: "Nissan Digital",
    title: "Data Analyst Intern",
    location: "Trivandrum",
    description: "6 month internship leading to full time. Fresher B.Tech CSE/IT.",
    link: "https://nissan.com/careers",
  }
];

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "moderator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  let fetchedJobs: any[] = [...MOCK_JOBS_FALLBACK];

  // 1. Try Google Jobs via SerpAPI
  const serpApiKey = process.env.SERPAPI_KEY;
  if (serpApiKey && serpApiKey !== "your-serpapi-key") {
    try {
      const response = await fetch(`https://serpapi.com/search.json?engine=google_jobs&q=B.Tech+Fresher+software+internship+india&hl=en&gl=in&api_key=${serpApiKey}`);
      const data = await response.json();
      if (data.jobs_results) {
        const serpJobs = data.jobs_results.map((j: any) => ({
          company: j.company_name,
          title: j.title,
          location: j.location,
          description: j.description,
          link: j.related_links?.[0]?.link || j.share_link,
        }));
        fetchedJobs = [...fetchedJobs, ...serpJobs];
      }
    } catch (e: any) {
      console.error("SerpApi Fetch failed.", e.message);
    }
  }

  // 2. Try Remotive API (focusing on globally remote software roles)
  try {
    const remotiveRes = await fetch("https://remotive.com/api/remote-jobs?category=software-dev&limit=50");
    const remotiveData = await remotiveRes.json();
    if (remotiveData.jobs) {
      const remotiveJobs = remotiveData.jobs.map((j: any) => ({
        company: j.company_name,
        title: j.title,
        location: j.candidate_required_location || "Remote Worldwide",
        description: j.description ? j.description.replace(/<[^>]+>/g, ' ') : "",
        link: j.url,
      }));
      fetchedJobs = [...fetchedJobs, ...remotiveJobs];
    }
  } catch (e: any) {
    console.error("Remotive Fetch failed.", e.message);
  }

  const newPlacements = [];

  for (const job of fetchedJobs) {
    if (!job.title || !job.company) continue;

    const combinedText = `${job.title} ${job.description || ""} ${job.location || ""}`.toLowerCase();

    if (EXCLUSION_KEYWORDS.some(kw => combinedText.includes(kw))) continue;

    // Must map to an acceptable location (India / Kerala / Remote / Global)
    const matchesLocation = LOCATION_KEYWORDS.some(kw => combinedText.includes(kw));
    // Must map to an acceptable entry level title (Intern / Fresher / Junior)
    const matchesRole = ROLE_KEYWORDS.some(kw => combinedText.includes(kw));

    if (!matchesLocation || !matchesRole) continue;

    const exists = await Placement.findOne({ company: job.company, role: job.title });
    if (exists) continue;

    const skills = [];
    if (combinedText.includes("java") && !combinedText.includes("javascript")) skills.push("Java");
    if (combinedText.includes("javascript") || combinedText.includes("js")) skills.push("JavaScript");
    if (combinedText.includes("c++")) skills.push("C++");
    if (combinedText.includes("react")) skills.push("React");
    if (combinedText.includes("python")) skills.push("Python");
    if (combinedText.includes("node")) skills.push("Node.js");
    if (combinedText.includes("sql")) skills.push("SQL");
    if (skills.length === 0) skills.push("Software Engineering");

    const isIntern = combinedText.includes("intern") || combinedText.includes("apprentice");

    const newPlacement = {
      company: job.company,
      role: job.title,
      skills,
      ctcRange: isIntern ? "Stipend Provided" : "Standard Fresher CTC",
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      applyLink: job.link || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(job.company)}`,
      branches: ["CSE", "ECE", "IT", "AI&DS"], // broadened branches
      eligibleYears: isIntern ? [2, 3, 4] : [4], // 2nd/3rd years eligible for internships!
      description: job.description?.substring(0, 300) + (job.description?.length > 300 ? "..." : " (Auto-Sourced)"),
      driveType: "Off-Campus",
      minCgpa: combinedText.includes("7 cgpa") ? 7 : 0,
      backlogsAllowed: !combinedText.includes("no backlogs"),
    };

    newPlacements.push(newPlacement);
  }

  if (newPlacements.length > 0) {
    await Placement.insertMany(newPlacements);
  }

  return NextResponse.json({
    message: `Placement sync successfully retrieved ${fetchedJobs.length} potential roles and added ${newPlacements.length} new Internships/Fresher jobs!`,
    processed: fetchedJobs.length,
    added: newPlacements.length
  });
}

