import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar'
import './index.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
        <Navbar />
        <div className="home-page">
        {/* Hero Section */}
            <section className="hero-section">
                <h1>Store Rating Portal</h1>
                <p>A platform where users can discover and rate stores, helping others make informed decisions.</p>
                <div className="hero-buttons">
                <button onClick={() => navigate('/login')}>Log In</button>
                <button onClick={() => navigate('/register')}>Register Now</button>
                </div>
            </section>

            {/* Key Features Section */}
            <section className="features-section">
                <h2>Key Features</h2>
                <div className="feature-cards">
                <div className="card">
                    <div className="icon">⭐</div>
                    <h3>Rate Stores</h3>
                    <p>Submit ratings for stores you've visited and help others make better choices.</p>
                </div>
                <div className="card">
                    <div className="icon">🏪</div>
                    <h3>Store Owners</h3>
                    <p>Monitor your store's performance and see what customers are saying about your business.</p>
                </div>
                <div className="card">
                    <div className="icon">👥</div>
                    <h3>System Administration</h3>
                    <p>For administrators to manage users, stores, and monitor platform activity.</p>
                </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <h2>How It Works</h2>
                <ol>
                <li><strong>Discover</strong> local stores listed on our platform.</li>
                <li><strong>Rate</strong> and review your experiences.</li>
                <li><strong>Improve</strong> the community with valuable feedback.</li>
                </ol>
            </section>

            {/* Get Started CTA */}
            <section className="get-started">
                <h2>Ready to get started?</h2>
                <button onClick={() => navigate('/register')}>Create your account</button>
                <p className='login-p'>Login credientials:</p>
                <ul className='login-details'>
                    <li>user: user@example.com/ User@123!</li>
                    <li>store_owner: store@example.com/ Store@123!</li>
                    <li>addmin: admin@example.com/ Admin@123!</li>
                </ul>
            </section>
        </div>
    </>
  );
};

export default Home;
