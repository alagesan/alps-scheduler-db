import React, { useState, useEffect } from 'react';
import { taskService } from './services/api';
import { format } from 'date-fns';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import './App.css';

function App() {
  const { user, loading: authLoading, logout, isAdmin } = useAuth();
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('today'); // 'today', 'week', 'search'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDepartments();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedDate, selectedDepartment, user]);

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

  const fetchDepartments = async () => {
    try {
      const response = await taskService.getAllDepartments();
      setDepartments(response.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      const dateStr = format(activeTab === 'today' ? new Date() : selectedDate, 'yyyy-MM-dd');

      if (activeTab === 'week') {
        response = await taskService.getTasksForWeek(dateStr);
        setTasks(response.data);
      } else {
        // 'today' or 'search' - both use daily view
        response = await taskService.getTasksByDate(dateStr);
        setTasks({ [dateStr]: response.data });
      }
    } catch (err) {
      setError('Failed to fetch tasks. Please check if the API server is running.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterTasksByDepartment = (taskList) => {
    if (selectedDepartment === 'all') {
      return taskList;
    }
    return taskList.filter(task => task.department === selectedDepartment);
  };

  const groupTasksByDepartment = (taskList) => {
    const grouped = {};
    taskList.forEach(task => {
      if (!grouped[task.department]) {
        grouped[task.department] = [];
      }
      grouped[task.department].push(task);
    });
    return grouped;
  };

  const getTotalTaskCount = () => {
    if (!tasks) return 0;
    return Object.values(tasks).reduce((total, taskList) => {
      const filtered = filterTasksByDepartment(taskList || []);
      return total + filtered.length;
    }, 0);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const renderTasks = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading tasks...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
        </div>
      );
    }

    // Check if there are no tasks at all, or all task arrays are empty
    const hasNoTasks = !tasks ||
      Object.keys(tasks).length === 0 ||
      Object.values(tasks).every(taskList => !taskList || taskList.length === 0);

    // Also check if filtering by department results in no tasks
    const hasNoFilteredTasks = !hasNoTasks && selectedDepartment !== 'all' &&
      Object.values(tasks).every(taskList =>
        !taskList || taskList.filter(t => t.department === selectedDepartment).length === 0
      );

    if (hasNoTasks || hasNoFilteredTasks) {
      const displayDate = activeTab === 'today' ? new Date() : selectedDate;
      return (
        <div className="no-tasks-container">
          <div className="no-tasks-icon">📋</div>
          <h2 className="no-tasks-title">No Tasks Scheduled</h2>
          <p className="no-tasks-message">
            There are no tasks scheduled for the selected criteria.
          </p>
          <div className="no-tasks-details">
            <p><strong>View:</strong> {activeTab === 'week' ? 'Weekly' : 'Daily'}</p>
            <p><strong>Date:</strong> {format(displayDate, 'MMMM d, yyyy')}</p>
            {selectedDepartment !== 'all' && (
              <p><strong>Department:</strong> {selectedDepartment}</p>
            )}
          </div>
          <p className="no-tasks-hint">Try selecting a different date or department.</p>
        </div>
      );
    }

    return (
      <div className="tasks-container">
        {Object.entries(tasks).map(([date, taskList]) => {
          const filteredTasks = filterTasksByDepartment(taskList);
          if (filteredTasks.length === 0 && selectedDepartment !== 'all') {
            return null;
          }

          const groupedTasks = groupTasksByDepartment(filteredTasks);

          return (
            <div key={date} className="date-section">
              <h2 className="date-header">
                <span className="date-icon">📅</span>
                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
              </h2>

              {Object.entries(groupedTasks).map(([dept, deptTasks]) => (
                <div key={dept} className="department-section">
                  <h3 className="department-header">
                    <span className="dept-badge">{dept}</span>
                    <span className="task-count">{deptTasks.length} task{deptTasks.length !== 1 ? 's' : ''}</span>
                  </h3>
                  <ul className="task-list">
                    {deptTasks.map((task, index) => (
                      <li key={index} className="task-item">
                        <div className="task-header">
                          <span className="task-name">{task.activity}</span>
                          <span className={`frequency-badge ${task.frequency.toLowerCase()}`}>
                            {task.frequency}
                          </span>
                        </div>
                        {task.comments && (
                          <div className="task-comments">
                            <span className="comment-icon">💬</span> {task.comments}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

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
                <a href="/" className="dropdown-item active">
                  <span className="dropdown-icon">🏠</span>
                  Home
                </a>
                {isAdmin() && (
                  <>
                    <a href="/batch/" className="dropdown-item">
                      <span className="dropdown-icon">📧</span>
                      Batch Control
                    </a>
                    <a href="/batch/master.html" className="dropdown-item">
                      <span className="dropdown-icon">📋</span>
                      Manage Task Master
                    </a>
                    <a href="/batch/users.html" className="dropdown-item">
                      <span className="dropdown-icon">👥</span>
                      Manage Users
                    </a>
                    <a href="/api-test/" className="dropdown-item">
                      <span className="dropdown-icon">🔧</span>
                      Test API
                    </a>
                  </>
                )}
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

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          <span className="tab-icon">📆</span>
          <span className="tab-label">Today</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'week' ? 'active' : ''}`}
          onClick={() => setActiveTab('week')}
        >
          <span className="tab-icon">📅</span>
          <span className="tab-label">Week</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <span className="tab-icon">🔍</span>
          <span className="tab-label">Search</span>
        </button>
      </nav>

      {activeTab === 'search' && (
        <div className="search-controls">
          <div className="control-group">
            <label>Select Date</label>
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
            />
          </div>
        </div>
      )}

      <div className="filter-bar">
        <div className="filter-group">
          <label>Department</label>
          <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        <div className="task-summary">
          <span className="summary-count">{getTotalTaskCount()}</span>
          <span className="summary-label">tasks</span>
        </div>
      </div>

      <main className="main-content">
        {renderTasks()}
      </main>

      <footer className="app-footer">
        <p>ALPS Residency Task Management</p>
      </footer>
    </div>
  );
}

export default App;
