"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getStatusColor } from "@/lib/utils";
import { 
  CalendarRange, 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  User, 
  Compass,
  FileSpreadsheet,
  CheckCircle,
  X
} from "lucide-react";

interface VisitRecord {
  id: string;
  executiveName: string;
  customerName: string;
  purpose: string;
  status: "Scheduled" | "In-Progress" | "Completed" | "Cancelled";
  visitDate: string;
  timeSlot: string;
  priority: "High" | "Normal";
}

export default function VisitsPage() {
  const employees = useSelector((s: RootState) => s.employees.list);

  const [visits, setVisits] = useState<VisitRecord[]>([
    {
      id: "v-1",
      executiveName: "Rahul Sharma",
      customerName: "Reliance Corporate Park",
      purpose: "Deploy updates & brief stakeholders",
      status: "Completed",
      visitDate: "2026-05-25",
      timeSlot: "10:00 AM - 12:30 PM",
      priority: "High"
    },
    {
      id: "v-2",
      executiveName: "Priya Patel",
      customerName: "Tata Motors Plant",
      purpose: "Safety perimeter validation",
      status: "In-Progress",
      visitDate: "2026-05-25",
      timeSlot: "01:30 PM - 03:00 PM",
      priority: "High"
    },
    {
      id: "v-3",
      executiveName: "Meena Joshi",
      customerName: "HDFC Central Bank",
      purpose: "ATM telemetry audit",
      status: "Scheduled",
      visitDate: "2026-05-26",
      timeSlot: "09:30 AM - 11:00 AM",
      priority: "Normal"
    },
    {
      id: "v-4",
      executiveName: "Arjun Singh",
      customerName: "L&T Infrastructure",
      purpose: "Routine site boundary inspection",
      status: "Scheduled",
      visitDate: "2026-05-26",
      timeSlot: "02:00 PM - 04:00 PM",
      priority: "Normal"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterExecutive, setFilterExecutive] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [showAddModal, setShowAddModal] = useState(false);
  const [newVisit, setNewVisit] = useState({
    executiveName: "",
    customerName: "",
    purpose: "",
    timeSlot: "09:00 AM - 11:00 AM",
    visitDate: new Date().toISOString().split("T")[0],
    priority: "Normal" as "High" | "Normal"
  });

  const [toast, setToast] = useState<string | null>(null);

  const handleAddVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisit.executiveName || !newVisit.customerName || !newVisit.purpose) {
      alert("Please fill all required fields.");
      return;
    }

    const record: VisitRecord = {
      id: `v-${Date.now()}`,
      executiveName: newVisit.executiveName,
      customerName: newVisit.customerName,
      purpose: newVisit.purpose,
      status: "Scheduled",
      visitDate: newVisit.visitDate,
      timeSlot: newVisit.timeSlot,
      priority: newVisit.priority
    };

    setVisits(prev => [record, ...prev]);
    setShowAddModal(false);
    setNewVisit({
      executiveName: "",
      customerName: "",
      purpose: "",
      timeSlot: "09:00 AM - 11:00 AM",
      visitDate: new Date().toISOString().split("T")[0],
      priority: "Normal"
    });
    setToast("Visit scheduled successfully!");
    setTimeout(() => setToast(null), 3000);
  };

  const filteredVisits = visits.filter(v => {
    const matchSearch = v.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        v.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchExec = filterExecutive === "All" || v.executiveName === filterExecutive;
    const matchStatus = filterStatus === "All" || v.status === filterStatus;
    return matchSearch && matchExec && matchStatus;
  });

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CalendarRange size={24} color="var(--accent-blue)" /> Field Visits Planner
          </div>
          <div className="page-subtitle">Schedule, assign, and audit client site visits and performance indices.</div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card" style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: "1 1 200px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>SEARCH SITE / PURPOSE</label>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "11px", color: "var(--text-muted)" }} />
            <input
              className="input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12.5px" }}
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{ flex: "1 1 180px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>EXECUTIVE</label>
          <select 
            className="input" 
            style={{ height: "36px", fontSize: "12.5px" }}
            value={filterExecutive}
            onChange={(e) => setFilterExecutive(e.target.value)}
          >
            <option value="All">All Executives</option>
            {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
          </select>
        </div>

        <div style={{ flex: "1 1 180px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>VISIT STATUS</label>
          <select 
            className="input" 
            style={{ height: "36px", fontSize: "12.5px" }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <button 
          className="btn-primary" 
          style={{ height: "36px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }}
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={15} /> Book Visit
        </button>
      </div>

      {/* Visits List */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
        {filteredVisits.map(visit => {
          const isHigh = visit.priority === "High";
          return (
            <div 
              key={visit.id} 
              className="card" 
              style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "12px", 
                borderLeft: isHigh ? "4px solid var(--accent-red)" : "1px solid var(--border)" 
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800 }}>{visit.customerName}</div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                    <MapPin size={10} /> Site Visit
                  </span>
                </div>
                <span className={`badge ${getStatusColor(
                  visit.status === "Scheduled" ? "pending" : visit.status === "In-Progress" ? "warning" : visit.status === "Completed" ? "present" : "absent"
                )}`} style={{ fontSize: "10px" }}>
                  {visit.status}
                </span>
              </div>

              <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", background: "var(--bg-secondary)", padding: "10px", border: "1px solid var(--border)" }}>
                <strong>Purpose:</strong> {visit.purpose}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "10px", marginTop: "4px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", fontWeight: 700 }}>
                  <User size={13} color="var(--accent-blue)" /> {visit.executiveName}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-jetbrains), monospace" }}>
                  <Clock size={12} /> {visit.timeSlot}
                </span>
              </div>
            </div>
          );
        })}

        {filteredVisits.length === 0 && (
          <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            No matching client visits found.
          </div>
        )}
      </div>

      {/* Book Visit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" style={{ maxWidth: "480px" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontWeight: 700, fontSize: "16px" }}>Assign New Client Visit Beat</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddVisit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Field Executive *</label>
                <select 
                  className="input"
                  value={newVisit.executiveName}
                  onChange={(e) => setNewVisit(prev => ({ ...prev, executiveName: e.target.value }))}
                  required
                >
                  <option value="">-- Choose Field Representative --</option>
                  {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Customer / Location Site *</label>
                <input 
                  className="input"
                  placeholder="e.g., Reliance Park Hub"
                  value={newVisit.customerName}
                  onChange={(e) => setNewVisit(prev => ({ ...prev, customerName: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Visit Date</label>
                  <input 
                    type="date"
                    className="input"
                    value={newVisit.visitDate}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, visitDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Priority Urgency</label>
                  <select 
                    className="input"
                    value={newVisit.priority}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, priority: e.target.value as any }))}
                  >
                    <option value="Normal">Normal Priority</option>
                    <option value="High">High Priority (CRITICAL)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Time Slot Beat</label>
                <input 
                  className="input"
                  placeholder="e.g., 11:30 AM - 01:00 PM"
                  value={newVisit.timeSlot}
                  onChange={(e) => setNewVisit(prev => ({ ...prev, timeSlot: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Purpose / Site Checklist *</label>
                <textarea 
                  className="input"
                  rows={3}
                  placeholder="Visit tasks and deliverables..."
                  value={newVisit.purpose}
                  onChange={(e) => setNewVisit(prev => ({ ...prev, purpose: e.target.value }))}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "4px" }}>
                Book Visit Beat
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating success notification */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          background: "var(--accent-green)",
          color: "white",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          zIndex: 9999,
          animation: "fadeIn 0.2s ease",
          border: "1px solid rgba(0,0,0,0.1)",
        }}>
          <CheckCircle size={16} />
          <span style={{ fontSize: "13px", fontWeight: 600 }}>{toast}</span>
        </div>
      )}
    </div>
  );
}
