import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function check() {
  const key = process.env.GEMINI_API_KEY;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
  const data = await res.json();
  const valid = data.models
    ?.filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
    .map((m) => m.name.replace("models/", ""));
  console.log(JSON.stringify(valid));
}
check();
