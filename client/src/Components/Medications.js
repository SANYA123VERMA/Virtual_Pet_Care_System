import React from "react";
import { useState, useEffect, useContext } from "react";
import Moment from "react-moment";
import moment from "moment";
import AddMeds from "./Modals/AddMeds";
import { Button, Modal } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { getPetData } from "../Components/Helpers/PetFunctions";
import PetContext from "../Context/PetContext";

const Medications = (props) => {
	const { petId } = useContext(PetContext);
	const [meds, setMeds] = useState(props.meds);
	const [show, setShow] = useState(false);
	const [modalData, setModalData] = useState(null);
	const [existing, setExisting] = useState(false);

	const [formData, setFormData] = useState({
		medication: "",
		startDate: "",
		dose: "",
		time: "",
		medId: ""
	});

	const handleClose = () => {
		setShow(false);
		getPetData(petId).then((data) => setMeds(data.Medications));
	};

	useEffect(() => {
		if (props.meds) {
			let m = [...props.meds];
			m.sort(function (a, b) {
				var nameA = a.DueDate,
					nameB = b.DueDate;
				if (nameA < nameB) return 1;
				if (nameA > nameB) return -1;
				return 0;
			});
			setMeds(m);
		}
	}, [props.meds]);

	const handleFormChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleAddUpdateMed = async (e) => {
		e.preventDefault();
		let url;

		let medName = formData.medication;
		let medDate = formData.startDate;
		let medDose = formData.dose;
		let medTime = formData.time;

		// Validation for Time
		if (!medTime) {
			console.warn("Saving Medication - TIME IS EMPTY!");
		}

		const vals = {
			MedicationName: medName,
			DueDate: medDate,
			Dose: medDose,
			Time: medTime,
		};

		if (existing) {
			url = `/api/updatePetMed/${petId}/${formData.medId}`;
		} else {
			url = `/api/addpetmed/${petId}`;
		}

		return postMed(url, vals);
	};

	const handleDelMed = async (e) => {
		e.preventDefault();
		let vals = {};
		const medId = formData.medId;
		const url = `/api/delPetMed/${petId}/${medId}`;
		return postMed(url, vals);
	};

	const postMed = async (url, vals) => {
		try {
			await axios.put(url, vals, {
				headers: { "x-auth-token": localStorage.getItem("auth-token") },
			});
			handleClose();
			// User feedback
			if (vals.Time) {
				toast.success(`Saved! Time set to: ${vals.Time}`);
			} else {
				toast.success("Saved successfully.");
			}
		} catch (err) {
			console.log(err);
			toast.error({ message: err.message });
		}
	};

	const update = async (e, data) => {
		e.preventDefault();
		setModalData(data);
		// Initialize form with existing data
		setFormData({
			medication: data.MedicationName || "",
			startDate: data.DueDate ? moment(data.DueDate).utc().format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
			dose: data.Dose || "",
			time: data.Time || "",
			medId: data._id
		});
		setExisting(true);
		setShow(true);
	};

	const add = (e, data) => {
		e.preventDefault();
		setModalData(data);
		// Initialize clean form
		setFormData({
			medication: "",
			startDate: moment().format("YYYY-MM-DD"),
			dose: "",
			time: "",
			medId: ""
		});
		setExisting(false);
		setShow(true);
	};

	return (
		<div className="card m-2 shadow rounded" id="petDashCard">
			<div className="card-body text-center">
				<h3 className="card-title">Medications</h3>
				<div className="pet-table">
					<ul className="overflow-auto">
						{meds.length > 0 ? meds.map((med) => (
							<li
								key={med._id}
								onClick={(e) => update(e, med)}
								className="pet-list w-100 py-2 mb-2 px-3 position-relative"
							>
								<div className="d-flex flex-column gap-2 text-start h-auto w-100 p-1">

									{/* Name Section */}
									<div className="w-100">
										<h5 className="text-wrap text-break mb-1" style={{ fontWeight: "bold", lineHeight: "1.4" }}>
											{med.MedicationName}
										</h5>
									</div>

									{/* Date Section */}
									<div className="w-100 d-flex align-items-center flex-wrap gap-2">
										<small className="text-muted text-nowrap">Due:</small>
										<span className="badge bg-primary rounded-pill">
											<Moment utc format="MM/DD/YYYY">
												{med.DueDate}
											</Moment>
										</span>
									</div>

									{/* Dosage Details Section - Ensure it clears previous lines */}
									<div className="w-100 border-top pt-2 mt-1">
										<div className="d-flex flex-column gap-1">
											<small className="text-muted" style={{ fontSize: "0.8rem" }}>Instructions:</small>
											<div className="d-flex flex-wrap gap-2">
												<span className="badge bg-secondary text-wrap text-start lh-sm p-2" style={{ maxWidth: "100%" }}>
													{med.Dose}
												</span>
												{med.Time && (
													<span className="badge bg-info text-dark text-nowrap p-2">
														<i className="bi bi-clock-fill me-1"></i> {med.Time}
													</span>
												)}
											</div>
										</div>
									</div>
								</div>
							</li>
						)) : <p className="empty-list-msg">No medications added.</p>}
					</ul>
				</div>
				<button
					name="addMedBtn"
					onClick={(e) => add(e, { _id: 0 })}
					className="edit-medications-btn btn btn-circle shadow"
				>
					<i className="fa fa-plus my-float"></i>
				</button>

				<Modal show={show} onHide={handleClose}>
					<Modal.Header closeButton>
						<Modal.Title>Add or Edit Medication</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<AddMeds
							formData={formData}
							handleChange={handleFormChange}
						/>
					</Modal.Body>
					<Modal.Footer>
						{existing ? (
							<Button
								className="delete-saved-entry"
								onClick={handleDelMed}
							>
								Remove Medication
							</Button>
						) : null}
						<Button
							className="save-updated-entry"
							onClick={handleAddUpdateMed}
						>
							Submit Changes
						</Button>
					</Modal.Footer>
				</Modal>
			</div>
		</div>
	);
};

export default Medications;
