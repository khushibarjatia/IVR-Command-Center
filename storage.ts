import { type User, type InsertUser, type CallLog, type InsertCallLog, callLogs } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createCallLog(log: InsertCallLog): Promise<CallLog>;
  getCallLog(callUuid: string): Promise<CallLog | undefined>;
  updateCallLog(callUuid: string, updates: Partial<InsertCallLog>): Promise<CallLog | undefined>;
  getAllCallLogs(): Promise<CallLog[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private callLogsMap: Map<string, CallLog>;

  constructor() {
    this.users = new Map();
    this.callLogsMap = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createCallLog(log: InsertCallLog): Promise<CallLog> {
    const id = this.callLogsMap.size + 1;
    const callLog: CallLog = {
      ...log,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (log.callUuid) {
      this.callLogsMap.set(log.callUuid, callLog);
    }
    return callLog;
  }

  async getCallLog(callUuid: string): Promise<CallLog | undefined> {
    return this.callLogsMap.get(callUuid);
  }

  async updateCallLog(callUuid: string, updates: Partial<InsertCallLog>): Promise<CallLog | undefined> {
    const existing = this.callLogsMap.get(callUuid);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.callLogsMap.set(callUuid, updated);
    return updated;
  }

  async getAllCallLogs(): Promise<CallLog[]> {
    return Array.from(this.callLogsMap.values());
  }
}

export class DBStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(callLogs).where(eq(callLogs.id, parseInt(id))).limit(1);
    return user as any;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return { id: randomUUID(), ...insertUser };
  }

  async createCallLog(log: InsertCallLog): Promise<CallLog> {
    const [created] = await db.insert(callLogs).values(log).returning();
    return created;
  }

  async getCallLog(callUuid: string): Promise<CallLog | undefined> {
    const [log] = await db.select().from(callLogs).where(eq(callLogs.callUuid, callUuid)).limit(1);
    return log;
  }

  async updateCallLog(callUuid: string, updates: Partial<InsertCallLog>): Promise<CallLog | undefined> {
    const [updated] = await db
      .update(callLogs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(callLogs.callUuid, callUuid))
      .returning();
    return updated;
  }

  async getAllCallLogs(): Promise<CallLog[]> {
    return await db.select().from(callLogs).orderBy(callLogs.createdAt);
  }
}

export const storage = process.env.DATABASE_URL ? new DBStorage() : new MemStorage();
