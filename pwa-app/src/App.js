import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Home from './pages/Home';
import TaskMaster from './pages/TaskMaster';
import Users from './pages/Users';
import BatchControl from './pages/BatchControl';
import ApiTest from './pages/ApiTest';
import './App.css';

function App() {
  const { user, loading: authLoading, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <Login />;
  }

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠', adminOnly: false },
    { path: '/batch', label: 'Batch Control', icon: '📧', adminOnly: true },
    { path: '/master', label: 'Manage Task Master', icon: '📋', adminOnly: true },
    { path: '/users', label: 'Manage Users', icon: '👥', adminOnly: true },
    { path: '/api-test', label: 'Test API', icon: '🔧', adminOnly: true },
  ];

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="menu-container">
            <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
              <span className="menu-icon">☰</span>
            </button>
            {menuOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-user-info">
                  {user.picture && (
                    <img src={user.picture} alt={user.name} className="user-avatar" />
                  )}
                  <div className="user-details">
                    <span className="user-name">{user.name}</span>
                    <span className="user-email">{user.email}</span>
                    <span className={`user-role role-${user.role?.toLowerCase()}`}>{user.role}</span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                {navItems
                  .filter(item => !item.adminOnly || isAdmin())
                  .map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`dropdown-item ${isActive(item.path) ? 'active' : ''}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="dropdown-icon">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-btn" onClick={handleLogout}>
                  <span className="dropdown-icon">🚪</span>
                  Sign Out
                </button>
              </div>
            )}
          </div>
          <div className="header-title">
            <h1>ALPS Residency</h1>
            <p className="subtitle">DB Based Task Scheduler</p>
          </div>
        </div>
      </header>
      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>}

      <Routes>
        <Route path="/" element={<Home />} />
        {isAdmin() && (
          <>
            <Route path="/batch" element={<BatchControl />} />
            <Route path="/master" element={<TaskMaster />} />
            <Route path="/users" element={<Users />} />
            <Route path="/api-test" element={<ApiTest />} />
          </>
        )}
        <Route path="*" element={<Home />} />
      </Routes>

      <footer className="app-footer">
        <p>ALPS Residency Task Management</p>
      </footer>
    </div>
  );
}

export default App;
