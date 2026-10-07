"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { LoginForm, SignupForm } from "./AuthForms"

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
  hideBuyer?: boolean;
}

export function AuthModal({ isOpen, onClose, initialMode = "login", hideBuyer = false }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Reset to initial mode when modal opens/closes if needed, 
  // but usually we want to keep the state while it's open.

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95%] sm:max-w-[400px] p-5 md:p-6 rounded-2xl overflow-hidden max-h-[95vh]">
        {/* Hidden DialogTitle for accessibility */}
        <DialogTitle className="sr-only">
          {mode === "login" ? "Login to your account" : "Create a new account"}
        </DialogTitle>
        
        {mode === "login" ? (
          <LoginForm 
            onSuccess={onClose} 
            onSwitchMode={() => setMode("signup")} 
            isAddPropertyIntent={hideBuyer}
          />
        ) : (
          <SignupForm 
            onSuccess={onClose} 
            onSwitchMode={() => setMode("login")} 
            hideBuyer={hideBuyer}
            isAddPropertyIntent={hideBuyer}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
