import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMemberSchema, insertReferralAssignmentSchema } from "@shared/schema";
import { z } from "zod";
// import { authHandler } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Temporary NextAuth placeholder routes
  app.get("/api/auth/session", (req, res) => {
    res.json({ user: null, expires: null });
  });
  
  app.get("/api/auth/signin/worldid", (req, res) => {
    const redirectUrl = `https://id.worldcoin.org/authorize?client_id=${process.env.WORLD_ID_APP_ID}&response_type=code&scope=openid&redirect_uri=${encodeURIComponent(process.env.NEXTAUTH_URL + '/api/auth/callback/worldid')}&state=temp`;
    res.redirect(redirectUrl);
  });

  app.get("/api/auth/callback/worldid", (req, res) => {
    // Placeholder callback - would normally handle OAuth code exchange
    res.redirect('/profile?auth=success');
  });

  app.post("/api/auth/signout", (req, res) => {
    res.json({ status: "ok" });
  });

  // ดึง referral link ถัดไป (หัวใจของระบบ)
  app.post("/api/assign-referral", async (req, res) => {
    try {
      const { ipAddress, userAgent } = req.body;
      
      // หาสมาชิกถัดไปที่พร้อมรับผู้ติดตาม
      const nextMember = await storage.getNextAvailableMember();
      
      if (!nextMember) {
        return res.status(400).json({ 
          message: "ขณะนี้ไม่มีสมาชิกพร้อมรับผู้ติดตามใหม่" 
        });
      }
      
      // สร้างบันทึกการจัดสรร
      const assignment = await storage.createReferralAssignment({
        memberId: nextMember.id,
        ipAddress,
        userAgent,
      });
      
      // เพิ่มจำนวน assignment ของสมาชิก
      await storage.incrementMemberAssignments(nextMember.id);
      
      res.json({
        success: true,
        referralLink: nextMember.worldIdReferralLink,
        assignedTo: {
          id: nextMember.id,
          name: nextMember.name,
        },
        assignmentId: assignment.id,
        message: `จัดสรรให้ ${nextMember.name} แล้ว`,
      });
      
    } catch (error) {
      console.error("Error assigning referral:", error);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
  });

  // เพิ่มสมาชิกใหม่
  app.post("/api/members", async (req, res) => {
    try {
      const memberData = insertMemberSchema.parse(req.body);
      
      const member = await storage.createMember(memberData);
      res.json({ 
        member, 
        message: `เพิ่มสมาชิก ${member.name} สำเร็จ` 
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "ข้อมูลไม่ถูกต้อง", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
  });

  // ดูรายชื่อสมาชิกทั้งหมด
  app.get("/api/members", async (req, res) => {
    try {
      const members = await storage.getAllMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
  });

  // นับจำนวนผู้เข้าชม
  app.post("/api/track-visit", async (req, res) => {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');
      
      await storage.trackPageVisit(ipAddress, userAgent);
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking visit:", error);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
  });

  // ดูสถิติการจัดสรร
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getAssignmentStats();
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
  });

  // ดูประวัติการจัดสรรของสมาชิก
  app.get("/api/members/:id/assignments", async (req, res) => {
    try {
      const assignments = await storage.getReferralAssignmentsByMember(req.params.id);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
  });

  // Referral redirect endpoint - นับคลิกแล้ว redirect ไป World ID
  app.get("/r/:shortId", async (req, res) => {
    try {
      const { shortId } = req.params;
      const member = await storage.getMemberByShortId(shortId);
      
      if (!member) {
        return res.status(404).send("Referral link not found");
      }
      
      // นับคลิก
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');
      await storage.trackReferralClick(member.id, ipAddress, userAgent);
      
      // Redirect ไป World ID จริง
      res.redirect(member.worldIdReferralLink);
    } catch (error) {
      console.error("Error tracking referral click:", error);
      res.status(500).send("Internal server error");
    }
  });

  // API สำหรับดูสถิติคลิกของสมาชิก
  app.get("/api/members/:id/clicks", async (req, res) => {
    try {
      const clicks = await storage.getReferralClicks(req.params.id);
      res.json({ totalClicks: clicks });
    } catch (error) {
      res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
  });

  // World ID verification endpoint
  app.post("/api/verify-world-id", async (req, res) => {
    try {
      const { proof, merkle_root, nullifier_hash, verification_level, credential_type, action, signal } = req.body;

      // Verify the World ID proof
      const verifyRes = await fetch('https://developer.worldcoin.org/api/v1/verify/' + process.env.WORLD_ID_APP_ID, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WORLD_ID_CLIENT_SECRET}`,
        },
        body: JSON.stringify({
          nullifier_hash,
          merkle_root,
          proof,
          verification_level,
          action,
          signal: signal || "",
        }),
      });

      if (verifyRes.status === 200) {
        const wldResponse = await verifyRes.json();
        
        // Store the verified user information
        const user = {
          verified: true,
          nullifier_hash,
          verification_level,
          merkle_root,
          proof,
          credential_type,
          verified_at: new Date().toISOString(),
        };

        res.json(user);
      } else {
        const errorResponse = await verifyRes.json();
        res.status(400).json({ 
          message: "World ID verification failed", 
          error: errorResponse 
        });
      }
    } catch (error) {
      console.error("World ID verification error:", error);
      res.status(500).json({ 
        message: "เกิดข้อผิดพลาดในการยืนยัน World ID" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}