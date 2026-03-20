import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;
  const genAI = new GoogleGenerativeAI(apiKey);

  const models = ["gemini-2.0-flash", "gemini-2.5-flash", "gemma-2-9b-it", "gemini-1.5-flash"];
  
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hello?");
      console.log(`SUCCESS [${m}]: ${result.response.text()}`);
    } catch (e) {
      console.error(`FAILED [${m}]: ${e.status} - ${e.message.split("\\n")[0].substring(0, 100)}`);
    }
  }
}

test();
