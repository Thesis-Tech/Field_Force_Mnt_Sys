"use client";

import React from "react";
import EmployeeCard from "./EmployeeCard";
import { Employee } from "@/types/live-feed";

interface GridViewProps {
  employees: Employee[];
  gridSize: number;
  isPastFeed: boolean;
}

export default function GridView({ employees, gridSize, isPastFeed }: GridViewProps) {
  // Compute grid template columns based on gridSize
  let columns = 4;
  if (gridSize === 4) columns = 2;
  else if (gridSize === 8) columns = 4;
  else if (gridSize === 12) columns = 4;
  else if (gridSize === 16) columns = 4;

  if (isPastFeed) {
    return (
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "24px",
        height: "100%",
        minHeight: "400px"
      }}>
        {employees.slice(0, 1).map((emp) => (
          <EmployeeCard key={`past-${emp.id}`} employee={emp} isPastFeed={true} />
        ))}
        {employees.length === 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
            No employee selected for audit
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: "20px",
      // Calculate responsive layout
    }}>
      {employees.map((emp) => (
        <EmployeeCard key={emp.id} employee={emp} isPastFeed={false} />
      ))}
      {employees.length === 0 && (
        <div style={{ gridColumn: `1 / -1`, textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
          No employees found for the selected filters.
        </div>
      )}
    </div>
  );
}
