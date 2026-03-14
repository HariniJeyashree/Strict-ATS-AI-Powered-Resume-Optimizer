import { z } from "zod";

export const api = {
  checks: {
    create: {
      method: "POST",
      path: "/api/checks",
      input: z.object({
        resumeText: z.string().min(10),
        jobDescription: z.string().min(10)
      })
    },
    list: { path: "/api/checks" },
    get: { path: "/api/checks/:id" }
  }
};