import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar';
import './index.css';
import { API_URL } from '../../config';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });

  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [ratings, setRatings] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [loading, setLoading] = useState(true);
  console.log(loading)

  // Fetch all data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = Cookies.get('token');
        const headers = { Authorization: `Bearer ${token}` };

        const dashRes = await fetch(`${API_URL}/admin/dashboard`, { headers });
        const dashData = await dashRes.json();
        if (dashRes.ok) setDashboardData(dashData);

        const usersRes = await fetch(`${API_URL}/admin/users`, { headers });
        const usersData = await usersRes.json();
        if (usersRes.ok) setUsers(usersData.users);

        const storeRes = await fetch(`${API_URL}/admin/stores`, { headers });
        const storeData = await storeRes.json();
        if (storeRes.ok) setStores(storeData.stores);

        const ratingsRes = await fetch(`${API_URL}/admin/ratings`, { headers });
        const ratingsData = await ratingsRes.json();
        if (ratingsRes.ok) setRatings(ratingsData.ratings);
      } catch (err) {
        console.error("Error fetching admin dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Filter helper
  const filterBySearch = (data, fields) =>
    data.filter(item =>
      fields.some(field =>
        item[field]?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  // Apply filters
  const filteredUsers = filterBySearch(users, ['name', 'email', 'address']);
  const filteredStores = filterBySearch(stores, ['name', 'email', 'address']);

  const filteredRatings = ratings.filter(r =>
    (!filterRating || r.rating.toString() === filterRating) &&
    (
      r.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.address?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <>
      <Navbar />
      <div className="admin-dashboard-container">
        <h2>Admin Dashboard</h2>

        {/* Summary Cards */}
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Total Users</h3>
            <p>{dashboardData.totalUsers}</p>
          </div>
          <div className="dashboard-card">
            <h3>Total Stores</h3>
            <p>{dashboardData.totalStores}</p>
          </div>
          <div className="dashboard-card">
            <h3>Total Ratings</h3>
            <p>{dashboardData.totalRatings}</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="filter-panel">
          <input
            type="text"
            placeholder="Search user/store/address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
            <option value="">All Ratings</option>
            {[1, 2, 3, 4, 5].map(r => (
              <option key={r} value={r}>{r} Stars</option>
            ))}
          </select>
        </div>

        {/* Users Section */}
        <div className="section">
          <h3>All Users</h3>
          <div className="card-grid">
            {filteredUsers.map(user => (
              <div key={user.id} className="admin-card user-card">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Address:</strong> {user.address}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stores Section */}
        <div className="section">
          <h3>All Stores</h3>
          <div className="card-grid">
            {filteredStores.map(store => (
              <div key={store.id} className="admin-card store-card">
                <p><strong>Name:</strong> {store.name}</p>
                <p><strong>Email:</strong> {store.email}</p>
                <p><strong>Address:</strong> {store.address}</p>
                <p><strong>Avg Rating:</strong> {store.average_rating || 'N/A'} ⭐</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ratings Section */}
        <div className="section">
          <h3>All Ratings</h3>
          <div className="card-grid">
            {filteredRatings.length === 0 ? (
              <p style={{ color: "#fff" }}>No matching ratings found.</p>
            ) : (
              filteredRatings.map((r, idx) => (
                <div key={idx} className="admin-card rating-card">
                  <p><strong>User:</strong> {r.user_name}</p>
                  <p><strong>Store:</strong> {r.store_name}</p>
                  <p><strong>Address:</strong> {r.address}</p>
                  <p><strong>Rating:</strong> {r.rating} ⭐</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
    