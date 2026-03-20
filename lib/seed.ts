import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI!;

async function seed() {
  if (!MONGODB_URI) {
    console.error("⚠️  Please configure MONGODB_URI in .env.local first!");
    console.log("   Get a free cluster at: https://cloud.mongodb.com");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const db = mongoose.connection.db!;

  // Seed moderator
  const modEmail = process.env.MOD_EMAIL || "admin@ieeelearn.com";
  const modPassword = process.env.MOD_PASSWORD || "IEEEAdmin2024!";
  const existing = await db.collection("users").findOne({ email: modEmail });

  if (!existing) {
    const hash = await bcrypt.hash(modPassword, 12);
    await db.collection("users").insertOne({
      name: "Admin Moderator",
      email: modEmail,
      passwordHash: hash,
      role: "moderator",
      branch: "CSE",
      year: 4,
      points: 0,
      streakDays: 0,
      lastActiveDate: null,
      badges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`✅ Moderator created: ${modEmail} / ${modPassword}`);
  } else {
    console.log("ℹ️  Moderator already exists");
  }

  // Seed sample questions
  const qCount = await db.collection("questions").countDocuments();
  if (qCount === 0) {
    await db.collection("questions").insertMany([
      {
        text: "What is the time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correctIndex: 1,
        explanation: "Binary search divides the search space in half each time, giving O(log n).",
        category: "coding",
        difficulty: "easy",
        approved: true,
        aiGenerated: false,
        weeklyExamId: null,
        isQOTD: false,
        qotdDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        text: "If 15% of a number is 45, what is the number?",
        options: ["200", "250", "300", "350"],
        correctIndex: 2,
        explanation: "45 / 0.15 = 300",
        category: "numerical",
        difficulty: "easy",
        approved: true,
        aiGenerated: false,
        weeklyExamId: null,
        isQOTD: false,
        qotdDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        text: "Choose the correct synonym of 'Pragmatic':",
        options: ["Idealistic", "Practical", "Theoretical", "Abstract"],
        correctIndex: 1,
        explanation: "Pragmatic means dealing with things sensibly and practically.",
        category: "verbal",
        difficulty: "easy",
        approved: true,
        aiGenerated: false,
        weeklyExamId: null,
        isQOTD: false,
        qotdDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        text: "Which data structure uses LIFO (Last In First Out)?",
        options: ["Queue", "Stack", "Array", "LinkedList"],
        correctIndex: 1,
        explanation: "A Stack follows LIFO - the last element added is the first to be removed.",
        category: "coding",
        difficulty: "easy",
        approved: true,
        aiGenerated: false,
        weeklyExamId: null,
        isQOTD: false,
        qotdDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        text: "A train 200m long passes a pole in 10 seconds. What is its speed?",
        options: ["20 km/h", "36 km/h", "72 km/h", "80 km/h"],
        correctIndex: 2,
        explanation: "Speed = 200/10 = 20 m/s = 20 × 3.6 = 72 km/h",
        category: "numerical",
        difficulty: "medium",
        approved: true,
        aiGenerated: false,
        weeklyExamId: null,
        isQOTD: false,
        qotdDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    console.log("✅ 5 sample questions seeded");
  }

  // Seed a sample roadmap
  const rmCount = await db.collection("roadmaps").countDocuments();
  if (rmCount === 0) {
    await db.collection("roadmaps").insertOne({
      skill: "Java",
      icon: "☕",
      description: "Master Java from basics to frameworks",
      approved: true,
      proposedByAI: false,
      nodes: [
        { title: "Variables & Data Types", description: "Learn primitive types, variables, and type casting", resources: ["docs.oracle.com/javase/tutorial"], questions: [{ text: "Which is not a primitive type in Java?", options: ["int", "String", "boolean", "char"], correctIndex: 1 }], order: 0 },
        { title: "Control Flow", description: "If-else, switch, for, while, do-while loops", resources: [], questions: [{ text: "Which loop runs at least once?", options: ["for", "while", "do-while", "foreach"], correctIndex: 2 }], order: 1 },
        { title: "OOP Concepts", description: "Classes, Objects, Inheritance, Polymorphism, Encapsulation", resources: [], questions: [{ text: "What enables 'is-a' relationship?", options: ["Encapsulation", "Inheritance", "Abstraction", "Polymorphism"], correctIndex: 1 }], order: 2 },
        { title: "Exception Handling", description: "Try-catch, throws, custom exceptions", resources: [], questions: [], order: 3 },
        { title: "Collections Framework", description: "List, Set, Map, Queue and their implementations", resources: [], questions: [{ text: "Which does not allow duplicates?", options: ["ArrayList", "LinkedList", "HashSet", "Vector"], correctIndex: 2 }], order: 4 },
        { title: "Multithreading", description: "Threads, synchronization, executors", resources: [], questions: [], order: 5 },
        { title: "JDBC & Databases", description: "Database connectivity, SQL basics, CRUD operations", resources: [], questions: [], order: 6 },
        { title: "Spring Framework", description: "Spring Boot, REST APIs, Dependency Injection", resources: [], questions: [], order: 7 },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ Java roadmap seeded");
  }

  // Seed Kerala engineering placements
  const pCount = await db.collection("placements").countDocuments();
  if (pCount === 0) {
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 2);
    const deadlineStr = deadline.toISOString();

    await db.collection("placements").insertMany([
      {
        company: "TCS",
        role: "Systems Engineer / Digital",
        skills: ["Java", "Python", "SQL", "Cloud Basics"],
        ctcRange: "3.36 - 7 LPA",
        deadline: deadlineStr,
        applyLink: "https://www.linkedin.com/jobs/tcs-jobs-kerala/",
        branches: ["CSE", "ECE", "EEE", "IT", "AI&DS"],
        eligibleYears: [3, 4],
        description: "TCS is hiring freshers across Kerala campuses. NQT score required. Digital roles for top performers.",
        driveType: "Pooled",
        minCgpa: 6.0,
        backlogsAllowed: false,
        createdAt: new Date(),
      },
      {
        company: "Infosys",
        role: "Systems Engineer / Power Programmer",
        skills: ["Java", "Python", "DBMS", "Data Structures"],
        ctcRange: "3.6 - 9.5 LPA",
        deadline: deadlineStr,
        applyLink: "https://www.linkedin.com/jobs/infosys-jobs-kerala/",
        branches: ["CSE", "ECE", "IT", "AI&DS"],
        eligibleYears: [3, 4],
        description: "Infosys on-campus and off-campus hiring. InfyTQ certified students get Power Programmer role at higher CTC.",
        driveType: "Pooled",
        minCgpa: 6.0,
        backlogsAllowed: false,
        createdAt: new Date(),
      },
      {
        company: "UST (formerly UST Global)",
        role: "Software Engineer Trainee",
        skills: ["React", "Node.js", "Java", "AWS"],
        ctcRange: "4 - 6 LPA",
        deadline: deadlineStr,
        applyLink: "https://www.linkedin.com/jobs/ust-global-jobs-thiruvananthapuram/",
        branches: ["CSE", "ECE", "IT"],
        eligibleYears: [3, 4],
        description: "UST headquartered in Trivandrum. Focus on full-stack and cloud roles. Strong training program for freshers.",
        driveType: "On-Campus",
        minCgpa: 6.5,
        backlogsAllowed: true,
        createdAt: new Date(),
      },
      {
        company: "IBS Software",
        role: "Associate Software Engineer",
        skills: ["Java", "Spring Boot", "Angular", "SQL"],
        ctcRange: "4.5 - 6.5 LPA",
        deadline: deadlineStr,
        applyLink: "https://www.linkedin.com/jobs/ibs-software-jobs-trivandrum/",
        branches: ["CSE", "IT", "ECE"],
        eligibleYears: [3, 4],
        description: "IBS Software (Trivandrum) - Global travel tech leader. Campus hiring for Java full-stack developers.",
        driveType: "On-Campus",
        minCgpa: 7.0,
        backlogsAllowed: false,
        createdAt: new Date(),
      },
      {
        company: "Envestnet | Yodlee",
        role: "Software Development Engineer",
        skills: ["Java", "Microservices", "React", "PostgreSQL"],
        ctcRange: "5.5 - 8 LPA",
        deadline: deadlineStr,
        applyLink: "https://www.linkedin.com/jobs/envestnet-jobs-trivandrum/",
        branches: ["CSE", "IT", "AI&DS"],
        eligibleYears: [3, 4],
        description: "Fintech company with Trivandrum office. Strong engineering culture and competitive packages.",
        driveType: "Off-Campus",
        minCgpa: 7.5,
        backlogsAllowed: false,
        createdAt: new Date(),
      },
      {
        company: "QBurst Technologies",
        role: "Software Engineer",
        skills: ["React", "Python", "Flutter", "Machine Learning"],
        ctcRange: "4 - 7 LPA",
        deadline: deadlineStr,
        applyLink: "https://www.linkedin.com/jobs/qburst-jobs-kochi/",
        branches: ["CSE", "IT", "AI&DS", "ECE"],
        eligibleYears: [3, 4],
        description: "QBurst (Trivandrum/Kochi) - Product engineering firm. Roles in web, mobile & ML projects.",
        driveType: "Off-Campus",
        minCgpa: 6.0,
        backlogsAllowed: true,
        createdAt: new Date(),
      },
      {
        company: "KPIT Technologies",
        role: "Engineer - Embedded Systems",
        skills: ["Embedded C", "AUTOSAR", "CAN Protocol", "RTOS"],
        ctcRange: "4 - 6 LPA",
        deadline: deadlineStr,
        applyLink: "https://www.linkedin.com/jobs/kpit-technologies-jobs/",
        branches: ["ECE", "EEE", "CSE"],
        eligibleYears: [3, 4],
        description: "Automotive embedded systems. Great for ECE/EEE students interested in VLSI and embedded domains.",
        createdAt: new Date(),
      },
      {
        company: "Tata Elxsi",
        role: "Engineer - VLSI / Embedded",
        skills: ["VHDL", "Verilog", "SystemVerilog", "UVM", "Embedded C"],
        ctcRange: "4.75 - 7 LPA",
        deadline: deadlineStr,
        applyLink: "https://www.linkedin.com/jobs/tata-elxsi-jobs-thiruvananthapuram/",
        branches: ["ECE", "EEE"],
        eligibleYears: [3, 4],
        description: "Tata Elxsi (Trivandrum) - Strong VLSI/Embedded division. Ideal for ECE students targeting chip design.",
        createdAt: new Date(),
      },
      {
        company: "Kerala State IT Mission (KSITM)",
        role: "Project Engineer",
        skills: ["Python", "Django", "PostgreSQL", "Linux"],
        ctcRange: "3.5 - 5 LPA",
        deadline: deadlineStr,
        applyLink: "https://www.linkedin.com/jobs/kerala-it-mission-jobs/",
        branches: ["CSE", "IT", "ECE"],
        eligibleYears: [4],
        description: "Government IT projects under KSITM. Stable roles in e-governance and public service platforms.",
        createdAt: new Date(),
      },
      {
        company: "Experion Technologies",
        role: "Trainee Software Engineer",
        skills: ["React", "Node.js", ".NET", "Azure"],
        ctcRange: "3.5 - 5.5 LPA",
        deadline: deadlineStr,
        applyLink: "https://www.linkedin.com/jobs/experion-technologies-jobs-kochi/",
        branches: ["CSE", "IT", "AI&DS"],
        eligibleYears: [3, 4],
        description: "Experion (Kochi/Trivandrum) - Digital product engineering. Freshers get 6-month structured training.",
        createdAt: new Date(),
      },
    ]);
    console.log("✅ 10 Kerala engineering placements seeded");
  }

  await mongoose.disconnect();
  console.log("\n🚀 Seed complete! Start the app with: npm run dev");
}

seed().catch(console.error);
