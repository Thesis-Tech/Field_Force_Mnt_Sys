"use client";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { addTask, updateTaskStatus, deleteTask, Task } from "@/store/slices/taskSlice";
import { getStatusColor } from "@/lib/utils";
import { Plus, Trash2, X, Flag, Calendar, User } from "lucide-react";

const STATUSES = ["pending", "in-progress", "completed"];
const PRIORITIES = ["low", "medium", "high"];

function TaskModal({ onClose, onSave, employees }: { onClose: () => void; onSave: (t: Task) => void; employees: { id: string; name: string }[] }) {
  const [form, setForm] = useState({ title:"", description:"", employeeId: employees[0]?.id||"", priority:"medium", deadline:"", territory:"" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const emp = employees.find(e => e.id === form.employeeId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth:"520px" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px" }}>
          <h2 style={{ fontWeight:700,fontSize:"18px" }}>Create New Task</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)" }}><X size={20}/></button>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:"14px" }}>
          <div>
            <label style={{ fontSize:"12px",fontWeight:600,color:"var(--text-secondary)",display:"block",marginBottom:"6px" }}>Task Title</label>
            <input className="input" value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Client Visit — ABC Corp" />
          </div>
          <div>
            <label style={{ fontSize:"12px",fontWeight:600,color:"var(--text-secondary)",display:"block",marginBottom:"6px" }}>Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Task details..." style={{ resize:"vertical" }} />
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px" }}>
            <div>
              <label style={{ fontSize:"12px",fontWeight:600,color:"var(--text-secondary)",display:"block",marginBottom:"6px" }}>Assign To</label>
              <select className="input" value={form.employeeId} onChange={e=>set("employeeId",e.target.value)}>
                {employees.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:"12px",fontWeight:600,color:"var(--text-secondary)",display:"block",marginBottom:"6px" }}>Priority</label>
              <select className="input" value={form.priority} onChange={e=>set("priority",e.target.value)}>
                {PRIORITIES.map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize:"12px",fontWeight:600,color:"var(--text-secondary)",display:"block",marginBottom:"6px" }}>Deadline</label>
            <input className="input" type="date" value={form.deadline} onChange={e=>set("deadline",e.target.value)} />
          </div>
          <button className="btn-primary" style={{ width:"100%",justifyContent:"center",marginTop:"4px" }}
            onClick={()=>{
              if(!form.title.trim()) return;
              onSave({ id:Date.now().toString(), title:form.title, description:form.description, assignedTo:emp?.name||"", employeeId:form.employeeId, priority:form.priority, status:"pending", deadline:form.deadline, territory:"" });
            }}>
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const dispatch = useDispatch();
  const tasks = useSelector((s: RootState) => s.tasks.list);
  const employees = useSelector((s: RootState) => s.employees.list);
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);
  const counts = { all: tasks.length, pending: tasks.filter(t=>t.status==="pending").length, "in-progress": tasks.filter(t=>t.status==="in-progress").length, completed: tasks.filter(t=>t.status==="completed").length };

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px" }}>
        <div>
          <div className="page-title">Tasks</div>
          <div className="page-subtitle">{tasks.length} total tasks assigned</div>
        </div>
        <button className="btn-primary" onClick={()=>setModal(true)}><Plus size={16}/> New Task</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display:"flex",gap:"8px",marginBottom:"20px" }}>
        {(["all","pending","in-progress","completed"] as const).map(s => (
          <button key={s} onClick={()=>setFilter(s)} style={{
            padding:"7px 16px", borderRadius: "0", border:"1px solid", cursor:"pointer", fontSize:"13px", fontWeight:500,
            background: filter===s ? "linear-gradient(135deg,#4f8ef7,#7c5ffc)" : "var(--bg-card)",
            borderColor: filter===s ? "transparent" : "var(--border)",
            color: filter===s ? "white" : "var(--text-secondary)",
            transition:"all 0.2s"
          }}>
            {s.charAt(0).toUpperCase()+s.slice(1)} <span style={{ opacity:0.7 }}>({counts[s]})</span>
          </button>
        ))}
      </div>

      {/* Task cards */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:"14px" }}>
        {filtered.map(task => (
          <div key={task.id} className="card" style={{ display:"flex",flexDirection:"column",gap:"12px" }}>
            {/* Title + delete */}
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"10px" }}>
              <div style={{ fontWeight:700,fontSize:"14px",lineHeight:1.4,flex:1 }}>{task.title}</div>
              <button onClick={()=>dispatch(deleteTask(task.id))} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",flexShrink:0 }}><Trash2 size={15}/></button>
            </div>
            <div style={{ fontSize:"13px",color:"var(--text-secondary)",lineHeight:1.5 }}>{task.description}</div>

            {/* Meta */}
            <div style={{ display:"flex",flexWrap:"wrap",gap:"8px" }}>
              <div style={{ display:"flex",alignItems:"center",gap:"5px",fontSize:"12px",color:"var(--text-muted)" }}>
                <User size={12}/> {task.assignedTo}
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:"5px",fontSize:"12px",color:"var(--text-muted)" }}>
                <Calendar size={12}/> {task.deadline || "No deadline"}
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:"5px",fontSize:"12px",color:"var(--text-muted)" }}>
                <Flag size={12}/> <span className={`badge ${getStatusColor(task.priority)}`} style={{ fontSize:"10px",padding:"1px 7px" }}>{task.priority}</span>
              </div>
            </div>

            {/* Status + change */}
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:"10px",borderTop:"1px solid var(--border)" }}>
              <span className={`badge ${getStatusColor(task.status)}`}>{task.status}</span>
              <select
                value={task.status}
                onChange={e=>dispatch(updateTaskStatus({id:task.id,status:e.target.value}))}
                style={{ background:"var(--bg-secondary)",border:"1px solid var(--border)",color:"var(--text-secondary)",borderRadius: "0",padding:"4px 8px",fontSize:"12px",cursor:"pointer",outline:"none",fontFamily:"Inter,sans-serif" }}
              >
                {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div style={{ textAlign:"center",padding:"60px",color:"var(--text-muted)" }}>No tasks found.</div>
      )}

      {modal && <TaskModal employees={employees.map(e=>({id:e.id,name:e.name}))} onClose={()=>setModal(false)} onSave={t=>{ dispatch(addTask(t)); setModal(false); }} />}
    </div>
  );
}
