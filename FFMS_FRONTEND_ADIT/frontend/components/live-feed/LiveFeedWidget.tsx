"use client";

import React, { useState, useRef, useEffect } from "react";
import FilterBar from "@/components/live-feed/FilterBar";
import GridView from "@/components/live-feed/GridView";
import PastFeedFilter from "@/components/live-feed/PastFeedFilter";
import { Maximize, Minimize } from "lucide-react";
import { Employee } from "@/types/live-feed";

export default function LiveFeedWidget({ 
  liveEmployees = [],
  territories = []
}: { 
  liveEmployees?: Employee[],
  territories?: string[]
}) {
  const [gridSize, setGridSize] = useState<number>(4); // Default to 4 grid in dashboard to save space
  const [territory, setTerritory] = useState<string>("All");
  const [role, setRole] = useState<string>("All");
  const [status, setStatus] = useState<string>("All");
  const [showPastFeed, setShowPastFeed] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pastFeedEmpId, setPastFeedEmpId] = useState<string>("");

  useEffect(() => {
    if (!pastFeedEmpId && liveEmployees.length > 0) {
      setPastFeedEmpId(liveEmployees[0].id);
    }
  }, [liveEmployees, pastFeedEmpId]);

  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Filter logic
  let filteredEmployees = liveEmployees;
  if (territory !== "All") {
    filteredEmployees = filteredEmployees.filter(e => e.territory === territory);
  }
  if (role !== "All") {
    filteredEmployees = filteredEmployees.filter(e => e.role === role);
  }
  if (status !== "All") {
    filteredEmployees = filteredEmployees.filter(e => {
      if (status === "Active") return e.status === "online";
      if (status === "Inactive") return e.status === "offline";
      return true;
    });
  }

  return (
    <div 
      ref={containerRef} 
      className="card"
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        background: "var(--bg-card)", 
        overflow: "hidden",
        position: "relative",
        height: isFullscreen ? "100%" : "600px", // fixed height when in dashboard
        borderRadius: isFullscreen ? 0 : 16,
        border: isFullscreen ? "none" : "1px solid #e2e8f0",
        boxShadow: "0 2px 12px rgba(48, 117, 228, 0.08)",
      }}
    >
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid #e2e8f0",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#1e293b" }}>Live Feed</h3>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            background: "rgba(34,211,165,0.1)", 
            color: "#22d3a5", 
            padding: "4px 10px", 
            borderRadius: "20px", 
            fontSize: "12px", 
            fontWeight: 600 
          }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22d3a5", animation: "pulse 2s infinite" }} />
            LIVE
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button 
            onClick={() => setShowPastFeed(!showPastFeed)}
            style={{
              padding: "6px 12px",
              background: showPastFeed ? "var(--accent-blue)" : "transparent",
              color: showPastFeed ? "white" : "var(--text-primary)",
              border: `1px solid ${showPastFeed ? "var(--accent-blue)" : "var(--border-color)"}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              transition: "all 0.2s"
            }}
          >
            Past Feed / Audit
          </button>
          <button 
            onClick={toggleFullscreen}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 10px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              cursor: "pointer",
              color: "var(--text-primary)",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            {isFullscreen ? "Exit" : "Fullscreen"}
          </button>
        </div>
      </div>

      {showPastFeed && (
        <div style={{ padding: "12px 16px 0", borderBottom: "1px solid var(--border-color)", background: "#fff" }}>
          <PastFeedFilter 
            onClose={() => setShowPastFeed(false)} 
            employees={liveEmployees}
            selectedEmpId={pastFeedEmpId}
            setSelectedEmpId={setPastFeedEmpId}
          />
        </div>
      )}

      {!showPastFeed && (
        <FilterBar 
          gridSize={gridSize}
          setGridSize={setGridSize}
          territory={territory}
          setTerritory={setTerritory}
          role={role}
          setRole={setRole}
          status={status}
          setStatus={setStatus}
          availableTerritories={territories}
        />
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "16px", background: "#f1f5f9" }}>
        <GridView 
          employees={showPastFeed ? liveEmployees.filter(e => e.id === pastFeedEmpId) : filteredEmployees.slice(0, gridSize)} 
          gridSize={gridSize} 
          isPastFeed={showPastFeed} 
        />
      </div>
    </div>
  );
}
