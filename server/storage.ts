import { type User, type InsertUser, type Referral, type InsertReferral } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Referral operations
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralsByReferrerId(referrerId: string): Promise<Referral[]>;
  getAllReferrals(): Promise<Referral[]>;
  updateReferral(id: string, updates: Partial<Referral>): Promise<Referral | undefined>;
  
  // Allocation operations
  findNextAvailableReferrer(): Promise<User | undefined>;
  getReferralCounts(): Promise<Map<string, number>>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private referrals: Map<string, Referral>;

  constructor() {
    this.users = new Map();
    this.referrals = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phone === phone,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      maxReferrals: 5,
      totalEarnings: 0,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const id = randomUUID();
    const referral: Referral = {
      ...insertReferral,
      id,
      status: "pending",
      earnings: 50,
      assignedAt: new Date(),
      verifiedAt: null,
    };
    this.referrals.set(id, referral);
    return referral;
  }

  async getReferralsByReferrerId(referrerId: string): Promise<Referral[]> {
    return Array.from(this.referrals.values()).filter(
      (referral) => referral.referrerId === referrerId,
    );
  }

  async getAllReferrals(): Promise<Referral[]> {
    return Array.from(this.referrals.values());
  }

  async updateReferral(id: string, updates: Partial<Referral>): Promise<Referral | undefined> {
    const referral = this.referrals.get(id);
    if (!referral) return undefined;
    
    const updatedReferral = { ...referral, ...updates };
    this.referrals.set(id, updatedReferral);
    return updatedReferral;
  }

  async findNextAvailableReferrer(): Promise<User | undefined> {
    const referralCounts = await this.getReferralCounts();
    const users = await this.getAllUsers();
    
    // Find users with the least referrals who haven't reached their limit
    const availableUsers = users.filter(user => {
      const count = referralCounts.get(user.id) || 0;
      return count < user.maxReferrals;
    });
    
    if (availableUsers.length === 0) return undefined;
    
    // Sort by referral count (ascending) to ensure fair distribution
    availableUsers.sort((a, b) => {
      const countA = referralCounts.get(a.id) || 0;
      const countB = referralCounts.get(b.id) || 0;
      return countA - countB;
    });
    
    return availableUsers[0];
  }

  async getReferralCounts(): Promise<Map<string, number>> {
    const counts = new Map<string, number>();
    const referrals = await this.getAllReferrals();
    
    for (const referral of referrals) {
      const current = counts.get(referral.referrerId) || 0;
      counts.set(referral.referrerId, current + 1);
    }
    
    return counts;
  }
}

export const storage = new MemStorage();
