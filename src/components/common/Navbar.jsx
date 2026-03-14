import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__container">
        {/* Logo */}
        <Link to="/" className="navbar__logo" onClick={() => setMenuOpen(false)}>
          <span className="navbar__logo-icon">⚽</span>
          <span className="navbar__logo-text">TurfPro</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar__nav">
          <NavLink to="/" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`} end>
            Home
          </NavLink>
          <NavLink to="/turfs" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>
            Turfs
          </NavLink>
          {isLoggedIn && (
            <NavLink to="/my-bookings" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>
              My Bookings
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>
              Admin
            </NavLink>
          )}
        </nav>

        {/* Auth Buttons */}
        <div className="navbar__actions">
          {isLoggedIn ? (
            <div className="navbar__user">
              <div className="navbar__user-info">
                <div className="navbar__avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
                <div className="navbar__user-meta">
                  <span className="navbar__user-name">{user?.name}</span>
                  <span className="navbar__user-role">{user?.role}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar__auth-btns">
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className={`navbar__hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile-menu">
          <NavLink to="/" className="navbar__mobile-link" onClick={() => setMenuOpen(false)} end>Home</NavLink>
          <NavLink to="/turfs" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Turfs</NavLink>
          {isLoggedIn && (
            <NavLink to="/my-bookings" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>My Bookings</NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Admin Panel</NavLink>
          )}
          <div className="navbar__mobile-divider" />
          {isLoggedIn ? (
            <>
              <span className="navbar__mobile-user">Hello, {user?.name}</span>
              <button onClick={handleLogout} className="btn btn-danger btn-sm btn-full">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm btn-full" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm btn-full" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
