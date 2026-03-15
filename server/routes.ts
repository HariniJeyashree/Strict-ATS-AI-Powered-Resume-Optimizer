import { type Express } from "express";
import { createServer, type Server } from "http";
import Groq from "groq-sdk";
import { storage } from "./storage.js";
import { insertCheckSchema } from "../shared/schema.js";

// Initialize Groq with the API Key from Environment Variables
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // 1. GET HISTORY: Fetches all previous scans from the database
  app.get("/api/history", async (_req, res) => {
    try {
      const data = await storage.getChecks();
      res.json(data || []);
    } catch (e) {
      console.error("History Fetch Error:", e);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // 2. ANALYZE RESUME: Core logic for AI analysis and database storage
  app.post("/api/analyze", async (req, res) => {
    try {
      const { content, filename, jd } = req.body;
      
      // Basic validation
      if (!content || !jd) {
        return res.status(400).json({ error: "Resume content and JD are required." });
      }

      console.log(`🚀 Starting analysis for: ${filename || "Untitled Scan"}`);

      // Check if AI key is configured
      if (!process.env.GROQ_API_KEY) {
        console.error("❌ MISSING KEY: GROQ_API_KEY is not defined in Render environment variables.");
        return res.status(500).json({ error: "Server AI configuration missing." });
      }

      // AI Analysis Call
      // Using 'llama-3.1-8b-instant' for fast response times on Render's Free Tier
      const completion = await groq.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: `You are a Senior Recruiter and ATS Expert. 
            Analyze the resume against the JD and format your response EXACTLY like this:
            [ATS SCORE: X/100]
            FEEDBACK
            (Strategic point-form feedback)
            ---RESUME_START---
            (The full optimized resume text using keywords from the JD)`
          },
          { role: "user", content: `RESUME:\n${content}\n\nJD:\n${jd}` }
        ],
        model: "llama-3.1-8b-instant",
      });

      const analysisResult = completion.choices[0]?.message?.content || "Analysis failed to generate.";

      // Database Insertion via Storage Class
      // This saves the result to the 'checks' table
      const inserted = await storage.createCheck({
        filename: filename || "Untitled Scan",
        content: content,
        analysis: analysisResult,
      });

      console.log("✅ Analysis Saved Successfully. ID:", inserted.id);
      res.json(inserted);

    } catch (error: any) {
      // Log the full error to the Render terminal for debugging
      console.error("❌ CRITICAL API ERROR:", error);
      
      res.status(500).json({ 
        error: "Database Sync Error or AI Timeout. Please try again.",
        details: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}