import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/UserDashBoard';
import AdminDashboard from './pages/AdminDashboard'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Signin'
import Stores from './pages/Stores'
import Profile from './pages/Profile'
import StoreOwnerDashboard from './pages/StoreOwnerDashboard'
import AdminControlPanel from './pages/AdminControlPanel'


import ProtectedRoute from './components/ProtectedRoute';
import RedirectIfLoggedIn from './components/RedirectIfLoggedIn';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<RedirectIfLoggedIn><Home /></RedirectIfLoggedIn>} />
        <Route exact path="/login" element={<RedirectIfLoggedIn><Login /></RedirectIfLoggedIn>}/>
        <Route exact path='/register' element={<Register/>}/>
        <Route exact path='/dashboard' element={<ProtectedRoute allowedRoles={['user']}>
              <Dashboard />
            </ProtectedRoute>}/>
        <Route exact path="/stores" element={
          <ProtectedRoute allowedRoles={['user']}>
              <Stores />
            </ProtectedRoute>
        } />
        <Route exact path="/profile" element={
          <ProtectedRoute allowedRoles={['user', 'admin', 'store_owner']}>
              <Profile />
            </ProtectedRoute>
        }/>
        <Route exact path='/store-owner' element={
          <ProtectedRoute allowedRoles={['store_owner']}>
              <StoreOwnerDashboard />
            </ProtectedRoute>
        } />
        <Route exact path='/admin' element={
          <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>} />
        <Route exact path="/admin/control-panel" element={
          <ProtectedRoute allowedRoles={['admin']}>
              <AdminControlPanel />
            </ProtectedRoute>
        }/>
      </Routes>
    </Router>
  );
}

export default App;
