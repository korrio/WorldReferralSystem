import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { authApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { ToastNotification } from "@/components/ui/toast-notification";

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [toast, setToast] = useState({ message: "", isVisible: false, type: "success" as const });

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      name: "",
      phone: "",
      referrerId: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      login(data.user);
      setToast({ message: data.message, isVisible: true, type: "success" });
      setTimeout(() => setLocation("/dashboard"), 1000);
    },
    onError: (error: any) => {
      setToast({ 
        message: error.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก", 
        isVisible: true, 
        type: "error" 
      });
    },
  });

  const onSubmit = (data: InsertUser) => {
    if (!acceptTerms) {
      setToast({ 
        message: "กรุณายอมรับเงื่อนไขการใช้งาน", 
        isVisible: true, 
        type: "error" 
      });
      return;
    }
    registerMutation.mutate(data);
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="กรุณากรอกชื่อ-นามสกุล"
                    {...form.register("name")}
                    data-testid="input-name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-destructive text-sm mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

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
                  <Label htmlFor="referrerId">ID ของผู้แนะนำ (ถ้ามี)</Label>
                  <Input
                    id="referrerId"
                    type="text"
                    placeholder="ระบุ ID ผู้แนะนำ"
                    {...form.register("referrerId")}
                    data-testid="input-referrer"
                  />
                  {form.formState.errors.referrerId && (
                    <p className="text-destructive text-sm mt-1">
                      {form.formState.errors.referrerId.message}
                    </p>
                  )}
                </div>

                <Card className="bg-muted">
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                        data-testid="checkbox-terms"
                      />
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        ยอมรับ
                        <span className="text-primary"> เงื่อนไขการใช้งาน</span> และ
                        <span className="text-primary"> นโยบายความเป็นส่วนตัว</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  className="w-full py-3 font-semibold"
                  disabled={registerMutation.isPending}
                  data-testid="button-submit"
                >
                  {registerMutation.isPending ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
                </Button>
              </form>

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
