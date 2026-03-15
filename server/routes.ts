import { type Express } from "express";
import { createServer, type Server } from "http";
import Groq from "groq-sdk";
import { storage } from "./storage.js";
import { db } from "./db.js";
import { checks } from "../shared/schema.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/history", async (_req, res) => {
    try {
      const data = await storage.getChecks();
      res.json(data || []);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.post("/api/analyze", async (req, res) => {
    try {
      const { content, filename, jd } = req.body;
      
      if (!content || !jd) {
        return res.status(400).json({ error: "Resume and JD are required." });
      }

      console.log(`🔍 STRICT ANALYSIS START: ${filename}`);

      // 1. AI STRICT COMPLETION
      // Using 8b-instant to stay within Render's free tier response window
      let aiResponse: string;
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            { 
              role: "system", 
              content: `You are a Strict ATS Compliance Auditor. 
              Evaluate the resume against the Job Description with 0% bias.
              
              STRUCTURE YOUR RESPONSE AS FOLLOWS:
              [ATS SCORE: 0-100]
              
              CRITICAL FAILURES:
              (List missing keywords or formatting issues)
              
              OPTIMIZATION STRATEGY:
              (List specific changes needed)
              
              ---RESUME_START---
              (Provide the rewritten resume text incorporating all JD keywords)` 
            },
            { role: "user", content: `RESUME CONTENT:\n${content}\n\nTARGET JD:\n${jd}` }
          ],
          model: "llama-3.1-8b-instant",
          temperature: 0.1, // Low temperature for consistent, strict results
        });
        
        aiResponse = completion.choices[0]?.message?.content || "";
        if (!aiResponse) throw new Error("AI returned empty content");
        
      } catch (aiErr: any) {
        console.error("❌ GROQ FAILURE:", aiErr.message);
        return res.status(500).json({ error: `AI Timeout/Error: ${aiErr.message}` });
      }

      // 2. DATABASE PERSISTENCE
      try {
        const [inserted] = await db.insert(checks).values({
          filename: filename || "Strict_Analysis_Result",
          content: content,
          analysis: aiResponse,
        }).returning();
        
        console.log("✅ ANALYSIS PERSISTED: ID", inserted.id);
        return res.json(inserted);
      } catch (dbErr: any) {
        console.error("❌ DATABASE SYNC FAILURE:", dbErr.message);
        return res.status(500).json({ error: `Database Error: ${dbErr.message}` });
      }

    } catch (error: any) {
      console.error("❌ UNEXPECTED ERROR:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  return createServer(app);
}