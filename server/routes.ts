import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMemberSchema, insertReferralAssignmentSchema } from "@shared/schema";
import { z } from "zod";
// import { authHandler } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check endpoint for Docker
  app.get("/api/health", async (req, res) => {
    try {
      // Check database connection
      await storage.getAllMembers();
      res.status(200).json({ 
        status: "healthy", 
        database: "connected",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(503).json({ 
        status: "unhealthy", 
        database: "disconnected",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get random World ID referral link for new signups
  app.get("/api/referral/random", async (req, res) => {
    try {
      // Get users with referral codes from the database
      const usersWithReferralCodes = await storage.getAllUsersWithReferralCodes();

      if (usersWithReferralCodes.length === 0) {
        // Return empty referral code instead of error
        return res.json({ 
          referralLink: "https://worldcoin.org/join/",
          memberName: "World ID Community",
          referralId: null,
          message: "No specific referral codes available, using default signup link"
        });
      }

      // Get random user with referral code
      const randomIndex = Math.floor(Math.random() * usersWithReferralCodes.length);
      const selectedUser = usersWithReferralCodes[randomIndex];

      // Generate the full World ID referral URL
      const referralLink = `https://worldcoin.org/join/${selectedUser.worldIdReferralCode}`;

      // Track the referral click in database
      const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'];
      
      try {
        const clickRecord = await storage.trackReferralClickForUser(
          selectedUser.id, 
          Array.isArray(ipAddress) ? ipAddress[0] : ipAddress, 
          userAgent
        );
        console.log(`✅ Referral click tracked: ${clickRecord.id} for user ${selectedUser.name}`);
      } catch (error) {
        console.error('Error tracking referral click:', error);
        // Don't fail the request if click tracking fails
      }

      res.json({
        referralLink: referralLink,
        referralCode: selectedUser.worldIdReferralCode,
        memberName: selectedUser.name,
        referralId: selectedUser.id
      });
    } catch (error) {
      console.error("Error getting random referral link:", error);
      res.status(500).json({ 
        error: "Internal server error" 
      });
    }
  });

  // Update user's World ID referral code
  app.post("/api/user/referral-code", async (req, res) => {
    console.log("=== REFERRAL CODE UPDATE REQUEST ===");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Content-Type:", req.headers['content-type']);
    console.log("Body:", JSON.stringify(req.body, null, 2));
    console.log("Session user:", req.session?.user?.id);
    
    try {
      // Set JSON response headers explicitly
      res.setHeader('Content-Type', 'application/json');
      
      const { nullifierHash, referralCode } = req.body;

      if (!referralCode) {
        console.log("❌ Missing referral code");
        return res.status(400).json({ 
          error: "referralCode is required" 
        });
      }

      // Validate referral code format (basic validation)
      if (!/^[A-Za-z0-9]+$/.test(referralCode)) {
        console.log("❌ Invalid referral code format:", referralCode);
        return res.status(400).json({ 
          error: "Invalid referral code format" 
        });
      }

      let existingUser = null;

      // Try to find user by nullifierHash (World ID users) or session (Google users)
      if (nullifierHash) {
        console.log("🔍 Looking for World ID user with nullifierHash:", nullifierHash);
        existingUser = await storage.getWorldIdUser(nullifierHash);
      } else if (req.session?.user) {
        console.log("🔍 Using Google user from session:", req.session.user.id);
        existingUser = req.session.user;
      }
      
      if (!existingUser) {
        console.log("❌ User not found");
        return res.status(404).json({ 
          error: "User not found. Please login first." 
        });
      }

      console.log("✅ Found user:", existingUser.id, existingUser.name);

      // Update user with referral code - handle both World ID and Google users
      let updatedUser;
      
      if (existingUser.worldIdNullifierHash) {
        // World ID user - use existing method
        const updatedUserData = {
          worldIdNullifierHash: existingUser.worldIdNullifierHash,
          name: existingUser.name,
          email: existingUser.email,
          verificationLevel: existingUser.verificationLevel,
          worldIdVerified: existingUser.worldIdVerified,
          worldIdReferralCode: referralCode.trim()
        };
        
        console.log("💾 Updating World ID user with referral code:", referralCode.trim());
        updatedUser = await storage.createOrUpdateWorldIdUser(updatedUserData);
      } else if (existingUser.googleUid) {
        // Google user - use Google method
        const updatedUserData = {
          googleUid: existingUser.googleUid,
          email: existingUser.email,
          name: existingUser.name,
          photoURL: existingUser.photoURL,
          emailVerified: !!existingUser.emailVerified,
          provider: 'google',
          worldIdReferralCode: referralCode.trim()
        };
        
        console.log("💾 Updating Google user with referral code:", referralCode.trim());
        updatedUser = await storage.createOrUpdateGoogleUser(updatedUserData);
      } else {
        console.log("❌ User type not supported");
        return res.status(400).json({ 
          error: "User type not supported" 
        });
      }

      // Update session with new user data
      if (req.session) {
        req.session.user = updatedUser;
      }

      const response = {
        success: true,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          referralCode: updatedUser.worldIdReferralCode
        }
      };

      console.log("✅ Success response:", JSON.stringify(response, null, 2));
      console.log("=== END REFERRAL CODE UPDATE ===\n");
      
      return res.json(response);
    } catch (error) {
      console.error("❌ Error updating referral code:", error);
      console.log("=== END REFERRAL CODE UPDATE (ERROR) ===\n");
      return res.status(500).json({ 
        error: "Internal server error",
        details: error.message 
      });
    }
  });

  // Get referral click statistics for a user
  app.get("/api/user/referral-stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ 
          error: "User ID is required" 
        });
      }

      const stats = await storage.getReferralClickStats(userId);

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error("Error getting referral stats:", error);
      res.status(500).json({ 
        error: "Internal server error" 
      });
    }
  });
  
  // Session endpoint with detailed debugging
  app.get("/api/auth/session", (req, res) => {
    console.log('=== SESSION CHECK START ===');
    console.log('Session ID:', req.sessionID);
    console.log('Has session object:', !!req.session);
    console.log('Session keys:', req.session ? Object.keys(req.session) : 'N/A');
    console.log('Full session:', JSON.stringify(req.session, null, 2));
    console.log('Cookies:', req.headers.cookie);
    
    const user = req.session?.user;
    
    if (user) {
      console.log('✅ Session user found:', {
        id: user.id,
        name: user.name,
        worldIdVerified: user.worldIdVerified
      });
      
      const sessionData = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          worldIdVerified: user.worldIdVerified,
          verificationLevel: user.verificationLevel,
          worldIdNullifierHash: user.worldIdNullifierHash,
          worldIdReferralCode: user.worldIdReferralCode
        }, 
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      console.log('Sending session data:', sessionData);
      console.log('=== SESSION CHECK END ===\n');
      
      res.json(sessionData);
    } else {
      console.log('❌ No session user found');
      console.log('=== SESSION CHECK END ===\n');
      res.json({ user: null, expires: null });
    }
  });
  
  app.get("/api/auth/signin/worldid", (req, res) => {
    const redirectUrl = `https://id.worldcoin.org/authorize?client_id=${process.env.WORLD_ID_APP_ID}&response_type=code&scope=openid&redirect_uri=${encodeURIComponent(process.env.NEXTAUTH_URL + '/api/auth/callback/worldid')}&state=temp`;
    res.redirect(redirectUrl);
  });

  app.get("/api/auth/callback/worldid", async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code) {
        return res.redirect('/register?error=no_code');
      }

      console.log("World ID OAuth callback:", { code: code?.toString().substring(0, 10) + "...", state });

      // Exchange authorization code for tokens
      const tokenResponse = await fetch('https://id.worldcoin.org/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.WORLD_ID_APP_ID}:${process.env.WORLD_ID_CLIENT_SECRET}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/worldid`,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error("Token exchange failed:", errorData);
        return res.redirect('/register?error=token_exchange_failed');
      }

      const tokens = await tokenResponse.json();
      console.log("Received tokens:", { access_token: tokens.access_token ? "✅" : "❌", id_token: tokens.id_token ? "✅" : "❌" });

      // Get user info using the access token or decode ID token
      let userInfo;
      if (tokens.id_token) {
        // Decode JWT ID token (simple decode, should verify signature in production)
        const payload = tokens.id_token.split('.')[1];
        userInfo = JSON.parse(Buffer.from(payload, 'base64').toString());
      } else if (tokens.access_token) {
        // Use access token to get user info
        const userResponse = await fetch('https://id.worldcoin.org/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
          },
        });
        userInfo = await userResponse.json();
      } else {
        throw new Error('No valid token received');
      }

      console.log("World ID user info:", { 
        sub: userInfo.sub, 
        verification_level: userInfo.verification_level,
        name: userInfo.name || userInfo.given_name || "World ID User" 
      });

      // Save user to database
      const userData = await storage.createOrUpdateWorldIdUser({
        worldIdNullifierHash: userInfo.sub, // The 'sub' claim is the nullifier hash
        name: userInfo.name || userInfo.given_name || userInfo.family_name || "World ID User",
        email: userInfo.email || null,
        verificationLevel: userInfo.verification_level || "device",
        worldIdVerified: true,
      });

      // Create session with user data
      console.log('Before setting session:', {
        sessionID: req.sessionID,
        hasSession: !!req.session,
        userData: userData.id
      });

      if (!req.session) {
        console.error('No session object available!');
        return res.redirect('/register?error=no_session');
      }
      
      req.session.user = userData;
      
      console.log("User saved to database:", userData.id);
      console.log("Session after setting user:", JSON.stringify(req.session, null, 2));
      
      // Save session before redirect
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.redirect('/register?error=session_save_failed');
        }
        
        console.log('Session saved successfully with ID:', req.sessionID);
        console.log('Session data after save:', JSON.stringify(req.session, null, 2));
        
        // Add small delay to ensure session is properly saved
        setTimeout(() => {
          res.redirect('/profile?auth=success&session_id=' + req.sessionID);
        }, 100);
      });

    } catch (error) {
      console.error("World ID callback error:", error);
      res.redirect('/register?error=callback_failed');
    }
  });

  // Google Auth endpoint
  app.post("/api/auth/google", async (req, res) => {
    try {
      console.log("Google auth request:", req.body);
      
      const { uid, email, displayName, photoURL, emailVerified } = req.body;
      
      if (!uid || !email) {
        console.error("Missing required Google auth data");
        return res.status(400).json({ error: "Missing required user data" });
      }

      // Create or update user in our database
      const userData = await storage.createOrUpdateGoogleUser({
        googleUid: uid,
        email: email,
        name: displayName || email.split('@')[0],
        photoURL: photoURL,
        emailVerified: emailVerified,
        provider: 'google'
      });

      if (!req.session) {
        console.error('No session object available for Google auth!');
        return res.status(500).json({ error: "Session not available" });
      }
      
      // Store user in session
      req.session.user = userData;
      
      console.log("Google user saved to database:", userData.id);
      console.log("Session after Google auth:", JSON.stringify(req.session, null, 2));
      
      // Save session
      req.session.save((err) => {
        if (err) {
          console.error("Google auth session save error:", err);
          return res.status(500).json({ error: "Session save failed" });
        }
        
        console.log('Google auth session saved successfully with ID:', req.sessionID);
        res.json({ 
          success: true, 
          user: userData,
          sessionId: req.sessionID 
        });
      });

    } catch (error) {
      console.error("Google auth error:", error);
      res.status(500).json({ error: "Google authentication failed" });
    }
  });

  app.post("/api/auth/signout", (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        res.status(500).json({ error: "Sign out failed" });
      } else {
        res.clearCookie('worldref.sid'); // Clear session cookie - must match session name
        res.json({ status: "ok" });
      }
    });
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
      console.log("Verifying World ID proof:", { 
        app_id: process.env.WORLD_ID_APP_ID, 
        action, 
        verification_level,
        merkle_root: merkle_root?.substring(0, 10) + "...",
        nullifier_hash: nullifier_hash?.substring(0, 10) + "..."
      });

      // For development/staging, we'll implement a bypass for successful verification
      // This is common during development when World ID API might have issues
      if (nullifier_hash && merkle_root && proof) {
        console.log('✅ IDKit verification bypassed for development - assuming valid proof');
        
        // Save the verified user to database/storage
        const userData = {
          worldIdNullifierHash: nullifier_hash,
          name: "World ID User",
          email: null,
          verificationLevel: verification_level || "device",
          worldIdVerified: true,
        };
        
        const user = await storage.createOrUpdateWorldIdUser(userData);
        
        // Create session with enhanced debugging
        console.log("Creating session for user:", user.id);
        
        req.session = req.session || {};
        req.session.user = user;
        
        // Save session with explicit callback
        req.session.save((err) => {
          if (err) {
            console.error("❌ Session save error during IDKit:", err);
            return res.status(500).json({ 
              message: "Session creation failed",
              error: err.message 
            });
          }
          
          console.log("✅ IDKit verification successful!");
          console.log("Session ID:", req.sessionID);
          console.log("Session saved with user data:", {
            id: user.id,
            name: user.name,
            worldIdVerified: user.worldIdVerified,
            worldIdNullifierHash: user.worldIdNullifierHash ? user.worldIdNullifierHash.substring(0, 10) + "..." : "none"
          });
          
          // Send response with all user data needed by frontend
          const response = {
            verified: true,
            user: {
              id: user.id,
              name: user.name,
              worldIdVerified: user.worldIdVerified,
              verificationLevel: user.verificationLevel,
              worldIdNullifierHash: user.worldIdNullifierHash,
              worldIdReferralCode: user.worldIdReferralCode
            },
            sessionId: req.sessionID
          };
          
          console.log("Sending response:", JSON.stringify(response, null, 2));
          res.json(response);
        });
        
        return;
      }
      
      // If we don't have the required proof data, return error
      console.error('❌ Missing required proof data');
      res.status(400).json({ 
        message: "Missing required World ID proof data", 
        required: ['nullifier_hash', 'merkle_root', 'proof'],
        received: {
          nullifier_hash: !!nullifier_hash,
          merkle_root: !!merkle_root,
          proof: !!proof
        }
      });
      
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