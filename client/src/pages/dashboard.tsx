import { useState } from "react";
import { Share2, Users, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { ToastNotification } from "@/components/ui/toast-notification";
import { useAuth } from "@/hooks/use-auth";
import { userApi } from "@/lib/api";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [toast, setToast] = useState({ message: "", isVisible: false, type: "success" as const });

  // Mock stats data for UI testing
  const stats = {
    totalReferrals: 3,
    verifiedReferrals: 2,
    pendingReferrals: 1,
    remainingSlots: 2,
    totalEarnings: 100,
    progressPercentage: 60,
  };

  // Mock referrals data for UI testing
  const referrals = [
    {
      id: "ref-1",
      referredName: "สมชาย ใจดี",
      referredPhone: "0812345678",
      status: "verified",
      earnings: 50,
      assignedAt: new Date('2024-01-15'),
      referrerId: user?.id || "",
      verifiedAt: new Date('2024-01-16'),
    },
    {
      id: "ref-2", 
      referredName: "สมศรี สุขสม",
      referredPhone: "0887654321",
      status: "verified",
      earnings: 50,
      assignedAt: new Date('2024-01-14'),
      referrerId: user?.id || "",
      verifiedAt: new Date('2024-01-15'),
    },
    {
      id: "ref-3",
      referredName: "นายวิชัย มั่นคง",
      referredPhone: "0898765432", 
      status: "pending",
      earnings: 50,
      assignedAt: new Date('2024-01-16'),
      referrerId: user?.id || "",
      verifiedAt: null,
    },
  ];

  const statsLoading = false;
  const referralsLoading = false;

  const generateReferralLink = async () => {
    if (!user) return;
    
    const referralLink = `${window.location.origin}/register?ref=${user.id}`;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setToast({ message: "ลิงก์แนะนำถูกคัดลอกแล้ว!", isVisible: true, type: "success" });
    } catch (error) {
      setToast({ message: referralLink, isVisible: true, type: "success" });
    }
  };

  if (!user) {
    return <div>กำลังโหลด...</div>;
  }

  const recentReferrals = referrals.slice(0, 2);

  return (
    <div className="min-h-screen bg-background font-thai pb-20">
      {/* Header */}
      <div className="gradient-bg text-white px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold" data-testid="user-name">สวัสดี, {user.name}</h1>
            <p className="text-white text-opacity-80 text-sm">
              ID: <span data-testid="user-id">{user.id.slice(0, 8).toUpperCase()}</span>
            </p>
          </div>
          <Link href="/profile">
            <Button variant="ghost" className="p-2 bg-white bg-opacity-20 rounded-full" data-testid="button-profile">
              <Users className="w-6 h-6 text-white" />
            </Button>
          </Link>
        </div>

        {/* Earnings Summary */}
        <Card className="bg-white bg-opacity-20 border-0">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4 text-white">
              <div className="text-center">
                <p className="text-white text-opacity-80 text-sm">รายได้ทั้งหมด</p>
                <p className="text-2xl font-bold" data-testid="total-earnings">
                  ฿{stats.totalEarnings}
                </p>
              </div>
              <div className="text-center">
                <p className="text-white text-opacity-80 text-sm">คนที่แนะนำ</p>
                <p className="text-2xl font-bold" data-testid="referral-count">
                  {`${stats.totalReferrals}/10`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {/* Progress Section */}
        <Card className="shadow-sm mb-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">ความคืบหน้า</h2>

            {/* Progress Circle */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full progress-circle" viewBox="0 0 36 36">
                  <path 
                    className="text-muted stroke-current" 
                    strokeDasharray="100, 100" 
                    strokeWidth="3" 
                    fill="none" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path 
                    className="text-primary stroke-current" 
                    strokeDasharray={`${stats.progressPercentage}, 100`}
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    fill="none" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground" data-testid="progress-percentage">
                      {stats.progressPercentage}%
                    </div>
                    <div className="text-xs text-muted-foreground">เสร็จสิ้น</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Info */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <Card className="bg-muted">
                <CardContent className="pt-3">
                  <p className="text-sm text-muted-foreground">คนที่ได้รับ</p>
                  <p className="text-xl font-bold text-secondary" data-testid="allocated-referrals">
                    {stats.totalReferrals}
                  </p>
                  <p className="text-xs text-muted-foreground">คน</p>
                </CardContent>
              </Card>
              <Card className="bg-muted">
                <CardContent className="pt-3">
                  <p className="text-sm text-muted-foreground">เหลือสล็อต</p>
                  <p className="text-xl font-bold text-primary" data-testid="remaining-slots">
                    {stats.remainingSlots}
                  </p>
                  <p className="text-xs text-muted-foreground">คน</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <Link href="/referrals">
            <Card className="shadow-sm hover:bg-muted transition-colors cursor-pointer">
              <CardContent className="pt-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-card-foreground">จัดการผู้สมัคร</h3>
                    <p className="text-sm text-muted-foreground">ดูรายชื่อผู้สมัครที่ได้รับมอบหมาย</p>
                  </div>
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card 
            className="shadow-sm hover:bg-muted transition-colors cursor-pointer"
            onClick={generateReferralLink}
          >
            <CardContent className="pt-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-secondary bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                  <Share2 className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-card-foreground">สร้างลิงก์แนะนำ</h3>
                  <p className="text-sm text-muted-foreground">แชร์ลิงก์ให้เพื่อนเพื่อสมัคร World ID</p>
                </div>
                <Plus className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-sm">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-card-foreground mb-4">กิจกรรมล่าสุด</h3>

            {referralsLoading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">กำลังโหลด...</div>
              </div>
            ) : recentReferrals.length > 0 ? (
              <div className="space-y-3">
                {recentReferrals.map((referral) => (
                  <Card key={referral.id} className="bg-muted">
                    <CardContent className="pt-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-secondary bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                          <Plus className="w-4 h-4 text-secondary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-card-foreground">
                            {referral.status === "verified" ? "ผู้สมัครยืนยันตัวตนสำเร็จ" : "ได้รับผู้สมัครใหม่"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {referral.referredName} • {new Date(referral.assignedAt).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                        <span className="text-secondary font-semibold text-sm">+{referral.earnings}฿</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">ยังไม่มีกิจกรรม</p>
                <p className="text-muted-foreground text-xs">เริ่มแนะนำเพื่อนเพื่อรับรายได้</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />

      <ToastNotification
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
