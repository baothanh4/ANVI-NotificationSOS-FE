import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HeartPulse, LogOut, User, Activity, AlertCircle, BookOpen, Shield } from 'lucide-react';

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="app-wrapper">
      <header className="header">
        <div className="container header-content">
          <Link to="/" className="logo">
            <HeartPulse size={28} color="var(--accent-red)" />
            ANVI-SOS
          </Link>
          <nav className="nav-links">
            {user ? (
              <>
                <Link to="/" className="nav-link"><Activity size={18} /> DASHBOARD</Link>
                <Link to="/profile" className="nav-link"><User size={18} /> PROFILE</Link>
                <Link to="/blog" className="nav-link"><BookOpen size={18} /> BLOG</Link>
                {user?.role === 'ADMIN' && <Link to="/admin" className="nav-link"><Shield size={18} /> ADMIN</Link>}
                <Link to="/sos" className="nav-link" style={{color: 'var(--accent-red)'}}><AlertCircle size={18} /> SOS</Link>
                <button onClick={handleLogout} className="btn btn-outline" style={{padding: '8px 16px', fontSize: '0.75rem', fontWeight: 800}}>
                  <LogOut size={16} /> LOGOUT
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary">SIGN IN</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="main-content container">
        <Outlet />
      </main>
    </div>
  );
};
