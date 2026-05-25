"use client";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { addEmployee, deleteEmployee, updateEmployee, Employee } from "@/store/slices/employeeSlice";
import { getStatusColor } from "@/lib/utils";
import { Plus, Search, Trash2, Pencil, X } from "lucide-react";

const ROLES = ["Sales Executive","Delivery Staff","Service Engineer","Surveyor","Marketing Executive","Healthcare Worker"];
const TERRITORIES = ["Mumbai North","Mumbai South","Thane","Pune","Navi Mumbai","Nashik"];

function EmployeeModal({ emp, onClose, onSave }: { emp: Partial<Employee> | null; onClose: () => void; onSave: (e: Employee) => void }) {
  const [form, setForm] = useState<Partial<Employee>>(emp || { name:"",email:"",phone:"",role:ROLES[0],territory:TERRITORIES[0],status:"active" });
  const set = (k: keyof Employee, v: string) => setForm(f => ({ ...f, [k]: v }));

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
              <input className="input" value={form[k]||""} onChange={e=>set(k,e.target.value)} placeholder={k} />
            </div>
          ))}
          <div>
            <label style={{ fontSize:"12px",fontWeight:600,color:"var(--text-secondary)",display:"block",marginBottom:"6px" }}>Role</label>
            <select className="input" value={form.role||""} onChange={e=>set("role",e.target.value)}>
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
              onSave({
                id: emp?.id || Date.now().toString(),
                name: form.name||"", email: form.email||"", phone: form.phone||"",
                role: form.role||ROLES[0], territory: form.territory||TERRITORIES[0],
                status: form.status||"active", avatar: avatarStr,
                lat: 19.076 + Math.random()*0.5 - 0.25,
                lng: 72.877 + Math.random()*0.5 - 0.25,
              });
            }}>
            {emp?.id ? "Save Changes" : "Add Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const dispatch = useDispatch();
  const employees = useSelector((s: RootState) => s.employees.list);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; emp: Partial<Employee>|null }>({ open:false, emp:null });
  const [deleteId, setDeleteId] = useState<string|null>(null);

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase()) ||
    e.territory.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px" }}>
        <div>
          <div className="page-title">Employees</div>
          <div className="page-subtitle">{employees.length} total field workers</div>
        </div>
        <button className="btn-primary" onClick={()=>setModal({open:true,emp:null})}>
          <Plus size={16}/> Add Employee
        </button>
      </div>

      {/* Search */}
      <div style={{ position:"relative",marginBottom:"20px",maxWidth:"360px" }}>
        <Search size={16} style={{ position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)" }}/>
        <input className="input" style={{ paddingLeft:"38px" }} placeholder="Search by name, role, territory..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      {/* Table */}
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
    </div>
  );
}
