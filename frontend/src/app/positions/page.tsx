"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface Position {
  id: number;
  title: string;
  base_salary: number;
}

export default function PositionsPage() {
  const { user, loading, logout } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPos, setNewPos] = useState({ title: "", base_salary: 0 });

  useEffect(() => {
    async function fetchPositions() {
      try {
        const data = await api.get("/positions/");
        setPositions(data);
      } catch (error) {
        console.error("Failed to fetch positions", error);
      } finally {
        setFetching(false);
      }
    }
    if (user) fetchPositions();
  }, [user]);

  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await api.post("/positions/", newPos);
      setPositions([...positions, added]);
      setNewPos({ title: "", base_salary: 0 });
      setShowAddForm(false);
    } catch (error) {
      alert("Failed to add position");
    }
  };

  if (loading) return <div style={{ color: '#0f172a', padding: '40px', background: '#f3f4f6', minHeight: '100vh' }}>Loading...</div>;

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="content-area">
        <div className="container-fluid">
          <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
            <div>
              <h1 className="gradient-text display-5 fw-bold mb-1">Career Positions</h1>
              <p className="text-muted lead mb-0">Define and manage job roles across the organization.</p>
            </div>
            <div className="d-flex gap-2">
              <button onClick={() => setShowAddForm(true)} className="btn-primary">
                + Add Position
              </button>
            </div>
          </header>

        {showAddForm && (
          <div className="glass-card p-4 mb-4" style={{ background: '#ffffff', border: '1px solid rgba(148,163,184,0.25)', boxShadow: '0 12px 30px rgba(15,23,42,0.05)' }}>
            <h3 className="mb-4">Create New Position</h3>
            <form onSubmit={handleAddPosition} className="row g-3">
              <div className="col-12 col-md-6">
                <label className="label">Job Title</label>
                <input className="input-field mb-0" placeholder="e.g. Senior Software Engineer" value={newPos.title} onChange={e => setNewPos({...newPos, title: e.target.value})} required />
              </div>
              <div className="col-12 col-md-4">
                <label className="label">Base Salary</label>
                <input className="input-field mb-0" type="number" placeholder="Enter amount" value={newPos.base_salary} onChange={e => setNewPos({...newPos, base_salary: parseFloat(e.target.value)})} />
              </div>
              <div className="col-12 col-md-2 d-flex align-items-end gap-2">
                <button type="submit" className="btn-primary w-100">Save</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-outline-light border-opacity-10 w-100">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <section className="glass-card p-0 overflow-hidden" style={{ background: '#ffffff', border: '1px solid rgba(148,163,184,0.25)', boxShadow: '0 12px 30px rgba(15,23,42,0.05)' }}>
          <div className="table-responsive">
            <table className="table mb-0" style={{ background: 'transparent', color: '#0f172a' }}>
              <thead>
                <tr className="small text-uppercase fw-bold" style={{ background: '#f9fafb', color: 'var(--text-muted)' }}>
                  <th className="px-4 py-3 border-0">Title</th>
                  <th className="px-4 py-3 border-0">Base Salary</th>
                  <th className="px-4 py-3 border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr><td colSpan={3} className="p-5 text-center text-muted">Loading positions...</td></tr>
                ) : positions.length === 0 ? (
                  <tr><td colSpan={3} className="p-5 text-center text-muted">No positions found.</td></tr>
                ) : (
                  positions.map(pos => (
                    <tr key={pos.id} className="border-bottom border-secondary border-opacity-10 align-middle">
                      <td className="px-4 py-3 border-0 fw-semibold">{pos.title}</td>
                      <td className="px-4 py-3 border-0 text-muted">${pos.base_salary.toLocaleString()}</td>
                      <td className="px-4 py-3 border-0 text-end">
                        <button className="btn btn-sm btn-outline-danger">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      </main>
    </div>
  );
}
