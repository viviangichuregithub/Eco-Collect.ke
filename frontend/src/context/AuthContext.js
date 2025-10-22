"use client"; // <-- MUST be first line

import { createContext, useContext, useState, useEffect } from "react";
import { userApi } from "../lib/user";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.profile()
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await userApi.login(email, password);
    setUser(data);
    return data;
  };

  const register = async (payload) => {
    const data = await userApi.register(payload);
    setUser(data);
    return data;
  };

  const logout = async () => {
    await userApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
