import { checks, type Check, type InsertCheck } from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getCheck(id: number): Promise<Check | undefined>;
  getChecks(): Promise<Check[]>;
  createCheck(check: InsertCheck): Promise<Check>;
}

export class DatabaseStorage implements IStorage {
  async getCheck(id: number): Promise<Check | undefined> {
    const [check] = await db.select().from(checks).where(eq(checks.id, id));
    return check;
  }

  async getChecks(): Promise<Check[]> {
    return await db.select().from(checks).orderBy(desc(checks.createdAt));
  }

  async createCheck(insertCheck: InsertCheck): Promise<Check> {
    const [check] = await db.insert(checks).values(insertCheck).returning();
    return check;
  }
}

export const storage = new DatabaseStorage();