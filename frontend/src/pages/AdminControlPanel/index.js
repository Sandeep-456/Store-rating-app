import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { API_URL } from '../../config';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar';
import Modal from 'react-modal';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { FaTrash, FaEdit } from 'react-icons/fa';
import './index.css';

// Set accessibility root for react-modal
Modal.setAppElement('#root');

const AdminControlPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', address: '', role: 'user',
  });
  const [editData, setEditData] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editType, setEditType] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${Cookies.get('token')}`,
  }), []);

  const fetchData = useCallback(async () => {
    const endpoints = [
      ['users', 'admin/users', setUsers],
      ['stores', 'admin/stores', setStores],
      ['ratings', 'admin/ratings', setRatings],
    ];

    for (const [, endpoint, setter] of endpoints) {
      try {
        const res = await fetch(`${API_URL}/${endpoint}`, { headers });
        const data = await res.json();
        if (res.ok) setter(data[endpoint] || data.users || data.stores || data.ratings || []);
      } catch (err) {
        console.error(`Failed to fetch ${endpoint}`);
      }
    }
  }, [headers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateUser = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('User created successfully!');
        setFormData({ name: '', email: '', password: '', address: '', role: 'user' });
        fetchData();
      } else {
        setError(data.errors?.join(' ') || data.error || 'User creation failed');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  const handleDelete = (type, id) => {
    confirmAlert({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete this ${type.slice(0, -1)}?`,
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              const res = await fetch(`${API_URL}/admin/${type}/${id}`, {
                method: 'DELETE',
                headers,
              });
              if (res.ok) fetchData();
            } catch (err) {
              console.error(`Error deleting ${type}`);
            }
          }
        },
        { label: 'Cancel' }
      ]
    });
  };

  const openEditModal = (type, data) => {
    setEditType(type);
    setEditData({ ...data });
    setModalIsOpen(true);
  };

  const handleEditSubmit = async () => {
    const id = editData.id || editData.rating_id;
    const endpoint = `${API_URL}/admin/${editType}/${id}`;
    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers,
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        fetchData();
        setModalIsOpen(false);
      }
    } catch (err) {
      console.error(`Failed to update ${editType}`);
    }
  };

  const renderEditModal = () => (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={() => setModalIsOpen(false)}
      className="modal"
      overlayClassName="overlay"
    >
      <h3>Edit {editType.charAt(0).toUpperCase() + editType.slice(1)}</h3>
      {editData && Object.entries(editData).map(([key, value]) => {
        if (key === 'id' || key === 'rating_id') return null;
        return (
          <input
            key={key}
            name={key}
            value={value}
            onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
            placeholder={key}
          />
        );
      })}
      <button onClick={handleEditSubmit}>Update</button>
      <button className="cancel-btn" onClick={() => setModalIsOpen(false)}>Cancel</button>
    </Modal>
  );

  return (
    <>
      <Navbar />
      <div className="admin-panel-container">
        <h2>Admin Control Panel</h2>
        <div className="caution-box">
          ⚠️ Please verify before updating or deleting. Changes are irreversible.
        </div>

        {/* Create User Form */}
        <div className="create-user-form">
          <h3>Create New User</h3>
          <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} />
          <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="store_owner">Store Owner</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={handleCreateUser}>Create User</button>
          {error && <p className="error-msg">{error}</p>}
          {success && <p className="success-msg">{success}</p>}
        </div>

        {/* Tabs */}
        <div className="tab-buttons">
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</button>
          <button className={activeTab === 'stores' ? 'active' : ''} onClick={() => setActiveTab('stores')}>Stores</button>
          <button className={activeTab === 'ratings' ? 'active' : ''} onClick={() => setActiveTab('ratings')}>Ratings</button>
        </div>

        {/* Users */}
        {activeTab === 'users' && (
          <div className="users-grid">
            {users.map(user => (
              <div key={user.id} className="user-card">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <div className="actions">
                  <FaEdit onClick={() => openEditModal('users', user)} />
                  <FaTrash className='delete-icon' onClick={() => handleDelete('users', user.id)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stores */}
        {activeTab === 'stores' && (
          <div className="users-grid">
            {stores.map(store => (
              <div key={store.id} className="user-card">
                <p><strong>Store:</strong> {store.name}</p>
                <p><strong>Email:</strong> {store.email}</p>
                <div className="actions">
                  <FaEdit onClick={() => openEditModal('stores', store)} />
                  <FaTrash className='delete-icon' onClick={() => handleDelete('stores', store.id)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ratings */}
        {activeTab === 'ratings' && (
          <div className="users-grid">
            {ratings.map((r, i) => (
              <div key={i} className="user-card">
                <p><strong>User:</strong> {r.user_name}</p>
                <p><strong>Store:</strong> {r.store_name}</p>
                <p><strong>Rating:</strong> {r.rating}</p>
                <div className="actions">
                  <FaEdit onClick={() => openEditModal('ratings', { ...r, id: r.rating_id })} />
                  <FaTrash className='delete-icon' onClick={() => handleDelete('ratings', r.rating_id)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {renderEditModal()}
      </div>
    </>
  );
};

export default AdminControlPanel;
