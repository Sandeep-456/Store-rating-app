import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { API_URL } from '../../config';
import Navbar from '../../components/Navbar';
import './index.css';

const Profile = () => {
  const [user, setUser] = useState({});
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${Cookies.get('token')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setError('Failed to fetch profile.'));
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/account/update-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setOldPassword('');
        setNewPassword('');
      } else {
        setError(data.error || 'Update failed');
      }
    } catch {
      setError('Server error while updating password');
    }
  };

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
            <div className="avatar-wrapper">
                <img
                src="https://i.pinimg.com/736x/fb/c7/c0/fbc7c0f44564099388f9c5ffcc338944.jpg" // or any animated avatar
                alt="Profile"
                className="avatar"
                />
            </div>
            <div className="user-name">
                <h2>{user?.name || "User Profile"}</h2>
            </div>
        </div>
        <div className='profile-form-container'>
            <div className="profile-info">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Address:</strong> {user.address}</p>
            <p><strong>Role:</strong> {user.role}</p>
            </div>
            <h3>Change Password</h3>
            <form onSubmit={handlePasswordUpdate} className="password-form">
            <input
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
            />
            <button type="submit">Update Password</button>
            </form>
        </div>
        {message && <p className="success-msg">{message}</p>}
        {error && <p className="error-msg">{error}</p>}
      </div>
    </>
  );
};

export default Profile;
