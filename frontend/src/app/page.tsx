"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
      <div className="glass-card" style={{ padding: '24px' }}>
        Initialising session...
      </div>
    </div>
  );
}
