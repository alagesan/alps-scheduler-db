import React, { useState, useEffect } from 'react';
import { batchService } from '../services/api';
import { format } from 'date-fns';
import './AdminPages.css';

function BatchControl() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendingDate, setSendingDate] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [scheduleTime, setScheduleTime] = useState('Manual Trigger');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const response = await batchService.getStatus();
      setStatus(response.data);
    } catch (err) {
      console.error('Error loading status:', err);
      setStatus({ status: 'ERROR', recipient: '-', currentDate: '-' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setSending(true);
    setResult(null);
    try {
      const response = await batchService.sendEmail();
      setResult({
        type: 'success',
        message: 'Email sent successfully!',
        data: response.data
      });
    } catch (err) {
      setResult({
        type: 'error',
        message: 'Failed to send email',
        data: err.response?.data || err.message
      });
    } finally {
      setSending(false);
    }
  };

  const handleSendEmailForDate = async () => {
    if (!selectedDate) {
      setResult({ type: 'error', message: 'Please select a date' });
      return;
    }
    setSendingDate(true);
    setResult(null);
    try {
      const response = await batchService.sendEmailForDate(selectedDate, scheduleTime);
      setResult({
        type: 'success',
        message: `Email sent successfully for ${selectedDate}!`,
        data: response.data
      });
    } catch (err) {
      setResult({
        type: 'error',
        message: 'Failed to send email',
        data: err.response?.data || err.message
      });
    } finally {
      setSendingDate(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Batch Control Panel</h1>
        <p className="subtitle">Manually trigger email jobs and view batch status</p>
      </div>

      {/* Status Card */}
      <div className="card">
        <div className="card-header">
          <h2>📊 Batch Status</h2>
          <button className="btn btn-secondary btn-sm" onClick={loadStatus} disabled={loading}>
            🔄 Refresh
          </button>
        </div>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Status</span>
            <span className={`status-value ${status?.status?.toLowerCase()}`}>
              {loading ? 'Loading...' : status?.status?.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Recipient</span>
            <span className="status-value">{status?.recipient || '-'}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Current Date</span>
            <span className="status-value">{status?.currentDate || '-'}</span>
          </div>
        </div>
      </div>

      {/* Send Email Now Card */}
      <div className="card">
        <div className="card-header">
          <h2>📧 Send Email Now</h2>
        </div>
        <p className="card-description">Trigger the email job for today's tasks</p>
        <button
          className="btn btn-primary btn-block"
          onClick={handleSendEmail}
          disabled={sending}
        >
          {sending ? (
            <>
              <span className="spinner"></span> Sending...
            </>
          ) : (
            '📨 Send Email for Today'
          )}
        </button>
      </div>

      {/* Send Email for Specific Date Card */}
      <div className="card">
        <div className="card-header">
          <h2>📅 Send Email for Specific Date</h2>
        </div>
        <div className="form-group">
          <label>Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Schedule Time Label (Optional)</label>
          <input
            type="text"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            placeholder="e.g., Manual Test, Special Run"
          />
        </div>
        <button
          className="btn btn-secondary btn-block"
          onClick={handleSendEmailForDate}
          disabled={sendingDate}
        >
          {sendingDate ? (
            <>
              <span className="spinner"></span> Sending...
            </>
          ) : (
            '📨 Send Email for Selected Date'
          )}
        </button>
      </div>

      {/* Result Display */}
      {result && (
        <div className={`result-card ${result.type}`}>
          <div className="result-header">
            {result.type === 'success' ? '✅' : '❌'} {result.message}
          </div>
          {result.data && (
            <pre className="result-data">
              {typeof result.data === 'object'
                ? JSON.stringify(result.data, null, 2)
                : result.data}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export default BatchControl;
