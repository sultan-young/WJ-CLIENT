import { createContext, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children, value }) => (
  <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
);

export const useAuth = () => useContext(AuthContext);