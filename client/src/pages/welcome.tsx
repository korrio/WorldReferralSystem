import { useState, useEffect } from "react";
import { Users, DollarSign } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToastNotification } from "@/components/ui/toast-notification";
import { WorldIdSignupButton } from "@/components/WorldIdSignupButton";
import { WorldIdLogo } from "@/components/WorldIdLogo";
import { referralApi } from "@/lib/api";

export default function Welcome() {
  const [toast, setToast] = useState({ message: "", isVisible: false, type: "success" as "success" | "error" });
  const [, navigate] = useLocation();

  // ติดตามผู้เข้าชมเมื่อเข้าหน้าเว็บ
  useEffect(() => {
    referralApi.trackVisit().catch(console.error);
  }, []);

  // ดึงสถิติปัจจุบัน
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: referralApi.getStats,
    refetchInterval: 30000, // อัพเดททุก 30 วินาที
  });

  const handleWorldIdSignupSuccess = (data: { referralLink: string; memberName: string; referralId: string }) => {
    setToast({ 
      message: `พบลิ้งค์แนะนำจาก ${data.memberName}! กำลังเปิดหน้าสมัคร...`, 
      isVisible: true, 
      type: "success" 
    });
  };

  const handleWorldIdSignupError = (error: string) => {
    setToast({ 
      message: error, 
      isVisible: true, 
      type: "error" 
    });
  };

  const handleJoinMember = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-background font-thai">
      {/* Hero Section */}
      <div className="gradient-bg text-white px-6 pt-16 pb-12">
        <div className="max-w-md mx-auto text-center">
          <div className="mx-auto mb-6 flex items-center justify-center">
            <WorldIdLogo width={80} height={80} />
          </div>
          <h1 className="text-3xl font-bold mb-4">World Referral</h1>
          <p className="text-white text-opacity-90 text-lg mb-8">
            เครื่องมือช่วยหา Referral<br />
            ไม่มีเพื่อน เราช่วยหาให้คุณ ❤️
          </p>
          
          {/* ตัวเลือก 1: ยังไม่มี World ID */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-white font-semibold mb-2">ยังไม่มี World ID?</h3>
              <WorldIdSignupButton
                onSuccess={handleWorldIdSignupSuccess}
                onError={handleWorldIdSignupError}
                className="w-full py-4 text-lg font-semibold bg-black text-white hover:bg-gray-800 shadow-lg"
              />
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white border-opacity-30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-10 bg-gradient-to-r from-transparent via-purple-500 to-transparent text-white text-opacity-80">หรือ</span>
              </div>
            </div>

            {/* ตัวเลือก 2: มี World ID แล้ว */}
            <div className="text-center">
              <h3 className="text-white font-semibold mb-2">มี World ID แล้ว?</h3>
              <Button
                onClick={handleJoinMember}
                className="w-full py-4 text-lg font-semibold bg-green-500 text-white border-2 border-green-400 hover:bg-green-600 hover:border-green-500 transition-colors shadow-lg"
                data-testid="button-join-member"
              >
                <div className="flex items-center justify-center">
                  <Users className="w-5 h-5 mr-2" />
                  สมัครสมาชิก World Referral
                </div>
              </Button>
              <p className="text-white text-opacity-80 text-xs mt-2">
                เพื่อให้ระบบหารายได้ค่าแนะนำให้ สูงสุดประมาณ 5000 บาท
              </p>
            </div>
          </div>
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
                      เพียงแค่ฝาก referral link ของคุณไว้ เราจะหาคนมาสมัครให้ จนกว่าจะครบ 10 คนเอง
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
                    {stats.totalVisitors}
                  </div>
                  <div className="text-sm text-muted-foreground">คนเข้าชมทั้งหมด</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-secondary">
                    {stats.totalSignups}
                  </div>
                  <div className="text-sm text-muted-foreground">สมัครผ่าน WorldRef</div>
                </CardContent>
              </Card>
            </div>
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