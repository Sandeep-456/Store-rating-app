import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { API_URL } from '../../config';
import Navbar from '../../components/Navbar';
import './index.css';


const Dashboard = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRatings = async () => {
    try {
      const res = await fetch(`${API_URL}/users/ratings`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setRatings(data.ratings);
      } else {
        console.log(data.error || "Failed to fetch ratings");
      }
    } catch (err) {
      console.log("Error fetching:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h2>Welcome to Your Dashboard!</h2>

        {loading ? (
          <p>Loading your ratings...</p>
        ) : ratings.length === 0 ? (
          <p className="no-rating">You haven't rated any stores yet.</p>
        ) : (
          <div className="ratings-list">
            <h3>Your Rated Stores:</h3>
            {ratings.map((r, index) => (
              <div
                key={r.id}
                className="rating-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h4>{r.store_name}</h4>
                <p>Address: {r.address}</p>
                <p>Rating: {r.rating} ⭐</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
