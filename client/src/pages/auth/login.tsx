import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { ToastNotification } from "@/components/ui/toast-notification";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [toast, setToast] = useState({ message: "", isVisible: false, type: "success" as const });

  const handleLogin = () => {
    // Mock login with sample user data
    const mockUser = {
      id: "demo-user-1",
      name: "ผู้ใช้ทดสอบ",
      phone: "0812345678",
      referrerId: null,
      maxReferrals: 5,
      totalEarnings: 0,
      createdAt: new Date(),
    };
    
    login(mockUser);
    setToast({ message: "เข้าสู่ระบบสำเร็จ", isVisible: true, type: "success" });
    setTimeout(() => setLocation("/dashboard"), 1000);
  };

  return (
    <div className="min-h-screen bg-background font-thai">
      <div className="px-6 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6 p-2" data-testid="button-back">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">เข้าสู่ระบบ</h1>
            <p className="text-muted-foreground">เข้าใช้งานระบบจัดการแนะนำเพื่อน</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <p className="text-muted-foreground text-sm mb-4">
                  นี่เป็นเวอร์ชันสำหรับทดสอบ UI เท่านั้น
                </p>
                
                <Button
                  onClick={handleLogin}
                  className="w-full py-3 font-semibold"
                  data-testid="button-submit"
                >
                  เข้าสู่ระบบ (ทดสอบ)
                </Button>
              </div>

              <div className="text-center mt-6">
                <Link href="/register">
                  <Button variant="link" data-testid="link-register">
                    ยังไม่มีบัญชี? สมัครสมาชิก
                  </Button>
                </Link>
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
