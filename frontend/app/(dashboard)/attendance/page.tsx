"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getStatusColor } from "@/lib/utils";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function AttendancePage() {
  const attendance = useSelector((s: RootState) => s.attendance.list);

  const present = attendance.filter(a => a.status === "present").length;
  const absent  = attendance.filter(a => a.status === "absent").length;
  const late    = attendance.filter(a => a.status === "late").length;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Attendance</div>
        <div className="page-subtitle">Today — {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"14px",marginBottom:"24px" }}>
        {[
          { label:"Total Employees",value:attendance.length,icon:Clock,color:"#4f8ef7" },
          { label:"Present",value:present,icon:CheckCircle,color:"#22d3a5" },
          { label:"Absent",value:absent,icon:XCircle,color:"#f43f5e" },
          { label:"Late Check-In",value:late,icon:AlertCircle,color:"#f97316" },
        ].map(s => (
          <div key={s.label} className="card" style={{ display:"flex",alignItems:"center",gap:"14px" }}>
            <div style={{ width:"44px",height:"44px",borderRadius: "0",background:`${s.color}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize:"24px",fontWeight:800 }}>{s.value}</div>
              <div style={{ fontSize:"12px",color:"var(--text-secondary)" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Hours Worked</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map(row => (
              <tr key={row.id}>
                <td>
                  <div style={{ fontWeight:600,fontSize:"14px" }}>{row.name}</div>
                </td>
                <td>
                  <span style={{ fontFamily:"monospace",fontSize:"13px",color: row.checkIn==="--" ? "var(--text-muted)" : "var(--accent-green)" }}>
                    {row.checkIn}
                  </span>
                </td>
                <td>
                  <span style={{ fontFamily:"monospace",fontSize:"13px",color: row.checkOut==="--" ? "var(--text-muted)" : "var(--text-primary)" }}>
                    {row.checkOut}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize:"13px",fontWeight:row.hours==="Active" ? 700 : 400, color:row.hours==="Active" ? "var(--accent-green)" : "var(--text-secondary)" }}>
                    {row.hours === "Active" ? "🟢 Active" : row.hours}
                  </span>
                </td>
                <td style={{ fontSize:"13px",color:"var(--text-secondary)" }}>{row.location}</td>
                <td>
                  <span className={`badge ${getStatusColor(row.status)}`}>
                    {row.status.charAt(0).toUpperCase()+row.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
