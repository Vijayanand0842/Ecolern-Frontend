import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../apiConfig';


export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [lessons, setLessons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
      fetchLessons();
    }
  }, [navigate]);

  const fetchLessons = async () => {
    try {
      const res = await fetch(`${API_URL}/api/lessons`);

      const data = await res.json();
      setLessons(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  // Gamification Math
  const points = user.points || 0;
  const level = Math.floor(points / 200) + 1;
  const nextLevelPoints = level * 200;
  const progressPercent = ((points % 200) / 200) * 100;

  const getLessonImage = (title) => {
    switch (title) {
      case 'Solar Power Fundamentals': return '/real_energy_bg.png';
      case 'Wind Turbines & Microgrids': return '/lesson2.png';
      case 'Zero Waste Living Handbook': return '/real_waste_bg.png';
      case 'Advanced Composting Techniques': return '/lesson4.png';
      case 'Water Conservation & Harvesting': return '/real_water_bg.png';
      case 'Urban Permaculture 101': return '/real_food_bg.png';
      case 'Plant-Based Diets for Climate': return '/food_bg.png';
      case 'Sustainable Fashion Ethics': return '/real_lifestyle_bg.png';
      case 'Minimalism & Eco-Footprint': return '/lifestyle_bg.png';
      case 'Climate Activism & Policy': return '/real_policy_bg.png';
      default: return '/abstract.png';
    }
  };

  return (
    <div className="container animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="text-gradient" style={{ margin: 0, fontSize: '2rem' }}>EcoLearn</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/projects')}>View Projects</button>
          <button className="btn" onClick={handleLogout} style={{ background: 'transparent', color: 'var(--text-muted)' }}>Logout</button>
        </div>
      </header>

      {/* Hero & Gamification Section */}
      <div className="glass-panel" style={{ marginBottom: '3rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome back, {user.username}!</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px' }}>
              You are making a real difference. Complete lessons and join projects to level up your eco-status.
            </p>
          </div>
          
          <div className="glass-panel hoverable" style={{ padding: '1.5rem', minWidth: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Eco-Level {level}</span>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{points} / {nextLevelPoints} pts</span>
            </div>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'right' }}>
              {200 - (points % 200)} pts to next level
            </p>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Recommended Lessons</h3>
      <div className="grid">
        {lessons.length === 0 ? (
          <p>No lessons available right now.</p>
        ) : (
          lessons.map(lesson => (
            <div key={lesson.id} className="glass-panel hoverable" style={{ display: 'flex', flexDirection: 'column' }}>
              <img src={getLessonImage(lesson.title)} alt={lesson.title} className="card-image" />
              <div style={{ flexGrow: 1 }}>
                <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--primary)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {lesson.category}
                </span>
                <h4 style={{ fontSize: '1.4rem', margin: '1rem 0' }}>{lesson.title}</h4>
              </div>
              <Link to={`/lesson/${lesson.id}`} className="btn btn-primary" style={{ width: '100%', textDecoration: 'none' }}>
                Start Learning (+50 pts)
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
