import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('turfpro_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem('turfpro_user');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Called after successful login/register.
   *
   * Original backend UserResponseDto:
   *   { userId, name, phone, email, createdAt, role }
   *
   * KNOWN ISSUE in original backend: ModelMapper maps User → UserResponseDto,
   * but User.id != UserResponseDto.userId, so userId will be null.
   * We work around this by checking response.id as a fallback.
   *
   * role comes back as a String from UserResponseDto ("USER"/"ADMIN").
   */
  const login = (responseData) => {
    if (!responseData) return;

    const userData = {
      // userId may be null due to ModelMapper mismatch (User.id → userId not auto-mapped)
      // fallback to 'id' if present (won't exist but safe)
      userId: responseData.userId ?? responseData.id ?? null,
      name:   responseData.name,
      email:  responseData.email,
      phone:  responseData.phone,
      role:   responseData.role ? String(responseData.role).toUpperCase() : 'USER',
    };

    setUser(userData);
    localStorage.setItem('turfpro_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('turfpro_user');
  };

  const isAdmin   = user?.role === 'ADMIN';
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isLoggedIn, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
