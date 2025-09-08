import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { ToastNotification } from "@/components/ui/toast-notification";

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [toast, setToast] = useState({ message: "", isVisible: false, type: "success" as const });

  const handleRegister = () => {
    // Mock register with sample user data
    const mockUser = {
      id: "demo-user-2", 
      name: "ผู้ใช้ใหม่",
      phone: "0887654321",
      referrerId: null,
      maxReferrals: 5,
      totalEarnings: 0,
      createdAt: new Date(),
    };
    
    login(mockUser);
    setToast({ message: "สมัครสมาชิกสำเร็จ", isVisible: true, type: "success" });
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
            <h1 className="text-2xl font-bold text-foreground mb-2">สมัครสมาชิก</h1>
            <p className="text-muted-foreground">เริ่มต้นรับรายได้จากการแนะนำเพื่อน</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <p className="text-muted-foreground text-sm mb-4">
                  นี่เป็นเวอร์ชันสำหรับทดสอบ UI เท่านั้น
                </p>
                
                <Button
                  onClick={handleRegister}
                  className="w-full py-3 font-semibold"
                  data-testid="button-submit"
                >
                  สมัครสมาชิก (ทดสอบ)
                </Button>
              </div>

              <div className="text-center mt-6">
                <Link href="/login">
                  <Button variant="link" data-testid="link-login">
                    มีบัญชีแล้ว? เข้าสู่ระบบ
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
