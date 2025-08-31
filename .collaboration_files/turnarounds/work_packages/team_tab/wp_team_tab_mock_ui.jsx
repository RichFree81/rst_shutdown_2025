import React, { useState } from "react";

// --- Minimal inline icons ---
const Icon = {
  Eye: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${props.className||""}`}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Edit: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${props.className||""}`}>
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/>
    </svg>
  ),
  Trash: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${props.className||""}`}>
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  Lock: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${props.className||""}`}>
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Unlock: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${props.className||""}`}>
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.5-2"/>
    </svg>
  ),
  Plus: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${props.className||""}`}>
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  File: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${props.className||""}`}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  X: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${props.className||""}`}>
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
};

const Divider = () => <div className="h-px w-full bg-gray-200"/>;

function Toggle({checked, onChange, disabled}){
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${disabled?"opacity-50 cursor-not-allowed":""} ${checked?"bg-gray-900":"bg-gray-300"}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${checked?"translate-x-5":"translate-x-1"}`}/>
    </button>
  );
}

// --- Mock Data ---
const initialTeam = [
  { id: 1, role: "Contractor Representative", company: "ABC Contractors", name: "John Smith", phone: "+27 82 123 4567", email: "john.smith@abc.co.za" },
  { id: 2, role: "SHE Representative (Client)", company: "RST SHE Dept", name: "Mary Jones", phone: "+27 83 987 6543", email: "mary.jones@rst.co.za" },
  { id: 3, role: "Project Manager", company: "RST Projects", name: "Richard Freemantle", phone: "+27 82 000 0000", email: "richard.freemantle@rst.co.za" },
  { id: 4, role: "Package Manager", company: "RST Projects", name: "Jane Doe", phone: "+27 82 555 1111", email: "jane.doe@rst.co.za" },
];

const initialEvents = [
  { id: 1, event: "Safety Incident (Minor)", description: "First-aid injury / near miss requiring attention", steps: ["Notify Contractor Rep","Escalate to SHE Rep","Inform Project Manager"] },
  { id: 2, event: "Safety Incident (Major)", description: "Serious injury, fatal risk, or reportable event", steps: ["Contractor Rep immediate notification","SHE Rep & Package Manager","Project Manager & Shutdown Manager"] },
];

// --- Main Component ---
export default function TeamTab(){
  const [locked, setLocked] = useState(false);
  const [team, setTeam] = useState(initialTeam);
  const [events, setEvents] = useState(initialEvents);

  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [viewEvent, setViewEvent] = useState(null);

  function addTeamMember(member){ setTeam(prev => [...prev, { id: Date.now(), ...member }]); }
  function addEventRow(row){ setEvents(prev => [...prev, { id: Date.now(), ...row, steps: [] }]); }

  function updateEventSteps(eventId, steps){
    setEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, steps } : ev));
  }

  function deleteEvent(eventId){
    setEvents(prev => prev.filter(ev => ev.id !== eventId));
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Package</div>
          <div className="text-2xl md:text-3xl font-semibold">PKG-014</div>
          <div className="text-gray-600">Secondary Crusher Rebuild</div>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-white shadow-sm">
            <span className="text-sm">Lock</span>
            <Toggle checked={locked} onChange={setLocked} />
            {locked ? <Icon.Lock/> : <Icon.Unlock/>}
          </div>
          <button
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm border ${locked?"bg-gray-100 text-gray-400 cursor-not-allowed":"bg-white hover:bg-gray-50"}`}
            disabled={locked}
          >
            <Icon.Edit/>
            <span>Edit</span>
          </button>
        </div>
      </div>

      <div className="mt-6"><Divider/></div>

      {/* Assigned Team Section */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Assigned Team</h2>
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3 font-medium">Role</th>
                <th className="text-left p-3 font-medium">Company / Department</th>
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Phone</th>
                <th className="text-left p-3 font-medium">Email</th>
              </tr>
            </thead>
            <tbody>
              {team.map((t)=> (
                <tr key={t.id} className="border-t last:border-b-0">
                  <td className="p-3 align-top">{t.role}</td>
                  <td className="p-3 align-top">{t.company}</td>
                  <td className="p-3 align-top">{t.name}</td>
                  <td className="p-3 align-top">{t.phone}</td>
                  <td className="p-3 align-top"><a href={`mailto:${t.email}`} className="text-blue-600 hover:underline">{t.email}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex justify-start">
          <button onClick={()=>setShowAddTeam(true)} disabled={locked} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl ${locked?"bg-gray-100 text-gray-400 cursor-not-allowed":"bg-gray-900 text-white hover:opacity-95"}`}>
            <Icon.Plus className="text-white"/>
            Add Member
          </button>
        </div>
      </section>

      {/* Escalation Paths Section */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold mb-3">Escalation Paths</h2>
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3 font-medium">Event / Trigger</th>
                <th className="text-left p-3 font-medium">Description</th>
                <th className="text-left p-3 font-medium">Escalation Path</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id} className="border-t last:border-b-0">
                  <td className="p-3">{ev.event}</td>
                  <td className="p-3 text-gray-600">{ev.description}</td>
                  <td className="p-3">
                    <button onClick={()=>setViewEvent(ev)} className="p-2 rounded-xl border hover:bg-gray-50" title="View">
                      <Icon.Eye/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex justify-start">
          <button onClick={()=>setShowAddEvent(true)} disabled={locked} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl ${locked?"bg-gray-100 text-gray-400 cursor-not-allowed":"bg-gray-900 text-white hover:opacity-95"}`}>
            <Icon.Plus className="text-white"/>
            Add Event
          </button>
        </div>
      </section>

      {/* Add Member Modal */}
      {showAddTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden p-6">
            <h3 className="text-lg font-semibold mb-4">Add Team Member</h3>
            <TeamForm onSave={(data)=>{ addTeamMember(data); setShowAddTeam(false); }} />
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={()=>setShowAddTeam(false)} className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden p-6">
            <h3 className="text-lg font-semibold mb-4">Add Escalation Event</h3>
            <EventForm onSave={(data)=>{ addEventRow(data); setShowAddEvent(false); }} />
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={()=>setShowAddEvent(false)} className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* View/Edit Event Modal (table-based form) */}
      {viewEvent && (
        <ViewEventModal
          locked={locked}
          eventItem={viewEvent}
          onClose={()=>setViewEvent(null)}
          onSaveSteps={(steps)=>{ updateEventSteps(viewEvent.id, steps); }}
          onDelete={()=>{ deleteEvent(viewEvent.id); setViewEvent(null); }}
        />
      )}
    </div>
  );
}

function TextField({label, value, onChange, placeholder}){
  return (
    <label className="block">
      <span className="text-sm text-gray-700">{label}</span>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="mt-1 w-full px-3 py-2 rounded-xl border bg-white shadow-sm text-sm"/>
    </label>
  );
}

function TeamForm({onSave}){
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  function handleSave(){ onSave({role, company, name, phone, email}); }

  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={e=>{e.preventDefault(); handleSave();}}>
      <TextField label="Role" value={role} onChange={setRole} placeholder="e.g., Package Manager"/>
      <TextField label="Company / Department" value={company} onChange={setCompany} placeholder="e.g., RST Projects"/>
      <TextField label="Name" value={name} onChange={setName} placeholder="Full name"/>
      <TextField label="Phone" value={phone} onChange={setPhone} placeholder="e.g., +27 82 123 4567"/>
      <div className="md:col-span-2"><TextField label="Email" value={email} onChange={setEmail} placeholder="name@example.com"/></div>
      <div className="md:col-span-2 flex justify-end">
        <button type="submit" className="px-4 py-2 rounded-xl bg-gray-900 text-white">Add Member</button>
      </div>
    </form>
  );
}

function EventForm({onSave}){
  const [event, setEvent] = useState("");
  const [description, setDescription] = useState("");
  function handleSave(){ onSave({event, description}); }
  return (
    <form className="grid grid-cols-1 gap-4" onSubmit={e=>{e.preventDefault(); handleSave();}}>
      <TextField label="Event / Trigger" value={event} onChange={setEvent} placeholder="e.g., Schedule Delay"/>
      <label className="block">
        <span className="text-sm text-gray-700">Description</span>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Short description of the trigger" className="mt-1 w-full px-3 py-2 rounded-xl border bg-white shadow-sm text-sm min-h-[100px]"/>
      </label>
      <div className="flex justify-end">
        <button type="submit" className="px-4 py-2 rounded-xl bg-gray-900 text-white">Add Event</button>
      </div>
    </form>
  );
}

function ViewEventModal({locked, eventItem, onClose, onSaveSteps, onDelete}){
  const [editMode, setEditMode] = useState(false);
  const [steps, setSteps] = useState(eventItem.steps || []);

  function addStep(){ setSteps(prev => [...prev, ""]); }
  function updateStep(idx, val){ setSteps(prev => prev.map((s,i)=> i===idx? val : s)); }
  function removeStep(idx){ setSteps(prev => prev.filter((_,i)=> i!==idx)); }

  function exportPDF(){
    // MVP: trigger browser print (user can choose Save as PDF)
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">Escalation Path</div>
            <h3 className="text-lg font-semibold">{eventItem.event}</h3>
            <p className="text-sm text-gray-600">{eventItem.description}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setEditMode(!editMode)} disabled={locked} className={`p-2 rounded-xl border ${locked?"opacity-40 cursor-not-allowed":"hover:bg-gray-50"}`} title="Edit"><Icon.Edit/></button>
            <button onClick={()=>{ if(!locked){ onDelete(); } }} disabled={locked} className={`p-2 rounded-xl border ${locked?"opacity-40 cursor-not-allowed":"hover:bg-gray-50"}`} title="Delete"><Icon.Trash/></button>
            <button onClick={exportPDF} className="p-2 rounded-xl border hover:bg-gray-50" title="Export PDF"><Icon.File/></button>
            <button onClick={onClose} className="p-2 rounded-xl border hover:bg-gray-50" title="Close"><Icon.X/></button>
          </div>
        </div>

        {/* Table-based form */}
        <div className="p-6">
          <table className="w-full text-sm border rounded-xl overflow-hidden">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-2 font-medium">Step</th>
                <th className="text-left p-2 font-medium">Action</th>
                {editMode && <th className="text-right p-2 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {steps.length === 0 && (
                <tr><td colSpan={editMode?3:2} className="p-3 text-gray-500 text-center">No steps defined.</td></tr>
              )}
              {steps.map((s,i)=> (
                <tr key={i} className="border-t">
                  <td className="p-2">Step {i+1}</td>
                  <td className="p-2">
                    {editMode ? (
                      <input value={s} onChange={e=>updateStep(i, e.target.value)} className="w-full px-3 py-2 rounded-xl border bg-white shadow-sm text-sm"/>
                    ) : (
                      s
                    )}
                  </td>
                  {editMode && (
                    <td className="p-2 text-right">
                      <button onClick={()=>removeStep(i)} className="px-2 py-1 rounded-lg border hover:bg-gray-50">Remove</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {editMode && (
            <div className="mt-3 flex justify-between">
              <button onClick={addStep} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 text-white">
                <Icon.Plus className="text-white"/>
                Add Step
              </button>
              <div className="flex gap-2">
                <button onClick={()=>{ setEditMode(false); setSteps(eventItem.steps || []); }} className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button onClick={()=>{ onSaveSteps(steps); setEditMode(false); }} className="px-4 py-2 rounded-xl bg-gray-900 text-white">Save</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
