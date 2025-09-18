import { type Member, type InsertMember, type ReferralAssignment, type InsertReferralAssignment } from "@shared/schema";
import { type User, type ReferralClick, type InsertReferralClick } from "@shared/auth-schema";
import { randomUUID } from "crypto";

export interface WorldIdUserData {
  worldIdNullifierHash: string;
  name: string;
  email?: string | null;
  verificationLevel: string;
  worldIdVerified: boolean;
  worldIdReferralCode?: string;
}

export interface GoogleUserData {
  googleUid: string;
  email: string;
  name: string;
  photoURL?: string | null;
  emailVerified: boolean;
  provider: 'google';
  worldIdReferralCode?: string;
}

export interface IStorage {
  // Member operations
  getAllMembers(): Promise<Member[]>;
  getMember(id: string): Promise<Member | undefined>;
  getMemberByShortId(shortId: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: string, updates: Partial<Member>): Promise<Member | undefined>;
  
  // Referral assignment operations  
  createReferralAssignment(assignment: InsertReferralAssignment & { memberId: string }): Promise<ReferralAssignment>;
  getReferralAssignmentsByMember(memberId: string): Promise<ReferralAssignment[]>;
  getAllReferralAssignments(): Promise<ReferralAssignment[]>;
  
  // Visitor tracking operations
  trackPageVisit(ipAddress?: string, userAgent?: string): Promise<void>;
  getTotalVisitors(): Promise<number>;
  
  // Click tracking operations
  trackReferralClick(memberId: string, ipAddress?: string, userAgent?: string): Promise<void>;
  getReferralClicks(memberId: string): Promise<number>;
  
  // Business logic operations
  getNextAvailableMember(): Promise<Member | undefined>;
  incrementMemberAssignments(memberId: string): Promise<void>;
  getAssignmentStats(): Promise<{
    totalVisitors: number;
    totalSignups: number;
  }>;

  // World ID user operations
  createOrUpdateWorldIdUser(userData: WorldIdUserData): Promise<User>;
  getWorldIdUser(nullifierHash: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getAllUsersWithReferralCodes(): Promise<User[]>;

  // Google user operations
  createOrUpdateGoogleUser(userData: GoogleUserData): Promise<User>;
  getGoogleUser(googleUid: string): Promise<User | undefined>;

  // Referral click tracking operations
  trackReferralClickForUser(referrerUserId: string, ipAddress?: string, userAgent?: string): Promise<ReferralClick>;
  getReferralClickStats(userId: string): Promise<{
    totalClicks: number;
    totalConversions: number;
    conversionRate: number;
    recentClicks: ReferralClick[];
  }>;
  markReferralConversion(clickId: string, convertedUserId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private members: Map<string, Member>;
  private referralAssignments: Map<string, ReferralAssignment>;
  private visitorIps: Set<string>; // เก็บ IP ที่เข้าชมแล้ว (unique visitors)
  private totalPageViews: number; // จำนวนครั้งที่เข้าชมทั้งหมด
  private referralClicks: Map<string, number>; // เก็บจำนวนคลิก referral link แต่ละ member
  private worldIdUsers: Map<string, User>; // World ID users by nullifier hash
  private userReferralClicks: Map<string, ReferralClick>; // Track detailed referral clicks

  constructor() {
    this.members = new Map();
    this.referralAssignments = new Map();
    this.visitorIps = new Set();
    this.totalPageViews = 0;
    this.referralClicks = new Map();
    this.worldIdUsers = new Map();
    this.userReferralClicks = new Map();
    
    // เพิ่มข้อมูลตัวอย่างสำหรับทดสอบ
    this.seedData();
  }

  private seedData() {
    // เพิ่มสมาชิกตัวอย่าง
    const sampleMembers = [
      {
        id: "member-1",
        name: "สมชาย ใจดี",
        worldIdReferralLink: "https://worldcoin.org/join/ABCD1234",
        currentAssignments: 2,
        maxAssignments: 10,
        isActive: true,
        totalEarned: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "member-2", 
        name: "สมศรี สุขสม",
        worldIdReferralLink: "https://worldcoin.org/join/EFGH5678",
        currentAssignments: 1,
        maxAssignments: 10,
        isActive: true,
        totalEarned: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "member-3",
        name: "วิชัย มั่นคง", 
        worldIdReferralLink: "https://worldcoin.org/join/IJKL9012",
        currentAssignments: 0,
        maxAssignments: 10,
        isActive: true,
        totalEarned: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    sampleMembers.forEach(member => {
      this.members.set(member.id, member);
      // เพิ่มข้อมูลคลิกตัวอย่าง
      this.referralClicks.set(member.id, Math.floor(Math.random() * 20) + 5);
    });
  }

  async getAllMembers(): Promise<Member[]> {
    return Array.from(this.members.values());
  }

  async getMember(id: string): Promise<Member | undefined> {
    return this.members.get(id);
  }

  async getMemberByShortId(shortId: string): Promise<Member | undefined> {
    // ในตัวอย่างนี้ shortId จะเป็น "user123" ที่ map กับ member-1
    // ในระบบจริงควรมี mapping table หรือ field ใน member
    const memberMap: Record<string, string> = {
      "user123": "member-1",
      "user456": "member-2", 
      "user789": "member-3",
    };
    
    const memberId = memberMap[shortId];
    return memberId ? this.members.get(memberId) : undefined;
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const id = randomUUID();
    const member: Member = {
      ...insertMember,
      id,
      currentAssignments: 0,
      maxAssignments: insertMember.maxAssignments || 10,
      isActive: true,
      totalEarned: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.members.set(id, member);
    return member;
  }

  async updateMember(id: string, updates: Partial<Member>): Promise<Member | undefined> {
    const member = this.members.get(id);
    if (!member) return undefined;
    
    const updatedMember = { ...member, ...updates, updatedAt: new Date() };
    this.members.set(id, updatedMember);
    return updatedMember;
  }

  async createReferralAssignment(assignmentData: InsertReferralAssignment & { memberId: string }): Promise<ReferralAssignment> {
    const id = randomUUID();
    const member = this.members.get(assignmentData.memberId);
    
    const assignment: ReferralAssignment = {
      id,
      memberId: assignmentData.memberId,
      ipAddress: assignmentData.ipAddress || null,
      userAgent: assignmentData.userAgent || null,
      referralUsed: member?.worldIdReferralLink || "",
      status: "pending",
      assignedAt: new Date(),
      completedAt: null,
    };
    
    this.referralAssignments.set(id, assignment);
    return assignment;
  }

  async getReferralAssignmentsByMember(memberId: string): Promise<ReferralAssignment[]> {
    return Array.from(this.referralAssignments.values())
      .filter(assignment => assignment.memberId === memberId);
  }

  async getAllReferralAssignments(): Promise<ReferralAssignment[]> {
    return Array.from(this.referralAssignments.values());
  }

  async getNextAvailableMember(): Promise<Member | undefined> {
    const activeMembers = Array.from(this.members.values())
      .filter(member => member.isActive && member.currentAssignments < member.maxAssignments);
    
    if (activeMembers.length === 0) return undefined;
    
    // เรียงตาม currentAssignments น้อยที่สุดก่อน (round-robin)
    activeMembers.sort((a, b) => a.currentAssignments - b.currentAssignments);
    
    return activeMembers[0];
  }

  async incrementMemberAssignments(memberId: string): Promise<void> {
    const member = this.members.get(memberId);
    if (member) {
      await this.updateMember(memberId, {
        currentAssignments: member.currentAssignments + 1,
      });
    }
  }

  async trackPageVisit(ipAddress?: string, userAgent?: string): Promise<void> {
    this.totalPageViews++;
    if (ipAddress) {
      this.visitorIps.add(ipAddress);
    }
  }

  async getTotalVisitors(): Promise<number> {
    return this.visitorIps.size;
  }

  async trackReferralClick(memberId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const currentClicks = this.referralClicks.get(memberId) || 0;
    this.referralClicks.set(memberId, currentClicks + 1);
  }

  async getReferralClicks(memberId: string): Promise<number> {
    return this.referralClicks.get(memberId) || 0;
  }

  async getAssignmentStats(): Promise<{
    totalVisitors: number;
    totalSignups: number;
  }> {
    const allAssignments = await this.getAllReferralAssignments();
    
    return {
      totalVisitors: this.totalPageViews,
      totalSignups: allAssignments.length,
    };
  }

  async createOrUpdateWorldIdUser(userData: WorldIdUserData): Promise<User> {
    const existingUser = this.worldIdUsers.get(userData.worldIdNullifierHash);
    
    if (existingUser) {
      // Update existing user
      const updatedUser: User = {
        ...existingUser,
        name: userData.name,
        email: userData.email,
        verificationLevel: userData.verificationLevel,
        worldIdVerified: userData.worldIdVerified,
        worldIdReferralCode: userData.worldIdReferralCode,
        updatedAt: new Date(),
      };
      this.worldIdUsers.set(userData.worldIdNullifierHash, updatedUser);
      return updatedUser;
    } else {
      // Create new user
      const newUser: User = {
        id: randomUUID(),
        name: userData.name,
        email: userData.email,
        emailVerified: null,
        image: null,
        worldIdNullifierHash: userData.worldIdNullifierHash,
        worldIdVerified: userData.worldIdVerified,
        verificationLevel: userData.verificationLevel,
        worldIdReferralCode: userData.worldIdReferralCode,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.worldIdUsers.set(userData.worldIdNullifierHash, newUser);
      return newUser;
    }
  }

  async getWorldIdUser(nullifierHash: string): Promise<User | undefined> {
    return this.worldIdUsers.get(nullifierHash);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return Array.from(this.worldIdUsers.values()).find(user => user.id === id);
  }

  async getAllUsersWithReferralCodes(): Promise<User[]> {
    return Array.from(this.worldIdUsers.values()).filter(user => 
      user.worldIdReferralCode && user.worldIdReferralCode.trim() !== ''
    );
  }

  async createOrUpdateGoogleUser(userData: GoogleUserData): Promise<User> {
    console.log('Creating/updating Google user (MemStorage):', userData);
    
    // Check if user already exists by Google UID
    const existingUser = await this.getGoogleUser(userData.googleUid);
    
    if (existingUser) {
      // Update existing user
      existingUser.name = userData.name;
      existingUser.email = userData.email;
      existingUser.photoURL = userData.photoURL;
      existingUser.emailVerified = userData.emailVerified;
      existingUser.updatedAt = new Date();
      return existingUser;
    } else {
      // Create new user
      const newUser: User = {
        id: randomUUID(),
        googleUid: userData.googleUid,
        name: userData.name,
        email: userData.email,
        photoURL: userData.photoURL,
        emailVerified: userData.emailVerified,
        provider: userData.provider,
        worldIdVerified: false,
        worldIdReferralCode: userData.worldIdReferralCode || null,
        worldIdNullifierHash: null,
        verificationLevel: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      this.worldIdUsers.set(userData.googleUid, newUser);
      return newUser;
    }
  }

  async getGoogleUser(googleUid: string): Promise<User | undefined> {
    return this.worldIdUsers.get(googleUid);
  }

  async trackReferralClickForUser(referrerUserId: string, ipAddress?: string, userAgent?: string): Promise<ReferralClick> {
    const clickId = randomUUID();
    const click: ReferralClick = {
      id: clickId,
      referrerUserId,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      clickedAt: new Date(),
      convertedAt: null,
      convertedUserId: null,
    };
    
    this.userReferralClicks.set(clickId, click);
    return click;
  }

  async getReferralClickStats(userId: string): Promise<{
    totalClicks: number;
    totalConversions: number;
    conversionRate: number;
    recentClicks: ReferralClick[];
  }> {
    const userClicks = Array.from(this.userReferralClicks.values())
      .filter(click => click.referrerUserId === userId);
    
    const totalClicks = userClicks.length;
    const totalConversions = userClicks.filter(click => click.convertedAt !== null).length;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    
    // Get recent clicks (last 10)
    const recentClicks = userClicks
      .sort((a, b) => new Date(b.clickedAt).getTime() - new Date(a.clickedAt).getTime())
      .slice(0, 10);
    
    return {
      totalClicks,
      totalConversions,
      conversionRate,
      recentClicks
    };
  }

  async markReferralConversion(clickId: string, convertedUserId: string): Promise<void> {
    const click = this.userReferralClicks.get(clickId);
    if (click) {
      click.convertedAt = new Date();
      click.convertedUserId = convertedUserId;
      this.userReferralClicks.set(clickId, click);
    }
  }
}

import { db } from "./db";
import { users, referralClicks } from "@shared/auth-schema";
import { eq, sql } from "drizzle-orm";

class DbStorage implements IStorage {
  // World ID User operations (database-backed)
  async createOrUpdateWorldIdUser(userData: WorldIdUserData): Promise<User> {
    try {
      // Try to find existing user by nullifier hash
      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.worldIdNullifierHash, userData.worldIdNullifierHash))
        .limit(1);

      if (existingUsers.length > 0) {
        // Update existing user
        const updatedUsers = await db
          .update(users)
          .set({
            name: userData.name,
            email: userData.email,
            verificationLevel: userData.verificationLevel,
            worldIdVerified: userData.worldIdVerified,
            worldIdReferralCode: userData.worldIdReferralCode,
            updatedAt: new Date(),
          })
          .where(eq(users.worldIdNullifierHash, userData.worldIdNullifierHash))
          .returning();
        
        console.log('Updated existing World ID user in database:', updatedUsers[0]?.id);
        return updatedUsers[0];
      } else {
        // Create new user
        const newUsers = await db
          .insert(users)
          .values({
            name: userData.name,
            email: userData.email,
            worldIdNullifierHash: userData.worldIdNullifierHash,
            verificationLevel: userData.verificationLevel,
            worldIdVerified: userData.worldIdVerified,
            worldIdReferralCode: userData.worldIdReferralCode,
          })
          .returning();
        
        console.log('Created new World ID user in database:', newUsers[0]?.id);
        return newUsers[0];
      }
    } catch (error) {
      console.error('Database error in createOrUpdateWorldIdUser:', error);
      throw error;
    }
  }

  async getWorldIdUser(nullifierHash: string): Promise<User | undefined> {
    try {
      const userResults = await db
        .select()
        .from(users)
        .where(eq(users.worldIdNullifierHash, nullifierHash))
        .limit(1);
      
      return userResults[0];
    } catch (error) {
      console.error('Database error in getWorldIdUser:', error);
      return undefined;
    }
  }

  async getUserById(id: string): Promise<User | undefined> {
    try {
      const userResults = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      
      return userResults[0];
    } catch (error) {
      console.error('Database error in getUserById:', error);
      return undefined;
    }
  }

  async getAllUsersWithReferralCodes(): Promise<User[]> {
    try {
      const userResults = await db
        .select()
        .from(users)
        .where(eq(users.worldIdVerified, true));
      
      return userResults.filter(user => 
        user.worldIdReferralCode && user.worldIdReferralCode.trim() !== ''
      );
    } catch (error) {
      console.error('Database error in getAllUsersWithReferralCodes:', error);
      return [];
    }
  }

  async createOrUpdateGoogleUser(userData: GoogleUserData): Promise<User> {
    try {
      console.log('Creating/updating Google user:', userData);
      
      // Check if user already exists by Google UID
      const existingUser = await this.getGoogleUser(userData.googleUid);
      
      if (existingUser) {
        console.log('Google user exists, updating:', existingUser.id);
        
        // Update existing user
        const updatedUsers = await db
          .update(users)
          .set({
            name: userData.name,
            email: userData.email,
            photoURL: userData.photoURL,
            emailVerified: userData.emailVerified ? new Date() : null, // Convert boolean to timestamp
            updatedAt: new Date(),
          })
          .where(eq(users.googleUid, userData.googleUid))
          .returning();
        
        return updatedUsers[0];
      } else {
        console.log('Creating new Google user');
        
        // Create new user
        const newUsers = await db
          .insert(users)
          .values({
            id: randomUUID(),
            googleUid: userData.googleUid,
            name: userData.name,
            email: userData.email,
            photoURL: userData.photoURL,
            emailVerified: userData.emailVerified ? new Date() : null, // Convert boolean to timestamp
            provider: userData.provider,
            worldIdVerified: false, // Google users are not World ID verified
            worldIdReferralCode: userData.worldIdReferralCode || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        
        console.log('Google user created successfully:', newUsers[0].id);
        return newUsers[0];
      }
    } catch (error) {
      console.error('Database error in createOrUpdateGoogleUser:', error);
      throw error;
    }
  }

  async getGoogleUser(googleUid: string): Promise<User | undefined> {
    try {
      const userResults = await db
        .select()
        .from(users)
        .where(eq(users.googleUid, googleUid))
        .limit(1);
      
      return userResults[0];
    } catch (error) {
      console.error('Database error in getGoogleUser:', error);
      return undefined;
    }
  }

  async trackReferralClickForUser(referrerUserId: string, ipAddress?: string, userAgent?: string): Promise<ReferralClick> {
    try {
      const newClicks = await db
        .insert(referralClicks)
        .values({
          referrerUserId,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        })
        .returning();
      
      console.log('Tracked referral click for user:', referrerUserId);
      return newClicks[0];
    } catch (error) {
      console.error('Database error in trackReferralClickForUser:', error);
      throw error;
    }
  }

  async getReferralClickStats(userId: string): Promise<{
    totalClicks: number;
    totalConversions: number;
    conversionRate: number;
    recentClicks: ReferralClick[];
  }> {
    try {
      // Get all clicks for this user
      const userClicks = await db
        .select()
        .from(referralClicks)
        .where(eq(referralClicks.referrerUserId, userId))
        .orderBy(sql`${referralClicks.clickedAt} DESC`)
        .limit(100); // Limit for performance
      
      const totalClicks = userClicks.length;
      const totalConversions = userClicks.filter(click => click.convertedAt !== null).length;
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
      
      // Get recent clicks (last 10)
      const recentClicks = userClicks.slice(0, 10);
      
      return {
        totalClicks,
        totalConversions,
        conversionRate,
        recentClicks
      };
    } catch (error) {
      console.error('Database error in getReferralClickStats:', error);
      return {
        totalClicks: 0,
        totalConversions: 0,
        conversionRate: 0,
        recentClicks: []
      };
    }
  }

  async markReferralConversion(clickId: string, convertedUserId: string): Promise<void> {
    try {
      await db
        .update(referralClicks)
        .set({
          convertedAt: new Date(),
          convertedUserId
        })
        .where(eq(referralClicks.id, clickId));
      
      console.log('Marked referral conversion:', clickId, '->', convertedUserId);
    } catch (error) {
      console.error('Database error in markReferralConversion:', error);
      throw error;
    }
  }

  // For now, delegate member operations to memory storage
  // TODO: Implement database-backed member storage
  private memStorage = new MemStorage();

  async getAllMembers(): Promise<Member[]> {
    return this.memStorage.getAllMembers();
  }

  async getMember(id: string): Promise<Member | undefined> {
    return this.memStorage.getMember(id);
  }

  async getMemberByShortId(shortId: string): Promise<Member | undefined> {
    return this.memStorage.getMemberByShortId(shortId);
  }

  async createMember(member: InsertMember): Promise<Member> {
    return this.memStorage.createMember(member);
  }

  async updateMember(id: string, updates: Partial<Member>): Promise<Member | undefined> {
    return this.memStorage.updateMember(id, updates);
  }

  async createReferralAssignment(assignment: InsertReferralAssignment & { memberId: string }): Promise<ReferralAssignment> {
    return this.memStorage.createReferralAssignment(assignment);
  }

  async getReferralAssignmentsByMember(memberId: string): Promise<ReferralAssignment[]> {
    return this.memStorage.getReferralAssignmentsByMember(memberId);
  }

  async getAllReferralAssignments(): Promise<ReferralAssignment[]> {
    return this.memStorage.getAllReferralAssignments();
  }

  async trackPageVisit(ipAddress?: string, userAgent?: string): Promise<void> {
    return this.memStorage.trackPageVisit(ipAddress, userAgent);
  }

  async getTotalVisitors(): Promise<number> {
    return this.memStorage.getTotalVisitors();
  }

  async trackReferralClick(memberId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    return this.memStorage.trackReferralClick(memberId, ipAddress, userAgent);
  }

  async getReferralClicks(memberId: string): Promise<number> {
    return this.memStorage.getReferralClicks(memberId);
  }

  async getNextAvailableMember(): Promise<Member | undefined> {
    return this.memStorage.getNextAvailableMember();
  }

  async incrementMemberAssignments(memberId: string): Promise<void> {
    return this.memStorage.incrementMemberAssignments(memberId);
  }

  async getAssignmentStats(): Promise<any> {
    return this.memStorage.getAssignmentStats();
  }
}

// Use database storage for World ID users, memory storage for other data
export const storage = new DbStorage();