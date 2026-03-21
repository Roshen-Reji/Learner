<<<<<<< HEAD
# Learner
A Website made for Students particularily from KTU Engineering Students
=======
# IEEE Learn Platform

An interactive and comprehensive learning platform tailored for IEEE student members. The platform focuses on gamified aptitude learning, structured roadmaps, personal note-taking, and provides an engaging, responsive experience across all devices.

---

## 🌟 Key Features

### 1. Interactive Roadmaps
- **Dynamic Learning Paths:** Visual, step-by-step timelines guiding students through various skills and subjects.
- **Progress Tracking:** Users can track their progress as they complete milestones.
- **Responsive Carousel UI:** Smooth mobile and desktop navigation tailored with a modern glassy aesthetic.

### 2. Gamified Aptitude Tests
- **Interactive Quizzes:** Practice and test logical, technical, and quantitative aptitude skills.
- **AI-Assisted Question Generation:** Automatically generate daily questions using Google Generative AI when the question pool runs low.
- **Leaderboards:** Competitive ranking system where users earn points for correct answers.
- **Fair Play Enforcement:** Built-in safeguards to prevent point farming and enforce one attempt per question.

### 3. Personal Notes Management
- **In-App Note Taking:** Create, read, update, and delete personal study notes directly within the platform.
- **Cloud Storage Integration:** Attach and store media using UploadThing & Cloudinary.

### 4. Progressive Web App (PWA) Support
- **Installable:** Allows users to install the learning platform on their mobile or desktop devices.
- **Offline Capabilities:** Enhanced performance and offline caching for seamless learning on the go.

### 5. Administrative Controls
- **Admin Dashboard:** Dedicated workspace for platform administrators.
- **Content Management:** Full CRUD (Create, Read, Update, Delete) access for aptitude questions.
- **Moderation Settings:** Advanced configuration options hidden securely behind a settings modal to manage rules and user content.

### 6. Authentication & Security
- **Secure Registration/Login:** Powered by NextAuth.js.
- **Role-Based Access Control:** Distinct experiences and permissions for students vs. administrators.

---

## 🛠️ Tech Stack

This project is built using modern web development technologies to ensure top-tier performance and fluid user experiences:

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with custom animations and glassy UI techniques.
- **Database:** MongoDB queried via [Mongoose](https://mongoosejs.com/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (with bcryptjs)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) for robust global state.
- **Icons & UI:** [Lucide React](https://lucide.dev/) for precise lightweight iconography, and React Hot Toast for notifications.
- **File Uploads/Media:** [UploadThing](https://uploadthing.com/) & [Cloudinary](https://cloudinary.com/)
- **Charts & Data:** [Recharts](https://recharts.org/) for rendering leaderboard statistics.
- **AI Integration:** Google Generative AI (`@google/generative-ai`) for dynamic content.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js installed on your machine.

### Installation

1. Clone the repository and navigate to the project root:
   ```bash
   cd Learn_app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` or `.env.local` file in the root directory and add the necessary secret keys for:
   - NextAuth (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`)
   - MongoDB connection string (`MONGODB_URI`)
   - Google Generative AI API Key (`GEMINI_API_KEY`)
   - Cloudinary credentials (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)
   - UploadThing keys (`UPLOADTHING_SECRET`, `UPLOADTHING_APP_ID`)

4. Initialize/Seed the database (Optional):
   Populate your local DB with initial data via the built-in seed script:
   ```bash
   npm run seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 💻 Development Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Compiles the application for production.
- `npm run start`: Starts the Next.js production server.
- `npm run lint`: Runs standard ESLint checks to enforce consistent code formatting.

---

## 📄 License

Private repository. All rights reserved.
>>>>>>> 19da1ca (docs: Create initial README.md file outlining the IEEE Learn Platform's features, tech stack, and setup guide.)
