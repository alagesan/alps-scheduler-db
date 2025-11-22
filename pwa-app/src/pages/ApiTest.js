import React, { useState } from 'react';
import api from '../services/api';
import { format } from 'date-fns';
import './AdminPages.css';

const today = format(new Date(), 'yyyy-MM-dd');
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
const currentHalf = new Date().getMonth() < 6 ? 1 : 2;
const weekLater = format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

const endpointCategories = [
  {
    name: 'Schedule Endpoints',
    color: '#28a745',
    endpoints: [
      { method: 'GET', path: '/schedule/today', description: 'Get tasks for today', params: [] },
      { method: 'GET', path: '/schedule/date/{date}', description: 'Get tasks for specific date', params: [{ name: 'date', type: 'date', default: today }] },
      { method: 'GET', path: '/schedule/week', description: 'Get tasks for current week', params: [] },
      { method: 'GET', path: '/schedule/week/{date}', description: 'Get tasks for week containing date', params: [{ name: 'date', type: 'date', default: today }] },
      { method: 'GET', path: '/schedule/month/{year}/{month}', description: 'Get tasks for month', params: [{ name: 'year', type: 'number', default: currentYear }, { name: 'month', type: 'number', default: currentMonth }] },
      { method: 'GET', path: '/schedule/quarter/{year}/{quarter}', description: 'Get tasks for quarter', params: [{ name: 'year', type: 'number', default: currentYear }, { name: 'quarter', type: 'number', default: currentQuarter }] },
      { method: 'GET', path: '/schedule/half-year/{year}/{half}', description: 'Get tasks for half-year', params: [{ name: 'year', type: 'number', default: currentYear }, { name: 'half', type: 'number', default: currentHalf }] },
      { method: 'GET', path: '/schedule/year/{year}', description: 'Get tasks for year', params: [{ name: 'year', type: 'number', default: currentYear }] },
      { method: 'GET', path: '/schedule/range?start={start}&end={end}', description: 'Get tasks for date range', params: [{ name: 'start', type: 'date', default: today }, { name: 'end', type: 'date', default: weekLater }], isQuery: true },
    ]
  },
  {
    name: 'Master Endpoints',
    color: '#007bff',
    endpoints: [
      { method: 'GET', path: '/master/tasks', description: 'Get all task definitions', params: [] },
      { method: 'GET', path: '/master/tasks/{rowNumber}', description: 'Get task by row', params: [{ name: 'rowNumber', type: 'number', default: 2 }] },
      { method: 'GET', path: '/master/departments', description: 'Get all departments', params: [] },
      { method: 'GET', path: '/master/frequencies', description: 'Get all frequencies', params: [] },
      { method: 'GET', path: '/master/tasks/department/{department}', description: 'Get tasks by department', params: [{ name: 'department', type: 'text', default: 'MEP' }] },
      { method: 'GET', path: '/master/tasks/frequency/{frequency}', description: 'Get tasks by frequency', params: [{ name: 'frequency', type: 'text', default: 'Daily' }] },
      { method: 'POST', path: '/master/tasks', description: 'Create new task', params: [{ name: 'body', type: 'json', default: JSON.stringify({ activity: 'Test Task', department: 'MEP', frequency: 'Daily', noOfTimes: 1, specificDates: '', comments: 'Test' }, null, 2) }] },
    ]
  },
  {
    name: 'User Endpoints',
    color: '#6f42c1',
    endpoints: [
      { method: 'GET', path: '/users', description: 'Get all users', params: [] },
      { method: 'GET', path: '/users/{rowNumber}', description: 'Get user by row', params: [{ name: 'rowNumber', type: 'number', default: 2 }] },
      { method: 'GET', path: '/users/email/{email}', description: 'Get user by email', params: [{ name: 'email', type: 'text', default: 'admin@example.com' }] },
      { method: 'GET', path: '/users/statuses', description: 'Get all statuses', params: [] },
      { method: 'GET', path: '/users/roles', description: 'Get all roles', params: [] },
      { method: 'POST', path: '/users', description: 'Create new user', params: [{ name: 'body', type: 'json', default: JSON.stringify({ email: 'test@example.com', status: 'Enabled', role: 'Staff' }, null, 2) }] },
    ]
  }
];

function ApiTest() {
  const [expandedEndpoint, setExpandedEndpoint] = useState(null);
  const [paramValues, setParamValues] = useState({});
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const getEndpointKey = (category, endpoint) => `${category}-${endpoint.path}-${endpoint.method}`;

  const handleParamChange = (key, paramName, value) => {
    setParamValues(prev => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [paramName]: value }
    }));
  };

  const getParamValue = (key, param) => {
    return paramValues[key]?.[param.name] ?? param.default;
  };

  const testEndpoint = async (category, endpoint) => {
    const key = getEndpointKey(category, endpoint);
    setLoading(prev => ({ ...prev, [key]: true }));
    setResults(prev => ({ ...prev, [key]: null }));

    let url = endpoint.path;
    let body = null;

    // Replace path parameters
    endpoint.params.forEach(param => {
      const value = getParamValue(key, param);
      if (param.type === 'json') {
        body = value;
      } else {
        url = url.replace(`{${param.name}}`, value);
      }
    });

    const startTime = Date.now();

    try {
      const options = { method: endpoint.method };
      if (body && (endpoint.method === 'POST' || endpoint.method === 'PUT')) {
        options.data = JSON.parse(body);
      }

      const response = await api.request({ url, ...options });
      const endTime = Date.now();

      setResults(prev => ({
        ...prev,
        [key]: {
          success: true,
          status: response.status,
          statusText: response.statusText,
          time: endTime - startTime,
          data: response.data
        }
      }));
    } catch (error) {
      const endTime = Date.now();
      setResults(prev => ({
        ...prev,
        [key]: {
          success: false,
          status: error.response?.status || 'Error',
          statusText: error.response?.statusText || error.message,
          time: endTime - startTime,
          data: error.response?.data || error.message
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const toggleEndpoint = (key) => {
    setExpandedEndpoint(prev => prev === key ? null : key);
  };

  const getMethodClass = (method) => {
    const classes = { GET: 'method-get', POST: 'method-post', PUT: 'method-put', DELETE: 'method-delete' };
    return classes[method] || '';
  };

  return (
    <div className="admin-page api-test-page">
      <div className="admin-header">
        <h1>API Test Page</h1>
        <p className="subtitle">Test Schedule, Master, and User APIs</p>
      </div>

      {endpointCategories.map(category => (
        <div key={category.name} className="api-category">
          <h2 className="category-header" style={{ backgroundColor: category.color }}>
            {category.name}
          </h2>

          {category.endpoints.map(endpoint => {
            const key = getEndpointKey(category.name, endpoint);
            const isExpanded = expandedEndpoint === key;
            const result = results[key];
            const isLoading = loading[key];

            return (
              <div key={key} className="endpoint-card">
                <div className="endpoint-header" onClick={() => toggleEndpoint(key)}>
                  <div className="endpoint-info">
                    <span className={`method-badge ${getMethodClass(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                    <span className="endpoint-path">{endpoint.path}</span>
                  </div>
                  <span className="endpoint-description">{endpoint.description}</span>
                </div>

                {isExpanded && (
                  <div className="endpoint-body">
                    {endpoint.params.map(param => (
                      <div key={param.name} className="form-group">
                        <label>{param.name}</label>
                        {param.type === 'json' ? (
                          <textarea
                            rows="6"
                            value={getParamValue(key, param)}
                            onChange={(e) => handleParamChange(key, param.name, e.target.value)}
                          />
                        ) : (
                          <input
                            type={param.type}
                            value={getParamValue(key, param)}
                            onChange={(e) => handleParamChange(key, param.name, e.target.value)}
                          />
                        )}
                      </div>
                    ))}

                    <button
                      className="btn btn-primary btn-block"
                      onClick={() => testEndpoint(category.name, endpoint)}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Testing...' : 'Test API'}
                    </button>

                    {result && (
                      <div className={`api-result ${result.success ? 'success' : 'error'}`}>
                        <div className="result-meta">
                          <span className={`status-badge ${result.success ? 'success' : 'error'}`}>
                            {result.status} {result.statusText}
                          </span>
                          <span className="time-badge">{result.time}ms</span>
                        </div>
                        <pre className="result-data">
                          {typeof result.data === 'object'
                            ? JSON.stringify(result.data, null, 2)
                            : result.data}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default ApiTest;
