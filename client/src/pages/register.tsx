import { useState } from "react";
import { ArrowLeft, Globe } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToastNotification } from "@/components/ui/toast-notification";

export default function Register() {
  const [toast, setToast] = useState({ message: "", isVisible: false, type: "success" as "success" | "error" });

  const handleWorldIdLogin = () => {
    setToast({ 
      message: "กำลังเชื่อมต่อกับ World ID...", 
      isVisible: true, 
      type: "success" 
    });
    
    // TODO: Integrate with actual World ID authentication
    setTimeout(() => {
      setToast({ 
        message: "การเข้าสู่ระบบด้วย World ID ยังอยู่ระหว่างการพัฒนา", 
        isVisible: true, 
        type: "success" 
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background font-thai">
      {/* Header */}
      <div className="gradient-bg text-white px-6 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-4">
            <Link href="/">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white hover:bg-opacity-20 p-2"
                data-testid="button-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold ml-3">สมัครสมาชิก WordReff</h1>
          </div>
          <p className="text-white text-opacity-90 text-sm">
            เข้าร่วมระบบเพื่อให้เราช่วยหาผู้สมัคร World ID ให้คุณ
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-md mx-auto">
          
          {/* Benefits Card */}
          <Card className="mb-6 shadow-sm border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-card-foreground mb-3">
                🎯 ประโยชน์ที่จะได้รับ
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✅ เราหาผู้สมัคร World ID ให้คุณอัตโนมัติ</li>
                <li>✅ รับรายได้สูงสุด 5,000 บาท จาก World ID</li>
                <li>✅ ไม่ต้องทำการตลาดหรือหาคนเอง</li>
                <li>✅ ระบบจัดสรรอย่างเป็นธรรม</li>
              </ul>
            </CardContent>
          </Card>

          {/* Login Card */}
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-foreground">เข้าสู่ระบบ</CardTitle>
              <p className="text-muted-foreground text-sm mt-2">
                ใช้ World ID ของคุณในการสมัครสมาชิก
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* World ID Login Button */}
              <Button
                onClick={handleWorldIdLogin}
                className="w-full py-4 text-lg font-semibold bg-black text-white hover:bg-gray-800 transition-colors shadow-lg"
                data-testid="button-worldid-login"
              >
                <div className="flex items-center justify-center">
                  <Globe className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">เข้าสู่ระบบด้วย World ID</div>
                    <div className="text-xs text-gray-300">ปลอดภัยและรวดเร็ว</div>
                  </div>
                </div>
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted-foreground border-opacity-20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-background text-muted-foreground">หรือ</span>
                </div>
              </div>

              {/* Traditional Form Placeholder */}
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-4">
                  ยังไม่มี World ID?
                </p>
                <Link href="/">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    data-testid="button-signup-worldid"
                  >
                    สมัคร World ID ฟรี
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Info Section */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-xs">
              การสมัครสมาชิก WordReff หมายความว่าคุณยอมรับ<br />
              <span className="text-primary underline">เงื่อนไขการใช้งาน</span> และ 
              <span className="text-primary underline"> นโยบายความเป็นส่วนตัว</span>
            </p>
          </div>
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