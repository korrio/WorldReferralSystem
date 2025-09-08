import { useState } from "react";
import { ArrowLeft, Users, DollarSign, Calendar, ExternalLink, Settings, Share } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToastNotification } from "@/components/ui/toast-notification";

export default function Profile() {
  const [toast, setToast] = useState({ message: "", isVisible: false, type: "success" as "success" | "error" });

  // Mock user data - จะเป็นข้อมูลจริงในภายหลัง
  const userData = {
    name: "สมชาย ใจดี",
    worldIdVerified: true,
    referralLink: `${window.location.origin}/r/user123`, // ใช้ short URL ผ่านระบบเรา
    originalWorldIdLink: "https://worldcoin.org/join/ABCD1234",
    currentReferrals: 3,
    maxReferrals: 10,
    totalClicks: 15, // จำนวนคลิกลิงค์ทั้งหมด
    joinDate: "15 มกราคม 2567",
    status: "active" as const,
  };

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(userData.referralLink);
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
        url: userData.referralLink,
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
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white hover:bg-opacity-20 p-2"
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
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
              <CardTitle className="text-xl">{userData.name}</CardTitle>
              <div className="flex justify-center space-x-2 mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✅ World ID Verified
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {userData.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{userData.currentReferrals}</div>
                  <div className="text-sm text-muted-foreground">ผู้สมัครปัจจุบัน</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">{userData.maxReferrals - userData.currentReferrals}</div>
                  <div className="text-sm text-muted-foreground">เหลือรับได้</div>
                </div>
              </div>
              
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(userData.currentReferrals / userData.maxReferrals) * 100}%` }}
                ></div>
              </div>
              
              <p className="text-center text-sm text-muted-foreground">
                {userData.currentReferrals} จาก {userData.maxReferrals} คน
              </p>
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
                  <div className="text-xl font-bold text-blue-600">{userData.totalClicks || 0}</div>
                  <div className="text-sm text-muted-foreground">คลิกทั้งหมด</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{userData.currentReferrals}</div>
                  <div className="text-sm text-muted-foreground">สมัครสำเร็จ</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">
                    {userData.totalClicks > 0 ? Math.round((userData.currentReferrals / userData.totalClicks) * 100) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">อัตราแปลง</div>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                คลิกลิงค์ = คนที่กดลิงค์ referral ของคุณ
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
              <div className="p-3 bg-muted rounded-lg text-sm font-mono break-all">
                {userData.referralLink}
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
            </CardContent>
          </Card>

          {/* Member Info */}
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">สมาชิกเมื่อ:</span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {userData.joinDate}
                </span>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      <ToastNotification
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}