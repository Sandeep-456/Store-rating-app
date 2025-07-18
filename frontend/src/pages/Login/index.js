import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { API_URL } from '../../config';
import Navbar from '../../components/Navbar';
import './index.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        Cookies.set('token', data.token, { expires: 1 });
        Cookies.set('role', data.user.role, { expires: 1 });
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else if (data.user.role === 'store_owner') {
          navigate('/store-owner');
        } else {
          navigate('/dashboard');
        }   
      }
    } catch (err) {
      setError('Server error. Try again.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        <div className='form-container'>
            <h2>Login to Your Account</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    id="email"
                    name="email"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    />
                </div>
                <button type="submit">Login</button>
                {error && <p className="error-msg">{error}</p>}
            </form>
            <p className="login-toggle">
                Don't have an account?{' '}
                <span onClick={() => navigate('/register')}>Sign In</span>
            </p>
        </div>
      </div>
    </>
  );
};

export default Login;