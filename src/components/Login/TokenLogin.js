import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const TokenLogin = () => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please enter an authentication token');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(token.trim());
      // Successful login - redirect will be handled by protected route
    } catch (error) {
      setError(error.message || 'Failed to authenticate. Please check your token and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Sign in to Tabnine</h2>
      <p>Enter your authentication token to continue</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="token">Authentication Token</label>
          <input
            type="password"
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your auth token here"
            disabled={isLoading}
          />
        </div>
        <button 
          type="submit" 
          className="login-button" 
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <div className="help-text">
        <p>Need help? <a href="https://docs.tabnine.com/getting-started" target="_blank" rel="noreferrer">Learn how to get your token</a></p>
      </div>
    </div>
  );
};

export default TokenLogin;
