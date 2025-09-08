import { useState } from "react";
import { Users, DollarSign, Zap, ExternalLink } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToastNotification } from "@/components/ui/toast-notification";
import { referralApi } from "@/lib/api";

export default function Welcome() {
  const [toast, setToast] = useState({ message: "", isVisible: false, type: "success" as "success" | "error" });

  // ดึงสถิติปัจจุบัน
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: referralApi.getStats,
    refetchInterval: 30000, // อัพเดททุก 30 วินาที
  });

  // Mutation สำหรับขอ referral link
  const assignReferralMutation = useMutation({
    mutationFn: () => {
      // ดึงข้อมูลผู้ใช้
      const ipAddress = undefined; // จะได้จาก backend
      const userAgent = navigator.userAgent;
      
      return referralApi.assignReferral(ipAddress, userAgent);
    },
    onSuccess: (data) => {
      // เปิด World ID ในแท็บใหม่ด้วย referral link ที่ได้
      window.open(data.referralLink, '_blank');
      
      setToast({ 
        message: `จัดสรรเรียบร้อย! ${data.message}`, 
        isVisible: true, 
        type: "success" 
      });
    },
    onError: (error: any) => {
      setToast({ 
        message: error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่", 
        isVisible: true, 
        type: "error" 
      });
    },
  });

  const handleJoinWorldId = () => {
    assignReferralMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background font-thai">
      {/* Hero Section */}
      <div className="gradient-bg text-white px-6 pt-16 pb-12">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4">World ID Referral</h1>
          <p className="text-white text-opacity-90 text-lg mb-8">
            สมัคร World ID ฟรี<br />
            ช่วยเหลือสมาชิกได้รับรายได้
          </p>
          
          {/* CTA Button */}
          <Button
            onClick={handleJoinWorldId}
            disabled={assignReferralMutation.isPending}
            className="w-full py-4 text-lg font-semibold bg-white text-primary hover:bg-gray-100 shadow-lg"
            data-testid="button-join-worldid"
          >
            {assignReferralMutation.isPending ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                กำลังจัดสรร...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <ExternalLink className="w-5 h-5 mr-2" />
                สมัคร World ID ฟรี
              </div>
            )}
          </Button>
          
          <p className="text-white text-opacity-80 text-sm mt-4">
            * คลิกเพื่อเปิด World ID ในแท็บใหม่
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">
            ทำไมต้องสมัครผ่านเรา?
          </h2>
          
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-secondary bg-opacity-20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <DollarSign className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">
                      ช่วยหาสมาชิก ให้ครบ 10 คนเร็วขึ้น
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      รับเงินประมาณ 5000 บาทจาก world id เร็วขึ้น
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary bg-opacity-20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">
                      ระบบจัดสรรอัตโนมัติ
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      เพียงแค่ฝาก refferal link  ของคุณไว้ เราจะหาคนมาสมัครให้ จนกว่าจะครบ 10 คนเอง
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="px-6 py-8 bg-muted">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-center text-foreground mb-6">
              สถิติปัจจุบัน
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {stats.totalMembers}
                  </div>
                  <div className="text-sm text-muted-foreground">สมาชิก</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-secondary">
                    {stats.totalAssignments}
                  </div>
                  <div className="text-sm text-muted-foreground">ผู้สมัคร</div>
                </CardContent>
              </Card>
            </div>
            
            <p className="text-center text-muted-foreground text-sm mt-4">
              เฉลี่ย {stats.averageAssignmentsPerMember.toFixed(1)} คนต่อสมาชิก
            </p>
          </div>
        </div>
      )}

      <ToastNotification
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}