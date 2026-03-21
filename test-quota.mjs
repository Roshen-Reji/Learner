import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.local" });

async function check() {
  const key = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(key);

  const models = JSON.parse(fs.readFileSync("models_fixed.json", "utf8"));
  const successfulModels = [];
  
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      await model.generateContent("Say hi");
      successfulModels.push(m);
    } catch (e) {
      // Failed
    }
  }
  
  fs.writeFileSync("working_models.json", JSON.stringify(successfulModels, null, 2), "utf8");
}

check();
