import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../Context/UserContext";

const LandingPage = () => {
    const navigate = useNavigate();
    const { userData } = useContext(UserContext);

    useEffect(() => {
        if (userData.user) navigate("/home");
    }, [userData.user, navigate]);

    return (
        <div className="landing-wrapper">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="landing-content-left">
                    <h1 className="landing-title">
                        Be Glowing <br />
                        <span className="highlight-text">Be Cute</span>
                    </h1>
                    <div className="landing-description">
                        <p>
                            Welcome to <strong>Fluffy</strong>, your all-in-one companion for comprehensive pet care.
                            We believe every pet deserves the best, which is why we've created a platform
                            to help you track vaccinations, monitor health weight trends, and stay on top of
                            medical appointments.
                        </p>
                        <br />
                        <p>
                            Join our vibrant community of pet lovers to share tips, asking questions,
                            and celebrating your furry friends. From smart reminders to health analytics,
                            Fluffy makes being a pet parent easier and more joyful than ever before.
                        </p>
                    </div>
                    <button
                        className="btn landing-cta-btn"
                        onClick={() => navigate("/login")}
                    >
                        Get Started
                    </button>
                </div>

                <div className="landing-content-right">
                    <div className="yellow-circle"></div>
                    <div className="hero-ring"></div>
                    <img src={require("../images/hero-cat.png")} alt="Cute Cat" className="hero-cat-img" />

                    <div className="floating-card grooming-card">
                        <div className="card-icon">
                            <i className="bi bi-scissors"></i>
                        </div>
                        <div className="card-text">
                            <h4>Pet Grooming</h4>
                            <small>Professional care</small>
                        </div>
                    </div>

                    <div className="floating-card clinic-card">
                        <div className="card-icon">
                            <i className="bi bi-heart-pulse"></i>
                        </div>
                        <div className="card-text">
                            <h4>Pet Clinic</h4>
                            <small>Expert veterinarians</small>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2 className="section-title">Why Choose Us?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <i className="bi bi-activity"></i>
                        </div>
                        <h3>Health Tracking</h3>
                        <p>Monitor your pet's weight, vaccinations, and medical history in one place.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <i className="bi bi-bell"></i>
                        </div>
                        <h3>Smart Reminders</h3>
                        <p>Never miss a vet visit or medication dose with our intelligent notification system.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <i className="bi bi-chat-dots"></i>
                        </div>
                        <h3>Community Connect</h3>
                        <p>Join a vibrant community of pet lovers. Share tips, photos, and get advice.</p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stat-item">
                    <h2>2k+</h2>
                    <p>Happy Pets</p>
                </div>
                <div className="stat-item">
                    <h2>500+</h2>
                    <p>Vet Clinics</p>
                </div>
                <div className="stat-item">
                    <h2>10k+</h2>
                    <p>Reminders Set</p>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works-section">
                <h2 className="section-title">How It Works</h2>
                <div className="steps-container">
                    <div className="step-item">
                        <div className="step-number">1</div>
                        <h3>Create Account</h3>
                        <p>Sign up in seconds and create your personal pet dashboard.</p>
                    </div>
                    <div className="step-connector"></div>
                    <div className="step-item">
                        <div className="step-number">2</div>
                        <h3>Add Your Pet</h3>
                        <p>Enter details about your furry friend to start tracking.</p>
                    </div>
                    <div className="step-connector"></div>
                    <div className="step-item">
                        <div className="step-number">3</div>
                        <h3>Stay Organized</h3>
                        <p>Get reminders and insights to keep your pet healthy.</p>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            {/* Testimonials Section Removed as per request */}


            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-col">
                        <h3>Fluffy</h3>
                        <p>Making pet care simple and fun for everyone.</p>
                    </div>
                    <div className="footer-col">
                        <h3>Quick Links</h3>
                        <ul>
                            <li>About Us</li>
                            <li>Services</li>
                            <li>Contact</li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h3>Stay Updated</h3>
                        <div className="newsletter-box">
                            <input type="email" placeholder="Enter your email" />
                            <button>Join</button>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2025 Fluffy. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
