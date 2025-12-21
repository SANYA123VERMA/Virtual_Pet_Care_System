import React, { useEffect, useState } from "react";
import Moment from "moment";

const AddVisit = (props) => {
  const [form, setForm] = useState({
    VisitDate: props.data.VisitDate ? Moment.utc(props.data.VisitDate).format("YYYY-MM-DD") : Moment().format("YYYY-MM-DD"),
    VisitNotes: props.data.VisitNotes || "",
    Weight: props.data.Weight || "",
  });

  useEffect(() => {
    if (props.data) {
      setForm({
        VisitDate: props.data.VisitDate ? Moment.utc(props.data.VisitDate).format("YYYY-MM-DD") : Moment().format("YYYY-MM-DD"),
        VisitNotes: props.data.VisitNotes || "",
        Weight: props.data.Weight || "",
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
      <form name="addVisitForm" onSubmit={submit}>
        <input type="hidden" id="visitId" name="visitId" value={props.data._id || ""} />
        <div className="form-group">
          <label>Visit Date</label>
          <input
            onChange={onChange}
            type="date"
            name="VisitDate"
            className="form-control"
            placeholder="Date of Visit"
            value={form.VisitDate}
          />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <input
            onChange={onChange}
            type="text"
            name="VisitNotes"
            className="form-control"
            placeholder="Enter Visit Notes"
            value={form.VisitNotes}
          />
        </div>
        <div className="form-group">
          <label>Weight (lbs)</label>
          <input
            onChange={onChange}
            type="number"
            name="Weight"
            className="form-control"
            placeholder="Enter Weight"
            value={form.Weight}
          />
        </div>
      </form>
    </div>
  );
};

export default AddVisit;
