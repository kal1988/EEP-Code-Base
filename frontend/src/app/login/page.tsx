"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await login(formData);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', padding: '24px',
      background: '#070c1a',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Background glows */}
      <div style={{ position: 'fixed', top: '20%', left: '10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
        {/* Logo mark */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(8,145,178,0.1))',
            border: '1px solid rgba(6,182,212,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: '1.8rem',
            boxShadow: '0 8px 32px rgba(6,182,212,0.2)'
          }}>⚡</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.04em', color: 'white', marginBottom: '6px' }}>Sign in to EEP</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem' }}>HR Management Portal — Ethiopian Electric Power</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(13, 20, 38, 0.8)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '36px',
          backdropFilter: 'blur(16px)',
        }}>
          {/* Teal top bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #06b6d4, #0891b2)', borderRadius: '20px 20px 0 0', pointerEvents: 'none' }} />

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', color: '#f87171',
                padding: '12px 16px', borderRadius: '12px',
                marginBottom: '20px', border: '1px solid rgba(239,68,68,0.2)',
                fontSize: '0.85rem', fontWeight: '500', textAlign: 'center'
              }}>⚠ {error}</div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Username</label>
              <input
                name="username" type="text" required
                placeholder="Enter your username"
                style={{
                  width: '100%', padding: '12px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', color: 'white',
                  fontSize: '0.9rem', fontFamily: 'inherit',
                  outline: 'none', transition: 'all 0.2s ease'
                }}
                onFocus={e => { e.target.style.borderColor = '#06b6d4'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Password</label>
              <input
                name="password" type="password" required
                placeholder="••••••••••"
                style={{
                  width: '100%', padding: '12px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', color: 'white',
                  fontSize: '0.9rem', fontFamily: 'inherit',
                  outline: 'none', transition: 'all 0.2s ease'
                }}
                onFocus={e => { e.target.style.borderColor = '#06b6d4'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? 'rgba(6,182,212,0.5)' : 'linear-gradient(135deg, #06b6d4, #0891b2)',
                color: 'white', border: 'none',
                borderRadius: '50px', cursor: loading ? 'wait' : 'pointer',
                fontSize: '0.9rem', fontWeight: '700',
                fontFamily: 'inherit', letterSpacing: '0.02em',
                boxShadow: '0 6px 24px rgba(6,182,212,0.3)',
                transition: 'all 0.25s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {loading ? (
                <><span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Authenticating...</>
              ) : '⚡ Sign In Securely'}
            </button>
          </form>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', textAlign: 'center', marginTop: '20px' }}>
          Ethiopian Electric Power — Secure Portal © 2025
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
