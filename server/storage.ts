import { type Member, type InsertMember, type ReferralAssignment, type InsertReferralAssignment } from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private members: Map<string, Member>;
  private referralAssignments: Map<string, ReferralAssignment>;
  private visitorIps: Set<string>; // เก็บ IP ที่เข้าชมแล้ว (unique visitors)
  private totalPageViews: number; // จำนวนครั้งที่เข้าชมทั้งหมด
  private referralClicks: Map<string, number>; // เก็บจำนวนคลิก referral link แต่ละ member

  constructor() {
    this.members = new Map();
    this.referralAssignments = new Map();
    this.visitorIps = new Set();
    this.totalPageViews = 0;
    this.referralClicks = new Map();
    
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
}

export const storage = new MemStorage();