"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Play,
  Pause,
  RotateCcw,
  Navigation,
  Compass,
  Zap,
  Activity,
  MapPin,
  Clock,
  Gauge,
  ListOrdered
} from "lucide-react";
import { mockEmployeeRoutes } from "@/lib/geofence-mock";

// Dynamically import map component to avoid SSR errors
const PlaybackMap = dynamic(() => import("@/components/map/PlaybackMap"), {
  ssr: false,
  loading: () => (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-card)",
      minHeight: "450px",
      border: "1px solid var(--border)"
    }}>
      <MapPin size={32} style={{ marginBottom: "12px", color: "var(--accent-blue)" }} className="pulse-dot" />
      <div style={{ color: "var(--text-muted)", fontSize: "14px", fontFamily: "var(--font-jetbrains), monospace" }}>
        Loading Satellite Interface...
      </div>
    </div>
  ),
});

export default function PlaybackPage() {
  const [selectedId, setSelectedId] = useState<string>("1");
  const [activePointIndex, setActivePointIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step

  const currentData = mockEmployeeRoutes[selectedId] || mockEmployeeRoutes["1"];
  const route = currentData.route;
  const currentPoint = route[activePointIndex] || route[0];

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Playback timer loop
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setActivePointIndex((prev) => {
          if (prev >= route.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, route.length, playbackSpeed]);

  // Reset route active index when changing employees
  useEffect(() => {
    setActivePointIndex(0);
    setIsPlaying(false);
  }, [selectedId]);

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 className="page-title">Routes Playback</h1>
          <p className="page-subtitle">Replay historic travel paths, coordinates, speeds, and log indices.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="badge badge-green" style={{ fontFamily: "var(--font-jetbrains), monospace" }}>
            <Activity size={12} /> Playback Ready
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px", alignItems: "start" }}>
        {/* Left Side: Employee Selection & Logs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card" style={{ padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <Navigation size={16} color="var(--accent-blue)" />
              <span style={{ fontWeight: 700, fontSize: "14px", fontFamily: "var(--font-hanken), sans-serif" }}>
                Select Field Agent
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {Object.values(mockEmployeeRoutes).map((emp) => {
                const active = emp.employeeId === selectedId;
                return (
                  <div
                    key={emp.employeeId}
                    onClick={() => setSelectedId(emp.employeeId)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px",
                      cursor: "pointer",
                      border: active ? "1px solid var(--accent-blue)" : "1px solid var(--border)",
                      background: active ? "rgba(0, 82, 255, 0.04)" : "var(--bg-card)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{
                      width: "36px",
                      height: "36px",
                      background: "linear-gradient(135deg, #4f8ef7, #0052ff)",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {emp.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-primary)" }}>
                        {emp.employeeName}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "capitalize" }}>
                        {emp.role}
                      </div>
                    </div>
                    <div style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "var(--accent-blue)"
                    }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chronological Stop points list */}
          <div className="card" style={{ padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <ListOrdered size={16} color="var(--accent-blue)" />
              <span style={{ fontWeight: 700, fontSize: "14px", fontFamily: "var(--font-hanken), sans-serif" }}>
                Route Log History
              </span>
            </div>

            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "350px",
              overflowY: "auto",
              paddingRight: "4px"
            }}>
              {route.map((pt, index) => {
                const active = index === activePointIndex;
                return (
                  <div
                    key={index}
                    onClick={() => {
                      setIsPlaying(false);
                      setActivePointIndex(index);
                    }}
                    style={{
                      padding: "8px 10px",
                      cursor: "pointer",
                      border: active ? "1px solid var(--accent-blue)" : "1px solid transparent",
                      background: active ? "rgba(0, 82, 255, 0.03)" : "var(--bg-hover)",
                      transition: "all 0.15s ease",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {pt.time}
                      </span>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-jetbrains), monospace" }}>
                        {pt.speed}
                      </span>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {pt.status}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Map and playback */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Map Display Card */}
          <div className="card" style={{ padding: "0", overflow: "hidden", height: "450px", border: "1px solid var(--border)" }}>
            <PlaybackMap
              selectedEmployeeName={currentData.employeeName}
              route={route}
              activePointIndex={activePointIndex}
            />
          </div>

          {/* Scrubber Playback Controls */}
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
              {/* Playback action buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  className="btn-primary"
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    padding: "8px 16px",
                    fontSize: "13px",
                    background: isPlaying ? "var(--accent-orange)" : "var(--accent-blue)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  {isPlaying ? "Pause Log" : "Play History"}
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => {
                    setIsPlaying(false);
                    setActivePointIndex(0);
                  }}
                  style={{ padding: "8px 12px" }}
                  title="Reset to Start"
                >
                  <RotateCcw size={14} />
                </button>

                {/* Speed buttons */}
                <div style={{ display: "flex", background: "var(--bg-hover)", border: "1px solid var(--border)", marginLeft: "8px" }}>
                  {[
                    { label: "1x", delay: 1500 },
                    { label: "2x", delay: 750 },
                    { label: "4x", delay: 300 },
                  ].map((speed) => (
                    <button
                      key={speed.label}
                      onClick={() => setPlaybackSpeed(speed.delay)}
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                        background: playbackSpeed === speed.delay ? "var(--accent-blue)" : "transparent",
                        color: playbackSpeed === speed.delay ? "white" : "var(--text-secondary)",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {speed.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Tracker */}
              <div style={{ fontSize: "13px", fontFamily: "var(--font-jetbrains), monospace", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={14} color="var(--accent-blue)" />
                Log Point {activePointIndex + 1} of {route.length}
              </div>
            </div>

            {/* Slider track scrubber */}
            <div style={{ marginBottom: "20px" }}>
              <input
                type="range"
                min="0"
                max={route.length - 1}
                value={activePointIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setActivePointIndex(parseInt(e.target.value));
                }}
                style={{
                  width: "100%",
                  cursor: "pointer",
                  accentColor: "var(--accent-blue)",
                  height: "6px",
                  borderRadius: "3px"
                }}
              />
            </div>

            {/* Current Log Node Telemetry Data */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
              background: "var(--bg-secondary)",
              padding: "16px",
              border: "1px solid var(--border)"
            }}>
              <div>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--font-jetbrains), monospace" }}>
                  <Clock size={10} /> Timestamp
                </span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginTop: "2px" }}>
                  {currentPoint.time}
                </span>
              </div>
              
              <div>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--font-jetbrains), monospace" }}>
                  <Gauge size={10} /> Logged Speed
                </span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginTop: "2px" }}>
                  {currentPoint.speed}
                </span>
              </div>

              <div>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--font-jetbrains), monospace" }}>
                  <Zap size={10} /> Status Message
                </span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent-blue)", display: "block", marginTop: "2px" }}>
                  {currentPoint.status}
                </span>
              </div>

              <div>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--font-jetbrains), monospace" }}>
                  <MapPin size={10} /> GPS Location
                </span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginTop: "2px" }}>
                  {currentPoint.lat.toFixed(5)}° N, {currentPoint.lng.toFixed(5)}° E
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
