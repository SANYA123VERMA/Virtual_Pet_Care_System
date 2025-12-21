import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";


import { FaPaw } from "react-icons/fa";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post("/users/forgot-password", { email });
            toast.success("If an account exists, a reset link has been sent.");
            setEmail("");
        } catch (err) {
            console.error("Forgot Password Error:", err);
            const msg = err.response?.data?.msg || "Something went wrong. Please check console.";
            toast.error(msg);

            if (msg.includes("535") || msg.includes("Authentication")) {
                toast.warn("Check your server .env for valid MAIL_USER and MAIL_PASS.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Left Side: Visual */}
            <div className="auth-visual-side">
                <div className="brand-content">
                    <FaPaw className="brand-logo-icon" />
                    <h1 className="brand-title">Fluffy</h1>
                    <p className="brand-tagline">Secure Account Recovery.</p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="auth-form-side">
                <div className="auth-card-flat">
                    <div className="auth-header-flat">
                        <h2 className="auth-title">Reset Password</h2>
                        <p className="auth-subtitle">Enter your email to receive a reset link.</p>
                    </div>

                    <form onSubmit={submit} className="auth-form">
                        <div className="auth-input-group">
                            <label className="auth-label">Email Address</label>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                className="auth-input"
                                value={email}
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                        <div className="d-grid gap-3 mt-4">
                            <button disabled={loading} type="submit" className="auth-btn">
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                            <a href="/login" className="btn btn-link text-decoration-none text-muted" style={{ fontWeight: 600 }}>Back to Login</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
