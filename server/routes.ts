import { type Express } from "express";
import { createServer, type Server } from "http";
import Groq from "groq-sdk";
import { db } from "./db.js";
import { checks } from "../shared/schema.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/analyze", async (req, res) => {
    try {
      const { content, filename, jd } = req.body;
      if (!content || !jd) return res.status(400).json({ error: "Missing data" });

      const completion = await groq.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: `You are a Strict ATS Auditor. 
            You MUST return your response in two distinct parts separated by exactly "|||".
            
            PART 1: The Score and Feedback (use Markdown).
            PART 2: The Optimized Resume (plain text or Markdown).
            
            Example:
            [ATS SCORE: 85/100]
            ### Feedback
            * Point 1
            |||
            # NEW RESUME CONTENT` 
          },
          { role: "user", content: `RESUME:\n${content}\n\nJD:\n${jd}` }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.1,
      });

      const analysisResult = completion.choices[0]?.message?.content || "";

      const [inserted] = await db.insert(checks).values({
        filename: filename || "Untitled Scan",
        content: content,
        analysis: analysisResult,
      }).returning();

      res.json(inserted);
    } catch (error: any) {
      console.error("API Error:", error);
      res.status(500).json({ error: "Analysis failed" });
    }
  });

  return createServer(app);
}