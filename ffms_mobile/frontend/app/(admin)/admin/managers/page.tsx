"use client";

import { useState } from "react";
import { mockManagers, Manager } from "@/lib/admin-mock-data";
import {
  UserPlus, Search, Filter, Edit2, ToggleLeft, ToggleRight, X, Check,
  Users, Briefcase, TrendingUp,
} from "lucide-react";

const cardStyle: React.CSSProperties = {
  background: "#f8f8faff",
  borderRadius: 16,
  border: "1px solid #c4b5fd",
  boxShadow: "0 2px 12px rgba(139,92,246,0.08)",
  padding: 24,
};

const departments = ["All Departments", "Sales", "Operations", "Delivery", "Marketing", "Field Services", "Support"];

export default function AdminManagersPage() {
  const [managers, setManagers] = useState<Manager[]>(mockManagers);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
    name: "", email: "", department: "Sales", phone: "", teamSize: 0,
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = managers.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "All Departments" || m.department === deptFilter;
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const toggleStatus = (id: string) => {
    setManagers((prev) => prev.map((m) => m.id === id ? { ...m, status: m.status === "active" ? "inactive" : "active" } : m));
    const mgr = managers.find((m) => m.id === id);
    showToast(`${mgr?.name} ${mgr?.status === "active" ? "deactivated" : "activated"} successfully.`, "success");
  };

  const handleAddManager = (e: React.FormEvent) => {
    e.preventDefault();
    const newMgr: Manager = {
      id: `m${Date.now()}`,
      name: formData.name,
      email: formData.email,
      department: formData.department,
      phone: formData.phone,
      teamSize: Number(formData.teamSize),
      assignedProjects: 0,
      status: "active",
      avatar: formData.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
      joinedDate: new Date().toISOString().split("T")[0],
      performanceScore: 75,
    };
    setManagers((prev) => [newMgr, ...prev]);
    setShowAddModal(false);
    setFormData({ name: "", email: "", department: "Sales", phone: "", teamSize: 0 });
    showToast(`${newMgr.name} added as a manager successfully!`, "success");
  };

  const handleEditManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingManager) return;
    setManagers((prev) => prev.map((m) => m.id === editingManager.id ? { ...m, name: formData.name, email: formData.email, department: formData.department, phone: formData.phone, teamSize: Number(formData.teamSize) } : m));
    setEditingManager(null);
    showToast("Manager details updated successfully!", "success");
  };

  const openEdit = (m: Manager) => {
    setFormData({ name: m.name, email: m.email, department: m.department, phone: m.phone, teamSize: m.teamSize });
    setEditingManager(m);
  };

  const summaryStats = [
    { label: "Total Managers", value: managers.length, icon: <Users size={18} />, color: "#8b5cf6", bg: "#ede9fe" },
    { label: "Active", value: managers.filter((m) => m.status === "active").length, icon: <Check size={18} />, color: "#22c55e", bg: "#dcfce7" },
    { label: "Inactive", value: managers.filter((m) => m.status === "inactive").length, icon: <X size={18} />, color: "#ef4444", bg: "#fee2e2" },
    { label: "Avg. Team Size", value: Math.round(managers.reduce((a, m) => a + m.teamSize, 0) / managers.length), icon: <TrendingUp size={18} />, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Total Projects", value: managers.reduce((a, m) => a + m.assignedProjects, 0), icon: <Briefcase size={18} />, color: "#f97316", bg: "#fff7ed" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "4px 4px 40px", maxWidth: 1600, margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── Stats Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
        {summaryStats.map((s) => (
          <div key={s.label} style={{ ...cardStyle, padding: "16px 20px", flexDirection: "row", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#1e293b" }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table Card ── */}
      <div style={cardStyle}>
        {/* Header + Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>All Managers</h2>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "2px 0 0" }}>{filtered.length} managers found</p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                id="manager-search"
                placeholder="Search managers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 9999, padding: "8px 16px 8px 36px", fontSize: 13, outline: "none", width: 220 }}
              />
            </div>
            {/* Dept filter */}
            <select id="dept-filter" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
              style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 9999, padding: "8px 16px", fontSize: 13, cursor: "pointer", outline: "none" }}>
              {departments.map((d) => <option key={d}>{d}</option>)}
            </select>
            {/* Status filter */}
            <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
              style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 9999, padding: "8px 16px", fontSize: 13, cursor: "pointer", outline: "none" }}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {/* Add Manager */}
            <button id="add-manager-btn" onClick={() => { setFormData({ name: "", email: "", department: "Sales", phone: "", teamSize: 0 }); setShowAddModal(true); }}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "#8b5cf6", color: "white", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <UserPlus size={16} /> Add Manager
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {["Manager Name", "Email", "Department", "Assigned Projects", "Team Size", "Performance", "Status", "Actions"].map((h) => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{m.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>Joined {m.joinedDate}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: "#64748b" }}>{m.email}</td>
                  <td><span style={{ background: "#ede9fe", color: "#8b5cf6", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999 }}>{m.department}</span></td>
                  <td style={{ fontSize: 13, fontWeight: 600, textAlign: "center" }}>{m.assignedProjects}</td>
                  <td style={{ fontSize: 13, fontWeight: 600, textAlign: "center" }}>{m.teamSize}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 999 }}>
                        <div style={{ height: "100%", width: `${m.performanceScore}%`, background: m.performanceScore >= 90 ? "#22c55e" : m.performanceScore >= 75 ? "#8b5cf6" : "#f97316", borderRadius: 999 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", minWidth: 32 }}>{m.performanceScore}%</span>
                    </div>
                  </td>
                  <td>
                    <button onClick={() => toggleStatus(m.id)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      {m.status === "active" ? <ToggleRight size={24} color="#22c55e" /> : <ToggleLeft size={24} color="#94a3b8" />}
                      <span style={{ fontSize: 12, fontWeight: 700, color: m.status === "active" ? "#22c55e" : "#94a3b8" }}>{m.status === "active" ? "Active" : "Inactive"}</span>
                    </button>
                  </td>
                  <td>
                    <button onClick={() => openEdit(m)} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(139,92,246,0.1)", color: "#8b5cf6", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      <Edit2 size={13} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: 14 }}>No managers found matching your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Manager Modal ── */}
      {showAddModal && (
        <ManagerFormModal
          title="Add New Manager"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleAddManager}
          onClose={() => setShowAddModal(false)}
          submitLabel="Add Manager"
        />
      )}

      {/* ── Edit Manager Modal ── */}
      {editingManager && (
        <ManagerFormModal
          title={`Edit — ${editingManager.name}`}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEditManager}
          onClose={() => setEditingManager(null)}
          submitLabel="Save Changes"
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: toast.type === "success" ? "var(--accent-green)" : "var(--accent-red)", color: "white", padding: "12px 20px", display: "flex", alignItems: "center", gap: "10px", zIndex: 9999, animation: "fadeIn 0.2s ease" }}>
          {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
          <span style={{ fontSize: "13px", fontWeight: 600 }}>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

function ManagerFormModal({ title, formData, setFormData, onSubmit, onClose, submitLabel }: {
  title: string;
  formData: { name: string; email: string; department: string; phone: string; teamSize: number };
  setFormData: React.Dispatch<React.SetStateAction<{ name: string; email: string; department: string; phone: string; teamSize: number }>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  submitLabel: string;
}) {
  const departments = ["Sales", "Operations", "Delivery", "Marketing", "Field Services", "Support"];
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 520 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-hanken), sans-serif" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={18} /></button>
        </div>
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Full Name *</label><input type="text" required className="input" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Ravi Kumar" /></div>
            <div style={{ flex: 1 }}><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Email *</label><input type="email" required className="input" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} placeholder="manager@company.com" /></div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Department *</label>
              <select className="input" value={formData.department} onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))} required>
                {departments.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Phone</label><input type="text" className="input" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 00001" /></div>
          </div>
          <div><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Team Size</label><input type="number" min={0} className="input" value={formData.teamSize} onChange={(e) => setFormData((p) => ({ ...p, teamSize: Number(e.target.value) }))} /></div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" style={{ background: "#8b5cf6" }}>{submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
