"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";

export default function Sidebar() {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const [org, setOrg] = React.useState<{ name: string; subtitle: string; logo_url?: string } | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => { setIsOpen(false); }, [pathname]);

  React.useEffect(() => {
    if (user) {
      api.get("/organization/").then(setOrg).catch(() => {});
    }
  }, [user]);

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: "◈" },
    { name: "CEO", href: "/ceo", icon: "★" },
    { name: "Employees", href: "/employees", icon: "◉" },
    { name: "Business Units", href: "/business-units", icon: "◫" },
    { name: "Sub‑Business Units", href: "/sub-business-units", icon: "↳", isSub: true },
    { name: "Positions", href: "/positions", icon: "◆" },
    { name: "Settings", href: "/settings", icon: "◎" },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .sidebar {
          position: fixed;
          top: 0; left: 0;
          width: 260px;
          height: 100vh;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-right: 1px solid rgba(15,23,42,0.06);
        }

        .sidebar-top {
          padding: 28px 20px 20px;
          border-bottom: 1px solid rgba(15,23,42,0.06);
          flex-shrink: 0;
        }

        .org-logo-container {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 14px;
          border: 1px solid rgba(37,99,235,0.18);
          background: rgba(37,99,235,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
        }

        .org-name {
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #0f172a, #0ea5e9);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 2px;
        }

        .org-subtitle {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(37,99,235,0.7);
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 12px 12px;
          scrollbar-width: none;
        }
        .sidebar-nav::-webkit-scrollbar { display: none; }

        .nav-section-label {
          font-size: 0.63rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(15,23,42,0.4);
          padding: 8px 8px 6px;
          margin-top: 8px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          text-decoration: none;
          color: rgba(15,23,42,0.7);
          font-weight: 500;
          font-size: 0.875rem;
          margin-bottom: 2px;
          transition: all 0.2s ease;
          position: relative;
        }
        .nav-link.sub-link {
          padding-left: 26px;
          font-size: 0.82rem;
        }
        .nav-link.sub-link .nav-icon {
          width: 26px;
          height: 26px;
          font-size: 0.85rem;
          background: rgba(148,163,184,0.18);
        }
        .nav-link:hover {
          color: rgba(15,23,42,0.95);
          background: rgba(15,23,42,0.04);
        }
        .nav-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          transition: all 0.2s ease;
          flex-shrink: 0;
          background: rgba(15,23,42,0.04);
        }
        .nav-link.active {
          color: #0f172a;
          font-weight: 700;
        }
        .nav-link.active .nav-icon {
          background: linear-gradient(135deg, #0ea5e9, #0369a1);
          box-shadow: 0 4px 16px rgba(37,99,235,0.35);
        }
        .nav-active-indicator {
          position: absolute;
          right: 12px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #0ea5e9;
          box-shadow: 0 0 8px rgba(14,165,233,0.8);
        }

        .sidebar-bottom {
          padding: 16px;
          border-top: 1px solid rgba(15,23,42,0.06);
          flex-shrink: 0;
        }

        .user-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 12px;
          background: rgba(15,23,42,0.02);
          border: 1px solid rgba(15,23,42,0.06);
          margin-bottom: 10px;
        }
        .user-avatar {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #0ea5e9, #0369a1);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; font-weight: 800;
          flex-shrink: 0;
        }
        .user-info { overflow: hidden; flex: 1; }
        .user-name {
          font-size: 0.82rem; font-weight: 700; color: #0f172a;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .user-email {
          font-size: 0.7rem; color: rgba(15,23,42,0.55);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 50px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          color: #f87171;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s ease;
          letter-spacing: 0.02em;
        }
        .logout-btn:hover {
          background: rgba(239,68,68,0.18);
          border-color: rgba(239,68,68,0.4);
          box-shadow: 0 4px 16px rgba(239,68,68,0.2);
        }

        .mobile-toggle {
          display: none;
          position: fixed;
          top: 14px; left: 14px;
          z-index: 1100;
          width: 42px; height: 42px;
          border-radius: 12px;
          background: #ffffff;
          border: 1px solid rgba(15,23,42,0.12);
          color: #0ea5e9;
          font-size: 1.1rem;
          cursor: pointer;
          align-items: center; justify-content: center;
        }
        .sidebar-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(3px);
          z-index: 900;
        }

        @media (max-width: 991.98px) {
          .mobile-toggle { display: flex !important; }
          .sidebar { transform: translateX(-100%); transition: transform 0.3s ease; }
          .sidebar.open { transform: translateX(0); }
          .sidebar-overlay.open { display: block; }
        }
      `}} />

      {/* Mobile Toggle */}
      <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Top Brand */}
        <div className="sidebar-top">
          <div className="org-logo-container">
            {org?.logo_url
              ? <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${org.logo_url}`} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : '⚡'
            }
          </div>
          <div className="org-name">{org?.name || "Ethiopian Electric Power"}</div>
          <div className="org-subtitle">{org?.subtitle || "HR Management Portal"}</div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {links.map((link) => {
            const isActive = pathname === link.href;
            const classes = [
              "nav-link",
              link.isSub ? "sub-link" : "",
              isActive ? "active" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <Link key={link.href} href={link.href} className={classes}>
                <span className="nav-icon">{link.icon}</span>
                {link.name}
                {isActive && <span className="nav-active-indicator" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="user-avatar">{user?.username?.[0].toUpperCase() || 'U'}</div>
            <div className="user-info">
              <div className="user-name">{user?.username}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} className="logout-btn">
            ⏻ Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />
    </>
  );
}
