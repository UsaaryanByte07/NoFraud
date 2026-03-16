import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // On mount, try to restore auth from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('nofraud_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem('nofraud_user');
      }
    }
    setAuthLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('nofraud_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('nofraud_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, authLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
