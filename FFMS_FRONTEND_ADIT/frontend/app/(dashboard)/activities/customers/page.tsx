"use client";

import { useState } from "react";
import { 
  Building2, 
  Plus, 
  Search, 
  MapPin, 
  Mail, 
  Phone, 
  Layers, 
  CheckCircle,
  X,
  FileSpreadsheet
} from "lucide-react";

interface CustomerRecord {
  id: string;
  name: string;
  poc: string;
  email: string;
  phone: string;
  location: string;
  category: "Enterprise Site" | "Branch Office" | "Retail Banking" | "Warehouse / Logistics";
  activeVisits: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    poc: "",
    email: "",
    phone: "",
    location: "",
    category: "Enterprise Site" as CustomerRecord["category"]
  });

  const [toast, setToast] = useState<string | null>(null);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.poc || !newCustomer.phone) {
      alert("Please fill all required fields.");
      return;
    }

    const record: CustomerRecord = {
      id: `cust-${Date.now()}`,
      name: newCustomer.name,
      poc: newCustomer.poc,
      email: newCustomer.email || "info@customer.com",
      phone: newCustomer.phone,
      location: newCustomer.location || "Co-ordinates Pending Setup",
      category: newCustomer.category,
      activeVisits: 0
    };

    setCustomers(prev => [record, ...prev]);
    setShowAddModal(false);
    setNewCustomer({
      name: "",
      poc: "",
      email: "",
      phone: "",
      location: "",
      category: "Enterprise Site"
    });
    setToast("Customer profile added to directory!");
    setTimeout(() => setToast(null), 3000);
  };

  const handleExportCSV = () => {
    const headers = "Customer Name,POC,Email,Phone,Location Site,Category,Total Visits\n";
    const rows = customers.map(c => 
      `"${c.name}","${c.poc}","${c.email}","${c.phone}","${c.location}","${c.category}",${c.activeVisits}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Customer_Directory_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredCustomers = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.poc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === "All" || c.category === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Building2 size={24} color="var(--accent-blue)" /> Customer Directory
          </div>
          <div className="page-subtitle">Manage client accounts, registered geofence coordinates, and site contacts.</div>
        </div>
      </div>

      {/* Action panel */}
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", minWidth: "260px" }}>
          <Search size={14} style={{ position: "absolute", left: "10px", top: "11px", color: "var(--text-muted)" }} />
          <input
            className="input"
            style={{ paddingLeft: "32px", height: "36px", fontSize: "12.5px" }}
            placeholder="Search customer name or POC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category selector */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select 
            className="input"
            style={{ height: "36px", fontSize: "12.5px", minWidth: "180px" }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Enterprise Site">Enterprise Site</option>
            <option value="Branch Office">Branch Office</option>
            <option value="Retail Banking">Retail Banking</option>
            <option value="Warehouse / Logistics">Warehouse / Logistics</option>
          </select>

          <button 
            className="btn-primary" 
            style={{ 
              background: "var(--accent-green)",
              borderColor: "var(--accent-green)",
              height: "36px", 
              fontSize: "12.5px", 
              display: "flex", 
              alignItems: "center", 
              gap: "6px" 
            }}
            onClick={handleExportCSV}
          >
            <FileSpreadsheet size={14} /> Export Directory
          </button>

          <button 
            className="btn-primary" 
            style={{ height: "36px", fontSize: "12.5px", display: "flex", alignItems: "center", gap: "6px" }}
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={15} /> Add Customer
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="card" style={{ padding: "16px" }}>
        <div className="table-wrapper">
          <table style={{ minWidth: "1000px" }}>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Category</th>
                <th>Point of Contact (POC)</th>
                <th>Email Contact</th>
                <th>Phone Number</th>
                <th>Location / Site Coordinates</th>
                <th style={{ textAlign: "right" }}>Logged Visits</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(cust => (
                  <tr key={cust.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: "13.5px" }}>{cust.name}</div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", fontSize: "11px" }}>
                        {cust.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: "13px" }}>{cust.poc}</td>
                    <td style={{ fontSize: "12.5px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                        <Mail size={12} color="var(--text-muted)" /> {cust.email}
                      </span>
                    </td>
                    <td style={{ fontSize: "12.5px", fontFamily: "var(--font-jetbrains), monospace" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                        <Phone size={12} color="var(--text-muted)" /> {cust.phone}
                      </span>
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <MapPin size={12} color="var(--accent-red)" /> {cust.location}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700, fontSize: "13px" }}>
                      {cust.activeVisits}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                    No customer accounts found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" style={{ maxWidth: "480px" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontWeight: 700, fontSize: "16px" }}>Add Customer Profile</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Customer / Site Name *</label>
                <input 
                  className="input"
                  placeholder="e.g., Tata Motors Plant C"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Point of Contact Name *</label>
                  <input 
                    className="input"
                    placeholder="e.g., Rajesh Mehta"
                    value={newCustomer.poc}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, poc: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Category</label>
                  <select 
                    className="input"
                    value={newCustomer.category}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, category: e.target.value as any }))}
                  >
                    <option value="Enterprise Site">Enterprise Site</option>
                    <option value="Branch Office">Branch Office</option>
                    <option value="Retail Banking">Retail Banking</option>
                    <option value="Warehouse / Logistics">Warehouse / Logistics</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Email Contact</label>
                  <input 
                    className="input"
                    placeholder="e.g., contact@corp.com"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Phone Number *</label>
                  <input 
                    className="input"
                    placeholder="e.g., +91 99000 12345"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Location Coordinates / Site address</label>
                <input 
                  className="input"
                  placeholder="e.g., Mumbai Central (19.12° N, 72.84° E)"
                  value={newCustomer.location}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "4px" }}>
                Save Customer Profile
              </button>
            </form>
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
