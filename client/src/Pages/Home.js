import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddPet from "../Components/Modals/AddPet";
import UserContext from "../Context/UserContext";
import PetContext from "../Context/PetContext";
import ConfirmDelete from "../Components/Modals/ConfirmDelete";
import { loadUserPets } from "../Components/Helpers/PetFunctions";

const Home = () => {
	const { userData } = useContext(UserContext);
	const { newPetData, setNewPetData } = useContext(PetContext);
	const { setPetId } = useContext(PetContext);
	const navigate = useNavigate();
	const { pets, setPets } = useContext(PetContext);
	const displayName = userData.user?.displayName;

	useEffect(() => {
		if (!userData.user) navigate("/login");
	}, [userData.user, navigate]);

	useEffect(() => {
		const fetchPets = async () => {
			const userId = userData.user?.id || userData.user?._id;
			if (!userId) return;
			const data = await loadUserPets(userId);
			setPets(data || []);
			setNewPetData(false);
		};
		fetchPets();
	}, [userData.user, newPetData, setNewPetData, setPets]);

	const routePet = async (e, id) => {
		// we already had the data no need to go back to the DB
		e.preventDefault();
		try {
			setPetId(id);
			localStorage.setItem("petId", id);
			let thisPet = pets.filter((pet) => pet._id === id);
			navigate(`/pet/${id}`, { state: { info: thisPet } });
		} catch {
			console.log("something wrong");
		}
	};

	//map user data and send pets as buttons in list items
	return (
		<>
			<div className="container pets-container">
				<div className="row mb-5">
					<div className="col-12 text-center py-5">
						<h2 className="myPet-header">{displayName}'s Pets</h2>
					</div>
				</div>

				<div className="row">
					{pets.length > 0 &&
						pets.map((pet, i) => (
							<div key={pet._id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
								<div className="pet-card" onClick={(e) => routePet(e, pet._id)}>
									<button
										data-bs-toggle="modal"
										data-bs-target="#confirmDelete"
										onClick={(e) => {
											e.stopPropagation();
											setPetId(pet._id);
										}}
										type="button"
										className="card-delete-btn"
										title="Remove Pet"
									>
										<i className="fa fa-minus-circle"></i>
									</button>

									{pet.PetImageLoc ? (
										<img
											className="pet-card-img"
											src={pet.PetImageLoc}
											alt={pet.PetName}
										/>
									) : (
										<img
											className="pet-card-img"
											src="./images/paw-print-small.png"
											alt="pet"
										/>
									)}
									<h3 className="pet-card-title">{pet.PetName}</h3>
								</div>
							</div>
						))}

					{/* Add New Pet Card */}
					<div className="col-lg-3 col-md-4 col-sm-6 mb-4">
						<div
							className="pet-card add-pet-card h-100"
							data-bs-toggle="modal"
							data-bs-target="#addAPetModal"
						>
							<i className="fa fa-plus add-pet-icon"></i>
							<span className="mt-2 text-muted font-weight-bold">Add Pet</span>
						</div>
					</div>
				</div>
			</div>
			<ConfirmDelete />
			<AddPet />
		</>
	);
};

export default Home;
