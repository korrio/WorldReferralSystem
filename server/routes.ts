import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertReferralSchema, loginSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if phone already exists
      const existingUser = await storage.getUserByPhone(userData.phone);
      if (existingUser) {
        return res.status(400).json({ message: "เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user, message: "สมัครสมาชิกสำเร็จ" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง", errors: error.errors });
      }
      res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phone, otp } = loginSchema.parse(req.body);
      
      // Simple OTP validation (in production, implement proper OTP system)
      if (otp !== "123456") {
        return res.status(400).json({ message: "รหัส OTP ไม่ถูกต้อง" });
      }
      
      const user = await storage.getUserByPhone(phone);
      if (!user) {
        return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
      }
      
      res.json({ user, message: "เข้าสู่ระบบสำเร็จ" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง", errors: error.errors });
      }
      res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
  });

  app.get("/api/users/:id/stats", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
      }
      
      const referrals = await storage.getReferralsByReferrerId(req.params.id);
      const verifiedReferrals = referrals.filter(r => r.status === "verified");
      const pendingReferrals = referrals.filter(r => r.status === "pending");
      
      const stats = {
        totalReferrals: referrals.length,
        verifiedReferrals: verifiedReferrals.length,
        pendingReferrals: pendingReferrals.length,
        remainingSlots: user.maxReferrals - referrals.length,
        totalEarnings: user.totalEarnings,
        progressPercentage: Math.round((referrals.length / user.maxReferrals) * 100),
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
  });

  // Referral routes
  app.get("/api/users/:id/referrals", async (req, res) => {
    try {
      const referrals = await storage.getReferralsByReferrerId(req.params.id);
      res.json(referrals);
    } catch (error) {
      res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
  });

  app.post("/api/referrals", async (req, res) => {
    try {
      const referralData = insertReferralSchema.parse(req.body);
      
      // Find next available referrer using round-robin allocation
      const nextReferrer = await storage.findNextAvailableReferrer();
      if (!nextReferrer) {
        return res.status(400).json({ message: "ไม่มีผู้แนะนำที่พร้อมรับผู้สมัครใหม่" });
      }
      
      const referral = await storage.createReferral({
        ...referralData,
        referrerId: nextReferrer.id,
      });
      
      res.json({ 
        referral, 
        referrer: nextReferrer,
        message: "จัดสรรผู้สมัครสำเร็จ" 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง", errors: error.errors });
      }
      res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
  });

  app.patch("/api/referrals/:id/verify", async (req, res) => {
    try {
      const referral = await storage.updateReferral(req.params.id, {
        status: "verified",
        verifiedAt: new Date(),
      });
      
      if (!referral) {
        return res.status(404).json({ message: "ไม่พบข้อมูลการแนะนำ" });
      }
      
      // Update referrer's earnings
      const referrer = await storage.getUser(referral.referrerId);
      if (referrer) {
        await storage.updateUser(referrer.id, {
          totalEarnings: referrer.totalEarnings + referral.earnings,
        });
      }
      
      res.json({ referral, message: "ยืนยันการแนะนำสำเร็จ" });
    } catch (error) {
      res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
  });

  app.get("/api/referrals/stats", async (req, res) => {
    try {
      const referralCounts = await storage.getReferralCounts();
      const users = await storage.getAllUsers();
      
      const stats = {
        totalUsers: users.length,
        totalReferrals: (await storage.getAllReferrals()).length,
        averageReferralsPerUser: users.length > 0 ? 
          Array.from(referralCounts.values()).reduce((a, b) => a + b, 0) / users.length : 0,
        usersAtCapacity: users.filter(u => (referralCounts.get(u.id) || 0) >= u.maxReferrals).length,
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
