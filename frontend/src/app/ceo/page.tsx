"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  gender?: string;
  address?: string;
  national_id?: string;
  company_id?: string;
  date_of_joining: string;
  is_active: boolean;
  photo_url?: string;
  department?: { name: string };
  position?: { title: string };
}

export default function CEOPage() {
  const { user, loading } = useAuth();
  const [searchId, setSearchId] = useState("");
  const [ceo, setCeo] = useState<Employee | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setFetching(true);
        const data: Employee | null = await api.get("/ceo/");
        if (data) {
          setCeo(data);
          setSearchId(data.company_id || "");
        }
      } catch {
        // ignore preload errors
      } finally {
        setFetching(false);
      }
    })();
  }, []);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setFetching(true);
    setError(null);
    setCeo(null);
    try {
      const updated: Employee = await api.post("/ceo/", { company_id: searchId.trim() });
      setCeo(updated);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("Failed to look up employee.");
    } finally {
      setFetching(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          color: "#0f172a",
          padding: "40px",
          background: "#f3f4f6",
          minHeight: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="content-area">
        <div className="container-fluid">
          <div className="page-header">
            <div>
              <h1 className="page-title gradient-text">CEO Profile</h1>
              <p className="page-subtitle">
                Assign the CEO once, then view their profile here.
              </p>
            </div>
            {ceo && !isEditing && (
              <button
                className="btn-primary"
                onClick={() => {
                  setIsEditing(true);
                  setSearchId(ceo.company_id || "");
                  setError(null);
                }}
              >
                Edit CEO
              </button>
            )}
          </div>

          {(isEditing || !ceo) && (
            <div
              className="glass-card p-4 mb-4"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(148,163,184,0.25)",
                boxShadow: "0 12px 30px rgba(15,23,42,0.05)",
              }}
            >
              <form
                onSubmit={handleFetch}
                style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}
              >
                <div style={{ flex: 1 }}>
                  <label className="label">CEO Employee ID</label>
                  <input
                    className="input-field mb-0"
                    placeholder="Enter Company ID (e.g. EEP/700480)"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={fetching}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {fetching ? "Saving..." : ceo ? "Update CEO" : "Assign CEO"}
                </button>
              </form>
              {error && (
                <div
                  style={{
                    marginTop: "12px",
                    fontSize: "0.85rem",
                    color: "#b91c1c",
                  }}
                >
                  {error}
                </div>
              )}
            </div>
          )}

          {ceo && !isEditing && (
            <div
              className="glass-card p-4"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(148,163,184,0.25)",
                boxShadow: "0 12px 30px rgba(15,23,42,0.05)",
              }}
            >
              <div className="row g-4">
                <div className="col-12 col-md-4">
                  <div
                    style={{
                      width: "140px",
                      height: "140px",
                      borderRadius: "24px",
                      border: "1px solid rgba(148,163,184,0.4)",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#e5e7eb",
                    }}
                  >
                    {ceo.photo_url ? (
                      <img
                        src={`${API_BASE}${ceo.photo_url}`}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: "3rem" }}>👤</span>
                    )}
                  </div>
                </div>
                <div className="col-12 col-md-8">
                  <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>
                    {ceo.first_name} {ceo.last_name}
                  </h2>
                  <p style={{ color: "var(--text-muted)", marginBottom: "8px" }}>
                    {ceo.position?.title || "CEO"}
                    {ceo.department?.name ? ` · ${ceo.department.name}` : ""}
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "12px",
                      marginTop: "12px",
                      fontSize: "0.9rem",
                    }}
                  >
                    <div>
                      <div className="label">Employee ID</div>
                      <div>{ceo.company_id || "—"}</div>
                    </div>
                    <div>
                      <div className="label">Email</div>
                      <div>{ceo.email}</div>
                    </div>
                    <div>
                      <div className="label">Phone</div>
                      <div>{ceo.phone || "—"}</div>
                    </div>
                    <div>
                      <div className="label">National ID</div>
                      <div>{ceo.national_id || "—"}</div>
                    </div>
                    <div>
                      <div className="label">Gender</div>
                      <div>{ceo.gender || "—"}</div>
                    </div>
                    <div>
                      <div className="label">Address</div>
                      <div>{ceo.address || "—"}</div>
                    </div>
                    <div>
                      <div className="label">Date of Joining</div>
                      <div>
                        {ceo.date_of_joining
                          ? new Date(ceo.date_of_joining).toLocaleDateString()
                          : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="label">Status</div>
                      <div>{ceo.is_active ? "Active" : "Inactive"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

