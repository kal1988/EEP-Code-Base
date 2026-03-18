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
  phone: string;
  date_of_joining: string;
  is_active: boolean;
  photo_url?: string;
  document_url?: string;
  gender?: string;
  address?: string;
  national_id?: string;
  company_id?: string;
  department?: { name: string };
  position?: { title: string };
}

interface Department {
  id: number;
  name: string;
}

interface Position {
  id: number;
  title: string;
}

export default function EmployeesPage() {
  const { user, loading, logout } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [fetching, setFetching] = useState(true);
  
  const [selectedDept, setSelectedDept] = useState("All Units");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [newEmp, setNewEmp] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    gender: "", address: "", national_id: "", company_id: "",
    emergency_contact_name: "", emergency_contact_phone: "",
    department_id: "", position_id: ""
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{ id: number; name: string } | null>(null);
  
  // Bulk upload states
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Filtered employees list
  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      fullName.includes(query) ||
      (emp.company_id && emp.company_id.toLowerCase().includes(query));
    
    // Handle department filter
    if (selectedDept === "All Units") return matchesSearch;
    const deptName = typeof emp.department === 'string' ? emp.department : (emp.department?.name || "Unassigned");
    return matchesSearch && deptName === selectedDept;
  });

  const fetchData = async () => {
    try {
      const [empData, deptData, posData] = await Promise.all([
        api.get("/employees/"),
        api.get("/departments/"),
        api.get("/positions/")
      ]);
      setEmployees(empData);
      setDepartments(deptData);
      setPositions(posData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(newEmp).forEach(([key, value]) => {
        if (value) formData.append(key, value.toString());
      });
      if (photoFile) formData.append("photo", photoFile);
      if (docFile) formData.append("document", docFile);

      if (isEditing && editId) {
        const updated = await api.patch(`/employees/${editId}`, formData);
        setEmployees(employees.map(emp => emp.id === editId ? updated : emp));
      } else {
        const added = await api.post("/employees/", formData);
        setEmployees([...employees, added]);
      }

      resetForm();
    } catch (error) {
      alert("Failed to save employee. Check if email/National ID is unique.");
    }
  };

  const handleEdit = (emp: Employee) => {
    setNewEmp({
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      phone: emp.phone || "",
      gender: emp.gender || "",
      address: emp.address || "",
      national_id: emp.national_id || "",
      company_id: emp.company_id || "",
      //@ts-ignore
      emergency_contact_name: emp.emergency_contact_name || "",
      //@ts-ignore
      emergency_contact_phone: emp.emergency_contact_phone || "",
      //@ts-ignore
      department_id: emp.department_id?.toString() || "",
      //@ts-ignore
      position_id: emp.position_id?.toString() || ""
    });
    setIsEditing(true);
    setEditId(emp.id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = (id: number, firstName: string, lastName: string) => {
    setSelectedEmployee({ id, name: `${firstName} ${lastName}` });
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!selectedEmployee) return;
    try {
      await api.delete(`/employees/${selectedEmployee.id}`);
      setEmployees(employees.filter(emp => emp.id !== selectedEmployee.id));
    } catch (error) {
      alert("Failed to delete employee.");
    } finally {
      setDeleteModalOpen(false);
      setSelectedEmployee(null);
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFile) {
      alert("Please select an Excel file.");
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", bulkFile);
    try {
      const response = await api.post("/employees/bulk-upload", formData);
      alert(response.message || "Employees imported successfully!");
      setBulkUploadModalOpen(false);
      setBulkFile(null);
      fetchData();
    } catch (error: any) {
      alert("Upload failed: " + (error.message || "Unknown error"));
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setIsEditing(false);
    setEditId(null);
    setNewEmp({ 
      first_name: "", last_name: "", email: "", phone: "", 
      gender: "", address: "", national_id: "", company_id: "",
      emergency_contact_name: "", emergency_contact_phone: "",
      department_id: "", position_id: "" 
    });
    setPhotoFile(null);
    setDocFile(null);
  };

  if (loading) return <div style={{ color: '#0f172a', padding: '40px', background: '#f3f4f6', minHeight: '100vh' }}>Loading...</div>;

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="content-area" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="container-fluid">
          <div className="page-header">
            <div>
              <h1 className="page-title gradient-text">Employee Directory</h1>
              <p className="page-subtitle">Manage your organization's talent and records.</p>
            </div>
            <div className="d-flex gap-2">
              <button onClick={() => setBulkUploadModalOpen(true)} className="btn btn-outline-primary" style={{ border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a' }}>
                📁 Import Excel
              </button>
              <button onClick={() => { if(showAddForm && !isEditing) setShowAddForm(false); else { resetForm(); setShowAddForm(true); } }} className="btn-primary">
                {showAddForm && !isEditing ? "Close Form" : "+ Add Employee"}
              </button>
            </div>
          </div>

        {showAddForm && (
          <div className="glass-card p-4 mb-4" style={{ background: '#ffffff', border: '1px solid rgba(148,163,184,0.25)', boxShadow: '0 12px 30px rgba(15,23,42,0.05)' }}>
            <h3 className="mb-4">{isEditing ? "Update Employee Profile" : "Add New Employee"}</h3>
            <form onSubmit={handleAddEmployee} className="row g-3">
              <div className="col-12 col-md-4">
                <label className="label">First Name</label>
                <input className="input-field mb-0" required value={newEmp.first_name} onChange={e => setNewEmp({...newEmp, first_name: e.target.value})} />
              </div>
              <div className="col-12 col-md-4">
                <label className="label">Last Name</label>
                <input className="input-field mb-0" required value={newEmp.last_name} onChange={e => setNewEmp({...newEmp, last_name: e.target.value})} />
              </div>
              <div className="col-12 col-md-4">
                <label className="label">Email</label>
                <input className="input-field mb-0" type="email" required value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} />
              </div>
              <div className="col-12 col-md-4">
                <label className="label">Company ID</label>
                <input className="input-field mb-0" required placeholder="EEP/..." value={newEmp.company_id} onChange={e => setNewEmp({...newEmp, company_id: e.target.value})} />
              </div>
              <div className="col-12 col-md-4 col-lg-4">
                <label className="label">Phone</label>
                <input className="input-field mb-0" value={newEmp.phone} onChange={e => setNewEmp({...newEmp, phone: e.target.value})} />
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <label className="label">Gender</label>
                <select className="input-field mb-0" value={newEmp.gender} onChange={e => setNewEmp({...newEmp, gender: e.target.value})}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <label className="label">National ID</label>
                <input className="input-field mb-0" value={newEmp.national_id} onChange={e => setNewEmp({...newEmp, national_id: e.target.value})} />
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <label className="label">Business Unit</label>
                <select className="input-field mb-0" value={newEmp.department_id} onChange={e => setNewEmp({...newEmp, department_id: e.target.value})}>
                  <option value="">Select Business Unit</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="col-12">
                <label className="label">Residential Address</label>
                <input className="input-field mb-0" value={newEmp.address} onChange={e => setNewEmp({...newEmp, address: e.target.value})} />
              </div>
              <div className="col-12 col-md-4">
                <label className="label">Emergency Contact Name</label>
                <input className="input-field mb-0" value={newEmp.emergency_contact_name} onChange={e => setNewEmp({...newEmp, emergency_contact_name: e.target.value})} />
              </div>
              <div className="col-12 col-md-4">
                <label className="label">Emergency Phone</label>
                <input className="input-field mb-0" value={newEmp.emergency_contact_phone} onChange={e => setNewEmp({...newEmp, emergency_contact_phone: e.target.value})} />
              </div>
              <div className="col-12 col-md-4">
                <label className="label">Position</label>
                <select className="input-field mb-0" value={newEmp.position_id} onChange={e => setNewEmp({...newEmp, position_id: e.target.value})}>
                  <option value="">Select Position</option>
                  {positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="label">Profile Photo {isEditing && "(Leave empty to keep current)"}</label>
                <input type="file" className="form-control bg-transparent text-muted small" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} />
              </div>
              <div className="col-12 col-md-6">
                <label className="label">Document (CV) {isEditing && "(Leave empty to keep current)"}</label>
                <input type="file" className="form-control bg-transparent text-muted small" onChange={e => setDocFile(e.target.files?.[0] || null)} />
              </div>
              <div className="col-12 d-flex gap-2 justify-content-end mt-4">
                <button type="button" onClick={resetForm} className="btn btn-outline-light border-opacity-10">Cancel</button>
                <button type="submit" className="btn-primary">{isEditing ? "Save Changes" : "Save Profile"}</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ background: '#ffffff', border: '1px solid rgba(148,163,184,0.25)', borderRadius: '16px', overflow: 'hidden', marginTop: '16px', boxShadow: '0 12px 30px rgba(15,23,42,0.05)' }}>
          <div className="p-3 d-flex flex-column flex-md-row gap-3" style={{ borderBottom: '1px solid rgba(226,232,240,0.9)' }}>
            <input 
              className="input-field mb-0" 
              placeholder="🔍  Search employees by name or company ID..." 
              style={{ maxWidth: '320px', fontSize: '0.875rem' }} 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <select 
              className="input-field mb-0" 
              style={{ maxWidth: '200px', fontSize: '0.875rem' }}
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
            >
              <option>All Units</option>
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
            {(searchQuery || selectedDept !== "All Units") && (
              <button 
                onClick={() => { setSearchQuery(""); setSelectedDept("All Units"); }}
                style={{ background: 'transparent', border: 'none', color: '#06b6d4', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
              >
                ✕ Clear Filters
              </button>
            )}
          </div>
          
          <div className="table-responsive">
            <table className="data-table" style={{ background: 'transparent' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(226,232,240,0.9)' }}>
                  <th>Company ID</th>
                  <th>Employee</th>
                  <th>Status</th>
                  <th>National ID</th>
                  <th>Business Unit</th>
                  <th>Attachments</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'rgba(148,163,184,0.9)', fontSize: '0.875rem' }}>Loading employees...</td></tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'rgba(148,163,184,0.9)', fontSize: '0.875rem' }}>No employees match your search.</td></tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <div style={{ fontWeight: '600', color: '#0ea5e9', fontSize: '0.85rem' }}>
                          {emp.company_id || "—"}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
                            {emp.photo_url ? <img src={`${API_BASE}${emp.photo_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '0.875rem', color: '#0f172a' }}>{emp.first_name} {emp.last_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.9)' }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={emp.is_active ? 'badge-active' : 'badge-inactive'}>
                          {emp.is_active ? '● Active' : '○ Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(15,23,42,0.7)' }}>
                          {emp.national_id || "—"}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'rgba(15,23,42,0.9)' }}>
                          {typeof emp.department === 'string' ? emp.department : (emp.department?.name || "Unassigned")}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.9)' }}>
                          {typeof emp.position === 'string' ? emp.position : (emp.position?.title || "Staff")}
                        </div>
                      </td>
                      <td>
                        {emp.document_url && (
                          <a href={`${API_BASE}${emp.document_url}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0ea5e9', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600' }}>📄 CV / Doc</a>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                          <button 
                            onClick={() => handleEdit(emp)}
                            style={{ background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(37,99,235,0.25)', color: '#0f172a', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => confirmDelete(emp.id, emp.first_name, emp.last_name)}
                            style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.4)', color: '#b91c1c', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(226,232,240,0.9)' }}>
            <div style={{ fontSize: '0.8rem', color: 'rgba(148,163,184,0.9)' }}>{employees.length} employees found</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button disabled className="btn-ghost" style={{ padding: '6px 16px', fontSize: '0.8rem', opacity: 0.5 }}>← Previous</button>
              <button disabled className="btn-ghost" style={{ padding: '6px 16px', fontSize: '0.8rem', opacity: 0.5 }}>Next →</button>
            </div>
          </div>
        </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedEmployee && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="bg-white rounded-4 p-4 animate-slide-up" style={{ width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', borderRadius: '1rem' }}>
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-danger" style={{ margin: 0, paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="fs-4">⚠️</span> Confirm Deletion
            </h5>
            <p className="text-secondary mb-4" style={{ marginBottom: '1.5rem', color: '#64748b' }}>Are you sure you want to delete the record for <strong>{selectedEmployee.name}</strong>? This action cannot be undone.</p>
            <div className="d-flex justify-content-end gap-2" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteModalOpen(false)} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={executeDelete} style={{ padding: '8px 16px', border: 'none', background: '#dc2626', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Delete Record</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {bulkUploadModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="bg-white rounded-4 p-4 animate-slide-up" style={{ width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', borderRadius: '1rem' }}>
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ margin: 0, paddingBottom: '0.5rem' }}>
              <span className="fs-4">📥</span> Bulk Import Employees
            </h5>
            <p className="text-secondary mb-4" style={{ fontSize: '0.9rem' }}>Upload an Excel (`.xlsx`) file containing employee records. The file must include `first_name`, `last_name`, and `email` columns.</p>
            
            <form onSubmit={handleBulkUpload}>
              <div className="mb-4">
                <input 
                  type="file" 
                  className="form-control" 
                  accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={e => setBulkFile(e.target.files?.[0] || null)}
                />
              </div>
              
              <div className="d-flex justify-content-end gap-2">
                <button type="button" onClick={() => { setBulkUploadModalOpen(false); setBulkFile(null); }} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isUploading || !bulkFile} style={{ padding: '8px 16px', border: 'none', background: '#2563eb', color: 'white', borderRadius: '8px', cursor: 'pointer', opacity: (isUploading || !bulkFile) ? 0.6 : 1 }}>
                  {isUploading ? "Uploading..." : "Upload & Import"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
