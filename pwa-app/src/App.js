import React, { useState, useEffect } from 'react';
import { taskService } from './services/api';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from 'date-fns';
import './App.css';

function App() {
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [viewType, selectedDate, selectedDepartment]);

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
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const quarter = Math.floor(selectedDate.getMonth() / 3) + 1;
      const half = selectedDate.getMonth() < 6 ? 1 : 2;

      switch (viewType) {
        case 'daily':
          response = await taskService.getTasksByDate(dateStr);
          setTasks({ [dateStr]: response.data });
          break;
        case 'weekly':
          response = await taskService.getTasksForWeek(dateStr);
          setTasks(response.data);
          break;
        case 'monthly':
          response = await taskService.getTasksForMonth(year, month);
          setTasks(response.data);
          break;
        case 'quarterly':
          response = await taskService.getTasksForQuarter(year, quarter);
          setTasks(response.data);
          break;
        case 'half-yearly':
          response = await taskService.getTasksForHalfYear(year, half);
          setTasks(response.data);
          break;
        case 'yearly':
          response = await taskService.getTasksForYear(year);
          setTasks(response.data);
          break;
        default:
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

  const renderTasks = () => {
    if (loading) {
      return <div className="loading">Loading tasks...</div>;
    }

    if (error) {
      return <div className="error">{error}</div>;
    }

    if (!tasks || Object.keys(tasks).length === 0) {
      return <div className="no-tasks">No tasks found for this period.</div>;
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
              <h2 className="date-header">{format(new Date(date), 'EEEE, MMMM d, yyyy')}</h2>

              {Object.entries(groupedTasks).map(([dept, deptTasks]) => (
                <div key={dept} className="department-section">
                  <h3 className="department-header">
                    {dept} <span className="task-count">({deptTasks.length} tasks)</span>
                  </h3>
                  <ul className="task-list">
                    {deptTasks.map((task, index) => (
                      <li key={index} className="task-item">
                        <div className="task-name">{task.activity}</div>
                        <div className="task-frequency">Frequency: {task.frequency}</div>
                        {task.comments && (
                          <div className="task-comments">Note: {task.comments}</div>
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
        <h1>ALPS Residency Task Scheduler</h1>
      </header>

      <div className="controls">
        <div className="control-group">
          <label>View:</label>
          <select value={viewType} onChange={(e) => setViewType(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="half-yearly">Half-Yearly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div className="control-group">
          <label>Date:</label>
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Department:</label>
          <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <button onClick={fetchTasks} className="refresh-button">Refresh</button>
      </div>

      <main className="main-content">
        {renderTasks()}
      </main>
    </div>
  );
}

export default App;
