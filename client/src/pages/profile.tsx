import { useState, useEffect } from "react";
import { ArrowLeft, Users, DollarSign, Calendar, ExternalLink, Settings, Share, LogOut, Edit3, Check } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ToastNotification } from "@/components/ui/toast-notification";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSession, signOut } from "@/hooks/use-session";

export default function Profile() {
  const [toast, setToast] = useState({ message: "", isVisible: false, type: "success" as "success" | "error" });
  const [, navigate] = useLocation();
  const { data: session, status, refresh: refreshSession } = useSession();
  const [memberData, setMemberData] = useState<any>(null);
  const [clickStats, setClickStats] = useState({ 
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
    recentClicks: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingReferralCode, setIsEditingReferralCode] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [isSavingReferralCode, setIsSavingReferralCode] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    // On initial mount, refresh session to get the latest data
    if (status === "loading") {
      refreshSession();
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      navigate("/register?error=not_authenticated");
      return;
    }

    if (session?.user) {
      fetchUserData();
    }
  }, [session, status, navigate]);

  const fetchUserData = async () => {
    if (!session?.user) return;

    try {
      setIsLoading(true);
      
      // For now, we'll create mock member data for the authenticated user
      // In a real app, you'd link the World ID user to a member record
      // Generate the actual World ID referral link if user has referral code
      const userReferralCode = (session.user as any).worldIdReferralCode;
      const referralLink = userReferralCode 
        ? `https://worldcoin.org/join/${userReferralCode}`
        : null;

      const userData = {
        name: session.user.name || "World ID User",
        worldIdVerified: session.user.worldIdVerified || false,
        verificationLevel: session.user.verificationLevel || "device",
        worldIdReferralCode: userReferralCode || "",
        referralLink: referralLink,
        currentReferrals: 0, // Will be updated from click stats
        maxReferrals: 10,
        totalClicks: 0,
        joinDate: new Date().toLocaleDateString('th-TH', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }),
        status: "active" as const,
      };

      setMemberData(userData);
      setReferralCode(userData.worldIdReferralCode || "");

      // Fetch referral click statistics
      try {
        const statsResponse = await fetch(`/api/user/referral-stats/${session.user.id}`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.success) {
            setClickStats(statsData.stats);
          }
        }
      } catch (statsError) {
        console.error("Error fetching referral stats:", statsError);
        // Don't show error to user, just use default stats
      }

    } catch (error) {
      console.error("Error fetching user data:", error);
      setToast({
        message: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
        isVisible: true,
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleSaveReferralCode = async () => {
    if (!session?.user || !referralCode.trim()) {
      setToast({
        message: "กรุณาใส่รหัส referral code",
        isVisible: true,
        type: "error"
      });
      return;
    }

    setIsSavingReferralCode(true);
    
    try {
      console.log("Sending referral code update request...");
      console.log("Session user:", JSON.stringify(session.user, null, 2));
      
      const requestBody = {
        nullifierHash: (session.user as any).worldIdNullifierHash,
        referralCode: referralCode.trim()
      };
      
      console.log("Request body:", JSON.stringify(requestBody, null, 2));
      
      const response = await fetch('/api/user/referral-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}...`);
      }

      if (response.ok) {
        setToast({
          message: "บันทึก referral code สำเร็จ!",
          isVisible: true,
          type: "success"
        });
        setIsEditingReferralCode(false);
        
        // Update the member data with both referral code and link
        const trimmedCode = referralCode.trim();
        setMemberData(prev => ({
          ...prev,
          worldIdReferralCode: trimmedCode,
          referralLink: `https://worldcoin.org/join/${trimmedCode}`
        }));
        
        // Refresh session to get updated user data
        refreshSession();
      } else {
        throw new Error(data.error || 'Failed to save referral code');
      }
    } catch (error) {
      console.error('Error saving referral code:', error);
      setToast({
        message: `เกิดข้อผิดพลาด: ${error.message}`,
        isVisible: true,
        type: "error"
      });
    } finally {
      setIsSavingReferralCode(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background font-thai flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || !memberData) {
    return (
      <div className="min-h-screen bg-background font-thai flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">ไม่พบข้อมูลผู้ใช้</p>
          <Link href="/register">
            <Button>กลับไปหน้าสมัครสมาชิก</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(memberData.referralLink);
    setToast({ 
      message: "คัดลอก Referral Link แล้ว!", 
      isVisible: true, 
      type: "success" 
    });
  };

  const handleShareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'World ID Referral',
        text: 'สมัคร World ID ฟรีผ่านลิงค์นี้',
        url: memberData.referralLink,
      });
    } else {
      handleCopyReferralLink();
    }
  };

  return (
    <div className="min-h-screen bg-background font-thai">
      {/* Header */}
      <div className="gradient-bg text-white px-6 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Link href="/register">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2"
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold ml-3">โปรไฟล์สมาชิก</h1>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsSettingsModalOpen(true)}
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white hover:bg-opacity-20 p-2"
                data-testid="button-settings"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button 
                onClick={handleSignOut}
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white hover:bg-opacity-20 p-2"
                data-testid="button-signout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="px-6 py-6">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* User Info Card */}
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 mx-auto mb-4 bg-primary bg-opacity-20 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-xl">{memberData.name}</CardTitle>
              <div className="flex justify-center space-x-2 mt-2">
                {memberData.worldIdVerified ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ✅ World ID Verified ({memberData.verificationLevel})
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    ❌ Not Verified
                  </Badge>
                )}
                <Badge variant="outline" className="capitalize">
                  {memberData.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{memberData.currentReferrals}</div>
                  <div className="text-sm text-muted-foreground">ผู้สมัครปัจจุบัน</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">{memberData.maxReferrals - memberData.currentReferrals}</div>
                  <div className="text-sm text-muted-foreground">เหลือรับได้</div>
                </div>
              </div>
              
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(memberData.currentReferrals / memberData.maxReferrals) * 100}%` }}
                ></div>
              </div>
              
              <p className="text-center text-sm text-muted-foreground">
                {memberData.currentReferrals} จาก {memberData.maxReferrals} คน
              </p>
            </CardContent>
          </Card>

          {/* World ID Referral Code Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Share className="w-5 h-5 mr-2 text-purple-600" />
                World ID Referral Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                ใส่รหัส referral code ของคุณจาก World ID เพื่อให้สมาชิกคนอื่นสามารถใช้ลิ้งค์ของคุณสมัคร World ID
              </p>
              
              {isEditingReferralCode ? (
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="ใส่รหัส referral code (เช่น ABC123XYZ)"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      className="flex-1"
                      disabled={isSavingReferralCode}
                    />
                    <Button 
                      onClick={handleSaveReferralCode}
                      disabled={isSavingReferralCode || !referralCode.trim()}
                      className="px-3"
                    >
                      {isSavingReferralCode ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => {
                        setIsEditingReferralCode(false);
                        setReferralCode(memberData.worldIdReferralCode || "");
                      }}
                      variant="outline" 
                      size="sm"
                      disabled={isSavingReferralCode}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      {memberData.worldIdReferralCode ? (
                        <div>
                          <p className="font-mono text-sm font-medium">{memberData.worldIdReferralCode}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            worldcoin.org/join/{memberData.worldIdReferralCode}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">ยังไม่ได้ใส่ referral code</p>
                      )}
                    </div>
                    <Button 
                      onClick={() => setIsEditingReferralCode(true)}
                      variant="ghost" 
                      size="sm"
                      className="ml-2"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {memberData.worldIdReferralCode && (
                    <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                      ✅ ลิ้งค์ referral ของคุณพร้อมให้สมาชิกคนอื่นใช้แล้ว
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Click Statistics Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <ExternalLink className="w-5 h-5 mr-2 text-blue-600" />
                สถิติคลิกลิงค์
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{clickStats.totalClicks || 0}</div>
                  <div className="text-sm text-muted-foreground">คลิกทั้งหมด</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{clickStats.totalConversions || 0}</div>
                  <div className="text-sm text-muted-foreground">สมัครสำเร็จ</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">
                    {Math.round(clickStats.conversionRate || 0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">อัตราแปลง</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-center text-sm text-muted-foreground">
                  คลิกลิงค์ = คนที่กดปุ่ม "สมัคร World ID ฟรี" และได้ลิ้งค์ referral ของคุณ
                </div>
                
                {clickStats.recentClicks && clickStats.recentClicks.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">คลิกล่าสุด:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {clickStats.recentClicks.slice(0, 5).map((click: any, index: number) => (
                        <div key={click.id} className="flex justify-between items-center text-xs bg-muted p-2 rounded">
                          <span>{new Date(click.clickedAt).toLocaleString('th-TH')}</span>
                          <span className={click.convertedAt ? "text-green-600" : "text-muted-foreground"}>
                            {click.convertedAt ? "✅ แปลงแล้ว" : "⏳ รอแปลง"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Referral Link Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <ExternalLink className="w-5 h-5 mr-2 text-blue-600" />
                Referral Link ของคุณ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {memberData.referralLink ? (
                <>
                  <div className="p-3 bg-muted rounded-lg text-sm font-mono break-all">
                    {memberData.referralLink}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={handleCopyReferralLink}
                      variant="outline"
                      className="w-full"
                      data-testid="button-copy-link"
                    >
                      คัดลอกลิงค์
                    </Button>
                    <Button 
                      onClick={handleShareReferralLink}
                      className="w-full"
                      data-testid="button-share-link"
                    >
                      <Share className="w-4 h-4 mr-2" />
                      แชร์ลิงค์
                    </Button>
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    ใช้ลิงค์นี้เพื่อเชิญเพื่อน ๆ สมัคร World ID
                  </div>
                </>
              ) : (
                <div className="text-center p-6 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    คุณยังไม่ได้ใส่ referral code
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ไปที่ส่วน "World ID Referral Code" ด้านบนเพื่อใส่รหัส referral ของคุณ
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Member Info */}
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">สมาชิกเมื่อ:</span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {memberData.joinDate}
                </span>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Settings Modal */}
      <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center font-bold text-xl">
              World Referral System
            </DialogTitle>
            <DialogDescription className="text-center mt-4 text-sm leading-relaxed">
              เราคือระบบ middleware ช่วยคุณหา referral friend ให้คุณสร้างรายได้ได้ง่ายขึ้นผ่านการโฆษณาและกระจายลิ้งในเครือข่าย Social Network และ การยิง Ads เพื่อให้คุณได้รับ Rewards จาก World ได้รวดเร็วทันใจขึ้น
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <ToastNotification
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}