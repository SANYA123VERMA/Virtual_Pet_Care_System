import React, { useContext } from "react";
import DeleteAccount from "./Modals/DeleteAccount";
import UserContext from "../Context/UserContext";
import { useLocation } from "react-router-dom";

const Footer = () => {
	const { userData } = useContext(UserContext);
	const location = useLocation();

	if (location.pathname === "/chat") return null;

	return (
		<footer className="footer mt-auto py-4">
			<div className="container">
				<div className="row align-items-center">
					<div className="col-md-4 text-center text-md-start mb-3 mb-md-0">
						<h5 className="mb-1" style={{ fontWeight: "bold" }}>Fluffy</h5>
						<small className="d-block mb-3 text-muted">&copy; 2025 Fluffy. All rights reserved.</small>
					</div>

					<div className="col-md-4 text-center mb-3 mb-md-0">
						<span className="footer-text font-italic text-muted small">
							"We love our pets, we take care of them."
						</span>
					</div>

					<div className="col-md-4 text-center text-md-end">
						{userData.user && (
							<span
								data-bs-toggle="modal"
								data-bs-target="#Delete"
								style={{ cursor: "pointer", color: "#dc3545", fontSize: "0.9rem" }}
							>
								Delete Account
							</span>
						)}
					</div>
				</div>
			</div>
			<DeleteAccount />
		</footer>
	);
};

export default Footer;
