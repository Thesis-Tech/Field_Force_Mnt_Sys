"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { 
  Compass, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ArrowRight,
  Route,
  ThumbsUp,
  AlertCircle
} from "lucide-react";

interface BeatPlan {
  id: string;
  executiveName: string;
  routeName: string;
  totalKm: number;
  sitesCount: number;
  sequence: string[];
  status: "Optimized" | "Pending Alignment" | "In Transit";
}

export default function BeatPlansPage() {
  const employees = useSelector((s: RootState) => s.employees.list);

  const [beatPlans, setBeatPlans] = useState<BeatPlan[]>([
    {
      id: "bp-1",
      executiveName: "Rahul Sharma",
      routeName: "Mumbai West Hub Beat #402",
      totalKm: 18.5,
      sitesCount: 3,
      sequence: ["Reliance Park HQ", "HDFC Corporate Office", "Mumbai Central Depot"],
      status: "Optimized"
    },
    {
      id: "bp-2",
      executiveName: "Priya Patel",
      routeName: "Pune Industrial Belt Beat #105",
      totalKm: 34.2,
      sitesCount: 3,
      sequence: ["Tata Motors Plant A", "Bajaj Auto Depot", "Infosys Hinjewadi"],
      status: "In Transit"
    },
    {
      id: "bp-3",
      executiveName: "Meena Joshi",
      routeName: "Thane Telemetry Beat #8",
      totalKm: 12.0,
      sitesCount: 2,
      sequence: ["HDFC ATM Thane East", "Wagle Industrial ATM"],
      status: "Pending Alignment"
    }
  ]);

  const [toast, setToast] = useState<string | null>(null);
  const [optimizingId, setOptimizingId] = useState<string | null>(null);

  const handleOptimizeRoute = (id: string) => {
    setOptimizingId(id);
    setTimeout(() => {
      setBeatPlans(prev => prev.map(bp => {
        if (bp.id === id) {
          return {
            ...bp,
            totalKm: parseFloat((bp.totalKm * 0.85).toFixed(1)), // Optimized 15% distance reduction
            status: "Optimized"
          };
        }
        return bp;
      }));
      setOptimizingId(null);
      setToast("Transit route optimized using AI telemetry! Distance reduced by 15%.");
      setTimeout(() => setToast(null), 3000);
    }, 1500);
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Compass size={24} color="var(--accent-blue)" /> Daily Beat Planner & Router
          </div>
          <div className="page-subtitle">Map daily customer check-in beats, optimize fuel usage, and audit in-transit times.</div>
        </div>
      </div>

      {/* Intro info box */}
      <div style={{ padding: "14px", background: "rgba(0,82,255,0.02)", border: "1px solid rgba(0,82,255,0.1)", display: "flex", gap: "12px", alignItems: "center" }}>
        <Zap size={20} color="var(--accent-blue)" />
        <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: 0 }}>
          <strong>Telemetry Routing Activated:</strong> Route Beat optimizer automatically recalculates site coordinates to reduce daily carbon burn and idle transit periods by up to 20%.
        </p>
      </div>

      {/* Beat Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        {beatPlans.map(bp => {
          const isPending = bp.status === "Pending Alignment";
          const isInTransit = bp.status === "In Transit";

          return (
            <div 
              key={bp.id} 
              className="card" 
              style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "14px",
                borderColor: isInTransit ? "var(--accent-blue)" : "var(--border)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "14.5px", fontWeight: 800 }}>{bp.routeName}</div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>Assigned to: <strong>{bp.executiveName}</strong></span>
                </div>
                <span className={`badge ${
                  isPending ? "badge-orange" : isInTransit ? "badge-blue" : "badge-green"
                }`} style={{ fontSize: "10.5px" }}>
                  {bp.status}
                </span>
              </div>

              {/* Transit Details Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "10px 12px", background: "var(--bg-secondary)", border: "1px solid var(--border)", fontFamily: "var(--font-jetbrains), monospace", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Total Distance:</span>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{bp.totalKm} km</div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Visits Sequence:</span>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{bp.sitesCount} Sites</div>
                </div>
              </div>

              {/* Beat Site Sequence Timeline */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative", paddingLeft: "16px", margin: "4px 0" }}>
                {/* Timeline vertical bar */}
                <div style={{ position: "absolute", left: "4px", top: "6px", bottom: "6px", width: "2px", background: "var(--border)" }}></div>

                {bp.sequence.map((site, index) => (
                  <div key={site} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12.5px" }}>
                    <div style={{ 
                      width: "10px", 
                      height: "10px", 
                      borderRadius: "50%", 
                      background: isInTransit && index === 0 ? "var(--accent-blue)" : "var(--text-muted)", 
                      border: "2px solid var(--card-bg)",
                      marginLeft: "-5px",
                      zIndex: 2
                    }}></div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-jetbrains), monospace" }}>0{index + 1}.</span>
                      <span style={{ fontWeight: 600 }}>{site}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer actions */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => handleOptimizeRoute(bp.id)}
                  disabled={optimizingId === bp.id || bp.status === "Optimized"}
                  className="btn-primary"
                  style={{
                    fontSize: "12px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: bp.status === "Optimized" ? "var(--bg-secondary)" : "var(--accent-blue)",
                    borderColor: bp.status === "Optimized" ? "var(--border)" : "var(--accent-blue)",
                    color: bp.status === "Optimized" ? "var(--text-muted)" : "white",
                    cursor: bp.status === "Optimized" ? "not-allowed" : "pointer"
                  }}
                >
                  <Navigation size={12} />
                  {optimizingId === bp.id ? "Recalculating..." : bp.status === "Optimized" ? "Route Fully Optimized" : "Run Smart Optimizer"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
          <CheckCircle2 size={16} />
          <span style={{ fontSize: "13px", fontWeight: 600 }}>{toast}</span>
        </div>
      )}
    </div>
  );
}
