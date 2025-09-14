import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorldIdSignupButtonProps {
  onSuccess?: (data: { referralLink: string; memberName: string; referralId: string }) => void;
  onError?: (error: string) => void;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg";
  children?: React.ReactNode;
}

export function WorldIdSignupButton({ 
  onSuccess, 
  onError, 
  className = "w-full py-4 text-lg font-semibold bg-white text-primary hover:bg-gray-100 shadow-lg",
  variant = "default",
  size = "default",
  children
}: WorldIdSignupButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetRandomReferral = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/referral/random');
      const data = await response.json();

      if (response.ok) {
        // Open the referral link in a new window
        window.open(data.referralLink, '_blank');
        
        // Call success callback
        onSuccess?.(data);
      } else {
        throw new Error(data.error || 'Failed to get referral link');
      }
    } catch (error) {
      console.error('Error getting random referral:', error);
      onError?.(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGetRandomReferral}
      disabled={isLoading}
      className={className}
      variant={variant}
      size={size}
      data-testid="button-signup-worldid"
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
          กำลังหาลิ้งค์...
        </div>
      ) : (
        children || (
          <div className="flex items-center justify-center">
            <ExternalLink className="w-5 h-5 mr-2" />
            สมัคร World ID ฟรี
          </div>
        )
      )}
    </Button>
  );
}