import { createContext, useContext, useReducer, useEffect } from 'react';
import { loginUser, registerUser, logoutUser } from '../services/authService';
import { getMe } from '../services/userService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER': return { ...state, user: action.payload, isAuthenticated: true, loading: false };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'LOGOUT': return { user: null, isAuthenticated: false, loading: false };
    case 'UPDATE_USER': return { ...state, user: { ...state.user, ...action.payload } };
    default: return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const { data } = await getMe();
          dispatch({ type: 'SET_USER', payload: data });
          localStorage.setItem('user', JSON.stringify(data));
        } catch {
          dispatch({ type: 'LOGOUT' });
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const { data } = await loginUser(credentials);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      dispatch({ type: 'SET_USER', payload: data.user });
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await registerUser(userData);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      dispatch({ type: 'SET_USER', payload: data.user });
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try { await logoutUser(); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out');
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
    const updated = { ...state.user, ...userData };
    localStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
