"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface User {
  username: string;
  email: string;
  is_superuser: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (formData: FormData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await api.get("/users/me");
          setUser(userData);
        } catch (error) {
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (formData: FormData) => {
    const data = await api.login(formData);
    localStorage.setItem("token", data.access_token);
    const userData = await api.get("/users/me");
    setUser(userData);
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
