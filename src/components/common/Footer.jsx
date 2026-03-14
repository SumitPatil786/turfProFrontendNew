import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer__grid">
        <div className="footer__brand">
          <div className="footer__logo">⚽ TurfPro</div>
          <p>Your one-stop platform for booking premium sports turfs. Play more, worry less.</p>
        </div>
        <div className="footer__col">
          <h4>Quick Links</h4>
          <div className="footer__links">
            <Link to="/">Home</Link>
            <Link to="/turfs">Browse Turfs</Link>
            <Link to="/register">Register</Link>
            <Link to="/login">Sign In</Link>
          </div>
        </div>
        <div className="footer__col">
          <h4>Sports</h4>
          <div className="footer__links">
            <span>🏏 Cricket</span>
            <span>⚽ Football</span>
            <span>🏸 Badminton</span>
            <span>🏀 Basketball</span>
            <span>🎾 Tennis</span>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} TurfPro. All rights reserved.</span>
        <span>Made with ❤️ for sports lovers</span>
      </div>
    </div>
  </footer>
);

export default Footer;
