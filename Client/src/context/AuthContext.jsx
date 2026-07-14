import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication from local storage on bootstrap
  useEffect(() => {
    const storedToken = localStorage.getItem('shipyard_token');
    const storedUser = localStorage.getItem('shipyard_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Register user
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('shipyard_token', token);
      localStorage.setItem('shipyard_user', JSON.stringify(userData));

      setToken(token);
      setUser(userData);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.error || 'Registration failed. Please check credentials.';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('shipyard_token', token);
      localStorage.setItem('shipyard_user', JSON.stringify(userData));

      setToken(token);
      setUser(userData);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.error || 'Authentication failed. Invalid email or password.';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('shipyard_token');
    localStorage.removeItem('shipyard_user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use Auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
