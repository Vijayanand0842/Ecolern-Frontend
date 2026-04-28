import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [roleMode, setRoleMode] = useState(null); // 'admin' | 'user' | null
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otpStep, setOtpStep] = useState(0); // 0: enter email, 1: enter otp, 2: reset pass
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [timer, setTimer] = useState(120);
  
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (otpStep === 1 && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setError('OTP has expired. Please request a new one.');
      setOtpStep(0);
    }
    return () => clearInterval(interval);
  }, [otpStep, timer]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    
    if (roleMode === 'admin' && username !== 'admin') {
      setError('Access Denied. You must log in using the master admin account.');
      return;
    }
    if (roleMode === 'user' && username === 'admin') {
      setError('The admin account cannot log in through the student portal.');
      return;
    }

    setIsLoading(true);
    const endpoint = isRegister ? '/api/users/register' : '/api/users/login';
    const payload = isRegister ? { username, password, name, email } : { username, password };
    
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'https://ecolearn-backend-ehag.onrender.com';
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        if (data.role === 'admin') navigate('/admin');
        else navigate('/dashboard');
      } else {
        setError(data.error || 'Authentication failed');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Server unreachable.');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    if (otpStep === 0) { // Request OTP
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/users/forgot-password', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) {
          setMessage(data.message);
          setOtpStep(1);
          setTimer(120);
        } else setError(data.error || 'Failed to send OTP');
      } catch (e) { setError('Server Error'); }
    } else if (otpStep === 1) { // Verify OTP
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/users/verify-otp', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp })
        });
        const data = await res.json();
        if (res.ok) {
          setMessage('OTP Verified. Enter your new password.');
          setOtpStep(2);
        } else setError(data.error || 'Invalid OTP');
      } catch (e) { setError('Server Error'); }
    } else if (otpStep === 2) { // Reset Password
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/users/reset-password', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: newPassword })
        });
        const data = await res.json();
        if (res.ok) {
          setMessage('Password reset successful. You can now login.');
          setIsForgotPassword(false);
          setOtpStep(0);
        } else setError(data.error || 'Failed to reset password');
      } catch (e) { setError('Server Error'); }
    }
    setIsLoading(false);
  };

  // --- RENDER: PORTAL SELECTION (FIRST PAGE) ---
  if (!roleMode) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <div style={{ flex: 1, backgroundImage: 'url(/login_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, var(--bg-base), transparent)' }}></div>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-base)', padding: '2rem' }}>
          <div className="animate-fade-in" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <h1 className="text-gradient" style={{ fontSize: '4.5rem', marginBottom: '0.5rem', fontWeight: 900 }}>EcoLearn</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.3rem', marginBottom: '4rem' }}>Select your portal access level</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <button className="btn btn-primary" style={{ padding: '2rem', fontSize: '1.4rem', borderRadius: '16px', boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)' }} onClick={() => setRoleMode('user')}>I am a Student User</button>
              <button className="btn" style={{ background: 'transparent', color: '#ef4444', padding: '1.5rem', fontSize: '1.2rem', borderRadius: '16px', border: '2px solid #ef4444' }} onClick={() => setRoleMode('admin')}>I am an Administrator</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: SPECIFIC LOGIN FORM ---
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-base)' }}>
      <div style={{ flex: 1, backgroundImage: roleMode==='admin' ? 'url(/admin_bg.png)' : 'url(/login_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem' }}>
        {roleMode==='admin' && (<h1 style={{color:'white', fontSize:'4rem', opacity:0.1, position:'absolute', top:'2rem'}}>SECURE AREA</h1>)}
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <button className="btn btn-secondary" style={{ position: 'absolute', top: '2rem', right: '2rem', border: 'none', background: 'rgba(0,0,0,0.05)' }} onClick={() => {setRoleMode(null); setError(''); setMessage(''); setIsForgotPassword(false);}}>Change Portal</button>

        <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px', background: 'var(--surface)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem', color: roleMode==='admin' ? '#ef4444' : 'var(--primary)' }}>
            {isForgotPassword ? 'Reset Password' : (roleMode === 'admin' ? 'Admin Gateway' : 'Student Login')}
          </h2>
          
          {error && <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}
          {message && <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 'bold' }}>{message}</div>}

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {otpStep === 0 && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Registered Email</label>
                  <input type="email" required className="input-field" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} />
                </div>
              )}
              {otpStep === 1 && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Enter 6-digit OTP (Expires in {Math.floor(timer/60)}:{('0'+(timer%60)).slice(-2)})</label>
                  <input type="text" required className="input-field" placeholder="123456" value={otp} onChange={e=>setOtp(e.target.value)} />
                </div>
              )}
              {otpStep === 2 && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>New Password</label>
                  <input type="password" required className="input-field" placeholder="••••••••" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
                </div>
              )}
              <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem' }}>
                {isLoading ? 'Processing...' : (otpStep === 0 ? 'Send OTP' : otpStep === 1 ? 'Verify OTP' : 'Reset Password')}
              </button>
              <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsForgotPassword(false)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>Back to Login</button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {isRegister && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Full Name</label>
                    <input type="text" className="input-field" placeholder="John Doe" value={name} onChange={e=>setName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email Address</label>
                    <input type="email" className="input-field" placeholder="john@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
                  </div>
                </>
              )}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Username</label>
                <input type="text" className="input-field" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Password</label>
                <input type="password" className="input-field" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} />
              </div>
              
              <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', background: roleMode==='admin' ? '#ef4444' : '', boxShadow: roleMode==='admin' ? '0 4px 15px rgba(239, 68, 68, 0.4)':'' }}>
                {isLoading ? 'Authenticating...' : (isRegister ? 'Register Account' : 'Secure Login')}
              </button>
            </form>
          )}
          
          {!isForgotPassword && roleMode === 'user' && (
            <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button type="button" onClick={() => setIsForgotPassword(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>
                Forgot Password?
              </button>
              <button type="button" onClick={() => setIsRegister(!isRegister)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', fontSize: '1rem', fontWeight:'bold' }}>
                {isRegister ? 'Already have an account? Log in' : 'New here? Create an account'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
