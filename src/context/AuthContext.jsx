import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session from storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    const storedRole = localStorage.getItem("role");

    if (storedUser && storedRole) {
      setUser({ id: storedUser, role: storedRole });
      setRole(storedRole);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    setRole(userData.role);
    localStorage.setItem("loggedInUser", userData.id);
    localStorage.setItem("role", userData.role);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("role");
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
