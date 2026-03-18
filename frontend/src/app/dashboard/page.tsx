"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Link from "next/link";

interface ActivityLogEntry {
  id: number;
  action: string;
  description: string;
  entity_type: string;
  actor: string;
  timestamp: string;
  icon: string;
  details?: string;
}

function timeAgo(isoString: string): string {
  const now = new Date();
  const then = new Date(isoString + (isoString.endsWith("Z") ? "" : "Z"));
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const entityColors: Record<string, string> = {
  employee: "#06b6d4",
  department: "#10b981",
  position: "#f59e0b",
  settings: "#818cf8",
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({ totalEmployees: 0, activeDepartments: 0, openPositions: 0 });
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const [emps, depts, pos] = await Promise.all([
          api.get("/employees/"),
          api.get("/departments/"),
          api.get("/positions/")
        ]);
        setStats({
          totalEmployees: emps.length,
          activeDepartments: depts.length,
          openPositions: pos.length
        });
      } catch (error) {
        console.error("Failed to fetch dashboard metrics", error);
      }
    };

    const fetchLogs = async () => {
      try {
        const data = await api.get("/activity-logs/?limit=10");
        setActivityLogs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch activity logs", error);
        setActivityLogs([]);
      } finally {
        setLogsLoading(false);
      }
    };

    // Initial fetch
    fetchStats();
    fetchLogs();

    // Set up polling (every 5 seconds)
    const interval = setInterval(() => {
      fetchStats();
      fetchLogs();
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#0ea5e9', fontFamily: 'Plus Jakarta Sans, sans-serif', background: '#f3f4f6' }}>Loading...</div>;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const metrics = [
    { label: "Total Employees", value: stats.totalEmployees, icon: "👥", color: "#06b6d4", href: "/employees" },
    { label: "Business Units", value: stats.activeDepartments, icon: "🏢", color: "#10b981", href: "/departments" },
    { label: "Open Positions", value: stats.openPositions, icon: "💼", color: "#f59e0b", href: "/positions" },
  ];

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="content-area" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 8px #06b6d4' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>HR Intelligence Platform</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.04em', color: '#0f172a', marginBottom: '4px' }}>
            {greeting}, <span style={{ background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.username}</span> ✦
          </h1>
          <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '0.875rem' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Metric Cards */}
        <div className="row g-3 mb-4">
          {metrics.map((m) => (
            <div key={m.label} className="col-12 col-md-4">
              <Link href={m.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#ffffff', border: `1px solid ${m.color}30`,
                  borderRadius: '18px', padding: '24px', transition: 'all 0.3s ease',
                  cursor: 'pointer', position: 'relative', overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(15,23,42,0.04)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${m.color}20`; e.currentTarget.style.borderColor = `${m.color}50`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = `${m.color}25`; }}
                >
                  <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: m.color, opacity: 0.06, filter: 'blur(24px)' }} />
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${m.color}12`, border: `1px solid ${m.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '20px' }}>
                    {m.icon}
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 1 }}>{m.value}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(15,23,42,0.55)', marginTop: '6px', fontWeight: '500' }}>{m.label}</div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom Grid */}
        <div className="row g-3">
          {/* Activity Log */}
          <div className="col-12 col-lg-7">
            <div style={{ background: '#ffffff', border: '1px solid rgba(148,163,184,0.25)', borderRadius: '18px', padding: '24px', height: '100%', boxShadow: '0 12px 30px rgba(15,23,42,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Activity Log</h3>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(15,23,42,0.6)', margin: '2px 0 0' }}>Real-time system events</p>
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '4px 10px', borderRadius: '50px', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399', display: 'inline-block' }} />
                  Live
                </div>
              </div>

              {logsLoading ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'rgba(15,23,42,0.45)', fontSize: '0.875rem' }}>Loading activity...</div>
              ) : activityLogs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📭</div>
                    <div style={{ color: 'rgba(15,23,42,0.7)', fontWeight: '600', marginBottom: '6px' }}>No activity yet</div>
                    <div style={{ color: 'rgba(15,23,42,0.45)', fontSize: '0.8rem' }}>Events will appear here as you use the system — try adding an employee or business unit.</div>
                </div>
              ) : (
                activityLogs.map((log) => {
                  const color = entityColors[log.entity_type] || "#818cf8";
                  const ts = new Date(log.timestamp + (log.timestamp.endsWith("Z") ? "" : "Z"));
                  const fullDate = ts.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
                  const fullTime = ts.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                  const entityLabel = log.entity_type.charAt(0).toUpperCase() + log.entity_type.slice(1);
                  
                  let parsedDetails = null;
                  if (log.details) {
                    try {
                      parsedDetails = JSON.parse(log.details);
                    } catch (e) {
                      console.error("Failed to parse log details", e);
                    }
                  }

                  return (
                    <div key={log.id} style={{
                      background: 'rgba(249,250,251,0.9)',
                      border: `1px solid ${color}26`,
                      borderLeft: `4px solid ${color}`,
                      borderRadius: '14px',
                      padding: '16px',
                      marginBottom: '12px',
                      transition: 'all 0.2s ease',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = `${color}40`; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(249,250,251,0.9)'; e.currentTarget.style.borderColor = `${color}26`; }}
                    >
                      {/* Top row: icon + action + entity badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                          {log.icon}
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a', flex: 1 }}>{log.action}</span>
                        <span style={{
                          fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em',
                          padding: '3px 10px', borderRadius: '50px',
                          background: `${color}15`, color: color, border: `1px solid ${color}30`
                        }}>{entityLabel}</span>
                      </div>

                      {/* Description */}
                      <div style={{ fontSize: '0.82rem', color: 'rgba(15,23,42,0.7)', lineHeight: '1.5', marginBottom: parsedDetails ? '12px' : '14px' }}>
                        {log.description}
                      </div>

                      {/* Structured Details Table */}
                      {parsedDetails && Array.isArray(parsedDetails) && parsedDetails.length > 0 && (
                        <div style={{ background: '#f9fafb', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.35)', overflow: 'hidden', marginBottom: '14px' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                            <thead style={{ background: 'rgba(248,250,252,0.9)', borderBottom: '1px solid rgba(226,232,240,0.9)' }}>
                              <tr>
                                <th style={{ padding: '6px 12px', textAlign: 'left', color: 'rgba(15,23,42,0.7)', fontWeight: '600' }}>Field</th>
                                <th style={{ padding: '6px 12px', textAlign: 'left', color: 'rgba(185,28,28,0.85)', fontWeight: '600' }}>From</th>
                                <th style={{ padding: '6px 12px', textAlign: 'left', color: 'rgba(22,163,74,0.95)', fontWeight: '600' }}>To</th>
                              </tr>
                            </thead>
                            <tbody>
                              {parsedDetails.map((change: any, idx: number) => (
                                <tr key={idx} style={{ borderBottom: idx < parsedDetails.length - 1 ? '1px solid rgba(226,232,240,0.9)' : 'none' }}>
                                  <td style={{ padding: '8px 12px', color: '#0f172a', fontWeight: '600' }}>{change.field}</td>
                                  <td style={{ padding: '8px 12px', color: 'rgba(185,28,28,0.9)', fontStyle: 'italic' }}>{change.old}</td>
                                  <td style={{ padding: '8px 12px', color: '#16a34a', fontWeight: '600' }}>{change.new}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Bottom row: admin badge + full timestamp */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid rgba(226,232,240,0.9)', paddingTop: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '24px', height: '24px', borderRadius: '8px',
                            background: 'linear-gradient(135deg, #0ea5e9, #0369a1)',
                            boxShadow: '0 0 10px rgba(59,130,246,0.35)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: '900', color: 'white', flexShrink: 0
                          }}>
                            {log.actor.charAt(0).toUpperCase()}
                          </div>
                          <span style={{
                            fontSize: '0.78rem', fontWeight: '700',
                            color: '#0f172a'
                          }}>{log.actor}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.9)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                            <span style={{ color: 'rgba(148,163,184,0.9)', marginRight: '4px' }}>📅</span> {fullDate}
                          </span>
                          <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(148,163,184,0.7)' }}></span>
                          <span style={{ fontSize: '0.7rem', color: 'rgba(37,99,235,0.8)', fontWeight: '600', fontFamily: 'monospace' }}>
                            {fullTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="col-12 col-lg-5">
            <div style={{ background: '#ffffff', border: '1px solid rgba(148,163,184,0.25)', borderRadius: '18px', padding: '24px', height: '100%', boxShadow: '0 12px 30px rgba(15,23,42,0.05)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>Quick Actions</h3>
              <p style={{ fontSize: '0.75rem', color: 'rgba(15,23,42,0.6)', marginBottom: '20px' }}>Common tasks & shortcuts</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: "Add New Employee", href: "/employees", icon: "👤", primary: true },
                  { label: "Manage Business Units", href: "/departments", icon: "🏢", primary: false },
                  { label: "View Open Positions", href: "/positions", icon: "💼", primary: false },
                  { label: "System Settings", href: "/settings", icon: "⚙️", primary: false },
                ].map((action) => (
                  <Link key={action.href} href={action.href} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 14px', borderRadius: '12px',
                      background: action.primary ? 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(37,99,235,0.10))' : '#f9fafb',
                      border: action.primary ? '1px solid rgba(37,99,235,0.35)' : '1px solid rgba(226,232,240,0.9)',
                      transition: 'all 0.2s ease', cursor: 'pointer'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = action.primary ? 'linear-gradient(135deg, rgba(14,165,233,0.16), rgba(37,99,235,0.14))' : '#e5e7eb'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = action.primary ? 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(37,99,235,0.10))' : '#f9fafb'; e.currentTarget.style.transform = 'translateX(0)'; }}
                    >
                      <span style={{ fontSize: '1rem' }}>{action.icon}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: action.primary ? '#0f172a' : 'rgba(15,23,42,0.8)' }}>{action.label}</span>
                      <span style={{ marginLeft: 'auto', color: 'rgba(148,163,184,0.9)', fontSize: '0.85rem' }}>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
