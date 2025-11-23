import React, { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ryj_user")) || null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("ryj_token") || null);

  useEffect(() => {
    if (user) localStorage.setItem("ryj_user", JSON.stringify(user));
    else localStorage.removeItem("ryj_user");
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem("ryj_token", token);
    else localStorage.removeItem("ryj_token");
  }, [token]);

  async function login(email, password) {
    const res = await apiLogin(email, password);
    if (res.token) {
      setToken(res.token);
      setUser(res.user);
      return { ok: true, user: res.user };
    }
    return { ok: false, error: res?.message || 'login failed' };
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
