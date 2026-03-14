import { type Express } from "express";
import { createServer, type Server } from "http";
import Groq from "groq-sdk";
import { db } from "./db.js";
import { resumes } from "../shared/schema.js";
import { desc } from "drizzle-orm";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function registerRoutes(app: Express): Promise<Server> {
  // GET HISTORY
  app.get("/api/history", async (_req, res) => {
    try {
      const data = await db.select().from(resumes).orderBy(desc(resumes.createdAt));
      res.json(data || []);
    } catch (e) {
      console.error("History Fetch Error:", e);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // ANALYZE RESUME
  app.post("/api/analyze", async (req, res) => {
    try {
      // 1. Validate incoming request body
      const { content, filename, jd } = req.body;
      
      if (!content || !jd) {
        return res.status(400).json({ error: "Resume content and JD are required." });
      }

      console.log(`Checking Resume: ${filename || "Untitled"}`);

      if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is missing in .env");
      }

      // 2. AI Completion
      const completion = await groq.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: `You are a Senior Recruiter and ATS Expert. 
            Format your response EXACTLY like this:
            [ATS SCORE: X/100]
             FEEDBACK
            (Strategic point-form feedback)
            ---RESUME_START---
            (The full optimized resume text using keywords from the JD)`
          },
          { role: "user", content: `RESUME:\n${content}\n\nJD:\n${jd}` }
        ],
        model: "llama-3.3-70b-versatile",
      });

      const analysisResult = completion.choices[0]?.message?.content || "";

      // 3. Database Insertion with Safety Defaults
      // This prevents the "Failed Query" error from your screenshot
      const [inserted] = await db.insert(resumes).values({
        filename: String(filename || "Untitled Scan").trim(),
        content: String(content).trim(),
        analysis: String(analysisResult).trim(),
      }).returning();

      console.log("Analysis Saved Successfully");
      res.json(inserted);

    } catch (error: any) {
      console.error("AI Analysis Error:", error.message);
      // Sending back a clean error message so the button doesn't show 5 lines of SQL code
      res.status(500).json({ error: "Database Sync Error or AI Timeout. Please try again." });
    }
  });

  return createServer(app);
}