import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../apiConfig';


export default function LessonViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [lesson, setLesson] = useState(null);
  const [modules, setModules] = useState([]);
  const [pages, setPages] = useState([]);
  const [quiz, setQuiz] = useState(null);
  
  const [viewState, setViewState] = useState('modules'); // 'modules'|'pages'|'quiz'|'success'
  const [currentModule, setCurrentModule] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Multi-question quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizFeedback, setQuizFeedback] = useState('');

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    if (!u) navigate('/login');
    else { setUser(u); fetchData(u.id); }
  }, [id, navigate]);

  const fetchData = async (userId) => {
    const lesRes = await fetch(`${API_URL}/api/lessons`);
    const lesData = await lesRes.json();
    setLesson(lesData.find(l => l.id.toString() === id));

    const modRes = await fetch(`${API_URL}/api/lessons/${id}/modules?userId=${userId}`);
    setModules(await modRes.json());
  };

  const startModule = async (mod) => {
    setCurrentModule(mod);
    setViewState('pages');
    setCurrentPageIndex(0);
    const res = await fetch(`${API_URL}/api/modules/${mod.id}/pages`);

    setPages(await res.json());
  };

  const nextPage = async () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    } else {
      const res = await fetch(`${API_URL}/api/modules/${currentModule.id}/quiz`);

      setQuiz(await res.json());
      setViewState('quiz');
      setQuizAnswers({});
      setQuizFeedback('');
    }
  };

  const handleQuizSubmit = async () => {
    // Check if every question matches the correct answer
    const isPass = quiz.questions.every((q, idx) => quizAnswers[idx] === q.correct_answer);

    if (isPass) {
      setQuizFeedback('Perfect score! Submitting progress...');
      await fetch(`${API_URL}/api/modules/${currentModule.id}/complete`, {

        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      const u = { ...user, points: user.points + 50 };
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
      setViewState('success');
      fetchData(user.id);
    } else {
      setQuizFeedback('Some answers are incorrect. Please review and try again!');
    }
  };

  if (!lesson) return <div className="container" style={{textAlign: 'center', marginTop: '5rem', fontSize: '1.5rem'}}>Loading...</div>;

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
      <header style={{ marginBottom: '2rem' }}>
        <button className="btn btn-secondary" onClick={() => viewState === 'modules' ? navigate('/dashboard') : setViewState('modules')}>Back</button>
      </header>

      {viewState === 'modules' && (
        <>
          <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', marginBottom: '2rem' }}>
            <img src={getLessonImage(lesson.title)} alt="Header" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <div style={{ padding: '2rem' }}>
              <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>{lesson.title}</h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>{lesson.description}</p>
            </div>
          </div>
          <h3 style={{ marginBottom: '1.5rem' }}>Curriculum Modules</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {modules.map(mod => (
              <div key={mod.id} className="glass-panel hoverable" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.3rem' }}>{mod.title}</h4>
                  {mod.completed === 1 && <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Completed</span>}
                </div>
                <button className={`btn ${mod.completed ? 'btn-secondary' : 'btn-primary'}`} onClick={() => startModule(mod)}>
                  {mod.completed ? 'Review Module' : 'Start Module'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {viewState === 'pages' && pages.length > 0 && (
        <div className="glass-panel" style={{ minHeight: '50vh', position: 'relative', paddingBottom: '6rem' }}>
          <h2 style={{ color: 'var(--primary)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem' }}>
            {currentModule.title} (Page {currentPageIndex + 1} of {pages.length})
          </h2>
          <div style={{ fontSize: '1.2rem', lineHeight: '1.8', margin: '2rem 0', whiteSpace: 'pre-wrap' }}>
            {pages[currentPageIndex].content}
          </div>
          <div style={{ position: 'absolute', bottom: '2rem', right: '2rem' }}>
             <button className="btn btn-primary" onClick={nextPage}>
               {currentPageIndex === pages.length - 1 ? 'Take Comprehensive Quiz' : 'Next Page'}
             </button>
          </div>
        </div>
      )}

      {viewState === 'quiz' && quiz && (
        <div className="glass-panel">
          <h2 style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>Module Knowledge Check</h2>
          <p style={{ marginBottom: '2rem', color: '#f59e0b', fontWeight: 'bold' }}>You must answer all 10 questions correctly to pass.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginBottom: '2rem' }}>
            {quiz.questions.map((q, qIdx) => (
              <div key={qIdx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>{qIdx + 1}. {q.question}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {q.options.map((opt, optIdx) => (
                    <button 
                      key={optIdx}
                      className={`btn ${quizAnswers[qIdx] === optIdx ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ textAlign: 'left', padding: '1rem', justifyContent: 'flex-start' }}
                      onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {quizFeedback && <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: quizFeedback.includes('Perfect') ? 'var(--primary)' : '#ef4444', textAlign: 'center', marginBottom: '1rem' }}>{quizFeedback}</p>}
          
          <button className="btn btn-primary" style={{ width: '100%', padding: '1.5rem', fontSize: '1.2rem' }} 
            onClick={handleQuizSubmit} 
            disabled={Object.keys(quizAnswers).length < quiz.questions.length}>
            Submit Final Answers
          </button>
        </div>
      )}

      {viewState === 'success' && (
        <div className="glass-panel" style={{ textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)' }}>
          <h2 style={{ color: 'var(--primary)' }}>Module Mastered!</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>You earned 50 Eco-Points for passing the quiz!</p>
          <button className="btn btn-primary" onClick={() => setViewState('modules')}>Return to Curriculum</button>
        </div>
      )}
    </div>
  );
}
