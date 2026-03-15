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
            content: `You are a Strict ATS Auditor. Be extremely strict. If 0 required skills overlap, the score must be below 10%.
            You MUST return your response in two distinct parts separated by exactly "|||".
            
            PART 1: The Score and missing skills (use Markdown).
            SCORING RULE: If the candidate lacks the primary programming language (e.g., Python for ML roles) and at least 50% of the required libraries, the score MUST be below 15%. Do not give credit for unrelated technical skills.
            PART 2: The Optimized Resume (plain text or Markdown).
            CRITICAL INSTRUCTIONS FOR PART 2:
            - Do NOT use Markdown.
            - Do NOT use '#' for headers; use ALL CAPS for section titles instead.
            - Do NOT use '**' for bolding; the text must be plain.
            - Do NOT use '*' for bullets; use a standard dash (-) or indentation.
            - Ensure the output is clean plain text that looks like a final resume document.
            
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
  // server/routes.ts

// Change your GET /api/history route to this:
app.get("/api/history", async (_req, res) => {
  try {
    // Import 'desc' from drizzle-orm and 'checks' from your schema
    const { desc } = await import("drizzle-orm");
    
    // Fetch all records, ordered by newest first
    const data = await db.select().from(checks).orderBy(desc(checks.id));
    
    res.json(data);
  } catch (e: any) {
    console.error("History Fetch Error:", e.message);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

  return createServer(app);
}