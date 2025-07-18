import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar';
import { API_URL } from '../../config';
import Modal from 'react-modal';
import './index.css';

Modal.setAppElement('#root'); // Required for accessibility

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed');
      } else {
        Cookies.set('token', data.token, { expires: 1 });
        Cookies.set('role', data.user.role, { expires: 1 });
        setIsModalOpen(true);
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  const handleLoginRedirect = () => {
    setIsModalOpen(false);
    navigate('/login');
  };

  return (
    <>
      <Navbar />
      <div className="register-container">
        <div className="form-container">
          <h2>Create Your Account</h2>
          <form className="register-form" onSubmit={handleSubmit}>
            {/* Input Fields */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input type="text" name="address" required value={formData.address} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Create Password</label>
              <input type="password" name="password" required value={formData.password} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="user">User</option>
                <option value="store_owner">Store Owner</option>
              </select>
            </div>

            <button type="submit">Sign Up</button>
            {error && <p className="error-msg">{error}</p>}
          </form>

          <p className="register-toggle">
            Already have an account? <span onClick={() => navigate('/login')}>Login</span>
          </p>
        </div>
      </div>

      {/* ✅ Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="success-modal"
        overlayClassName="modal-overlay"
      >
        <h2>🎉 Registered Successfully!</h2>
        <p>You can now log in to your account.</p>
        <button onClick={handleLoginRedirect}>Lets Explore</button>
      </Modal>
    </>
  );
};

export default Register;
