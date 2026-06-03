"use client";

import { useState } from "react";
import { Map, Plus, Edit2, Trash2, MapPin } from "lucide-react";

interface Territory {
    id: string;
    name: string;
    region: string;
    executiveCount: number;
    activeSites: number;
    status: "Active" | "Inactive";
}

export default function TerritorySetupPage() {
    const [territories, setTerritories] = useState<Territory[]>([
        { id: "t1", name: "Mumbai South", region: "West", executiveCount: 12, activeSites: 45, status: "Active" },
        { id: "t2", name: "Pune Central", region: "West", executiveCount: 8, activeSites: 28, status: "Active" },
        { id: "t3", name: "Delhi NCR", region: "North", executiveCount: 15, activeSites: 62, status: "Active" },
        { id: "t4", name: "Bangalore East", region: "South", executiveCount: 10, activeSites: 35, status: "Active" },
    ]);

    return (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <div className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Map size={24} color="var(--accent-blue)" /> Territory Setup
                    </div>
                    <div className="page-subtitle">Define operational zones, assign regions, and manage geographical boundaries.</div>
                </div>
                <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px", height: "36px", fontSize: "13px" }}>
                    <Plus size={16} /> New Territory
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
                {territories.map(t => (
                    <div key={t.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>{t.name}</h3>
                                <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                                    <MapPin size={12} /> {t.region} Region
                                </span>
                            </div>
                            <span className="badge badge-green">{t.status}</span>
                        </div>

                        <div style={{ display: "flex", gap: "16px", padding: "12px", background: "var(--bg-secondary)", borderRadius: "4px", border: "1px solid var(--border)" }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Executives</div>
                                <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "var(--font-jetbrains)" }}>{t.executiveCount}</div>
                            </div>
                            <div style={{ width: "1px", background: "var(--border)" }}></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Active Sites</div>
                                <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "var(--font-jetbrains)" }}>{t.activeSites}</div>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                            <button style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 600 }}>
                                <Edit2 size={14} /> Edit
                            </button>
                            <button style={{ background: "none", border: "none", color: "var(--accent-red)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 600 }}>
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
