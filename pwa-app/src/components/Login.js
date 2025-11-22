import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const { login, error, loading } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await login(credentialResponse.credential);
    if (!result.success) {
      console.error('Login failed:', result.error);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Sign-In failed');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>ALPS Residency</h1>
          <p className="login-subtitle">Task Scheduler</p>
        </div>

        <div className="login-content">
          <div className="login-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>

          <h2>Sign In</h2>
          <p className="login-description">
            Please sign in with your Google account to access the application.
          </p>

          {error && (
            <div className="login-error">
              <span className="error-icon">!</span>
              {error}
            </div>
          )}

          {loading ? (
            <div className="login-loading">
              <div className="spinner"></div>
              <p>Signing in...</p>
            </div>
          ) : (
            <div className="google-login-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_blue"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="280"
              />
            </div>
          )}

          <p className="login-note">
            Only authorized users can access this application.
            Contact your administrator if you need access.
          </p>
        </div>

        <div className="login-footer">
          <p>ALPS Residency Task Management System</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
