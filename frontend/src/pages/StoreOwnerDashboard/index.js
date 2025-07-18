// src/pages/StoreOwnerDashboard/index.js
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar';
import { API_URL } from '../../config';
import './index.css';

const StoreOwnerDashboard = () => {
  const [ratings, setRatings] = useState([]);
  const [averageData, setAverageData] = useState({
    overall_average_rating: 0,
    store_wise_average_ratings: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // Fetch individual ratings
      const res = await fetch(`${API_URL}/store-owner/ratings`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.ratings)) {
        setRatings(data.ratings);
      }

      // Fetch store averages
      const avgRes = await fetch(`${API_URL}/store-owner/average-rating`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      const avgData = await avgRes.json();
      if (avgRes.ok) {
        setAverageData({
          overall_average_rating: avgData.overall_average_rating || 0,
          store_wise_average_ratings: avgData.store_wise_average_ratings || [],
        });
      }
    } catch (err) {
      console.error("Error loading dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <>
      <Navbar />
      <div className="store-owner-container">
        {/* Owner Header */}
        <div className="owner-header">
          <div className="avatar-frame">
            <img
              src="https://cdn-icons-png.flaticon.com/512/1995/1995567.png"
              alt="avatar"
              className="avatar"
            />
          </div>
          <div>
            <h2>Welcome to the Dashboard</h2>
            <p className="avg-rating">⭐ Overall Avg Rating: {averageData.overall_average_rating}</p>
          </div>
        </div>

        {/* Store-Wise Average Ratings */}
        <div className="ratings-section">
          <h3>Average Ratings Per Store</h3>
          <div className="rating-list">
            {averageData.store_wise_average_ratings.length === 0 ? (
              <p>No store ratings available.</p>
            ) : (
              averageData.store_wise_average_ratings.map((store, idx) => (
                <div key={idx} className="rating-card store-average">
                  <p><strong>Store:</strong> {store.store_name}</p>
                  <p><strong>Average Rating:</strong> {store.average_rating} ⭐</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Ratings */}
        <div className="ratings-section">
          <h3>Individual User Ratings</h3>
          {loading ? (
            <p>Loading ratings...</p>
          ) : ratings.length === 0 ? (
            <p>No user ratings submitted.</p>
          ) : (
            <div className="rating-list">
              {ratings.map((r, idx) => (
                <div key={idx} className="rating-card">
                  <p><strong>User:</strong> {r.user_name || 'Unknown'}</p>
                  <p><strong>Email:</strong> {r.user_email}</p>
                  <p><strong>Store:</strong> {r.store_name}</p>
                  <p><strong>Rating:</strong> {r.rating} ⭐</p>
                  {r.created_at && (
                    <p><strong>Date:</strong> {new Date(r.created_at).toLocaleDateString()}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StoreOwnerDashboard;
