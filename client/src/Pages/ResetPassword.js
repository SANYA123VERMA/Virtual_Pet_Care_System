import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const onChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (form.newPassword !== form.confirmPassword) {
                toast.error("Passwords do not match");
                setLoading(false);
                return;
            }

            await axios.post("/users/reset-password", {
                token,
                newPassword: form.newPassword,
                confirmPassword: form.confirmPassword
            });

            toast.success("Password reset successful! Please login.");
            navigate("/login");
        } catch (err) {
            const msg = err.response?.data?.msg || "Failed to reset password. Link may be expired.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">Fluffy</div>
                    <div className="auth-subtitle">Set New Password</div>
                </div>

                <form onSubmit={submit} className="auth-form">
                    <div className="auth-input-group">
                        <label className="auth-label">New Password</label>
                        <div className="password-wrapper">
                            <input
                                onChange={onChange}
                                type={showPassword ? "text" : "password"}
                                name="newPassword"
                                className="auth-input"
                                value={form.newPassword}
                                required
                                minLength="8"
                                placeholder="Min 8 characters"
                            />
                            <button
                                type="button"
                                className="toggle-password-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                            </button>
                        </div>
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Confirm New Password</label>
                        <div className="password-wrapper">
                            <input
                                onChange={onChange}
                                type={showConfirm ? "text" : "password"}
                                name="confirmPassword"
                                className="auth-input"
                                value={form.confirmPassword}
                                required
                                minLength="8"
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                className="toggle-password-btn"
                                onClick={() => setShowConfirm(!showConfirm)}
                            >
                                {showConfirm ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                            </button>
                        </div>
                    </div>

                    <div className="d-grid mt-4">
                        <button disabled={loading} type="submit" className="auth-btn">
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
