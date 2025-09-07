import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: "success" | "error" | "info";
}

export function ToastNotification({ message, isVisible, onClose, type = "success" }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <X className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-secondary text-secondary-foreground";
      case "error":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div
      className={cn(
        "fixed top-4 left-4 right-4 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 z-50",
        getBackgroundColor(),
        isVisible 
          ? "translate-y-0 opacity-100" 
          : "translate-y-[-100px] opacity-0 pointer-events-none"
      )}
      data-testid="toast-notification"
    >
      <div className="flex items-center">
        {getIcon()}
        <span className="ml-2 flex-1" data-testid="toast-message">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 p-1 rounded hover:bg-black hover:bg-opacity-10"
          data-testid="toast-close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
