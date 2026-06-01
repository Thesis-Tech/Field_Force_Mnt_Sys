"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  FileSpreadsheet,
  Download,
  Clock,
  CheckCircle,
  TrendingUp,
  ClipboardList,
  Users,
  Search,
  Calendar,
  AlertCircle
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from "recharts";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"attendance" | "tasks" | "analytics">("attendance");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  // Redux lists
  const employees = useSelector((s: RootState) => s.employees.list);
  const tasks = useSelector((s: RootState) => s.tasks.list);

  const attendance = useSelector((s: RootState) => s.attendance.list);

  // Filter Attendance Logs
  const filteredAttendance = attendance.filter((att) => {
    const matchesSearch = att.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          att.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || att.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Filter Task Logs
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || task.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Simulated export trigger
  const handleExport = (type: "csv" | "excel") => {
    setIsExporting(type === "csv" ? true : false);
    alert(`Generating export for ${activeTab} data as ${type.toUpperCase()}... File download will begin shortly.`);
    setTimeout(() => {
      setIsExporting(false);
    }, 1500);
  };

  // KPI Calculations
  const presentCount = attendance.filter(a => a.status === "present" || a.status === "late").length;
  const attendanceRate = attendance.length > 0 ? ((presentCount / attendance.length) * 100).toFixed(0) : "0";
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const taskSuccessRate = tasks.length > 0 ? ((completedTasks / tasks.length) * 100).toFixed(0) : "0";
  const lateCount = attendance.filter(a => a.status === "late").length;

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="page-title">Executive Reports</h1>
          <p className="page-subtitle">Detailed compliance, productivity logs, and performance metrics.</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button 
            className="btn-secondary" 
            onClick={() => handleExport("csv")}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "13px" }}
          >
            <FileSpreadsheet size={16} /> Export CSV
          </button>
          <button 
            className="btn-primary" 
            onClick={() => handleExport("excel")}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", fontSize: "13px" }}
          >
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div className="card" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ width: "42px", height: "42px", background: "rgba(0,82,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={18} color="var(--accent-blue)" />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 800 }}>{attendanceRate}%</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Attendance Rate</div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ width: "42px", height: "42px", background: "rgba(34,211,165,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle size={18} color="var(--accent-green)" />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 800 }}>{taskSuccessRate}%</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Task Success Rate</div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ width: "42px", height: "42px", background: "rgba(249,115,22,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Clock size={18} color="var(--accent-orange)" />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 800 }}>{lateCount} Arrivals</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Late Check-ins Today</div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ width: "42px", height: "42px", background: "rgba(139,92,246,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ClipboardList size={18} color="var(--accent-purple)" />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 800 }}>{tasks.length} Assigned</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Tasks Evaluated</div>
          </div>
        </div>
      </div>

      {/* Tabs Selector & Search Control Deck */}
      <div className="card" style={{ padding: "16px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          {/* Tab buttons */}
          <div style={{ display: "flex", border: "1px solid var(--border)", background: "var(--bg-hover)", padding: "2px" }}>
            {[
              { id: "attendance", label: "Attendance Log", icon: Clock },
              { id: "tasks", label: "Task Compliance", icon: ClipboardList },
              { id: "analytics", label: "Productivity Analytics", icon: TrendingUp },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSelectedStatus("all");
                    setSearchTerm("");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    fontSize: "13px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    background: active ? "var(--bg-card)" : "transparent",
                    color: active ? "var(--accent-blue)" : "var(--text-secondary)",
                    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  <TabIcon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Table Filters (Only show when not in analytics tab) */}
          {activeTab !== "analytics" && (
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: "1", justifyContent: "flex-end", minWidth: "260px" }}>
              <div style={{ position: "relative", flex: "1", maxWidth: "240px" }}>
                <Search size={14} style={{ position: "absolute", left: "10px", top: "12px", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input"
                  style={{ paddingLeft: "32px", fontSize: "12px", height: "36px" }}
                />
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input"
                style={{ width: "120px", fontSize: "12px", height: "36px" }}
              >
                <option value="all">All Statuses</option>
                {activeTab === "attendance" ? (
                  <>
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                  </>
                ) : (
                  <>
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="pending">Pending</option>
                  </>
                )}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Reports Log Grid Display */}
      {activeTab === "attendance" && (
        <div className="table-wrapper fade-in">
          <table>
            <thead>
              <tr>
                <th>Agent Name</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Assigned Territory</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 600 }}>{log.name}</td>
                    <td>{log.checkIn}</td>
                    <td>{log.checkOut}</td>
                    <td style={{ fontFamily: "var(--font-jetbrains), monospace" }}>{log.hours}</td>
                    <td>{log.location}</td>
                    <td>
                      <span className={`badge ${
                        log.status === "present" 
                          ? "badge-green" 
                          : log.status === "late" 
                          ? "badge-orange" 
                          : "badge-red"
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                    <AlertCircle size={20} style={{ margin: "0 auto 8px" }} />
                    No attendance records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="table-wrapper fade-in">
          <table>
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Assigned Executive</th>
                <th>Priority</th>
                <th>Territory Scope</th>
                <th>Target Deadline</th>
                <th>Compliance Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <tr key={task.id}>
                    <td style={{ fontWeight: 600 }}>{task.title}</td>
                    <td>{task.assignedTo}</td>
                    <td>
                      <span className={`badge ${
                        task.priority === "high" 
                          ? "badge-red" 
                          : task.priority === "medium" 
                          ? "badge-orange" 
                          : "badge-blue"
                      }`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </td>
                    <td>{task.territory}</td>
                    <td>{task.deadline}</td>
                    <td>
                      <span className={`badge ${
                        task.status === "completed" 
                          ? "badge-green" 
                          : task.status === "in-progress" 
                          ? "badge-blue" 
                          : "badge-purple"
                      }`}>
                        {task.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                    <AlertCircle size={20} style={{ margin: "0 auto 8px" }} />
                    No task compliance records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "analytics" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>
          {/* Chart 1: Daily Task & Attendance correlation */}
          <div className="card fade-in">
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
              <TrendingUp size={16} color="var(--accent-blue)" />
              <span style={{ fontWeight: 700, fontSize: "14px", fontFamily: "var(--font-hanken), sans-serif" }}>
                Daily Task Completion Trends
              </span>
            </div>
            <div style={{ height: "260px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tasks.map((t, i) => ({ day: `T${i+1}`, tasks: 1, present: t.status === 'completed' ? 1 : 0 }))} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "0" }} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="tasks" name="Tasks Processed" fill="#4f8ef7" />
                  <Bar dataKey="present" name="Staff Active" fill="#22d3a5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Late / Absent Correlation lines */}
          <div className="card fade-in">
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
              <Calendar size={16} color="var(--accent-red)" />
              <span style={{ fontWeight: 700, fontSize: "14px", fontFamily: "var(--font-hanken), sans-serif" }}>
                Staff Absenteeism Log
              </span>
            </div>
            <div style={{ height: "260px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendance.reduce((acc: {day: string, absent: number}[], a) => { const existing = acc.find(x => x.day === a.date); if (existing) { if (a.status === 'absent') existing.absent++; } else { acc.push({ day: a.date, absent: a.status === 'absent' ? 1 : 0 }); } return acc; }, [])}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "0" }} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line type="monotone" dataKey="absent" name="Absent Personnel" stroke="#f43f5e" strokeWidth={3} dot={{ strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
