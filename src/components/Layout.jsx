import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HeartPulse, LogOut, User, Activity, AlertCircle } from 'lucide-react';

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-wrapper">
      <header className="header">
        <div className="container header-content">
          <Link to="/" className="logo">
            <HeartPulse size={28} color="#ef4444" />
            ANVI-SOS
          </Link>
          <nav className="nav-links">
            {user ? (
              <>
                <Link to="/" className="nav-link"><Activity size={18} /> Dashboard</Link>
                <Link to="/profile" className="nav-link"><User size={18} /> Profile</Link>
                <Link to="/sos" className="nav-link" style={{color: '#ef4444'}}><AlertCircle size={18} /> SOS</Link>
                <button onClick={handleLogout} className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.875rem'}}>
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary">Login</Link>
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
