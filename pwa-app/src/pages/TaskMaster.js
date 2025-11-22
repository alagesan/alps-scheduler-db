import React, { useState, useEffect } from 'react';
import { masterService } from '../services/api';
import './AdminPages.css';

function TaskMaster() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Filters
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterFrequency, setFilterFrequency] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    activity: '',
    department: '',
    frequency: '',
    noOfTimes: 1,
    specificDates: '',
    comments: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  // Apply filters when tasks or filter values change
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, filterDepartment, filterFrequency, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksRes, deptsRes, freqsRes] = await Promise.all([
        masterService.getAllTasks(),
        masterService.getDepartments(),
        masterService.getFrequencies()
      ]);
      setTasks(tasksRes.data);
      setDepartments(deptsRes.data);
      setFrequencies(freqsRes.data);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...tasks];

    if (filterDepartment) {
      result = result.filter(t => t.department?.toLowerCase() === filterDepartment.toLowerCase());
    }

    if (filterFrequency) {
      result = result.filter(t => t.frequency?.toLowerCase() === filterFrequency.toLowerCase());
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.activity?.toLowerCase().includes(query) ||
        t.comments?.toLowerCase().includes(query)
      );
    }

    setFilteredTasks(result);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setEditingTask(null);
    setFormData({
      activity: '',
      department: departments[0] || '',
      frequency: frequencies[0] || '',
      noOfTimes: 1,
      specificDates: '',
      comments: ''
    });
    setShowForm(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      activity: task.activity || '',
      department: task.department || '',
      frequency: task.frequency || '',
      noOfTimes: task.noOfTimes || 1,
      specificDates: task.specificDates || '',
      comments: task.comments || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Are you sure you want to delete "${task.activity}"?`)) {
      return;
    }
    try {
      await masterService.deleteTask(task.rowNumber);
      await loadData();
    } catch (err) {
      setError('Failed to delete task.');
      console.error('Error deleting task:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await masterService.updateTask(editingTask.rowNumber, formData);
      } else {
        await masterService.createTask(formData);
      }
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(`Failed to ${editingTask ? 'update' : 'create'} task.`);
      console.error('Error saving task:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  // Calculate stats
  const uniqueDepts = [...new Set(tasks.map(t => t.department))].length;

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Manage Task Master</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add Task
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-value">{tasks.length}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{uniqueDepts}</div>
          <div className="stat-label">Departments</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{filteredTasks.length}</div>
          <div className="stat-label">Showing</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-toolbar">
        <div className="filter-group">
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={filterFrequency}
            onChange={(e) => setFilterFrequency(e.target.value)}
          >
            <option value="">All Frequencies</option>
            {frequencies.map(freq => (
              <option key={freq} value={freq}>{freq}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadData}>
          🔄 Refresh
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Activity *</label>
                <input
                  type="text"
                  name="activity"
                  value={formData.activity}
                  onChange={handleInputChange}
                  required
                  placeholder="Task description"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Frequency *</label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Frequency</option>
                    {frequencies.map(freq => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>No. of Times</label>
                  <input
                    type="number"
                    name="noOfTimes"
                    value={formData.noOfTimes}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Specific Dates</label>
                  <input
                    type="text"
                    name="specificDates"
                    value={formData.specificDates}
                    onChange={handleInputChange}
                    placeholder="e.g., October 1"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Comments</label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Row</th>
              <th>Activity</th>
              <th>Department</th>
              <th>Frequency</th>
              <th>Times</th>
              <th>Specific Dates</th>
              <th>Comments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.rowNumber}>
                <td>{task.rowNumber}</td>
                <td>{task.activity}</td>
                <td><span className="badge badge-dept">{task.department}</span></td>
                <td><span className={`badge badge-freq freq-${task.frequency?.toLowerCase().replace('-', '')}`}>{task.frequency}</span></td>
                <td>{task.noOfTimes || '-'}</td>
                <td>{task.specificDates || '-'}</td>
                <td className="comments-cell">{task.comments || '-'}</td>
                <td className="actions-cell">
                  <button className="btn-icon btn-edit" onClick={() => handleEdit(task)} title="Edit">
                    ✏️
                  </button>
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(task)} title="Delete">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTasks.length === 0 && (
          <div className="empty-state">
            <p>{tasks.length === 0 ? 'No tasks found. Click "Add Task" to create one.' : 'No tasks match the current filters.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskMaster;
