import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Axios from "axios";
import PetContext from "../Context/PetContext";
import UserContext from "../Context/UserContext";
import VetVisits from "../Components/VetVisits";
import Medications from "../Components/Medications";
import Reminders from "../Components/Reminders";
import Vaccinations from "../Components/Vaccinations";
import DashboardAlerts from "../Components/DashboardAlerts";
import Moment from "react-moment";
import ChangePet from "../Components/Modals/ChangePet";
import { getPetData } from "../Components/Helpers/PetFunctions";
import ActivityTracker from "../Components/ActivityTracker";

const PetDash = () => {
	const { petId, setPetId, newPetData, setNewPetData } = useContext(PetContext);
	const { userData } = useContext(UserContext);
	const navigate = useNavigate();
	const location = useLocation();
	const { id } = useParams(); // Get ID from URL
	const [data, setData] = useState();
	const [img] = useState();

	useEffect(() => {
		setNewPetData(false);
	}, [setNewPetData]);

	// Optimized Data Fetching
	useEffect(() => {
		let isMounted = true;

		const loadData = async () => {
			const targetId = id || petId || localStorage.getItem("petId");

			if (targetId) {
				// Sync context if needed, but don't block fetching
				if (targetId !== petId) setPetId(targetId);

				try {
					const petData = await getPetData(targetId);
					if (isMounted) {
						if (petData) {
							setData(petData);
						} else {
							// Don't blank out data if it was already there, just warn
							if (!data) {
								setData(null);
							} else {
								console.warn(`Pet data for ID ${targetId} not found, retaining previous data.`);
							}
						}
					}
				} catch (e) {
					console.error("Fetch failed", e);
				} finally {
					if (newPetData === true) setNewPetData(false);
				}
			}
		};

		loadData();
		return () => { isMounted = false; };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, newPetData]); // Removed petId/setPetId to prevent loop

	useEffect(() => { }, [img]);

	useEffect(() => {
		if (!userData.user) navigate("/");
	}, [userData.user, navigate]);

	if (!data) {
		return <div className="text-center py-5"><h3 className="text-secondary">Loading Pet Dashboard...</h3></div>;
	}

	return (
		<div className="container-fluid">
			<div className="container">
				<div className="row">
					{data && (
						<div className="col-sm-3 py-5">
							<div className="card m-2 shadow rounded">
								{data.PetImageLoc ? (
									<img
										src={data.PetImageLoc.startsWith('/') || data.PetImageLoc.startsWith('http') ? data.PetImageLoc : `/${data.PetImageLoc}`}
										className="card-img-top"
										alt="petImage"
									></img>
								) : (
									<img src="/images/paw-print-small.png" alt="profile"></img>
								)}

								<div className="card-body text-center">
									<h1 className="card-title">{data.PetName}</h1>
									<h4 className="card-title">
										Birth Date: &nbsp;
										<Moment format="MM/DD/YYYY">{data.BirthDate}</Moment>
									</h4>
									<h4 className="card-title">{data.Gender}</h4>
									<h4 className="card-title">{data.Breed}</h4>

									<div className="edit-new-pet">
										<button
											data-bs-toggle="modal"
											data-bs-target="#editAPetModal"
											type="button"
											className="edit-pet-btn btn btn-xl"
										>
											Edit
										</button>
									</div>
								</div>
							</div>
						</div>
					)}

					<ChangePet data={data} />

					<div className="pet-dash-cards col-sm-9 py-5">
						{/* Dashboard Alerts Section */}
						{data && <DashboardAlerts currentPet={data} />}

						{/* Activity Tracker Section */}
						{data && (
							<>
								<ActivityTracker
									petId={data._id}
									activities={data.Activities || []}
									onUpdate={(updatedData) => {
										if (updatedData && updatedData._id) {
											setData(updatedData);
										} else {
											setNewPetData(true);
										}
									}}
								/>
								<div
									className="card shadow-sm mb-4 text-center cursor-pointer hover-scale"
									onClick={() => navigate(`/pet/expenses/${data._id}`)}
									style={{ transition: '0.3s', border: 'none', color: 'var(--text-expense-theme)' }}
								>
									<div className="card-body py-4">
										<h5 className="mb-0"><i className="bi bi-wallet2 me-2"></i>Manage Expenses & Analytics</h5>
										<small>Track Bills, Food, and view Spending Charts</small>
									</div>
								</div>
							</>
						)}

						<div className="row">
							<div className="col-lg-4 col-md-6 col-sm-12 mb-4">
								{data && <Reminders petI={data._id} Reminders={data.Reminders} />}
							</div>
							<div className="col-lg-4 col-md-6 col-sm-12 mb-4">
								{data && <VetVisits petI={data._id} VetVisits={data.VetVisits} />}
							</div>
							<div className="col-lg-4 col-md-6 col-sm-12 mb-4">
								{data && <Medications petI={data._id} meds={data.Medications} />}
							</div>
						</div>
						<div className="row">
							<div className="col-lg-12 col-md-12 col-sm-12 mb-4">
								{data && <Vaccinations petI={data._id} vaccinations={data.Vaccinations} />}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div >
	);
};

export default PetDash;
