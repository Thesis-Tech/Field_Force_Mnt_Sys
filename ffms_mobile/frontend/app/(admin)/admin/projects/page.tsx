"use client";

import { useState } from "react";
import { mockProjects, mockManagers, Project } from "@/lib/admin-mock-data";
import { FolderPlus, Search, Edit2, X, Check, RefreshCw, Briefcase, CheckCircle2, PauseCircle, Clock4 } from "lucide-react";

const cardStyle: React.CSSProperties = {
  background: "#f8f8faff",
  borderRadius: 16,
  border: "1px solid #c4b5fd",
  boxShadow: "0 2px 12px rgba(139,92,246,0.08)",
  padding: 24,
};

const statusColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  active: { bg: "#dcfce7", text: "#16a34a", icon: <CheckCircle2 size={13} /> },
  completed: { bg: "#dbeafe", text: "#2563eb", icon: <CheckCircle2 size={13} /> },
  "on-hold": { bg: "#fff7ed", text: "#ea580c", icon: <PauseCircle size={13} /> },
  planning: { bg: "#f3e8ff", text: "#9333ea", icon: <Clock4 size={13} /> },
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
    name: "", managerId: "m1", startDate: "", endDate: "", status: "planning" as Project["status"], department: "Sales", budget: "", progress: 0,
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.assignedManager.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const mgr = mockManagers.find((m) => m.id === formData.managerId);
    const newProject: Project = {
      id: `p${Date.now()}`,
      name: formData.name,
      assignedManager: mgr?.name || "",
      managerId: formData.managerId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      progress: Number(formData.progress),
      status: formData.status,
      department: formData.department,
      budget: formData.budget,
    };
    setProjects((prev) => [newProject, ...prev]);
    setShowAddModal(false);
    showToast(`Project "${newProject.name}" created successfully!`, "success");
  };

  const handleEditProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    const mgr = mockManagers.find((m) => m.id === formData.managerId);
    setProjects((prev) => prev.map((p) => p.id === editingProject.id
      ? { ...p, name: formData.name, managerId: formData.managerId, assignedManager: mgr?.name || p.assignedManager, startDate: formData.startDate, endDate: formData.endDate, progress: Number(formData.progress), status: formData.status, budget: formData.budget }
      : p));
    setEditingProject(null);
    showToast("Project updated successfully!", "success");
  };

  const openEdit = (p: Project) => {
    setFormData({ name: p.name, managerId: p.managerId, startDate: p.startDate, endDate: p.endDate, status: p.status, department: p.department, budget: p.budget, progress: p.progress });
    setEditingProject(p);
  };

  const summaryStats = [
    { label: "Total Projects", value: projects.length, color: "#8b5cf6", bg: "#ede9fe", icon: <Briefcase size={18} /> },
    { label: "Active", value: projects.filter((p) => p.status === "active").length, color: "#22c55e", bg: "#dcfce7", icon: <CheckCircle2 size={18} /> },
    { label: "On Hold", value: projects.filter((p) => p.status === "on-hold").length, color: "#f97316", bg: "#fff7ed", icon: <PauseCircle size={18} /> },
    { label: "Completed", value: projects.filter((p) => p.status === "completed").length, color: "#3b82f6", bg: "#eff6ff", icon: <CheckCircle2 size={18} /> },
    { label: "Planning", value: projects.filter((p) => p.status === "planning").length, color: "#a855f7", bg: "#f3e8ff", icon: <Clock4 size={18} /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "4px 4px 40px", maxWidth: 1600, margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
        {summaryStats.map((s) => (
          <div key={s.label} style={{ ...cardStyle, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>All Projects</h2>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "2px 0 0" }}>{filtered.length} projects found</p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input id="project-search" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 9999, padding: "8px 16px 8px 36px", fontSize: 13, outline: "none", width: 220 }} />
            </div>
            <select id="project-status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 9999, padding: "8px 16px", fontSize: 13, cursor: "pointer", outline: "none" }}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
            <button id="add-project-btn" onClick={() => { setFormData({ name: "", managerId: "m1", startDate: "", endDate: "", status: "planning", department: "Sales", budget: "", progress: 0 }); setShowAddModal(true); }}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "#8b5cf6", color: "white", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <FolderPlus size={16} /> Create Project
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {["Project Name", "Assigned Manager", "Start Date", "End Date", "Progress", "Budget", "Status", "Actions"].map((h) => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const sc = statusColors[p.status] || statusColors.planning;
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{p.department}</div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6", fontWeight: 700, fontSize: 10, flexShrink: 0 }}>
                          {p.assignedManager.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span style={{ fontSize: 13, color: "#334155" }}>{p.assignedManager}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: "#64748b" }}>{p.startDate}</td>
                    <td style={{ fontSize: 13, color: "#64748b" }}>{p.endDate}</td>
                    <td style={{ minWidth: 140 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 999 }}>
                          <div style={{ height: "100%", width: `${p.progress}%`, background: p.progress >= 80 ? "#22c55e" : p.progress >= 50 ? "#8b5cf6" : "#f97316", borderRadius: 999, transition: "width 0.3s ease" }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", minWidth: 32 }}>{p.progress}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{p.budget}</td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: sc.bg, color: sc.text, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>
                        {sc.icon}
                        {p.status === "on-hold" ? "On Hold" : p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => openEdit(p)} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(139,92,246,0.1)", color: "#8b5cf6", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          <Edit2 size={12} /> Edit
                        </button>
                        <button onClick={() => { setProjects((prev) => prev.map((proj) => proj.id === p.id ? { ...proj, assignedManager: mockManagers[Math.floor(Math.random() * mockManagers.length)].name } : proj)); showToast("Project reassigned!", "success"); }}
                          style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          <RefreshCw size={12} /> Reassign
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: 14 }}>No projects found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingProject) && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 560 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-hanken), sans-serif" }}>
                {editingProject ? `Edit — ${editingProject.name}` : "Create New Project"}
              </h2>
              <button onClick={() => { setShowAddModal(false); setEditingProject(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={18} /></button>
            </div>
            <form onSubmit={editingProject ? handleEditProject : handleAddProject} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Project Name *</label><input type="text" required className="input" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Q3 Sales Drive" /></div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Assign Manager *</label>
                  <select className="input" required value={formData.managerId} onChange={(e) => setFormData((p) => ({ ...p, managerId: e.target.value }))}>
                    {mockManagers.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.department})</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Status</label>
                  <select className="input" value={formData.status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as Project["status"] }))}>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Start Date *</label><input type="date" required className="input" value={formData.startDate} onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))} /></div>
                <div style={{ flex: 1 }}><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>End Date *</label><input type="date" required className="input" value={formData.endDate} onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))} /></div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Budget</label><input type="text" className="input" value={formData.budget} onChange={(e) => setFormData((p) => ({ ...p, budget: e.target.value }))} placeholder="e.g. ₹4.5L" /></div>
                <div style={{ flex: 1 }}><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Progress (%)</label><input type="number" min={0} max={100} className="input" value={formData.progress} onChange={(e) => setFormData((p) => ({ ...p, progress: Number(e.target.value) }))} /></div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => { setShowAddModal(false); setEditingProject(null); }} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: "#8b5cf6" }}>{editingProject ? "Save Changes" : "Create Project"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: toast.type === "success" ? "var(--accent-green)" : "var(--accent-red)", color: "white", padding: "12px 20px", display: "flex", alignItems: "center", gap: "10px", zIndex: 9999, animation: "fadeIn 0.2s ease" }}>
          {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
          <span style={{ fontSize: "13px", fontWeight: 600 }}>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
