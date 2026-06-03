"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { 
  BarChart3, 
  Clock, 
  UserX, 
  Calendar,
  Award,
  TrendingUp,
  ChevronRight
} from "lucide-react";

export default function AttendanceAnalyticsPage() {
  const employees = useSelector((s: RootState) => s.employees.list);
  const attendance = useSelector((s: RootState) => s.attendance.list);

  // Compute analytics metrics
  const totalEmployees = employees.length;
  const lateCount = attendance.filter(a => a.status?.toLowerCase() === "late").length;
  const presentCount = attendance.filter(a => {
    const s = a.status?.toLowerCase();
    return s === "present" || s === "on time" || s === "on-time";
  }).length;
  const onTimeCount = presentCount - lateCount;
  
  // Calculate delay rates
  const averageDelayMins = 24; // Simulated average delayed time
  const onTimeRate = totalEmployees > 0 ? Math.round(((totalEmployees - lateCount) / totalEmployees) * 100) : 100;

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div>
        <div className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <BarChart3 size={24} color="var(--accent-blue)" /> Attendance Analytics & Trends
        </div>
        <div className="page-subtitle">Historical check-in audits, average transit delays, and field compliance scores.</div>
      </div>

      {/* Analytics KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        
        {/* KPI 1: On-Time rate */}
        <div className="card" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ width: "42px", height: "42px", background: "rgba(16,185,129,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Award size={18} color="var(--accent-green)" />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "var(--font-jetbrains), monospace" }}>{onTimeRate}%</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>On-Time Shift Rate</div>
          </div>
        </div>

        {/* KPI 2: Average Delay */}
        <div className="card" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ width: "42px", height: "42px", background: "rgba(249,115,22,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Clock size={18} color="var(--accent-orange)" />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "var(--font-jetbrains), monospace" }}>{averageDelayMins} mins</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Average Transit Delay</div>
          </div>
        </div>

        {/* KPI 3: Late Check-ins */}
        <div className="card" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ width: "42px", height: "42px", background: "rgba(244,63,94,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserX size={18} color="var(--accent-red)" />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "var(--font-jetbrains), monospace" }}>{lateCount} Shifts</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Late Check-ins Today</div>
          </div>
        </div>

        {/* KPI 4: Monthly Active Period */}
        <div className="card" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ width: "42px", height: "42px", background: "rgba(0,82,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Calendar size={18} color="var(--accent-blue)" />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "var(--font-jetbrains), monospace" }}>22 Days</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Billing Cycle</div>
          </div>
        </div>

      </div>

      {/* Main Grid: Weekly heatmaps & Employee Scoreboard */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr", gap: "20px" }}>
        
        {/* Left Column: Weekly Compliance Heatmap */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
            <span style={{ fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <TrendingUp size={16} color="var(--accent-blue)" /> Weekly Compliance Graph
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "180px", paddingTop: "20px", paddingBottom: "10px", borderBottom: "1px solid var(--border)" }}>
            {/* Monday bar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: 1 }}>
              <span style={{ fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace" }}>85%</span>
              <div style={{ width: "24px", height: "110px", background: "var(--accent-blue)" }}></div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Mon</span>
            </div>

            {/* Tuesday bar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: 1 }}>
              <span style={{ fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace" }}>92%</span>
              <div style={{ width: "24px", height: "125px", background: "var(--accent-blue)" }}></div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Tue</span>
            </div>

            {/* Wednesday bar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: 1 }}>
              <span style={{ fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace" }}>95%</span>
              <div style={{ width: "24px", height: "135px", background: "var(--accent-blue)" }}></div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Wed</span>
            </div>

            {/* Thursday bar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: 1 }}>
              <span style={{ fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace" }}>78%</span>
              <div style={{ width: "24px", height: "95px", background: "var(--accent-orange)" }}></div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Thu</span>
            </div>

            {/* Friday bar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: 1 }}>
              <span style={{ fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace" }}>89%</span>
              <div style={{ width: "24px", height: "115px", background: "var(--accent-blue)" }}></div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Fri</span>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "var(--text-muted)", justifyContent: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "10px", height: "10px", background: "var(--accent-blue)" }}></span> On-Time Rate &gt; 80%
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "10px", height: "10px", background: "var(--accent-orange)" }}></span> Warning Threshold (&lt; 80%)
            </span>
          </div>
        </div>

        {/* Right Column: Punctuality Scoreboard */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
            <span style={{ fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Award size={16} color="var(--accent-green)" /> Executive Punctuality Rank
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {employees.map((emp, index) => {
              // Mock punctuality
              const rank = index + 1;
              const scores = [98, 95, 91, 88, 82, 75];
              const score = scores[index] || 85;
              const isExcellent = score >= 90;

              return (
                <div 
                  key={emp.id} 
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-muted)", fontFamily: "var(--font-jetbrains), monospace", width: "16px" }}>
                      #{rank}
                    </span>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700 }}>{emp.name}</span>
                      <span style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>{emp.role}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span 
                      className={`badge ${isExcellent ? "badge-green" : "badge-orange"}`} 
                      style={{ fontSize: "10px", fontWeight: 800, fontFamily: "var(--font-jetbrains), monospace" }}
                    >
                      {score}% On-Time
                    </span>
                    <ChevronRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
