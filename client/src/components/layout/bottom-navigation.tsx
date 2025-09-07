import { Home, Users, DollarSign, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  className?: string;
}

export function BottomNavigation({ className }: BottomNavigationProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "หน้าหลัก", testId: "nav-dashboard" },
    { path: "/referrals", icon: Users, label: "จัดการ", testId: "nav-referrals" },
    { path: "/earnings", icon: DollarSign, label: "รายได้", testId: "nav-earnings" },
    { path: "/profile", icon: User, label: "โปรไฟล์", testId: "nav-profile" },
  ];

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 bg-card border-t border-border", className)}>
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <button
                className={cn(
                  "flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors w-full h-full",
                  isActive && "text-primary"
                )}
                data-testid={item.testId}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
