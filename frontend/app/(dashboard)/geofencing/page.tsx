"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Navigation,
  Compass,
  Activity,
  Zap,
  Clock,
  ShieldAlert
} from "lucide-react";
import { mockEmployeeRoutes } from "@/lib/geofence-mock";

// Dynamically import map component to avoid SSR errors
const GeofenceMap = dynamic(() => import("@/components/map/GeofenceMap"), {
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

export default function GeofencingPage() {
  const [selectedId, setSelectedId] = useState<string>("1");

  const currentData = mockEmployeeRoutes[selectedId] || mockEmployeeRoutes["1"];
  // Set their current location as their last logged point
  const currentLocation = currentData.route[currentData.route.length - 1];

  // Compute geofence status for current location
  const getGeofenceStatuses = () => {
    return currentData.geofences.map((gf) => {
      // Calculate distance (simple formula since distance is small)
      const lat1 = currentLocation.lat;
      const lon1 = currentLocation.lng;
      const lat2 = gf.lat;
      const lon2 = gf.lng;
      
      // Rough distance in meters (haversine approximation)
      const R = 6371e3; // Earth radius in meters
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      const isInside = distance <= gf.radius;

      return {
        ...gf,
        isInside,
        distance: Math.round(distance),
      };
    });
  };

  const geofenceStatuses = getGeofenceStatuses();
  const currentlyInsideAny = geofenceStatuses.some((gf) => gf.isInside);
  const activeGeofenceName = geofenceStatuses.find((gf) => gf.isInside)?.name || "";

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 className="page-title">Geofencing Monitor</h1>
          <p className="page-subtitle">Track agent current coordinate proximity relative to authorized corporate bounds.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="badge badge-blue" style={{ fontFamily: "var(--font-jetbrains), monospace" }}>
            <Activity size={12} /> Live Boundaries Checked
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px", alignItems: "start" }}>
        {/* Left Side: Employee Selection & Geofence overview */}
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
                      background: "var(--accent-green)"
                    }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Geofence Status Overview card */}
          <div className="card" style={{ padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <Compass size={16} color="var(--accent-green)" />
              <span style={{ fontWeight: 700, fontSize: "14px", fontFamily: "var(--font-hanken), sans-serif" }}>
                Geofence Analysis
              </span>
            </div>

            <div style={{
              padding: "12px",
              background: currentlyInsideAny ? "rgba(5, 150, 105, 0.06)" : "rgba(249, 115, 22, 0.06)",
              borderLeft: currentlyInsideAny ? "3px solid var(--accent-green)" : "3px solid var(--accent-orange)",
              marginBottom: "16px"
            }}>
              <div style={{ fontWeight: 700, fontSize: "12px", color: currentlyInsideAny ? "var(--accent-green)" : "var(--accent-orange)" }}>
                {currentlyInsideAny ? "GEOCONTAINED" : "IN TRANSIT"}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-primary)", marginTop: "4px", fontWeight: 500 }}>
                {currentlyInsideAny ? `Inside ${activeGeofenceName}` : "Outside all assigned boundaries"}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Assigned Zones
              </div>
              {geofenceStatuses.map((gf) => (
                <div key={gf.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{gf.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {gf.isInside ? "Agent present" : `${gf.distance}m away`}
                    </div>
                  </div>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: gf.isInside ? "var(--accent-green)" : "var(--text-muted)"
                  }}>
                    {gf.isInside ? "● Active" : "○ Clear"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Map and Telemetry Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Main Map Card */}
          <div className="card" style={{ padding: "0", overflow: "hidden", height: "450px", border: "1px solid var(--border)" }}>
            <GeofenceMap
              selectedEmployeeName={currentData.employeeName}
              currentLocation={currentLocation}
              geofences={currentData.geofences}
            />
          </div>

          {/* Current Live Stats of Selected Employee */}
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <ShieldAlert size={16} color="var(--accent-blue)" />
              <span style={{ fontWeight: 700, fontSize: "14px", fontFamily: "var(--font-hanken), sans-serif" }}>
                Current Agent Log Details
              </span>
            </div>

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
                  <Clock size={10} /> Last Active Time
                </span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginTop: "2px" }}>
                  {currentLocation.time}
                </span>
              </div>
              
              <div>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--font-jetbrains), monospace" }}>
                  Current Speed
                </span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginTop: "2px" }}>
                  {currentLocation.speed}
                </span>
              </div>

              <div>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--font-jetbrains), monospace" }}>
                  Current Status
                </span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent-blue)", display: "block", marginTop: "2px" }}>
                  {currentLocation.status}
                </span>
              </div>

              <div>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--font-jetbrains), monospace" }}>
                  Coordinates
                </span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginTop: "2px" }}>
                  {currentLocation.lat.toFixed(5)}° N, {currentLocation.lng.toFixed(5)}° E
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
