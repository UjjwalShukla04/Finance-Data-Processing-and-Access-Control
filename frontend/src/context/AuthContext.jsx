import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const response = await authAPI.getProfile();
        setUser(response.data.data);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    const { user, token } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin';
  const isAnalyst = () => user?.role === 'analyst' || user?.role === 'admin';
  const canManageUsers = () => user?.role === 'admin';
  const canCreateRecords = () => user?.role === 'analyst' || user?.role === 'admin';
  const canEditRecords = () => user?.role === 'admin';

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isAnalyst,
    canManageUsers,
    canCreateRecords,
    canEditRecords
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
