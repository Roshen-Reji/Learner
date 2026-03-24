import dbConnect from "./lib/db";
import Placement from "./models/Placement";

async function run() {
  await dbConnect();
  const all = await Placement.find({});
  console.log("Total placements in DB:", all.length);
  if (all.length > 0) {
    console.log("Sample:", JSON.stringify(all[0], null, 2));
  }
  process.exit(0);
}

run();
