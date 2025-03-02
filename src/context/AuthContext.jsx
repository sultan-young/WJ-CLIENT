import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 添加加载状态

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userInfo'));

    if (storedUser) {
      setUser(storedUser);
    } else {
    }

    if (!storedUser && !location.pathname.includes('login')) {
      logout()
    }
    setLoading(false); // 加载完成
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    location.pathname = '/login/supplier';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);