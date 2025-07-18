import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Navbar from '../../components/Navbar';
import StarRating from '../../components/StarRating/StarRating.js';
import './index.css';
import { API_URL } from '../../config';

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    const filteredStores = stores.filter(
      (store) =>
        store.name.toLowerCase().includes(search.toLowerCase()) ||
        store.address.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(filteredStores);
  }, [search, stores]);

  const fetchStores = async () => {
    try {
      const res = await fetch(`${API_URL}/users/stores`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setStores(data.stores || []);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    }
  };

  const handleRating = async (storeId, ratingValue, hasRatedBefore) => {
    try {
      const url = hasRatedBefore
        ? `${API_URL}/users/ratings/${storeId}`
        : `${API_URL}/users/ratings`;

      const method = hasRatedBefore ? 'PUT' : 'POST';
      const body = hasRatedBefore
        ? JSON.stringify({ rating: ratingValue })
        : JSON.stringify({ store_id: storeId, rating: ratingValue });

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
        body,
      });

      const data = await res.json();
      if (res.ok) {
        alert('Rating submitted successfully!');
        fetchStores(); // Refresh after rating
      } else {
        alert(data.error || 'Rating failed');
      }
    } catch (err) {
      alert('Server error while rating');
    }
  };

  return (
    <>
      <Navbar />
      <div className="stores-container">
        <h2>Explore Stores</h2>
        <input
          type="text"
          placeholder="Search by name or address"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-box"
        />

        {filtered.length === 0 ? (
          <p className="no-store">No matching stores found.</p>
        ) : (
          <div className="store-list">
            {filtered.map((store) => (
              <div key={store.id} className="store-card">
                <h3>{store.name}</h3>
                <p><strong>Address:</strong> {store.address}</p>

                <div className="rating-block">
                  <p><strong>Average Rating:</strong></p>
                  <StarRating rating={store.overall_rating || 0} />

                  <p><strong>Your Rating:</strong></p>
                  <StarRating
                    rating={store.user_rating || 0}
                    onRate={(val) => handleRating(store.id, val, !!store.user_rating)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Stores;
