import React from "react";

const AddMeds = ({ formData, handleChange }) => {

	const submit = (e) => {
		e.preventDefault();
	};

	return (
		<div className="col-md-12">
			<form name="addMedForm" onSubmit={submit}>
				{/* Hidden ID no longer needed in DOM, managed in state, but keeping for safety if needed by other things */}
				<input type="hidden" name="medId" value={formData.medId || ""} />

				<div className="form-group mb-3">
					<label>Medication Name</label>
					<input
						onChange={handleChange}
						name="medication"
						type="text"
						className="form-control"
						placeholder="Enter Medication Name"
						value={formData.medication}
					/>
				</div>
				<div className="form-group mb-3">
					<label>Start Date</label>
					<input
						onChange={handleChange}
						type="date"
						name="startDate"
						className="form-control"
						value={formData.startDate}
					/>
				</div>
				<div className="form-group mb-3">
					<label>Dosage</label>
					<input
						onChange={handleChange}
						type="text"
						name="dose"
						className="form-control"
						placeholder="Enter Dosage"
						value={formData.dose}
					/>
				</div>
				<div className="form-group mb-3">
					<label>Time</label>
					<input
						onChange={handleChange}
						type="time"
						name="time"
						className="form-control"
						value={formData.time}
					/>
				</div>
			</form>
		</div>
	);

};

export default AddMeds;
