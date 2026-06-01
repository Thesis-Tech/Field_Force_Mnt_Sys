"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getStatusColor } from "@/lib/utils";
import { 
  CalendarRange, 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  User, 
  CheckCircle,
  X
} from "lucide-react";
import { tasksApi, ApiTask } from "@/lib/api-client";
import { loadMapplsSDK, fetchMapToken } from "@/lib/mappls-loader";

export default function VisitsPage() {
  const employees = useSelector((s: RootState) => s.employees.list);

  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterExecutive, setFilterExecutive] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [showAddModal, setShowAddModal] = useState(false);
  const [newVisit, setNewVisit] = useState({
    executiveId: "",
    customerName: "",
    purpose: "",
    timeSlot: "09:00 AM - 11:00 AM",
    visitDate: new Date().toISOString().split("T")[0],
    priority: "NORMAL",
    lat: "22.786999",
    lng: "86.184998"
  });

  // Map Picker State
  const pickerMapRef = useRef<any>(null);
  const pickerMarkerRef = useRef<any>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await tasksApi.list();
      setTasks(res.data || []);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Map initialization inside Modal
  useEffect(() => {
    if (!showAddModal) {
      pickerMapRef.current = null;
      pickerMarkerRef.current = null;
      return;
    }

    let active = true;
    const initMap = async () => {
      try {
        await loadMapplsSDK();
        if (!active) return;
        setSdkReady(true);

        setTimeout(() => {
          if (!active) return;
          const container = document.getElementById("mappls-visit-picker-map");
          if (!container) return;

          const mappls = (window as any).mappls;
          const initialLat = parseFloat(newVisit.lat) || 22.786999;
          const initialLng = parseFloat(newVisit.lng) || 86.184998;

          const mapObj = new mappls.Map("mappls-visit-picker-map", {
            center: { lat: initialLat, lng: initialLng },
            zoom: 14,
            zoomControl: true,
            search: false,
          });

          pickerMapRef.current = mapObj;

          mapObj.on("load", () => {
            if (!active) return;
            pickerMarkerRef.current = new mappls.Marker({
              map: mapObj,
              position: { lat: initialLat, lng: initialLng },
            });
          });

          mapObj.on("click", (e: any) => {
            const clickedLat = e.latlng?.lat ?? e.lngLat?.lat;
            const clickedLng = e.latlng?.lng ?? e.lngLat?.lng;
            if (clickedLat && clickedLng) {
              setNewVisit(p => ({
                ...p,
                lat: clickedLat.toFixed(6),
                lng: clickedLng.toFixed(6)
              }));
            }
          });
        }, 100);
      } catch (err) {
        console.error("Failed to load picker map:", err);
      }
    };

    initMap();

    return () => { active = false; };
  }, [showAddModal]);

  // Synchronize form changes with map view
  useEffect(() => {
    if (!showAddModal || !pickerMapRef.current) return;

    const latVal = parseFloat(newVisit.lat);
    const lngVal = parseFloat(newVisit.lng);

    if (isNaN(latVal) || isNaN(lngVal)) return;

    const mappls = (window as any).mappls;
    const mapObj = pickerMapRef.current;

    try {
      if (typeof mapObj.panTo === 'function') {
        mapObj.panTo({ lat: latVal, lng: lngVal });
      } else {
        mapObj.setCenter({ lat: latVal, lng: lngVal });
      }
    } catch (err) {
      console.warn("Failed to pan map:", err);
    }

    if (pickerMarkerRef.current) {
      try { pickerMarkerRef.current.setPosition({ lat: latVal, lng: lngVal }); } catch (_) { }
    } else {
      try {
        pickerMarkerRef.current = new mappls.Marker({
          map: mapObj,
          position: { lat: latVal, lng: lngVal }
        });
      } catch (_) { }
    }
  }, [newVisit.lat, newVisit.lng, showAddModal]);

  const handleLocationSearchInput = (val: string) => {
    setLocationSearchQuery(val);
    setNewVisit(p => ({ ...p, customerName: val }));
    
    if (val.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const token = await fetchMapToken();
        const res = await fetch(`https://atlas.mappls.com/api/places/search/json?query=${encodeURIComponent(val)}`, {
          headers: { "Authorization": `bearer ${token}` }
        });
        const data = await res.json();
        if (data && data.suggestedLocations) {
          setSuggestions(data.suggestedLocations);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Search API failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleSelectSuggestion = (loc: any) => {
    if (loc.latitude && loc.longitude) {
      setNewVisit(p => ({
        ...p,
        customerName: loc.placeName || loc.placeAddress || "",
        lat: loc.latitude.toString(),
        lng: loc.longitude.toString()
      }));
      setLocationSearchQuery(loc.placeName || loc.placeAddress || "");
      setSuggestions([]);
    }
  };

  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisit.executiveId || !newVisit.customerName || !newVisit.purpose) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const taskData = {
        title: newVisit.customerName,
        description: newVisit.purpose,
        status: "PENDING",
        priority: newVisit.priority,
        scheduledDate: newVisit.visitDate,
        latitude: parseFloat(newVisit.lat),
        longitude: parseFloat(newVisit.lng),
        address: newVisit.customerName
      };

      const createdTask: any = await tasksApi.create(taskData);
      
      if (newVisit.executiveId) {
        await tasksApi.assign(createdTask.id || createdTask.data?.id, newVisit.executiveId);
      }

      setShowAddModal(false);
      setNewVisit({
        executiveId: "",
        customerName: "",
        purpose: "",
        timeSlot: "09:00 AM - 11:00 AM",
        visitDate: new Date().toISOString().split("T")[0],
        priority: "NORMAL",
        lat: "22.786999",
        lng: "86.184998"
      });
      setLocationSearchQuery("");
      fetchTasks();
      setToast("Visit scheduled successfully!");
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to schedule visit");
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchSearch = (t.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                        (t.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    
    let execName = "Unassigned";
    if (t.assignments && t.assignments.length > 0 && t.assignments[0].user) {
      execName = t.assignments[0].user.name;
    }

    const matchExec = filterExecutive === "All" || execName === filterExecutive;
    
    // Status mapping for simple filter logic
    let filterStat = filterStatus.toUpperCase();
    let taskStat = t.status.toUpperCase();
    if (filterStatus === "Scheduled") filterStat = "PENDING";
    
    const matchStatus = filterStatus === "All" || taskStat === filterStat;
    
    return matchSearch && matchExec && matchStatus;
  });

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CalendarRange size={24} color="var(--accent-blue)" /> Field Visits Planner
          </div>
          <div className="page-subtitle">Schedule, assign, and audit client site visits and performance indices.</div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card" style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: "1 1 200px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>SEARCH SITE / PURPOSE</label>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "11px", color: "var(--text-muted)" }} />
            <input
              className="input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12.5px" }}
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{ flex: "1 1 180px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>EXECUTIVE</label>
          <select 
            className="input" 
            style={{ height: "36px", fontSize: "12.5px" }}
            value={filterExecutive}
            onChange={(e) => setFilterExecutive(e.target.value)}
          >
            <option value="All">All Executives</option>
            {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
          </select>
        </div>

        <div style={{ flex: "1 1 180px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>VISIT STATUS</label>
          <select 
            className="input" 
            style={{ height: "36px", fontSize: "12.5px" }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <button 
          className="btn-primary" 
          style={{ height: "36px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px" }}
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={15} /> Book Visit
        </button>
      </div>

      {/* Visits List */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-card" style={{ height: "160px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", borderLeft: "4px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div className="skeleton-line" style={{ width: "70%" }} />
                  <div className="skeleton-line" style={{ width: "30%", height: "10px" }} />
                </div>
                <div className="skeleton-box" style={{ width: "40px", height: "16px", borderRadius: "12px" }} />
              </div>
              <div className="skeleton-box" style={{ flex: 1, borderRadius: "4px", marginTop: "4px" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "10px", marginTop: "4px" }}>
                <div className="skeleton-line" style={{ width: "35%", height: "12px" }} />
                <div className="skeleton-line" style={{ width: "25%", height: "12px" }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {filteredTasks.map(task => {
            const isHigh = task.priority === "HIGH";
            
            let execName = "Unassigned";
            if (task.assignments && task.assignments.length > 0 && task.assignments[0].user) {
              execName = task.assignments[0].user.name;
            }

            const displayStatus = task.status === "PENDING" ? "Scheduled" : task.status;

            return (
              <div 
                key={task.id} 
                className="card" 
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "12px", 
                  borderLeft: isHigh ? "4px solid var(--accent-red)" : "1px solid var(--border)" 
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 800 }}>{task.title}</div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                      <MapPin size={10} /> Site Visit
                    </span>
                  </div>
                  <span className={`badge ${getStatusColor(
                    task.status === "PENDING" ? "pending" : task.status === "IN_PROGRESS" ? "warning" : task.status === "COMPLETED" ? "present" : "absent"
                  )}`} style={{ fontSize: "10px" }}>
                    {displayStatus}
                  </span>
                </div>

                <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", background: "var(--bg-secondary)", padding: "10px", border: "1px solid var(--border)", flex: 1 }}>
                  <strong>Purpose:</strong> {task.description}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "10px", marginTop: "4px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", fontWeight: 700 }}>
                    <User size={13} color="var(--accent-blue)" /> {execName}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-jetbrains), monospace" }}>
                    <Clock size={12} /> {task.scheduledDate ? new Date(task.scheduledDate).toLocaleDateString() : "No Date"}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredTasks.length === 0 && (
            <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              No matching client visits found.
            </div>
          )}
        </div>
      )}

      {/* Book Visit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" style={{ maxWidth: "600px", padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ fontWeight: 700, fontSize: "16px", margin: 0 }}>Assign New Client Visit Beat</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", padding: "20px 24px", gap: "20px", maxHeight: "80vh", overflowY: "auto" }}>
              <form id="visit-form" onSubmit={handleAddVisit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Field Executive *</label>
                  <select 
                    className="input"
                    value={newVisit.executiveId}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, executiveId: e.target.value }))}
                    required
                  >
                    <option value="">-- Choose Field Representative --</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Search Customer / Location Site *</label>
                  <div style={{ position: "relative" }}>
                    <Search size={14} style={{ position: "absolute", left: "10px", top: "11px", color: "var(--text-muted)" }} />
                    <input 
                      className="input"
                      placeholder="Search and drop pin..."
                      value={locationSearchQuery}
                      onChange={(e) => handleLocationSearchInput(e.target.value)}
                      style={{ paddingLeft: "32px" }}
                      required
                    />
                    {isSearching && (
                      <div style={{ position: "absolute", right: "10px", top: "11px", fontSize: "11px", color: "var(--text-muted)" }}>Searching...</div>
                    )}
                    {suggestions.length > 0 && (
                      <div style={{
                        position: "absolute", top: "100%", left: 0, right: 0, 
                        background: "var(--bg-card)", border: "1px solid var(--border)", 
                        borderTop: "none", zIndex: 100, maxHeight: "200px", overflowY: "auto",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "0 0 8px 8px"
                      }}>
                        {suggestions.map((loc, idx) => (
                          <div 
                            key={idx} 
                            style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", cursor: "pointer", fontSize: "12px" }}
                            onClick={() => handleSelectSuggestion(loc)}
                            className="suggestion-item"
                          >
                            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{loc.placeName}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{loc.placeAddress}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ height: "180px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--border)", position: "relative" }}>
                  {!sdkReady && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-secondary)", color: "var(--text-muted)", fontSize: "12px" }}>
                      Loading Maps...
                    </div>
                  )}
                  <div id="mappls-visit-picker-map" style={{ width: "100%", height: "100%" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Visit Date</label>
                    <input 
                      type="date"
                      className="input"
                      value={newVisit.visitDate}
                      onChange={(e) => setNewVisit(prev => ({ ...prev, visitDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Priority Urgency</label>
                    <select 
                      className="input"
                      value={newVisit.priority}
                      onChange={(e) => setNewVisit(prev => ({ ...prev, priority: e.target.value as any }))}
                    >
                      <option value="NORMAL">Normal Priority</option>
                      <option value="HIGH">High Priority (CRITICAL)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Purpose / Site Checklist *</label>
                  <textarea 
                    className="input"
                    rows={3}
                    placeholder="Visit tasks and deliverables..."
                    value={newVisit.purpose}
                    onChange={(e) => setNewVisit(prev => ({ ...prev, purpose: e.target.value }))}
                    required
                  />
                </div>
              </form>
            </div>
            
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
              <button form="visit-form" type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                Book Visit Beat
              </button>
            </div>
          </div>
        </div>
      )}

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
          <CheckCircle size={16} />
          <span style={{ fontSize: "13px", fontWeight: 600 }}>{toast}</span>
        </div>
      )}
    </div>
  );
}
