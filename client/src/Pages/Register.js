
import React, { useContext, useEffect, useState } from "react";
import UserContext from "../Context/UserContext.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { toast } from "react-toastify";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";


import { FaPaw } from "react-icons/fa";

const Register = () => {
	const { userData, setUserData } = useContext(UserContext);
	const navigate = useNavigate();

	const [registerForm, setRegisterForm] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		passwordCheck: "",
	});
	const [error, setError] = useState(null);
	const [showPassword, setShowPassword] = useState(false);
	const [showPasswordCheck, setShowPasswordCheck] = useState(false);

	useEffect(() => {
		if (userData.user) navigate("/");
	}, [userData.user, navigate]);

	const onChange = (e) => {
		setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
	};

	const submit = async (e) => {
		e.preventDefault();

		// Client-side validation
		if (!registerForm.firstName || !registerForm.email || !registerForm.password || !registerForm.passwordCheck) {
			const msg = "Please fill in all required fields.";
			setError(msg);
			toast.error(msg);
			return;
		}

		try {
			// Construct displayName for backward compatibility (if server code is old)
			const displayName = registerForm.lastName
				? `${registerForm.firstName} ${registerForm.lastName}`
				: registerForm.firstName;

			const newUser = {
				firstName: registerForm.firstName,
				lastName: registerForm.lastName,
				email: registerForm.email,
				password: registerForm.password,
				passwordCheck: registerForm.passwordCheck,
				displayName, // Sent to satisfy older/stale server code expecting this field
			};

			await axios.post("/users/register", newUser);
			toast.success("Registration successful! Please login.");
			navigate("/login");
		} catch (err) {
			const msg = err.response?.data?.msg || "Registration failed. Please try again.";
			setError(msg);
			toast.error(msg);
		}
	};

	return (
		<div className="auth-container">
			{/* Left Side: Visual */}
			<div className="auth-visual-side">
				<div className="brand-content">
					<FaPaw className="brand-logo-icon" />
					<h1 className="brand-title">Join Fluffy</h1>
					<p className="brand-tagline">Start your pet care journey.</p>
				</div>
			</div>

			{/* Right Side: Form */}
			<div className="auth-form-side">
				<div className="auth-card-flat">
					<div className="auth-header-flat">
						<h2 className="auth-title">Register</h2>
						<p className="auth-subtitle">Create your account</p>
					</div>

					{error && (
						<div className="alert alert-danger" role="alert">
							{error}
						</div>
					)}

					<form onSubmit={submit} className="auth-form" autoComplete="off">
						<div className="row">
							<div className="col-md-6 auth-input-group">
								<label className="auth-label">First Name</label>
								<input
									onChange={onChange}
									type="text"
									name="firstName"
									className="auth-input"
									value={registerForm.firstName}
									autoComplete="nope"
									placeholder="First Name"
								/>
							</div>
							<div className="col-md-6 auth-input-group">
								<label className="auth-label">Last Name</label>
								<input
									onChange={onChange}
									type="text"
									name="lastName"
									className="auth-input"
									value={registerForm.lastName}
									autoComplete="nope"
									placeholder="Optional"
								/>
							</div>
						</div>

						<div className="auth-input-group">
							<label className="auth-label">Email Address</label>
							<input
								onChange={onChange}
								type="email"
								name="email"
								className="auth-input"
								value={registerForm.email}
								autoComplete="nope"
								placeholder="name@example.com"
							/>
						</div>

						<div className="auth-input-group">
							<label className="auth-label">Password</label>
							<div className="password-wrapper">
								<input
									onChange={onChange}
									type={showPassword ? "text" : "password"}
									name="password"
									className="auth-input"
									value={registerForm.password}
									autoComplete="new-password"
									placeholder="Create password"
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
							<label className="auth-label">Confirm Password</label>
							<div className="password-wrapper">
								<input
									onChange={onChange}
									type={showPasswordCheck ? "text" : "password"}
									name="passwordCheck"
									className="auth-input"
									value={registerForm.passwordCheck}
									autoComplete="new-password"
									placeholder="Confirm password"
								/>
								<button
									type="button"
									className="toggle-password-btn"
									onClick={() => setShowPasswordCheck(!showPasswordCheck)}
								>
									{showPasswordCheck ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
								</button>
							</div>
						</div>

						<div className="d-grid mt-4">
							<button type="submit" className="auth-btn">
								Register
							</button>
						</div>
					</form>

					<div className="auth-links">
						Already have an account?
						<a href="/login" className="auth-link">Login</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Register;
