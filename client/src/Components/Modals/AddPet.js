import React, { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PetContext from "../../Context/PetContext";

import { toast } from "react-toastify";

const AddPet = () => {
	const { REACT_APP_LOCAL_STORAGE } = process.env;
	const navigate = useNavigate();

	const [file, setFile] = useState(null);
	const uploadedImage = useRef(null);
	const imageUploader = useRef(null);
	//state for new pet data to be added to db
	const [newPet, setnewPet] = useState({});
	const { setNewPetData, pets, setPets } = useContext(PetContext);

	//handle change of form data to be set for newPet state
	const handleChange = (e) => {
		setnewPet({ ...newPet, [e.target.name]: e.target.value });
	};

	//handel save button to add a new pet to db
	const saveNewPet = async (e) => {
		e.preventDefault();
		try {
			if (!newPet.PetName || !String(newPet.PetName).trim()) {
				return toast.error("Please enter a Pet Name.");
			}
			if (!newPet.TypeOfPet || !String(newPet.TypeOfPet).trim()) {
				return toast.error("Please enter the Type of Pet.");
			}

			if (file) {
				const formData = new FormData();
				formData.append("file", file);
				const { data } = await axios.post("/api/saveLocImage", formData, {
					headers: { "x-auth-token": localStorage.getItem("auth-token") },
				});
				newPet.PetImageLoc = data.fileUrl;
			} else if (!newPet.PetImageLoc) {
				newPet.PetImageLoc = "/images/paw-print-small.png";
			}

			const { data: saved } = await axios.post("/api/pet", newPet, {
				headers: { "x-auth-token": localStorage.getItem("auth-token") },
			});
			toast.success("Pet saved.");
			// Optimistically update context so Home shows immediately
			setPets([...(pets || []), saved]);
			setNewPetData(true);
			const modalEl = document.getElementById("addAPetModal");
			if (modalEl) {
				try {
					if (window.bootstrap) {
						const instance = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
						instance.hide();
					} else {
						modalEl.classList.remove("show");
						modalEl.style.display = "none";
						document.body.classList.remove("modal-open");
						const backdrop = document.querySelector(".modal-backdrop");
						backdrop && backdrop.remove();
					}
				} catch { }
			}
			navigate("/");
		} catch (error) {
			if (error?.response?.status === 401) {
				toast.error(error.response?.data?.msg || "Please log in to save a pet.");
				return navigate("/login");
			}
			const msg =
				error?.response?.data?.error ||
				error?.response?.data?.msg ||
				error?.message ||
				"Failed to save pet";
			toast.error(msg);
		}
	};

	const handleImage = async (e) => {
		e.preventDefault();
		try {
			let file = e.target.files[0];
			file && setFile(file);
			if (file) {
				const reader = new FileReader();
				const { current } = uploadedImage;
				current.file = file;
				reader.onload = (e) => {
					current.src = e.target.result;
				};
				reader.readAsDataURL(file);
			}
		} catch (error) {
			toast.error(
				"There was a problem uploading the image, please try again" + error
			);
		}
	};

	return (
		<div className="modal" id="addAPetModal" tabIndex="-1">
			<div className="modal-dialog modal-md ">
				<div className="modal-content">
					<div className="modal-header">
						<h4>Fluffy</h4>
						<button
							type="button"
							className="btn-close"
							data-bs-dismiss="modal"
							aria-label="Close"
						></button>
					</div>
					<div
						style={{ display: "inline-flex", justifyContent: "center" }}
						className="modal-body"
					>
						<form onSubmit={saveNewPet}>
							<div className="form-group">
								<label>
									Add Photo <i className="fa fa-camera"></i>
								</label>
								<br />

								<div
									style={{
										height: "60px",
										width: "60px",
										border: "1px dashed black",
										borderRadius: "100%",
									}}
									onClick={() => imageUploader.current.click()}
								>
									<img
										ref={uploadedImage}
										style={{
											height: "60px",
											width: "60px",
											border: "none",
											borderRadius: "50%",
										}}
									></img>
								</div>
								<div className="container">
									<input
										onChange={(e) => handleImage(e)}
										ref={imageUploader}
										type="file"
										accept="image/*"
										multiple={false}
										name="PetImageLoc"
										style={{
											display: "none",
										}}
									/>
								</div>
							</div>
							<p></p>
							<div className="form-group">
								<input
									onChange={handleChange}
									placeholder="Pet Name"
									name="PetName"
									type="text"
									required
								/>
							</div>
							<p></p>
							<div className="form-group">
								<label>Birth Date</label>
								<br />
								<input
									onChange={handleChange}
									placeholder="Birth Date"
									name="BirthDate"
									type="date"
								/>
							</div>
							<p></p>
							<div className="form-group">
								<input
									onChange={handleChange}
									placeholder="Gender"
									name="Gender"
									type="text"
								/>
							</div>
							<p></p>
							<div className="form-group">
								<input
									onChange={handleChange}
									placeholder="Type of Pet"
									name="TypeOfPet"
									type="text"
									required
								/>
							</div>
							<p></p>
							<div className="form-group">
								<input
									onChange={handleChange}
									placeholder="Breed"
									name="Breed"
									type="text"
								/>
							</div>
						</form>
					</div>
					<div className="modal-footer">
						<button onClick={saveNewPet} type="submit" className="btn save-pet-submit">
							Save Pet
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AddPet;
