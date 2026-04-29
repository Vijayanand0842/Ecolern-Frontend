import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../apiConfig';


export default function ProjectBoard() {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [proofText, setProofText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    if (!u) navigate('/login');
    else { setUser(u); fetchProjects(u.id); }
  }, [navigate]);

  const fetchProjects = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/projects?userId=${userId}`);

      setProjects(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const submitProof = async () => {
    if (!proofText.trim()) {
      alert('Please provide proof of completion.');
      return;
    }
    setIsSubmitting(true);
    try {
      await fetch(`${API_URL}/api/projects/${selectedProject.id}/complete`, {

        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, proof: proofText })
      });
      fetchProjects(user.id);
      setSelectedProject(null);
      setProofText('');
      alert('Proof submitted! It is now pending admin approval.');
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await fetch(`${API_URL}/api/projects/${projectId}`, { method: 'DELETE' });

      fetchProjects(user.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ position: 'relative' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 className="text-gradient" style={{ margin: 0, fontSize: '2.5rem' }}>Global Projects</h2>
          <p style={{ color: 'var(--text-muted)' }}>Complete physical tasks to earn massive Eco-Points!</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </header>

      {/* Grid handling items smoothly */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {projects.length === 0 ? (
          <p>No projects available right now. Check back later!</p>
        ) : (
          projects.map((project) => {
            const isHard = project.difficulty.toLowerCase() === 'hard';
            const colors = isHard ? ['#f43f5e', '#e11d48'] : ['var(--secondary)', '#2563eb'];
            
            return (
              <div key={project.id} className="glass-panel hoverable" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})` }} />
                
                <h3 style={{ fontSize: '1.2rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>{project.title}</h3>
                <span style={{ 
                  display: 'inline-block', alignSelf: 'flex-start',
                  background: isHard ? 'rgba(244, 63, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)', 
                  color: isHard ? '#f43f5e' : 'var(--secondary)', 
                  padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '1rem' 
                }}>
                  {project.difficulty}
                </span>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4', flexGrow: 1, marginBottom: '1.5rem' }}>
                  {project.description}
                </p>
                
                {project.status === 'APPROVED' ? (
                  <button className="btn btn-secondary" style={{ width: '100%', cursor: 'default' }} disabled>
                    Completed
                  </button>
                ) : project.status === 'PENDING' ? (
                  <button className="btn btn-secondary" style={{ width: '100%', cursor: 'default', color: '#f59e0b', border: '1px solid #f59e0b' }} disabled>
                    Pending Approval
                  </button>
                ) : (
                  <button className="btn" onClick={() => setSelectedProject(project)} style={{ 
                    background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`, 
                    color: 'white', width: '100%', padding: '0.8rem', fontSize: '0.9rem',
                    boxShadow: `0 4px 15px ${isHard ? 'rgba(244, 63, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                  }}>
                    Complete (+100 pts)
                  </button>
                )}
                
                {user && user.role === 'admin' && (
                  <button className="btn" onClick={() => deleteProject(project.id)} style={{ 
                    marginTop: '1rem', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', width: '100%', padding: '0.5rem', fontSize: '0.8rem'
                  }}>
                    Delete Project
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Proof Modal */}
      {selectedProject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', background: 'var(--surface)', padding: '2rem' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Submit Proof</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              You are completing: <strong>{selectedProject.title}</strong>.<br/>
              Please provide proof (a brief description, link to photos, etc.) to claim your 100 Eco-Points. This will be emailed to the Admin.
            </p>
            <textarea
              className="input-field"
              rows="5"
              placeholder="Describe your completion or provide a link to images..."
              value={proofText}
              onChange={e => setProofText(e.target.value)}
              style={{ width: '100%', resize: 'vertical', marginBottom: '1.5rem' }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => { setSelectedProject(null); setProofText(''); }} disabled={isSubmitting}>Cancel</button>
              <button className="btn btn-primary" onClick={submitProof} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit & Claim Points'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
