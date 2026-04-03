import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState({ name: '', email: '', password: '' });
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Sending setup request:', setupData);
      const setupRes = await authAPI.setupAdmin(setupData);
      console.log('Setup response:', setupRes.data);
      await login(setupData.email, setupData.password);
      navigate('/');
    } catch (err) {
      console.error('Setup error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Setup failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {!showSetup ? (
          <>
            <div className="login-header">
              <h1>Finance Dashboard</h1>
              <p>Sign in to your account</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button 
                onClick={() => setShowSetup(true)} 
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Setup Admin Account
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="login-header">
              <h1>Setup Admin</h1>
              <p>Create the first admin account</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSetupAdmin}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={setupData.name}
                  onChange={(e) => setSetupData({ ...setupData, name: e.target.value })}
                  placeholder="Admin name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={setupData.email}
                  onChange={(e) => setSetupData({ ...setupData, email: e.target.value })}
                  placeholder="Admin email"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={setupData.password}
                  onChange={(e) => setSetupData({ ...setupData, password: e.target.value })}
                  placeholder="Password (min 6 characters)"
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Creating...' : 'Create Admin'}
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button 
                onClick={() => setShowSetup(false)} 
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
