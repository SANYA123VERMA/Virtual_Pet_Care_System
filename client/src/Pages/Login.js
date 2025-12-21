import React, { useContext, useEffect, useState } from "react";
import UserContext from "../Context/UserContext.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import About from "../Components/About.js";

import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "react-toastify";


import { FaPaw } from "react-icons/fa";

const Login = () => {
	const { userData, setUserData } = useContext(UserContext);
	const navigate = useNavigate();
	const [form, setForm] = useState({ email: "", password: "" });
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		if (userData.user) navigate("/home");
	}, [userData.user, navigate]);

	const onChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const submit = async (e) => {
		e.preventDefault();
		try {
			const loginRes = await axios.post("/users/login", {
				email: form.email,
				password: form.password,
			});

			setUserData({
				token: loginRes.data.token,
				user: loginRes.data.user,
			});
			localStorage.setItem("auth-token", loginRes.data.token);
			navigate("/home");
		} catch (err) {
			console.log("Login Error:", err);
			const msg = err.response?.data?.msg || "Login failed. Please check your credentials.";
			toast.error(msg);
		}
	};

	return (
		<div className="auth-container">
			{/* Left Side: Visual */}
			<div className="auth-visual-side">
				<div className="brand-content">
					<FaPaw className="brand-logo-icon" />
					<h1 className="brand-title">Fluffy</h1>
					<p className="brand-tagline">Pet Care Made Simple.</p>
				</div>
			</div>

			{/* Right Side: Form */}
			<div className="auth-form-side">
				<div className="auth-card-flat">
					<div className="auth-header-flat">
						<h2 className="auth-title">Login</h2>
						<p className="auth-subtitle">Welcome Back! Please login.</p>
					</div>

					<form onSubmit={submit} className="auth-form" autoComplete="off">
						<div className="auth-input-group">
							<label htmlFor="email" className="auth-label">Email Address</label>
							<input
								onChange={onChange}
								type="email"
								name="email"
								className="auth-input"
								value={form.email}
								autoComplete="nope"
								placeholder="name@example.com"
							/>
						</div>
						<div className="auth-input-group">
							<div className="d-flex justify-content-between align-items-center mb-2">
								<label htmlFor="password" className="auth-label mb-0">Password</label>
								<a href="/forgot-password" style={{ fontSize: "0.85rem", color: "#666", textDecoration: "none", fontWeight: "600" }}>Forgot Password?</a>
							</div>
							<div className="password-wrapper">
								<input
									onChange={onChange}
									type={showPassword ? "text" : "password"}
									name="password"
									className="auth-input"
									value={form.password}
									autoComplete="new-password"
									placeholder="Enter your password"
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
						<div className="d-grid mt-4">
							<button type="submit" className="auth-btn">
								Login
							</button>
						</div>
					</form>

					<div className="auth-links">
						Don't have an account?
						<a href="/register" className="auth-link">Create free account</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
