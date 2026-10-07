"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "BUYER" | "SELLER" | "SUPER_ADMIN" | "BUILDER" | "BROKER";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  registerUser: (data: any) => Promise<any>;
  verifyOTP: (email: string, otp: string) => Promise<any>;
  initiateOTPLogin: (email: string) => Promise<any>;
  verifyOTPLogin: (email: string, otp: string) => Promise<any>;
  logout: () => Promise<void>;
  switchRole: (newRole: string, stayOnPage?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const getRoleRoute = (role: string) => {
  const r = role?.toUpperCase();
  if (r === "SUPER_ADMIN" || r === "ADMIN") return "/admin-dashboard";
  if (r === "SELLER") return "/seller";
  if (r === "BUILDER") return "/builder-dashboard";
  if (r === "BROKER") return "/broker";
  if (r === "BUYER") return "/";
  return "/";
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const data = await api("/auth/profile");
      const normalizedUser = data.user || data;
      setUser(normalizedUser);

      // If user is logged in and on an auth page or the landing page, redirect professional roles to their dashboard
      const path = window.location.pathname;
      const isProfessional = ["SELLER", "BUILDER", "BROKER", "ADMIN", "SUPER_ADMIN"].includes(normalizedUser.role?.toUpperCase());
      const isAuthPage = path.includes("/login") || path.includes("/signup");
      
      if (isAuthPage || (path === "/" && isProfessional)) {
        requestAnimationFrame(() => {
          window.location.href = getRoleRoute(normalizedUser.role);
        });
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (credentials: any) => {
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      // Save token to localStorage so api.ts sends it via header
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      const normalizedUser = data.user || data;
      setUser(normalizedUser);

      const isAuthPage = window.location.pathname.includes("/login") || window.location.pathname.includes("/signup");
      const isProfessional = ["SELLER", "BUILDER", "BROKER", "ADMIN", "SUPER_ADMIN"].includes(normalizedUser.role?.toUpperCase());
      const destination = getRoleRoute(normalizedUser.role);

      if (isAuthPage || isProfessional) {
        window.location.href = destination;
      }
      // If it's a BUYER logging in via popup, we stay on page.

    } catch (error: any) {
      throw error;
    }
  };

  const registerUser = async (userData: any) => {
    try {
      const data = await api("/auth/signup", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      return data;
    } catch (error: any) {
      throw error;
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const data = await api("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });

      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        const normalizedUser = data.user || data;
        setUser(normalizedUser);

        const isAuthPage = window.location.pathname.includes("/login") || window.location.pathname.includes("/signup");
        const destination = getRoleRoute(normalizedUser.role);

        const isProfessional = ["SELLER", "BUILDER", "BROKER", "ADMIN", "SUPER_ADMIN"].includes(normalizedUser.role?.toUpperCase());
        if (isAuthPage || isProfessional) {
          window.location.href = destination;
        }
      }
      return data;
    } catch (error: any) {
      throw error;
    }
  };

  const initiateOTPLogin = async (email: string) => {
    try {
      return await api("/auth/login-otp-init", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    } catch (error: any) {
      throw error;
    }
  };

  const verifyOTPLogin = async (email: string, otp: string) => {
    try {
      const data = await api("/auth/login-otp-verify", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });

      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        const normalizedUser = data.user || data;
        setUser(normalizedUser);

        const isAuthPage = window.location.pathname.includes("/login") || window.location.pathname.includes("/signup");
        const destination = getRoleRoute(normalizedUser.role);

        const isProfessional = ["SELLER", "BUILDER", "BROKER", "ADMIN", "SUPER_ADMIN"].includes(normalizedUser.role?.toUpperCase());
        if (isAuthPage || isProfessional) {
          window.location.href = destination;
        }
      }
      return data;
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch (error) {
      console.warn("Backend logout failed, proceeding with local logout", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      window.location.href = "/";
    }
  };

  const switchRole = async (newRole: string, stayOnPage: boolean = false) => {
    try {
      const data = await api("/auth/switch-role", {
        method: "PATCH",
        body: JSON.stringify({ newRole }),
      });

      if (data.success) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        setUser(data.user);
        
        // Always redirect to the appropriate landing page for the new role
        const destination = getRoleRoute(data.user.role);
        window.location.href = destination;
      }
    } catch (error: any) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      registerUser,
      verifyOTP,
      initiateOTPLogin,
      verifyOTPLogin,
      logout,
      switchRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};