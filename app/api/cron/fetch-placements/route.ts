import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Placement from "@/models/Placement";

export const dynamic = "force-dynamic";

const KERALA_KEYWORDS = ["kerala", "kochi", "trivandrum", "technopark", "infopark", "ernakulam", "thiruvananthapuram", "calicut", "remote"];
const ROLE_KEYWORDS = ["fresher", "b.tech", "entry level", "associate", "graduate", "junior", "trainee", "intern"];
const EXCLUSION_KEYWORDS = ["senior", "manager", "director", "lead", "staff", "5+ years", "4+ years", "3+ years", "experienced"];

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
    title: "Software Engineer",
    location: "Trivandrum, Technopark",
    description: "Entry-level position for Kerala engineering college students. C++ or Java required.",
    link: "https://www.ibsplc.com/careers",
  },
  {
    company: "Google",
    title: "Senior Staff Engineer",
    location: "Bangalore",
    description: "Requires 10+ years of active experience.",
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

export async function GET(req: Request) {
  // 1. Authenticate Cron using Vercel CRON_SECRET
  const authHeader = req.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  let fetchedJobs: any[] = [];
  
  // 2. Fetch from SerpApi (Google Jobs) if key is present
  const serpApiKey = process.env.SERPAPI_KEY;
  if (serpApiKey && serpApiKey !== "your-serpapi-key") {
    try {
      const response = await fetch(`https://serpapi.com/search.json?engine=google_jobs&q=B.Tech+Fresher+software+jobs+Kerala&hl=en&gl=in&api_key=${serpApiKey}`);
      const data = await response.json();
      if (data.jobs_results) {
        fetchedJobs = data.jobs_results.map((j: any) => ({
          company: j.company_name,
          title: j.title,
          location: j.location,
          description: j.description,
          link: j.related_links?.[0]?.link || j.share_link,
        }));
      }
    } catch (e: any) {
      console.error("SerpApi Fetch failed, falling back to mock data.", e.message);
      fetchedJobs = MOCK_JOBS_FALLBACK;
    }
  } else {
    // Fallback to mock data for demonstration
    fetchedJobs = MOCK_JOBS_FALLBACK;
  }

  const newPlacements = [];

  // 3. Apply rigorous filtering logic
  for (const job of fetchedJobs) {
    const combinedText = `${job.title} ${job.description} ${job.location}`.toLowerCase();

    // Exclusion filter (block seniors)
    if (EXCLUSION_KEYWORDS.some(kw => combinedText.includes(kw))) continue;

    // Inclusion filter (must match at least one role keyword and one location keyword)
    const matchesLocation = KERALA_KEYWORDS.some(kw => combinedText.includes(kw));
    const matchesRole = ROLE_KEYWORDS.some(kw => combinedText.includes(kw));
    
    // For general remote fresher jobs we can relax the location rule, but let's be strict for KTU relevance
    if (!matchesLocation || !matchesRole) continue;

    // Check if already in DB to avoid duplicates
    const exists = await Placement.findOne({ company: job.company, role: job.title });
    if (exists) continue;

    // Auto-extract and map skills
    const skills = [];
    if (combinedText.includes("java")) skills.push("Java");
    if (combinedText.includes("rust")) skills.push("Rust");
    if (combinedText.includes("c++")) skills.push("C++");
    if (combinedText.includes("react")) skills.push("React");
    if (combinedText.includes("python")) skills.push("Python");
    if (combinedText.includes("sql")) skills.push("SQL");
    if (skills.length === 0) skills.push("Logic/Aptitude");

    // Standardize mapping for the DB model
    const newPlacement = {
      company: job.company,
      role: job.title,
      skills,
      ctcRange: combinedText.includes("intern") ? "Stipend based" : "Standard Fresher CTC",
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now as placeholder
      applyLink: job.link || "https://linkedin.com",
      branches: ["CSE", "ECE", "IT"], // Assume general tech branches
      eligibleYears: [3, 4],
      description: job.description?.substring(0, 300) + (job.description?.length > 300 ? "..." : ""),
      driveType: "Off-Campus", // Online scraped jobs are inherently off-campus
      minCgpa: combinedText.includes("7 cgpa") ? 7 : 0,
      backlogsAllowed: !combinedText.includes("no backlogs"),
    };

    newPlacements.push(newPlacement);
  }

  // 4. Save to Database
  if (newPlacements.length > 0) {
    await Placement.insertMany(newPlacements);
  }

  return NextResponse.json({ 
    message: "Placement Cron executed successfully", 
    processed: fetchedJobs.length, 
    added: newPlacements.length 
  });
}
