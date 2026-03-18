"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface Department {
  id: number;
  name: string;
  description: string;
  parent_id?: number | null;
  responsible_employee_id?: number | null;
}

interface EmployeeOption {
  id: number;
  company_id?: string | null;
  first_name: string;
  last_name: string;
}

export default function SubBusinessUnitsPage() {
  const { user, loading } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [responsibleSearch, setResponsibleSearch] = useState("");
  const [parentSearch, setParentSearch] = useState("");
  const [form, setForm] = useState<{
    name: string;
    description: string;
    parent_id: string | null;
    responsible_employee_id: string | null;
  }>({
    name: "",
    description: "",
    parent_id: null,
    responsible_employee_id: null,
  });

  useEffect(() => {
    async function fetchAll() {
      try {
        const [deptData, empData] = await Promise.all([
          api.get("/departments/"),
          api.get("/employees/"),
        ]);
        setDepartments(deptData);
        setEmployees(empData);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setFetching(false);
      }
    }
    if (user) fetchAll();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        description: form.description,
        parent_id: form.parent_id ? parseInt(form.parent_id, 10) : null,
        responsible_employee_id: form.responsible_employee_id
          ? parseInt(form.responsible_employee_id, 10)
          : null,
      };
      if (editingId) {
        const updated = await api.patch(`/departments/${editingId}`, payload);
        setDepartments(departments.map((d) => (d.id === editingId ? updated : d)));
      } else {
        const added = await api.post("/departments/", payload);
        setDepartments([...departments, added]);
      }
      setForm({ name: "", description: "", parent_id: null, responsible_employee_id: null });
      setEditingId(null);
      setResponsibleSearch("");
      setShowForm(false);
    } catch (err) {
      alert("Failed to save sub-business unit");
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

  // Only sub-business units (those that have a parent)
  const subUnits = departments.filter((d) => d.parent_id);

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="content-area">
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 800 }}>
              Sub‑Business Units
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              Manage sub‑levels under main business units.
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => {
              setEditingId(null);
              setForm({
                name: "",
                description: "",
                parent_id: null,
                responsible_employee_id: null,
              });
              setResponsibleSearch("");
              setShowForm(true);
            }}
          >
            {showForm && !editingId ? "Close Form" : "+ Add Sub‑Business Unit"}
          </button>
        </header>

        {showForm && (
          <div
            className="glass-card"
            style={{
              padding: "24px",
              marginBottom: "32px",
              background: "#ffffff",
              border: "1px solid rgba(148,163,184,0.25)",
              boxShadow: "0 12px 30px rgba(15,23,42,0.05)",
            }}
          >
            <h3>{editingId ? "Edit Sub‑Business Unit" : "Create Sub‑Business Unit"}</h3>
            <form onSubmit={handleSubmit} className="row g-3 mt-1">
              <div className="col-12 col-md-4">
                <input
                  className="input-field"
                  placeholder="Sub‑Business Unit Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <input
                  className="input-field"
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="label">Parent Business Unit</label>
                <input
                  className="input-field mb-0"
                  placeholder="Search parent business unit by name..."
                  value={parentSearch}
                  onChange={e => {
                    const value = e.target.value;
                    setParentSearch(value);
                  }}
                />
                {parentSearch && (
                  <div
                    style={{
                      marginTop: "4px",
                      maxHeight: "160px",
                      overflowY: "auto",
                      borderRadius: "10px",
                      border: "1px solid rgba(148,163,184,0.4)",
                      background: "#ffffff",
                      boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
                      padding: "4px 0",
                    }}
                  >
                    {departments
                      .filter(d => !d.parent_id)
                      .filter(d =>
                        d.name.toLowerCase().includes(parentSearch.toLowerCase())
                      )
                      .slice(0, 15)
                      .map(d => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setForm({
                              ...form,
                              parent_id: String(d.id),
                            });
                            setParentSearch(d.name);
                          }}
                          style={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            padding: "6px 12px",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            color: "#0f172a",
                          }}
                          onMouseOver={e =>
                            (e.currentTarget.style.backgroundColor = "#f3f4f6")
                          }
                          onMouseOut={e =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          {d.name}
                        </button>
                      ))}
                  </div>
                )}
              </div>
              <div className="col-12 col-md-8">
                <label className="label">
                  Responsible Person (search by ID or name)
                </label>
                <input
                  className="input-field mb-0"
                  placeholder="Start typing Company ID or name..."
                  value={responsibleSearch}
                  onChange={(e) => {
                    const value = e.target.value;
                    setResponsibleSearch(value);
                    setForm({ ...form, responsible_employee_id: null });
                  }}
                />
                {responsibleSearch && (
                  <div
                    style={{
                      marginTop: "4px",
                      maxHeight: "180px",
                      overflowY: "auto",
                      borderRadius: "10px",
                      border: "1px solid rgba(148,163,184,0.4)",
                      background: "#ffffff",
                      boxShadow: "0 8px 24px rgba(15,23,42,0.15)",
                      padding: "4px 0",
                    }}
                  >
                    {employees
                      .filter((emp) => {
                        const q = responsibleSearch.toLowerCase();
                        const id = (emp.company_id || "").toLowerCase();
                        const name = `${emp.first_name} ${emp.last_name}`.toLowerCase();
                        return id.includes(q) || name.includes(q);
                      })
                      .slice(0, 15)
                      .map((emp) => {
                        const label = `${
                          emp.company_id || "NO-ID"
                        } — ${emp.first_name} ${emp.last_name}`;
                        return (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => {
                              setResponsibleSearch(label);
                              setForm({
                                ...form,
                                responsible_employee_id: String(emp.id),
                              });
                            }}
                            style={{
                              display: "block",
                              width: "100%",
                              textAlign: "left",
                              padding: "6px 12px",
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              color: "#0f172a",
                            }}
                            onMouseOver={(e) =>
                              (e.currentTarget.style.backgroundColor = "#f3f4f6")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            {label}
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
              <div className="col-12 d-flex justify-content-end gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm({
                      name: "",
                      description: "",
                      parent_id: null,
                      responsible_employee_id: null,
                    });
                    setResponsibleSearch("");
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? "Save Changes" : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}

        <section
          className="glass-card"
          style={{
            padding: "0",
            background: "#ffffff",
            border: "1px solid rgba(148,163,184,0.25)",
            boxShadow: "0 12px 30px rgba(15,23,42,0.05)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f9fafb",
                  color: "var(--text-muted)",
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                }}
              >
                <th style={{ padding: "16px 24px" }}>Name</th>
                <th style={{ padding: "16px 24px" }}>Parent Business Unit</th>
                <th style={{ padding: "16px 24px" }}>Responsible Person</th>
                <th style={{ padding: "16px 24px" }}>Description</th>
                <th style={{ padding: "16px 24px", textAlign: "right" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ padding: "40px", textAlign: "center" }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : subUnits.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ padding: "40px", textAlign: "center" }}
                  >
                    No sub‑business units found.
                  </td>
                </tr>
              ) : (
                subUnits.map((dept) => {
                  const parent = departments.find((d) => d.id === dept.parent_id);
                  const responsible = dept.responsible_employee_id
                    ? employees.find((e) => e.id === dept.responsible_employee_id)
                    : undefined;
                  return (
                    <tr
                      key={dept.id}
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <td
                        style={{
                          padding: "16px 24px",
                          fontWeight: "bold",
                        }}
                      >
                        {dept.name}
                      </td>
                      <td
                        style={{
                          padding: "16px 24px",
                          color: "var(--text-muted)",
                        }}
                      >
                        {parent ? parent.name : "—"}
                      </td>
                      <td
                        style={{
                          padding: "16px 24px",
                          color: "var(--text-muted)",
                        }}
                      >
                        {responsible ? (
                          <>
                            <div style={{ fontWeight: 600 }}>
                              {responsible.first_name} {responsible.last_name}
                            </div>
                            <div
                              style={{ fontSize: "0.8rem", opacity: 0.7 }}
                            >
                              ID: {responsible.company_id || "NO-ID"}
                            </div>
                          </>
                        ) : (
                          <span style={{ opacity: 0.7 }}>Not assigned</span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "16px 24px",
                          color: "var(--text-muted)",
                        }}
                      >
                        {dept.description}
                      </td>
                      <td
                        style={{
                          padding: "16px 24px",
                          textAlign: "right",
                        }}
                      >
                        <button
                          type="button"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#3b82f6",
                            cursor: "pointer",
                            marginRight: "8px",
                          }}
                          onClick={() => {
                            setEditingId(dept.id);
                            setForm({
                              name: dept.name,
                              description: dept.description || "",
                              parent_id: dept.parent_id
                                ? String(dept.parent_id)
                                : null,
                              responsible_employee_id:
                                dept.responsible_employee_id
                                  ? String(dept.responsible_employee_id)
                                  : null,
                            });
                            setResponsibleSearch("");
                            setShowForm(true);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

