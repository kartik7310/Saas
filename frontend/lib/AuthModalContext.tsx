"use client"

import React, { createContext, useContext, useState } from "react"
import { AuthModal } from "@/components/auth/AuthModal"

interface AuthModalContextType {
  openLogin: () => void;
  openSignup: (hideBuyer?: boolean) => void;
  closeAuth: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const AuthModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modalState, setModalState] = useState<{ 
    open: boolean; 
    mode: "login" | "signup";
    hideBuyer?: boolean;
  }>({
    open: false,
    mode: "login",
    hideBuyer: false,
  });

  const openLogin = () => setModalState({ open: true, mode: "login", hideBuyer: false });
  const openSignup = (hideBuyer: boolean = false) => setModalState({ open: true, mode: "signup", hideBuyer });
  const closeAuth = () => setModalState({ open: false, mode: "login", hideBuyer: false });

  return (
    <AuthModalContext.Provider value={{ openLogin, openSignup, closeAuth }}>
      {children}
      <AuthModal 
        isOpen={modalState.open} 
        onClose={closeAuth} 
        initialMode={modalState.mode} 
        hideBuyer={modalState.hideBuyer}
      />
    </AuthModalContext.Provider>
  )
}

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
};
