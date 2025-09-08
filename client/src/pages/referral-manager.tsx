import { ArrowLeft, Plus, CheckCircle, Clock } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { useAuth } from "@/hooks/use-auth";
import { userApi } from "@/lib/api";

export default function ReferralManager() {
  const { user } = useAuth();

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

  if (!user) {
    return <div>กำลังโหลด...</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-secondary bg-opacity-20 text-secondary">
            <CheckCircle className="w-3 h-3 mr-1" />
            ยืนยันแล้ว
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-accent bg-opacity-20 text-accent">
            <Clock className="w-3 h-3 mr-1" />
            รอยืนยัน
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background font-thai pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center">
          <Link href="/dashboard">
            <Button variant="ghost" className="mr-4 p-2" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-foreground">จัดการผู้สมัคร</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="shadow-sm text-center">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-secondary" data-testid="total-assigned">
                {stats.totalReferrals}
              </div>
              <div className="text-sm text-muted-foreground">ผู้สมัครที่ได้รับ</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm text-center">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary" data-testid="available-slots">
                {stats.remainingSlots}
              </div>
              <div className="text-sm text-muted-foreground">สล็อตที่เหลือ</div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Users List */}
        <Card className="shadow-sm">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-card-foreground">ผู้สมัครที่ได้รับมอบหมาย</h2>
          </div>

          {referralsLoading ? (
            <CardContent className="pt-4">
              <div className="text-center py-8">
                <div className="text-muted-foreground">กำลังโหลด...</div>
              </div>
            </CardContent>
          ) : referrals.length > 0 ? (
            <div className="divide-y divide-border">
              {referrals.map((referral) => (
                <div key={referral.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold text-primary">
                        {getInitials(referral.referredName)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-card-foreground" data-testid={`referral-name-${referral.id}`}>
                        {referral.referredName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        มอบหมายเมื่อ {new Date(referral.assignedAt).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(referral.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <CardContent className="pt-4">
              <div className="text-center py-8">
                <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">ยังไม่มีผู้สมัคร</p>
                <p className="text-muted-foreground text-xs">ระบบจะจัดสรรผู้สมัครใหม่ให้อัตโนมัติ</p>
              </div>
            </CardContent>
          )}

          {/* Empty State for remaining slots */}
          {stats.remainingSlots > 0 && (
            <div className="p-4 border-t border-border bg-muted bg-opacity-50">
              <div className="text-center py-8">
                <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  เหลือสล็อตอีก {stats.remainingSlots} คน
                </p>
                <p className="text-muted-foreground text-xs">
                  ระบบจะจัดสรรผู้สมัครใหม่ให้อัตโนมัติ
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Instructions */}
        <Card className="bg-muted mt-6">
          <CardContent className="pt-4">
            <div className="flex items-start">
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                <span className="text-white text-xs">i</span>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">วิธีการทำงาน</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• ระบบจะจัดสรรผู้สมัครใหม่ให้อัตโนมัติ</li>
                  <li>• แต่ละคนจะได้รับไม่เกิน 5 คน</li>
                  <li>• เมื่อผู้สมัครยืนยันตัวตน จะได้รับ 50 บาท</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
