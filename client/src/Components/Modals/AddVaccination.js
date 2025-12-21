import React, { useState, useEffect } from "react";
import Moment from "moment";

const AddVaccination = (props) => {
    const [form, setForm] = useState({
        Name: props.data.Name || "",
        DateAdministered: props.data.DateAdministered ? Moment.utc(props.data.DateAdministered).format("YYYY-MM-DD") : Moment().format("YYYY-MM-DD"),
        NextDueDate: props.data.NextDueDate ? Moment.utc(props.data.NextDueDate).format("YYYY-MM-DD") : "",
    });

    useEffect(() => {
        if (props.data) {
            setForm({
                Name: props.data.Name || "",
                DateAdministered: props.data.DateAdministered ? Moment.utc(props.data.DateAdministered).format("YYYY-MM-DD") : Moment().format("YYYY-MM-DD"),
                NextDueDate: props.data.NextDueDate ? Moment.utc(props.data.NextDueDate).format("YYYY-MM-DD") : "",
            });
        }
    }, [props.data]);

    const onChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const submit = (e) => {
        e.preventDefault();
    };

    return (
        <div className="col-md-6">
            <form name="addVaccinationForm" onSubmit={submit}>
                <input type="hidden" id="vaccId" name="vaccId" value={props.data._id || ""} />
                <div className="form-group">
                    <label>Vaccine Name</label>
                    <input
                        onChange={onChange}
                        name="Name"
                        type="text"
                        className="form-control"
                        placeholder="Enter Vaccine Name"
                        value={form.Name}
                    />
                </div>
                <div className="form-group">
                    <label>Date Administered</label>
                    <input
                        onChange={onChange}
                        type="date"
                        name="DateAdministered"
                        className="form-control"
                        value={form.DateAdministered}
                    />
                </div>
                <div className="form-group">
                    <label>Next Due Date</label>
                    <input
                        onChange={onChange}
                        type="date"
                        name="NextDueDate"
                        className="form-control"
                        value={form.NextDueDate}
                    />
                </div>
            </form>
        </div>
    );
};

export default AddVaccination;
