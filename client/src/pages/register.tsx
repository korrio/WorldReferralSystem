import { useState, useEffect } from "react";
import { ArrowLeft, Globe, Shield } from "lucide-react";
import { Link, useLocation } from "wouter";
import { IDKitWidget, ISuccessResult } from '@worldcoin/idkit';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToastNotification } from "@/components/ui/toast-notification";
import { WorldIdSignupButton } from "@/components/WorldIdSignupButton";
import { WORLD_ID_CONFIG, handleWorldIDSuccess, handleWorldIDError, type WorldIDUser } from "@/lib/worldid";
import { useSession } from "@/hooks/use-session";

export default function Register() {
  const [toast, setToast] = useState({ message: "", isVisible: false, type: "success" as "success" | "error" });
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const { data: session, status, refresh: refreshSession } = useSession();

  // Show initial configuration
  useEffect(() => {
    const config = {
      app_id: WORLD_ID_CONFIG.app_id,
      action: WORLD_ID_CONFIG.action,
      verification_level: WORLD_ID_CONFIG.verification_level,
      session_status: status,
      session_data: session,
      timestamp: new Date().toISOString()
    };
    setDebugInfo(`Initial World ID Config:\n${JSON.stringify(config, null, 2)}`);
    console.log("World ID Configuration:", config);
  }, [session, status]);



  const onWorldIDSuccess = async (user: WorldIDUser) => {
    setIsLoading(false);
    setToast({ 
      message: "World ID ยืนยันตัวตนสำเร็จ! กำลังเข้าสู่ระบบ...", 
      isVisible: true, 
      type: "success" 
    });
    
    // The server has already created a session for us
    // Refresh the session to get the latest data
    setTimeout(async () => {
      refreshSession();
      // Wait a bit for the session to refresh, then navigate
      setTimeout(() => {
        navigate("/profile");
      }, 500);
    }, 1500);
  };

  const onWorldIDError = (error: Error) => {
    setIsLoading(false);
    setToast({ 
      message: `เกิดข้อผิดพลาด: ${error.message}`, 
      isVisible: true, 
      type: "error" 
    });
  };

  const onVerifySuccess = (proof: ISuccessResult) => {
    setIsLoading(true);
    setToast({ 
      message: "กำลังยืนยันตัวตนกับ World ID...", 
      isVisible: true, 
      type: "success" 
    });
    
    handleWorldIDSuccess(proof, onWorldIDSuccess, onWorldIDError);
  };

  const onVerifyError = (error: any) => {
    setIsLoading(false);
    console.error("World ID Verification Error:", error);
    setDebugInfo(`Error Details:\n${JSON.stringify(error, null, 2)}`);
    
    // Handle specific bridge 404 error
    if (error?.message?.includes('bridge.worldcoin.org') || 
        error?.message?.includes('404') ||
        error?.code === 'network_error') {
      
      setToast({
        message: "เกิดปัญหาเชื่อมต่อกับ World ID ชั่วคราว แต่การยืนยันอาจสำเร็จแล้ว กรุณาลองอีกครั้ง",
        isVisible: true,
        type: "error"
      });
      
      // Add user-friendly explanation to debug info
      setDebugInfo(prev => prev + `\n\n=== User-Friendly Info ===\nBridge 404 Error: This is a known World ID infrastructure issue that doesn't affect the core verification process. Your verification may have actually succeeded despite this error.`);
      
      return;
    }
    
    handleWorldIDError(error, onWorldIDError);
  };

  const handleRandomReferralSuccess = (data: { referralLink: string; memberName: string; referralId: string }) => {
    setToast({
      message: `พบลิ้งค์แนะนำจาก ${data.memberName}! กำลังเปิดหน้าสมัคร...`,
      isVisible: true,
      type: "success"
    });
    setDebugInfo(`Random Referral Link:\n${JSON.stringify(data, null, 2)}`);
  };

  const handleRandomReferralError = (error: string) => {
    setToast({
      message: `เกิดข้อผิดพลาด: ${error}`,
      isVisible: true,
      type: "error"
    });
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
                <li>✅ ระบบจะช่วยคุณได้ค่าแนะนำคนละประมาณ 500 บาท สูงสุด 10 คน ( ตามนโยบายของ World ID)</li>
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

              {/* IDKit World ID Login Button */}
              <IDKitWidget
                app_id={WORLD_ID_CONFIG.app_id}
                action={WORLD_ID_CONFIG.action}
                onSuccess={onVerifySuccess}
                onError={onVerifyError}
                verification_level={WORLD_ID_CONFIG.verification_level}
                enableTelemetry
                handleVerify={async (proof) => {
                  console.log("World ID Proof:", proof);
                  setDebugInfo(JSON.stringify(proof, null, 2));
                  return Promise.resolve();
                }}
                onInitSuccess={() => {
                  console.log("World ID initialized successfully");
                  const config = {
                    app_id: WORLD_ID_CONFIG.app_id,
                    action: WORLD_ID_CONFIG.action,
                    verification_level: WORLD_ID_CONFIG.verification_level
                  };
                  setDebugInfo(`World ID Config:\n${JSON.stringify(config, null, 2)}`);
                }}
              >
                {({ open }) => (
                  <Button
                    onClick={open}
                    disabled={isLoading}
                    className="w-full py-4 text-lg font-semibold bg-black text-white hover:bg-gray-800 transition-colors shadow-lg"
                    data-testid="button-worldid-login"
                  >
                    <div className="flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          กำลังยืนยัน...
                        </>
                      ) : (
                        <>
                          <Globe className="w-6 h-6 mr-3" />
                          <span className="font-semibold">เข้าสู่ระบบด้วย World ID</span>
                        </>
                      )}
                    </div>
                  </Button>
                )}
              </IDKitWidget>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted-foreground border-opacity-20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-background text-muted-foreground">หรือ</span>
                </div>
              </div>

              {/* World ID Registration with Random Referral */}
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-4">
                  ยังไม่มี World ID?
                </p>
                <WorldIdSignupButton
                  onSuccess={handleRandomReferralSuccess}
                  onError={handleRandomReferralError}
                  variant="outline"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  เราจะหาลิ้งค์แนะนำจากสมาชิกให้คุณ
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Debug Section */}
          {debugInfo && (
            <Card className="mt-6 bg-gray-50">
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-auto max-h-40">
                  {debugInfo}
                </pre>
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => navigator.clipboard.writeText(debugInfo)}
                    variant="outline"
                    size="sm"
                  >
                    Copy Debug Info
                  </Button>
                  <Button
                    onClick={() => {
                      const deepLink = `https://worldcoin.org/verify?app_id=${WORLD_ID_CONFIG.app_id}&action=${WORLD_ID_CONFIG.action}&signal=&verification_level=${WORLD_ID_CONFIG.verification_level}`;
                      navigator.clipboard.writeText(deepLink);
                      setToast({
                        message: "World ID deep link copied to clipboard!",
                        isVisible: true,
                        type: "success"
                      });
                      setDebugInfo(prev => prev + `\n\nDeep Link URL:\n${deepLink}`);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Copy QR URL
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* World ID Info Section */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="text-center">
                <h4 className="text-sm font-medium text-blue-800 mb-2">💡 เกี่ยวกับ World ID</h4>
                <p className="text-xs text-blue-700">
                  หากพบข้อผิดพลาด "bridge.worldcoin.org 404" ในคอนโซล นี่เป็นปัญหาชั่วคราวของ World ID<br />
                  ไม่ส่งผลต่อการใช้งาน และการยืนยันของคุณอาจสำเร็จแล้ว
                </p>
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