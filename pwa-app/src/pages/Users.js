import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import './AdminPages.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    status: '',
    role: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  // Apply filters when users or filter values change
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, filterStatus, filterRole, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, rolesRes, statusesRes] = await Promise.all([
        userService.getAllUsers(),
        userService.getRoles(),
        userService.getStatuses()
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      setStatuses(statusesRes.data);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...users];

    if (filterStatus) {
      result = result.filter(u => u.status === filterStatus);
    }

    if (filterRole) {
      result = result.filter(u => u.role === filterRole);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(u => u.email?.toLowerCase().includes(query));
    }

    setFilteredUsers(result);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      status: statuses[0] || 'Enabled',
      role: roles[0] || 'Staff'
    });
    setShowForm(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      status: user.status || '',
      role: user.role || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user "${user.email}"?`)) {
      return;
    }
    try {
      await userService.deleteUser(user.rowNumber);
      await loadData();
    } catch (err) {
      setError('Failed to delete user.');
      console.error('Error deleting user:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.rowNumber, formData);
      } else {
        await userService.createUser(formData);
      }
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(`Failed to ${editingUser ? 'update' : 'create'} user.`);
      console.error('Error saving user:', err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const getStatusClass = (status) => {
    return status?.toLowerCase() === 'enabled' ? 'status-enabled' : 'status-disabled';
  };

  const getRoleClass = (role) => {
    return role?.toLowerCase() === 'admin' ? 'role-admin' : 'role-staff';
  };

  // Calculate stats
  const enabledCount = users.filter(u => u.status === 'Enabled').length;
  const adminCount = users.filter(u => u.role === 'Admin').length;

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Manage Users</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add User
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
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{enabledCount}</div>
          <div className="stat-label">Enabled</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{adminCount}</div>
          <div className="stat-label">Admins</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{filteredUsers.length}</div>
          <div className="stat-label">Showing</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-toolbar">
        <div className="filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search by email..."
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
            <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="user@example.com"
                  disabled={!!editingUser}
                />
                {editingUser && (
                  <small className="form-hint">Email cannot be changed</small>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Status</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Update' : 'Create'}
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
              <th>Email</th>
              <th>Status</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.rowNumber}>
                <td>{user.rowNumber}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge ${getStatusClass(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <span className={`badge ${getRoleClass(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="btn-icon btn-edit" onClick={() => handleEdit(user)} title="Edit">
                    ✏️
                  </button>
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(user)} title="Delete">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <p>{users.length === 0 ? 'No users found. Click "Add User" to create one.' : 'No users match the current filters.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;
