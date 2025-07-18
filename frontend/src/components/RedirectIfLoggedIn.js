import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const RedirectIfLoggedIn = ({ children }) => {
  const token = Cookies.get('token');
  const role = Cookies.get('role');

  if (token) {
    // Navigate based on role
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'store_owner') return <Navigate to="/store-owner" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RedirectIfLoggedIn;
