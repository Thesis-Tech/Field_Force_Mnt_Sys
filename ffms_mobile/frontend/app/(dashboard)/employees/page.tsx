"use client";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { addEmployee, deleteEmployee, updateEmployee, Employee } from "@/store/slices/employeeSlice";
import { getStatusColor } from "@/lib/utils";
import { Plus, Search, Trash2, Pencil, X, Coins, FileText, Calculator, Printer } from "lucide-react";

const ROLES = ["Sales Executive","Delivery Staff","Service Engineer","Surveyor","Marketing Executive","Healthcare Worker"];
const TERRITORIES = ["Mumbai North","Mumbai South","Thane","Pune","Navi Mumbai","Nashik"];

/**
 * Auto-generate a deterministic password (8-12 chars) from employee fields.
 * Formula: first3Name + phoneLastDigits + roleInitial + hashSuffix
 * Always includes a mix of lowercase, digits, and an uppercase letter.
 */
function generatePassword(name: string, email: string, phone: string, role: string): string {
  const clean = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const namePart = clean(name).slice(0, 3) || "emp";                // e.g. "rah"
  const phonePart = phone.replace(/\D/g, "").slice(-3) || "000";    // e.g. "210"
  const rolePart = clean(role).charAt(0).toUpperCase() || "X";      // e.g. "S"

  // Simple hash from email + name for extra entropy
  let hash = 0;
  const seed = email + name + phone;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const hashStr = Math.abs(hash).toString(36).slice(0, 3);          // e.g. "k7f"

  // Assemble: namePart(3) + phonePart(3) + rolePart(1) + hashStr(up to 3) → 8-10 chars
  let pwd = namePart + phonePart + rolePart + hashStr;

  // Enforce 8-12 character bounds
  if (pwd.length < 8) pwd = pwd + "0".repeat(8 - pwd.length);
  if (pwd.length > 12) pwd = pwd.slice(0, 12);

  return pwd;
}

function EmployeeModal({ emp, onClose, onSave }: { emp: Partial<Employee> | null; onClose: () => void; onSave: (e: Employee) => void }) {
  const [form, setForm] = useState<Partial<Employee>>(() => {
    if (emp) {
      const autoPassword = generatePassword(emp.name || "", emp.email || "", emp.phone || "", emp.role || "");
      return { ...emp, password: emp.password || autoPassword };
    }
    return { name:"",email:"",phone:"",role:ROLES[0],territory:TERRITORIES[0],status:"active", password: "" };
  });
  const set = (k: keyof Employee, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Re-generate password whenever name, email, phone, or role changes
  const handleFieldChange = (k: keyof Employee, v: string) => {
    setForm(f => {
      const next = { ...f, [k]: v };
      if (["name", "email", "phone", "role"].includes(k)) {
        next.password = generatePassword(
          next.name || "", next.email || "", next.phone || "", next.role || ""
        );
      }
      return next;
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px" }}>
          <h2 style={{ fontWeight:700,fontSize:"18px" }}>{emp?.id ? "Edit Employee" : "Add Employee"}</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)" }}><X size={20}/></button>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:"14px" }}>
          {(["name","email","phone"] as const).map(k => (
            <div key={k}>
              <label style={{ fontSize:"12px",fontWeight:600,color:"var(--text-secondary)",display:"block",marginBottom:"6px",textTransform:"capitalize" }}>{k}</label>
              <input className="input" value={form[k]||""} onChange={e=>handleFieldChange(k,e.target.value)} placeholder={k} />
            </div>
          ))}
          
          {/* Auto-generated Password Field */}
          <div>
            <label style={{ fontSize:"12px",fontWeight:600,color:"var(--text-secondary)",display:"block",marginBottom:"6px" }}>
              Password
              <span style={{ fontSize:"10px",fontWeight:400,color:"var(--text-muted)",marginLeft:"6px" }}>Custom password or auto-generated</span>
            </label>
            <div style={{ display:"flex",gap:"8px" }}>
              <input 
                type="text" 
                className="input" 
                value={form.password || ""} 
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={{ flex:1, fontFamily:"var(--font-jetbrains, monospace)",letterSpacing:"0.08em" }}
              />
              <button
                type="button"
                className="btn-secondary"
                style={{ padding:"6px 12px",fontSize:"11px",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:"4px" }}
                onClick={() => {
                  const pwd = generatePassword(form.name||"", form.email||"", form.phone||"", form.role||"");
                  setForm(f => ({ ...f, password: pwd }));
                }}
                title="Regenerate password from current fields"
              >
                ↻ Regenerate
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize:"12px",fontWeight:600,color:"var(--text-secondary)",display:"block",marginBottom:"6px" }}>Role</label>
            <select className="input" value={form.role||""} onChange={e=>handleFieldChange("role",e.target.value)}>
              {ROLES.map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:"12px",fontWeight:600,color:"var(--text-secondary)",display:"block",marginBottom:"6px" }}>Territory</label>
            <select className="input" value={form.territory||""} onChange={e=>set("territory",e.target.value)}>
              {TERRITORIES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:"12px",fontWeight:600,color:"var(--text-secondary)",display:"block",marginBottom:"6px" }}>Status</label>
            <select className="input" value={form.status||"active"} onChange={e=>set("status",e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button className="btn-primary" style={{ width:"100%",justifyContent:"center",marginTop:"6px" }}
            onClick={()=>{
              const avatarStr = (form.name||"XX").split(" ").map((w:string)=>w[0]).join("").toUpperCase().slice(0,2);
              const finalPassword = form.password || generatePassword(form.name||"", form.email||"", form.phone||"", form.role||"");
              onSave({
                id: emp?.id || Date.now().toString(),
                name: form.name||"", email: form.email||"", phone: form.phone||"",
                role: form.role||ROLES[0], territory: form.territory||TERRITORIES[0],
                status: form.status||"active", avatar: avatarStr,
                lat: 19.076 + Math.random()*0.5 - 0.25,
                lng: 72.877 + Math.random()*0.5 - 0.25,
                password: finalPassword,
              });
            }}>
            {emp?.id ? "Save Changes" : "Add Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}

const BASE_SALARIES: Record<string, number> = {
  "Sales Executive": 35000,
  "Delivery Staff": 22000,
  "Service Engineer": 45000,
  "Surveyor": 30000,
  "Marketing Executive": 40000,
  "Healthcare Worker": 50000,
};
const getBaseSalary = (role: string) => BASE_SALARIES[role] || 30000;

function numberToWords(num: number): string {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num <= 0) return 'Zero Rupees';
  
  const g = (n: number): string => {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
  };
  
  const h = (n: number): string => {
    if (n >= 100) {
      const rem = n % 100;
      return a[Math.floor(n / 100)] + ' Hundred' + (rem ? ' and ' + g(rem) : '');
    }
    return g(n);
  };
  
  let temp = num;
  let result = '';
  
  if (temp >= 100000) {
    result += h(Math.floor(temp / 100000)) + ' Lakh ';
    temp %= 100000;
  }
  if (temp >= 1000) {
    result += h(Math.floor(temp / 1000)) + ' Thousand ';
    temp %= 1000;
  }
  if (temp > 0) {
    result += h(temp);
  }
  return result.trim() + ' Rupees Only';
}

export default function EmployeesPage() {
  const dispatch = useDispatch();
  const employees = useSelector((s: RootState) => s.employees.list);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"roster" | "payroll">("roster");
  const [modal, setModal] = useState<{ open: boolean; emp: Partial<Employee>|null }>({ open:false, emp:null });
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [payslipEmpId, setPayslipEmpId] = useState<string | null>(null);

  // Dynamic Payroll parameters per employee
  const [payrollData, setPayrollData] = useState<Record<string, { leaves: number; tasks: number; bonus: number; baseSalary?: number }>>({});

  // Populate dynamic default values if missing
  const activeEmployees = employees.filter(e => e.status === "active");

  const ensurePayrollData = () => {
    const updated = { ...payrollData };
    let changed = false;
    employees.forEach(emp => {
      if (!updated[emp.id]) {
        // Seed realistic deterministic calculations
        const val = emp.id.charCodeAt(0) || 0;
        updated[emp.id] = {
          leaves: val % 3,             // 0 to 2 leaves
          tasks: 12 + (val % 18),      // 12 to 29 tasks completed
          bonus: (val % 4 === 0) ? 2500 : 1000,
          baseSalary: getBaseSalary(emp.role),
        };
        changed = true;
      }
    });
    if (changed) {
      setPayrollData(updated);
    }
  };

  if (Object.keys(payrollData).length < employees.length) {
    ensurePayrollData();
  }

  const updatePayrollField = (empId: string, field: "leaves" | "tasks" | "bonus" | "baseSalary", val: number) => {
    setPayrollData(prev => ({
      ...prev,
      [empId]: {
        ...((prev[empId]) || { leaves: 0, tasks: 0, bonus: 0, baseSalary: getBaseSalary("") }),
        [field]: Math.max(0, val)
      }
    }));
  };

  const calculateSalary = (empId: string, role: string) => {
    const data = payrollData[empId] || { leaves: 0, tasks: 0, bonus: 0, baseSalary: getBaseSalary(role) };
    const base = data.baseSalary !== undefined ? data.baseSalary : getBaseSalary(role);
    
    const dailyRate = Math.round(base / 26);
    const lop = data.leaves * dailyRate;
    const taskIncentive = data.tasks * 250; // ₹250 per task incentive
    const gross = base + taskIncentive + data.bonus;
    
    const pf = Math.round(base * 0.12); // 12% PF contribution
    const pt = base > 15000 ? 200 : 0;  // Flat ₹200 PT
    const totalDeductions = lop + pf + pt;
    const netPay = gross - totalDeductions;

    return {
      base,

      dailyRate,
      leaves: data.leaves,
      tasks: data.tasks,
      bonus: data.bonus,
      lop,
      taskIncentive,
      gross,
      pf,
      pt,
      totalDeductions,
      netPay
    };
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase()) ||
    e.territory.toLowerCase().includes(search.toLowerCase())
  );

  // Payroll summary metrics
  const totalPayrollCost = activeEmployees.reduce((sum, emp) => sum + calculateSalary(emp.id, emp.role).netPay, 0);
  const avgPayrollCost = activeEmployees.length > 0 ? Math.round(totalPayrollCost / activeEmployees.length) : 0;
  const totalIncentives = activeEmployees.reduce((sum, emp) => sum + calculateSalary(emp.id, emp.role).taskIncentive, 0);
  const totalDeductionsSum = activeEmployees.reduce((sum, emp) => sum + calculateSalary(emp.id, emp.role).totalDeductions, 0);

  // Get selected employee for payslip
  const payslipEmp = employees.find(e => e.id === payslipEmpId);
  const payslipCalc = payslipEmp ? calculateSalary(payslipEmp.id, payslipEmp.role) : null;

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px" }}>
        <div>
          <div className="page-title">{activeTab === "roster" ? "Employees" : "Payroll System"}</div>
          <div className="page-subtitle">
            {activeTab === "roster" 
              ? `${employees.length} total field workers registered`
              : `₹${totalPayrollCost.toLocaleString()} active payroll burden for Mumbai Sector`
            }
          </div>
        </div>
        
        {activeTab === "roster" ? (
          <button className="btn-primary" onClick={()=>setModal({open:true,emp:null})}>
            <Plus size={16}/> Add Employee
          </button>
        ) : (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Active Period: May 2026</span>
          </div>
        )}
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: "flex", gap: "4px", background: "var(--bg-hover)", padding: "4px", borderRadius: "0px", border: "1px solid var(--border)", width: "fit-content", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("roster")}
          style={{
            padding: "8px 16px", borderRadius: "0px", fontSize: "13px", fontWeight: 700, cursor: "pointer",
            background: activeTab === "roster" ? "var(--bg-secondary)" : "transparent",
            color: activeTab === "roster" ? "var(--accent-blue)" : "var(--text-secondary)",
            boxShadow: activeTab === "roster" ? "0 2px 8px rgba(48,117,228,0.08)" : "none",
            border: activeTab === "roster" ? "1px solid var(--border)" : "1px solid transparent",
            transition: "all 0.2s"
          }}
        >
          👤 Employee Roster
        </button>
        <button
          onClick={() => {
            ensurePayrollData();
            setActiveTab("payroll");
          }}
          style={{
            padding: "8px 16px", borderRadius: "0px", fontSize: "13px", fontWeight: 700, cursor: "pointer",
            background: activeTab === "payroll" ? "var(--bg-secondary)" : "transparent",
            color: activeTab === "payroll" ? "var(--accent-blue)" : "var(--text-secondary)",
            boxShadow: activeTab === "payroll" ? "0 2px 8px rgba(48,117,228,0.08)" : "none",
            border: activeTab === "payroll" ? "1px solid var(--border)" : "1px solid transparent",
            transition: "all 0.2s"
          }}
        >
          🪙 Payroll & Salary Center
        </button>
      </div>

      {/* Salary Overview KPI Cards */}
      {activeTab === "payroll" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "24px" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid #92b3f1ff", boxShadow: "0 2px 12px rgba(48, 117, 228, 0.08)", padding: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.5px" }}>TOTAL NET PAYROLL</span>
              <Coins size={16} color="var(--accent-blue)" />
            </div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "var(--text-primary)" }}>₹{totalPayrollCost.toLocaleString()}</div>
            <span style={{ fontSize: "11px", color: "var(--accent-green)", fontWeight: 700 }}>● Fully calculated live</span>
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid #92b3f1ff", boxShadow: "0 2px 12px rgba(48, 117, 228, 0.08)", padding: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.5px" }}>AVERAGE TAKE-HOME</span>
              <Calculator size={16} color="var(--accent-purple)" />
            </div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "var(--text-primary)" }}>₹{avgPayrollCost.toLocaleString()}</div>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 700 }}>Per active field agent</span>
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid #92b3f1ff", boxShadow: "0 2px 12px rgba(48, 117, 228, 0.08)", padding: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.5px" }}>TOTAL DYNAMIC INCENTIVES</span>
              <Coins size={16} color="var(--accent-green)" />
            </div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "var(--text-primary)" }}>₹{totalIncentives.toLocaleString()}</div>
            <span style={{ fontSize: "11px", color: "var(--accent-green)", fontWeight: 700 }}>₹250 / task completed</span>
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid #92b3f1ff", boxShadow: "0 2px 12px rgba(48, 117, 228, 0.08)", padding: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.5px" }}>TOTAL DEDUCTIONS</span>
              <Coins size={16} color="var(--accent-red)" />
            </div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "var(--text-primary)" }}>₹{totalDeductionsSum.toLocaleString()}</div>
            <span style={{ fontSize: "11px", color: "var(--accent-red)", fontWeight: 700 }}>Inc. LOP, 12% PF & PT</span>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ position:"relative",marginBottom:"20px",maxWidth:"360px" }}>
        <Search size={16} style={{ position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)" }}/>
        <input className="input" style={{ paddingLeft:"38px" }} placeholder="Search by name, role, territory..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      {/* Content View */}
      {activeTab === "roster" ? (
        /* ROSTER TABLE (Original) */
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee</th><th>Role</th><th>Territory</th><th>Phone</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
                      <div style={{ width:"36px",height:"36px",borderRadius: "0",background: "var(--accent-blue)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"12px",color:"white",flexShrink:0 }}>{emp.avatar}</div>
                      <div>
                        <div style={{ fontWeight:600,fontSize:"14px" }}>{emp.name}</div>
                        <div style={{ fontSize:"12px",color:"var(--text-muted)" }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize:"13px",color:"var(--text-secondary)" }}>{emp.role}</td>
                  <td style={{ fontSize:"13px",color:"var(--text-secondary)" }}>{emp.territory}</td>
                  <td style={{ fontSize:"13px",color:"var(--text-secondary)" }}>{emp.phone}</td>
                  <td><span className={`badge ${getStatusColor(emp.status)}`}>{emp.status}</span></td>
                  <td>
                    <div style={{ display:"flex",gap:"8px" }}>
                      <button className="btn-secondary" style={{ padding:"6px 10px",fontSize:"12px" }} onClick={()=>setModal({open:true,emp})}>
                        <Pencil size={13}/> Edit
                      </button>
                      <button onClick={()=>setDeleteId(emp.id)} style={{ background:"rgba(244,63,94,0.1)",border:"1px solid rgba(244,63,94,0.2)",color:"var(--accent-red)",padding:"6px 10px",borderRadius: "0",fontSize:"12px",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px" }}>
                        <Trash2 size={13}/> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding:"40px",textAlign:"center",color:"var(--text-muted)",fontSize:"14px" }}>No employees found.</div>
          )}
        </div>
      ) : (
        /* PAYROLL SYSTEM TABLE (Interactive Salary Center) */
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Base Salary</th>
                <th style={{ width: "100px", textAlign: "center" }}>Leaves (LOP)</th>
                <th style={{ width: "100px", textAlign: "center" }}>Tasks Completed</th>
                <th style={{ width: "110px", textAlign: "center" }}>Bonus (₹)</th>
                <th style={{ textAlign: "right" }}>Total Deductions</th>
                <th style={{ textAlign: "right" }}>Net Take-Home</th>
                <th style={{ textAlign: "center" }}>Payslip</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => {
                const isInactive = emp.status === "inactive";
                const calc = calculateSalary(emp.id, emp.role);
                const empData = payrollData[emp.id] || { leaves: 0, tasks: 0, bonus: 0 };
                
                return (
                  <tr key={emp.id} style={{ opacity: isInactive ? 0.6 : 1, background: isInactive ? "var(--bg-hover)" : "none" }}>
                    <td>
                      <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
                        <div style={{ width:"36px",height:"36px",borderRadius: "0",background: isInactive ? "var(--text-muted)" : "var(--accent-blue)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"12px",color:"white",flexShrink:0 }}>{emp.avatar}</div>
                        <div>
                          <div style={{ fontWeight:600,fontSize:"14px" }}>{emp.name}</div>
                          <div style={{ fontSize:"11px",color:"var(--text-muted)",fontWeight:600 }}>{emp.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        disabled={isInactive}
                        value={(empData.baseSalary !== undefined ? empData.baseSalary : getBaseSalary(emp.role)) || ""}
                        onChange={e => updatePayrollField(emp.id, "baseSalary", e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
                        style={{
                          width: "85px", padding: "4px 6px", border: "1px solid var(--border)",
                          background: isInactive ? "transparent" : "var(--bg-secondary)", fontSize: "13px", fontWeight: 700,
                          borderRadius: "0px", outline: "none"
                        }}
                      />
                    </td>
                    
                    {/* Live inputs for leaves */}
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="number"
                        disabled={isInactive}
                        value={empData.leaves === 0 ? "" : empData.leaves}
                        onChange={e => updatePayrollField(emp.id, "leaves", e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
                        style={{
                          width: "60px", padding: "4px 6px", textAlign: "center", border: "1px solid var(--border)",
                          background: isInactive ? "transparent" : "var(--bg-secondary)", fontSize: "13px", fontWeight: 700,
                          borderRadius: "0px", outline: "none"
                        }}
                      />
                    </td>
                    
                    {/* Live inputs for tasks */}
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="number"
                        disabled={isInactive}
                        value={empData.tasks === 0 ? "" : empData.tasks}
                        onChange={e => updatePayrollField(emp.id, "tasks", e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
                        style={{
                          width: "65px", padding: "4px 6px", textAlign: "center", border: "1px solid var(--border)",
                          background: isInactive ? "transparent" : "var(--bg-secondary)", fontSize: "13px", fontWeight: 700,
                          borderRadius: "0px", outline: "none"
                        }}
                      />
                    </td>

                    {/* Live inputs for bonus */}
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="number"
                        disabled={isInactive}
                        value={empData.bonus === 0 ? "" : empData.bonus}
                        onChange={e => updatePayrollField(emp.id, "bonus", e.target.value === "" ? 0 : parseInt(e.target.value) || 0)}
                        style={{
                          width: "80px", padding: "4px 6px", textAlign: "center", border: "1px solid var(--border)",
                          background: isInactive ? "transparent" : "var(--bg-secondary)", fontSize: "13px", fontWeight: 700,
                          borderRadius: "0px", outline: "none"
                        }}
                      />
                    </td>

                    <td style={{ textAlign: "right", fontSize: "13px", fontWeight: 600, color: "var(--accent-red)" }}>
                      ₹{calc.totalDeductions.toLocaleString()}
                    </td>
                    
                    <td style={{ textAlign: "right", fontSize: "14px", fontWeight: 800, color: isInactive ? "var(--text-muted)" : "var(--accent-green)" }}>
                      ₹{isInactive ? "0" : calc.netPay.toLocaleString()}
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => setPayslipEmpId(emp.id)}
                        className="btn-secondary"
                        style={{ padding: "4px 10px", fontSize: "11px", gap: "4px", borderRadius: "0px" }}
                      >
                        <FileText size={12} /> Pay Slip
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding:"40px",textAlign:"center",color:"var(--text-muted)",fontSize:"14px" }}>No active payroll files found.</div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal.open && (
        <EmployeeModal emp={modal.emp} onClose={()=>setModal({open:false,emp:null})}
          onSave={emp => {
            if (modal.emp?.id) dispatch(updateEmployee(emp));
            else dispatch(addEmployee(emp));
            setModal({open:false,emp:null});
          }} />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={()=>setDeleteId(null)}>
          <div className="modal-box" style={{ maxWidth:"380px" }} onClick={e=>e.stopPropagation()}>
            <h2 style={{ fontWeight:700,fontSize:"18px",marginBottom:"10px" }}>Delete Employee?</h2>
            <p style={{ fontSize:"14px",color:"var(--text-secondary)",marginBottom:"20px" }}>This action cannot be undone.</p>
            <div style={{ display:"flex",gap:"10px" }}>
              <button className="btn-secondary" style={{ flex:1,justifyContent:"center" }} onClick={()=>setDeleteId(null)}>Cancel</button>
              <button style={{ flex:1,background:"rgba(244,63,94,0.15)",border:"1px solid rgba(244,63,94,0.3)",color:"var(--accent-red)",borderRadius: "0",fontWeight:600,cursor:"pointer",padding:"10px" }}
                onClick={()=>{ dispatch(deleteEmployee(deleteId)); setDeleteId(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* PAYSLIP FLOATING DIALOG */}
      {payslipEmpId && payslipEmp && payslipCalc && (
        <div className="modal-overlay" onClick={() => setPayslipEmpId(null)}>
          <div className="modal-box" style={{ maxWidth: "660px", padding: "30px", borderRadius: "0px", background: "#ffffff", border: "1.5px solid var(--accent-blue)", position: "relative" }} onClick={e => e.stopPropagation()}>
            
            {/* Payslip Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid var(--accent-blue)", paddingBottom: "16px", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--accent-blue)", letterSpacing: "1px" }}>FIELDTRACK SYSTEMS LTD.</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, marginTop: "2px" }}>Mumbai Corporate HQ, Maharashtra · IN</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "14px", fontWeight: 900, color: "var(--text-primary)" }}>SALARY PAY SLIP</div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-blue)", marginTop: "2px" }}>MAY 2026</div>
              </div>
            </div>

            {/* Employee Metadata */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "16px", marginBottom: "20px" }}>
              <div>
                <div style={{ marginBottom: "6px" }}><span style={{ fontWeight: 700, color: "var(--text-secondary)" }}>Employee Name:</span> {payslipEmp.name}</div>
                <div style={{ marginBottom: "6px" }}><span style={{ fontWeight: 700, color: "var(--text-secondary)" }}>Designation:</span> {payslipEmp.role}</div>
                <div><span style={{ fontWeight: 700, color: "var(--text-secondary)" }}>Territory Sector:</span> {payslipEmp.territory}</div>
              </div>
              <div>
                <div style={{ marginBottom: "6px" }}><span style={{ fontWeight: 700, color: "var(--text-secondary)" }}>Employee Email:</span> {payslipEmp.email}</div>
                <div style={{ marginBottom: "6px" }}><span style={{ fontWeight: 700, color: "var(--text-secondary)" }}>Phone Contact:</span> {payslipEmp.phone}</div>
                <div><span style={{ fontWeight: 700, color: "var(--text-secondary)" }}>Calculated Pay Period:</span> 26 Working Days</div>
              </div>
            </div>

            {/* Earnings & Deductions Comparison */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "24px" }}>
              
              {/* Earnings Table */}
              <div>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--accent-green)", borderBottom: "1.5px solid var(--border)", paddingBottom: "6px", marginBottom: "10px" }}>EARNINGS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Basic Fixed Salary</span>
                    <span style={{ fontWeight: 700 }}>₹{payslipCalc.base.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Task Completion Incentives</span>
                    <span style={{ fontWeight: 700 }}>₹{payslipCalc.taskIncentive.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Performance Incentive Bonus</span>
                    <span style={{ fontWeight: 700 }}>₹{payslipCalc.bonus.toLocaleString()}</span>
                  </div>
                  
                  {/* Space filler */}
                  <div style={{ height: "30px" }} />
                  
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1.5px solid var(--border)", paddingTop: "8px", fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>
                    <span>Gross Earnings</span>
                    <span>₹{payslipCalc.gross.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Deductions Table */}
              <div>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--accent-red)", borderBottom: "1.5px solid var(--border)", paddingBottom: "6px", marginBottom: "10px" }}>DEDUCTIONS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Loss of Pay (LOP Leaves: {payslipCalc.leaves})</span>
                    <span style={{ fontWeight: 700 }}>₹{payslipCalc.lop.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Provident Fund (PF - 12%)</span>
                    <span style={{ fontWeight: 700 }}>₹{payslipCalc.pf.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Professional Tax (PT)</span>
                    <span style={{ fontWeight: 700 }}>₹{payslipCalc.pt.toLocaleString()}</span>
                  </div>
                  
                  {/* Space filler */}
                  <div style={{ height: "30px" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1.5px solid var(--border)", paddingTop: "8px", fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>
                    <span>Total Deductions</span>
                    <span>₹{payslipCalc.totalDeductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Net take home section */}
            <div style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", padding: "16px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-secondary)" }}>NET TAKE-HOME PAY</span>
                <span style={{ fontSize: "20px", fontWeight: 900, color: "var(--accent-green)" }}>₹{payslipCalc.netPay.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 700, fontStyle: "italic" }}>
                <span style={{ fontWeight: 800, color: "var(--text-muted)" }}>In Words: </span>
                {numberToWords(payslipCalc.netPay)}
              </div>
            </div>

            {/* Signature & Info notice */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: "10px", color: "var(--text-muted)", borderTop: "1px dashed var(--border)", paddingTop: "14px", marginBottom: "20px" }}>
              <div>
                <div>● This is an electronically generated payroll record.</div>
                <div>● Generated securely by Admin Portal of FieldTrack.</div>
              </div>
              <div style={{ textAlign: "center", borderTop: "1px solid var(--text-secondary)", width: "140px", paddingTop: "4px" }}>
                Authorized HR Signatory
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="btn-secondary" onClick={() => setPayslipEmpId(null)} style={{ padding: "8px 18px", borderRadius: "0px" }}>
                Close
              </button>
              <button
                className="btn-primary"
                onClick={() => window.print()}
                style={{ padding: "8px 18px", borderRadius: "0px", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Printer size={14} /> Print / Save PDF
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}

