import React, { useState, useEffect } from "react";
import Moment from "moment";

const AddReminder = (props) => {


	const [form, setForm] = useState({
		Date: props?.data?.Date ? Moment(props.data.Date).format("YYYY-MM-DDTHH:mm") : Moment().format("YYYY-MM-DDTHH:mm"),
		Title: props?.data?.Title || "",
		Note: props?.data?.Note || "",
		Frequency: props?.data?.Frequency || "Once",
		SelectedDays: props?.data?.SelectedDays || [],
	});

	useEffect(() => {
		if (props.data) {
			setForm({
				Date: props.data.Date ? Moment(props.data.Date).format("YYYY-MM-DDTHH:mm") : Moment().format("YYYY-MM-DDTHH:mm"),
				Title: props.data.Title || "",
				Note: props.data.Note || "",
				Frequency: props.data.Frequency || "Once",
				SelectedDays: props.data.SelectedDays || [],
			});
		}
	}, [props.data]);

	const onChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const submit = async (e) => {
		e.preventDefault();
	};

	return (
		<div className="col-md-6">
			<form name="addReminderForm" onSubmit={submit}>
				<input
					type="hidden"
					id="reminderId"
					name="reminderId"
					value={props.data?._id || 0}
				/>
				<input
					type="hidden"
					name="SelectedDays"
					value={JSON.stringify(form.SelectedDays || [])}
				/>
				<div className="form-group">
					<label>Date & Time</label>
					<input
						onChange={onChange}
						type="datetime-local"
						name="Date"
						className="form-control"
						placeholder="Date reminder needed"
						value={form.Date}
					/>

					<label>Frequency</label>
					<select
						onChange={onChange}
						name="Frequency"
						className="form-control"
						value={form.Frequency}
					>
						<option value="Once">Once</option>
						<option value="Daily">Daily</option>
						<option value="Weekly">Weekly</option>
					</select>

					{form.Frequency === "Weekly" && (
						<div className="form-group mt-2">
							<label>Select Days:</label>
							<div className="d-flex flex-wrap">
								{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
									<div key={day} className="form-check mr-2">
										<input
											className="form-check-input"
											type="checkbox"
											id={`day-${day}`}
											value={day}
											checked={form.SelectedDays?.includes(day)}
											onChange={(e) => {
												let days = form.SelectedDays ? [...form.SelectedDays] : [];
												if (e.target.checked) {
													days.push(day);
												} else {
													days = days.filter((d) => d !== day);
												}
												setForm({ ...form, SelectedDays: days });
											}}
										/>
										<label className="form-check-label" htmlFor={`day-${day}`}>
											&nbsp;{day}&nbsp;
										</label>
									</div>
								))}
							</div>
						</div>
					)}

					<label>Title</label>
					<input
						onChange={onChange}
						type="text"
						name="Title"
						className="form-control"
						placeholder="title"
						value={form.Title}
					/>

					<label>Note</label>
					<input
						onChange={onChange}
						type="text"
						name="Note"
						className="form-control"
						placeholder="note"
						value={form.Note}
					/>
				</div>
			</form>
		</div>
	);
};

export default AddReminder;
