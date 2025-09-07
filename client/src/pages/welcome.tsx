import { Users, DollarSign, Zap } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-background font-thai">
      {/* Header */}
      <div className="gradient-bg text-white px-6 pt-12 pb-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">World ID Referral</h1>
          <p className="text-white text-opacity-90">ระบบจัดการแนะนำเพื่อน</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto">
          {/* Benefits Cards */}
          <div className="space-y-4 mb-8">
            <Card className="shadow-sm">
              <CardContent className="pt-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-secondary bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                    <DollarSign className="w-4 h-4 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-card-foreground">รายได้สูงสุด 500 บาท</h3>
                </div>
                <p className="text-muted-foreground text-sm">แนะนำเพื่อนสูงสุด 10 คนและรับผลตอบแทน</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="pt-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-card-foreground">ระบบจัดสรรอัตโนมัติ</h3>
                </div>
                <p className="text-muted-foreground text-sm">จัดสรรผู้สมัครอย่างเป็นธรรม ไม่เกิน 5 คนต่อคน</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="pt-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-accent bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                    <Zap className="w-4 h-4 text-accent" />
                  </div>
                  <h3 className="font-semibold text-card-foreground">ติดตามแบบเรียลไทม์</h3>
                </div>
                <p className="text-muted-foreground text-sm">ติดตามสถานะการแนะนำและรายได้ทันที</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/login">
              <Button 
                className="w-full py-4 text-lg font-semibold" 
                size="lg"
                data-testid="button-login"
              >
                เข้าสู่ระบบ
              </Button>
            </Link>
            <Link href="/register">
              <Button 
                variant="outline" 
                className="w-full py-4 text-lg font-semibold"
                size="lg"
                data-testid="button-register"
              >
                สมัครสมาชิก
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
