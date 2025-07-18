import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = Cookies.get('token');
  const role = Cookies.get('role');

  // If no token → redirect to login
  if (!token) return <Navigate to="/" replace />;

  // If allowedRoles is specified, check if user has access
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
