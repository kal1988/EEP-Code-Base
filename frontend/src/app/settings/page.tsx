"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

interface Organization {
  name: string;
  subtitle: string;
  logo_url?: string;
}

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [org, setOrg] = useState<Organization | null>(null);
  const [orgName, setOrgName] = useState("Ethiopian Electric Power");
  const [orgSubtitle, setOrgSubtitle] = useState("HR Management Portal");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  
  // Modal states
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: number; username: string } | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState("");
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) { 
      // Fetch Organization
      api.get("/organization/").then((data) => {
        setOrg(data);
        setOrgName(data.name);
        setOrgSubtitle(data.subtitle);
        if (data.logo_url) {
          setLogoPreview(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${data.logo_url}`);
        }
      }).catch(console.error);

      // Fetch Users
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const data = await api.get("/users/");
      setUsers(data);
    } catch (e) {
      console.error("Failed to fetch users:", e);
    }
  };

  const confirmDeleteUser = (userId: number, username: string) => {
    setSelectedUser({ id: userId, username });
    setDeleteModalOpen(true);
  };

  const executeDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/users/${selectedUser.id}`);
      showToast(`User ${selectedUser.username} deleted successfully.`);
      setUsers(users.filter(u => u.id !== selectedUser.id));
    } catch (e: any) {
      showToast(e.message || "Failed to delete user", "error");
    } finally {
      setDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  const openPasswordModal = (userId: number, username: string) => {
    setSelectedUser({ id: userId, username });
    setNewPasswordValue("");
    setPasswordModalOpen(true);
  };

  const executeChangePassword = async () => {
    if (!selectedUser) return;
    if (newPasswordValue.length < 4) {
      showToast("Password must be at least 4 characters", "error");
      return;
    }
    try {
      await api.put(`/users/${selectedUser.id}/password`, { new_password: newPasswordValue });
      showToast(`Password for ${selectedUser.username} changed successfully.`);
    } catch (e: any) {
      showToast(e.message || "Failed to change password", "error");
    } finally {
      setPasswordModalOpen(false);
      setSelectedUser(null);
      setNewPasswordValue("");
    }
  };

  const changeUserPassword = async (userId: number, username: string) => {
    const newPassword = window.prompt(`Enter new password for ${username}:`);
    if (!newPassword) return; // cancelled or empty
    if (newPassword.length < 4) {
      showToast("Password must be at least 4 characters", "error");
      return;
    }
    
    try {
      await api.put(`/users/${userId}/password`, { new_password: newPassword });
      showToast(`Password for ${username} changed successfully.`);
    } catch (e: any) {
      showToast(e.message || "Failed to change password", "error");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const saveOrganization = async () => {
    const hasNameChanged = orgName !== org?.name;
    const hasSubtitleChanged = orgSubtitle !== org?.subtitle;
    const hasLogoChanged = !!logoFile;

    if (!hasNameChanged && !hasSubtitleChanged && !hasLogoChanged) {
      showToast("No changes were made to save.", "info");
      return;
    }

    const formData = new FormData();
    formData.append("name", orgName);
    formData.append("subtitle", orgSubtitle);
    if (logoFile) {
      formData.append("logo", logoFile);
    }

    try {
      const updated = await api.post("/organization/", formData);
      setOrg(updated);
      setOrgName(updated.name);
      showToast("Settings updated successfully! ✨");
      router.refresh(); 
      setLogoFile(null);
    } catch (e: any) {
      showToast(e.message || "Failed to save settings", "error");
    }
  };

  if (loading) return <div style={{ color: '#0f172a', padding: '40px', background: '#f3f4f6', minHeight: '100vh' }}>Loading...</div>;

  const getToastStyles = () => {
    switch(toast?.type) {
      case 'error': return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', text: '#f87171', icon: '❌' };
      case 'info': return { bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.3)', text: '#818cf8', icon: 'ℹ️' };
      default: return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', text: '#10b981', icon: '✅' };
    }
  };

  const toastStyle = getToastStyles();

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="content-area">
        <div className="container-fluid">
          {toast && (
            <div className={`toast-notification alert d-flex align-items-center gap-3 animate-slide-up`} 
                 style={{
                   position: 'fixed',
                   bottom: '40px',
                   left: '50%',
                   transform: 'translateX(-50%)',
                   background: toastStyle.bg,
                   backdropFilter: 'blur(12px)',
                   border: `1px solid ${toastStyle.border}`,
                   padding: '12px 24px',
                   borderRadius: '12px',
                   color: toastStyle.text,
                   fontWeight: '600',
                   zIndex: 2000,
                   boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                 }}>
              <span className="fs-5">{toastStyle.icon}</span>
              <span>{toast.message}</span>
            </div>
          )}
          <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3 mb-5">
            <div>
              <h1 className="gradient-text display-5 fw-bold mb-1">Settings</h1>
              <p className="text-muted lead mb-0">Manage your account preferences and system configuration.</p>
            </div>
          </header>

          <div className="row g-4">
            <div className="col-12 col-xl-8">
              <section className="glass-card p-4" style={{ background: '#ffffff', border: '1px solid rgba(148,163,184,0.25)', boxShadow: '0 12px 30px rgba(15,23,42,0.05)' }}>
                <div className="mb-5">
                  <h3 className="h4 fw-bold mb-2">Organization Details</h3>
                  <p className="text-muted small mb-4">Branding and identity for the portal.</p>
                  
                  <div className="row g-4">
                    <div className="col-12">
                      <label className="label">Company Logo</label>
                      <div className="d-flex flex-column flex-md-row align-items-md-center gap-4 p-4 rounded-3" style={{ background: '#f9fafb', border: '1px dashed rgba(148,163,184,0.7)' }}>
                        <div className="rounded-3 d-flex justify-content-center align-items-center overflow-hidden" style={{ width: '100px', height: '100px', minWidth: '100px', background: '#e5e7eb' }}>
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo" className="w-100 h-100 object-fit-contain" />
                          ) : (
                            <span className="fs-1 text-muted">🏢</span>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <input type="file" onChange={handleLogoUpload} className="d-none" id="logo-upload" accept="image/*" />
                          <label htmlFor="logo-upload" className="btn btn-outline-secondary btn-sm px-4 mb-2">
                            Change Logo
                          </label>
                          <p className="text-muted small mb-0">Recommended: Square PNG/SVG, max 2MB.</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="label">Display Name</label>
                      <input className="input-field mb-0" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g. Ethiopian Electric Power" />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="label">Subtitle</label>
                      <input className="input-field mb-0" value={orgSubtitle} onChange={(e) => setOrgSubtitle(e.target.value)} placeholder="e.g. HR Management Portal" />
                    </div>
                  </div>
                </div>

                {/* Admin Users Table */}
                <div className="mb-5 pt-4 border-top border-secondary border-opacity-10">
                  <h3 className="h4 fw-bold mb-2">Admin Users</h3>
                  <p className="text-muted small mb-4">Manage portal access for other administrators.</p>
                  
                  <div className="table-responsive rounded-3 overflow-hidden" style={{ border: '1px solid rgba(148,163,184,0.2)' }}>
                    <table className="table table-hover mb-0 align-middle">
                      <thead style={{ background: '#f8fafc' }}>
                        <tr>
                          <th className="px-4 py-3 border-0 small text-uppercase fw-bold text-muted">User</th>
                          <th className="px-4 py-3 border-0 small text-uppercase fw-bold text-muted">Email</th>
                          <th className="px-4 py-3 border-0 small text-uppercase fw-bold text-muted">Status</th>
                          <th className="px-4 py-3 border-0 small text-uppercase fw-bold text-muted text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td className="px-4 py-3 border-bottom border-secondary border-opacity-10">
                              <div className="d-flex align-items-center gap-3">
                                <div className="rounded-circle d-flex justify-content-center align-items-center bg-light fw-bold" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                  {u.username[0].toUpperCase()}
                                </div>
                                <div>
                                  <div className="fw-semibold" style={{ color: '#1e293b' }}>{u.username}</div>
                                  {u.is_superuser && <span className="badge bg-primary-subtle text-primary border-primary border-opacity-25" style={{ fontSize: '0.65rem' }}>Superuser</span>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 border-bottom border-secondary border-opacity-10 text-muted small">{u.email}</td>
                            <td className="px-4 py-3 border-bottom border-secondary border-opacity-10">
                              <span className={`badge ${u.is_active ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`} style={{ fontSize: '0.7rem' }}>
                                {u.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-3 border-bottom border-secondary border-opacity-10 text-end">
                              <button 
                                className="btn btn-sm text-primary border-0 p-1 me-2" 
                                onClick={() => openPasswordModal(u.id, u.username)}
                                title="Change user password"
                              >
                                🔑
                              </button>
                              <button 
                                className="btn btn-sm text-danger border-0 p-1" 
                                onClick={() => confirmDeleteUser(u.id, u.username)}
                                disabled={u.username === user?.username}
                                title={u.username === user?.username ? "You cannot delete yourself" : "Delete user"}
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-4 border-top border-secondary border-opacity-10">
                  <h3 className="h4 fw-bold mb-2">User Account</h3>
                  <p className="text-muted small mb-4">Personal preferences and security.</p>
                  
                  <div className="row g-4 align-items-end">
                    <div className="col-12 col-md-8">
                      <label className="label">Email Address</label>
                      <input className="input-field mb-0" defaultValue={user?.email || ""} readOnly />
                    </div>
                    <div className="col-12 col-md-4">
                      <button className="btn btn-outline-secondary w-100" disabled>Change Password</button>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-5 pt-3 border-top border-secondary border-opacity-10">
                  <button className="btn-primary px-5" onClick={saveOrganization}>Save All Changes</button>
                </div>
              </section>
            </div>
            
            <div className="col-12 col-xl-4 text-center">
              <div className="glass-card p-4 h-100 d-flex flex-column justify-content-center align-items-center border-0" style={{ background: '#ffffff', boxShadow: '0 12px 30px rgba(15,23,42,0.05)', border: '1px solid rgba(148,163,184,0.25)' }}>
                <div className="rounded-circle d-flex justify-content-center align-items-center mb-4 text-primary" style={{ width: '80px', height: '80px', fontSize: '2rem', fontWeight: '800', background: '#e0f2fe', color: '#0f172a' }}>
                  {user?.username?.[0].toUpperCase()}
                </div>
                <h4 className="fw-bold mb-1" style={{ color: '#0f172a' }}>{user?.username}</h4>
                <p className="text-muted small mb-0">Administrator Portal</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="bg-white rounded-4 p-4 animate-slide-up" style={{ width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-danger">
              <span className="fs-4">⚠️</span> Confirm Deletion
            </h5>
            <p className="text-secondary mb-4">Are you sure you want to remove <strong>{selectedUser.username}</strong> from the system? This action cannot be undone.</p>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-light px-4" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
              <button className="btn btn-danger px-4 shadow-sm" onClick={executeDeleteUser}>Delete User</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordModalOpen && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="bg-white rounded-4 p-4 animate-slide-up" style={{ width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
            <h5 className="fw-bold mb-1">Change Password</h5>
            <p className="text-muted small mb-4">Set a new password for <strong className="text-dark">{selectedUser.username}</strong></p>
            
            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary">New Password</label>
              <input 
                type="password" 
                className="form-control form-control-lg bg-light" 
                placeholder="At least 4 characters"
                value={newPasswordValue}
                onChange={(e) => setNewPasswordValue(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="d-flex justify-content-end gap-2 pt-2 border-top">
              <button className="btn btn-light px-4" onClick={() => setPasswordModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary px-4 shadow-sm" onClick={executeChangePassword} disabled={newPasswordValue.length < 4}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
