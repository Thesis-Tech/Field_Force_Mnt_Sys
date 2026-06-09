"use client";

import React from "react";
import MiniMap from "./MiniMap";
import { Employee } from "@/types/live-feed";
import { MapPin, User, Activity } from "lucide-react";

interface EmployeeCardProps {
  employee: Employee;
  isPastFeed?: boolean;
}

export default function EmployeeCard({ employee, isPastFeed }: EmployeeCardProps) {
  const isOnline = employee.status === "online";

  return (
    <div style={{
      background: "var(--bg-card)",
      borderRadius: "12px",
      border: "1px solid var(--border-color)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      height: isPastFeed ? "100%" : "300px"
    }}>
      <div style={{ flex: 1, position: "relative", minHeight: isPastFeed ? "400px" : "180px", background: "var(--bg-elevated)" }}>
        <MiniMap employee={employee} isPastFeed={isPastFeed} />
        
        {/* Status Badge Overlaid on Map */}
        <div style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          background: isOnline ? "#22d3a5" : "#e0e0e0",
          color: isOnline ? "white" : "#666",
          padding: "4px 8px",
          borderRadius: "12px",
          fontSize: "11px",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          zIndex: 10
        }}>
          {isOnline && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white", animation: "pulse 2s infinite" }} />}
          {isOnline ? "Active" : "Inactive"}
        </div>
      </div>
      
      <div style={{ padding: "16px", borderTop: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
            <User size={16} color="var(--text-muted)" />
            {employee.name}
          </h3>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", background: "var(--bg-elevated)", padding: "2px 8px", borderRadius: "10px" }}>
            {employee.role}
          </span>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)" }}>
            <MapPin size={14} color="var(--accent-blue)" />
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {employee.territory}
            </span>
          </div>
          
          {isPastFeed && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)" }}>
              <Activity size={14} color="var(--accent-purple)" />
              <span>Audit Trail Enabled</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
