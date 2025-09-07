import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginSchema, type LoginCredentials } from "@shared/schema";
import { authApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { ToastNotification } from "@/components/ui/toast-notification";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [toast, setToast] = useState({ message: "", isVisible: false, type: "success" as const });

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      otp: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.user);
      setToast({ message: data.message, isVisible: true, type: "success" });
      setTimeout(() => setLocation("/dashboard"), 1000);
    },
    onError: (error: any) => {
      setToast({ 
        message: error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ", 
        isVisible: true, 
        type: "error" 
      });
    },
  });

  const onSubmit = (data: LoginCredentials) => {
    loginMutation.mutate(data);
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="08X-XXX-XXXX"
                    {...form.register("phone")}
                    data-testid="input-phone"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-destructive text-sm mt-1">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="otp">รหัส OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="xxxxxx"
                    maxLength={6}
                    {...form.register("otp")}
                    data-testid="input-otp"
                  />
                  {form.formState.errors.otp && (
                    <p className="text-destructive text-sm mt-1">
                      {form.formState.errors.otp.message}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs mt-1">
                    ใช้รหัส: 123456 สำหรับทดสอบ
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full py-3 font-semibold"
                  disabled={loginMutation.isPending}
                  data-testid="button-submit"
                >
                  {loginMutation.isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </Button>
              </form>

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
