"use client";

import React, { useState } from "react";
import { X, Search } from "lucide-react";

interface PastFeedFilterProps {
  onClose: () => void;
  employees: any[];
  selectedEmpId: string;
  setSelectedEmpId: (id: string) => void;
}

export default function PastFeedFilter({ onClose, employees, selectedEmpId, setSelectedEmpId }: PastFeedFilterProps) {
  const [dateStr, setDateStr] = useState("");

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: "16px",
      flexWrap: "wrap",
      gap: "16px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Select Employee</label>
          <select 
            value={selectedEmpId} 
            onChange={e => setSelectedEmpId(e.target.value)}
            style={{
              padding: "8px 12px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              color: "var(--text-primary)",
              fontSize: "14px",
              minWidth: "160px",
              outline: "none",
            }}
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Select Date</label>
          <input 
            type="date" 
            value={dateStr}
            onChange={e => setDateStr(e.target.value)}
            style={{
              padding: "7px 12px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              color: "var(--text-primary)",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "2px", height: "100%" }}>
          <button style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            background: "var(--accent-blue)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer"
          }}>
            <Search size={16} />
            View Audit Trail
          </button>
        </div>
      </div>

      <button 
        onClick={onClose}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "32px",
          height: "32px",
          background: "transparent",
          border: "1px solid var(--border-color)",
          borderRadius: "6px",
          cursor: "pointer",
          color: "var(--text-muted)"
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
