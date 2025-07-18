import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './index.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const token = Cookies.get('token');

  useEffect(() => {
    const cookieRole = Cookies.get('role');
    if (cookieRole) {
      setRole(cookieRole);
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    navigate('/login');
  };

  const handleDashboardClick = () => {
    if (!token) {
      navigate('/');
    } else if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'store_owner') {
      navigate('/store-owner');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={handleDashboardClick}>
        Store Rating App
      </div>
      <div className="navbar-links">
        {token ? (
          <>
            <span onClick={handleDashboardClick}>Dashboard</span>
            {role === 'admin' && (
              <span onClick={() => navigate('/admin/control-panel')}>Control Panel</span>
            )}
            {role === 'user' && (
              <span onClick={() => navigate('/stores')}>Stores</span>
            )}
            <span onClick={() => navigate('/profile')}>Profile</span>
            <button className='logout-btn' onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <span onClick={() => navigate('/login')}>Login</span>
            <span onClick={() => navigate('/register')}>Register</span>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
