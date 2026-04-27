import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, lessons: 0, projects: 0 });
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // New Project State
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projDiff, setProjDiff] = useState('Easy');
  
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    const [statsRes, usersRes, projectsRes, pendingRes] = await Promise.all([
      fetch('/api/stats'),
      fetch('/api/users'),
      fetch('/api/projects'),
      fetch('/api/projects/pending')
    ]);
    const s = await statsRes.json();
    const u = await usersRes.json();
    const p = await projectsRes.json();
    const pa = await pendingRes.json();
    
    setStats(s || { users: 0, lessons: 0, projects: 0 });
    setUsers(Array.isArray(u) ? u : []);
    setProjects(Array.isArray(p) ? p : []);
    setPendingApprovals(Array.isArray(pa) ? pa : []);
  };

  const loadUserDetails = async (user) => {
    const res = await fetch(`/api/users/${user.id}/details`);
    const details = await res.json();
    setSelectedUser({ ...user, details });
  };

  const handleVerify = async () => {
    if (!selectedUser) return;
    await fetch(`/api/users/${selectedUser.id}/verify`, { method: 'POST' });
    fetchData(); // reload
    setSelectedUser(null);
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    await fetch('/api/projects', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: projTitle, description: projDesc, difficulty: projDiff })
    });
    setProjTitle(''); setProjDesc(''); setProjDiff('Easy');
    fetchData();
    alert('Project Added Successfully!');
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleApproveProject = async (projectId, userId) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/approve/${userId}`, { method: 'POST' });
      if (res.ok) {
        alert('Project approved successfully! 100 points awarded.');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h2 className="text-gradient" style={{ margin: 0, fontSize: '2.5rem' }}>Admin Gateway 🛡️</h2>
        <button className="btn btn-secondary" onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</button>
      </header>

      <div className="grid" style={{ marginBottom: '4rem' }}>
        <div className="glass-panel hoverable" style={{ textAlign: 'center' }}><h3 style={{ color: 'var(--text-muted)' }}>Users</h3><p className="text-gradient" style={{ fontSize: '4rem', fontWeight: '900', margin: '0' }}>{stats.users}</p></div>
        <div className="glass-panel hoverable" style={{ textAlign: 'center' }}><h3 style={{ color: 'var(--text-muted)' }}>Lessons</h3><p className="text-gradient" style={{ fontSize: '4rem', fontWeight: '900', margin: '0' }}>{stats.lessons}</p></div>
        <div className="glass-panel hoverable" style={{ textAlign: 'center' }}><h3 style={{ color: 'var(--text-muted)' }}>Projects</h3><p className="text-gradient" style={{ fontSize: '4rem', fontWeight: '900', margin: '0' }}>{stats.projects}</p></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
        {/* MANAGE PROJECTS FORM */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Add New Project</h3>
          <form onSubmit={handleAddProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <input className="input-field" placeholder="Project Title" value={projTitle} onChange={e=>setProjTitle(e.target.value)} required />
            <select className="input-field" value={projDiff} onChange={e=>setProjDiff(e.target.value)}>
              <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
            </select>
            <textarea className="input-field" placeholder="Description" rows="4" value={projDesc} onChange={e=>setProjDesc(e.target.value)} required />
            <button className="btn btn-primary" type="submit">Publish</button>
          </form>

          <h3 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Existing Projects</h3>
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {projects.map(p => (
              <div key={p.id} style={{ background: 'var(--surface-border)', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{p.title}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.difficulty}</div>
                </div>
                <button className="btn btn-secondary" style={{ color: '#ef4444', padding: '0.4rem 0.8rem' }} onClick={() => handleDeleteProject(p.id)}>Delete</button>
              </div>
            ))}
            {projects.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No projects found.</p>}
          </div>
        </div>

        {/* STUDENT TRACKING */}
        <div className="glass-panel">
          <h3 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Student Tracking & Verification</h3>
          
          {!selectedUser ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'var(--surface-border)', textAlign: 'left' }}><th>User</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '1rem' }}><b>{u.username}</b> <br/><small>{u.points} pts</small></td>
                    <td style={{ color: u.verified ? 'var(--primary)' : '#f59e0b', fontWeight: 'bold' }}>{u.verified ? '✓ Verified' : 'Pending'}</td>
                    <td><button className="btn btn-secondary" style={{ padding: '0.4rem 1rem' }} onClick={() => loadUserDetails(u)}>Inspect</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="animate-fade-in">
               <button className="btn" onClick={()=>setSelectedUser(null)} style={{ marginBottom: '1rem' }}>← Back</button>
               <h4>Details for: <span className="text-gradient">{selectedUser.username}</span></h4>
               <p>Status: {selectedUser.verified ? 'Verified' : 'Unverified'}</p>
               
               <h5 style={{ marginTop: '1rem', color: 'var(--primary)' }}>Completed Modules ({selectedUser.details.modules.length})</h5>
               <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                 {selectedUser.details.modules.map((m, i) => <li key={i}>{m.title}</li>)}
               </ul>

               <h5 style={{ color: 'var(--secondary)' }}>Completed Projects ({selectedUser.details.projects.length})</h5>
               <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                 {selectedUser.details.projects.map((p, i) => <li key={i}>{p.title}</li>)}
               </ul>

               {!selectedUser.verified && (
                 <button className="btn btn-primary" onClick={handleVerify} style={{ width: '100%', marginTop: '1rem' }}>Mark User as Verified</button>
               )}
            </div>
          )}
        </div>
      </div>

      {/* PENDING APPROVALS SECTION */}
      <div className="glass-panel" style={{ marginTop: '2rem' }}>
        <h3 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', marginBottom: '1.5rem', color: '#f59e0b' }}>
          Pending Project Approvals ({pendingApprovals.length})
        </h3>
        {pendingApprovals.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No pending projects to review.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingApprovals.map((p, idx) => (
              <div key={idx} style={{ background: 'var(--surface-border)', padding: '1.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--primary)' }}>Project: {p.title}</h4>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Submitted by: {p.username}</span>
                  </div>
                  <button className="btn btn-primary" onClick={() => handleApproveProject(p.projectId, p.userId)}>
                    Approve & Award 100pts
                  </button>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '4px', fontStyle: 'italic', fontSize: '0.9rem' }}>
                  " {p.proof} "
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
