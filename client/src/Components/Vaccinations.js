import React, { useState, useEffect, useContext } from "react";
import Moment from "react-moment";
import AddVaccination from "./Modals/AddVaccination";
import { Button, Modal } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { getPetData } from "../Components/Helpers/PetFunctions";
import PetContext from "../Context/PetContext";

const Vaccinations = (props) => {
    const { petId } = useContext(PetContext);
    const [vaccinations, setVaccinations] = useState(props.vaccinations);
    const [show, setShow] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [existing, setExisting] = useState(false);

    const handleClose = () => {
        setShow(false);
        getPetData(petId).then((data) => setVaccinations(data.Vaccinations));
    };

    useEffect(() => {
        if (props.vaccinations) {
            let v = [...props.vaccinations];
            v.sort(function (a, b) {
                var dateA = a.NextDueDate || a.DateAdministered;
                var dateB = b.NextDueDate || b.DateAdministered;
                if (dateA < dateB) return -1;
                if (dateA > dateB) return 1;
                return 0;
            });
            setVaccinations(v);
        }
    }, [props.vaccinations]);

    const handleAddUpdateVacc = async (e, form, cb) => {
        e.preventDefault();
        let url;

        let name = form.addVaccinationForm.Name.value;
        let adminDate = form.addVaccinationForm.DateAdministered.value;
        let dueDate = form.addVaccinationForm.NextDueDate.value;

        const vals = {
            Name: name,
            DateAdministered: adminDate,
            NextDueDate: dueDate,
        };

        if (existing) {
            url = `/api/updatePetVaccination/${petId}/${form.addVaccinationForm.vaccId.value}`;
        } else {
            url = `/api/addPetVaccination/${petId}`;
        }

        return cb(url, vals);
    };

    const handleDelVacc = async (e, form, cb) => {
        e.preventDefault();
        let vals = {};
        const vaccId = form.addVaccinationForm.vaccId.value;
        const url = `/api/delPetVaccination/${petId}/${vaccId}`;

        return cb(url, vals);
    };

    const postVacc = async (url, vals) => {
        try {
            await axios.put(url, vals, {
                headers: { "x-auth-token": localStorage.getItem("auth-token") },
            });
            handleClose();
        } catch (err) {
            console.log(err);
            toast.error({ message: err.message });
        }
    };

    const update = (e, data) => {
        e.preventDefault();
        setModalData(data);
        setExisting(true);
        setShow(true);
    };

    const add = (e, data) => {
        e.preventDefault();
        setModalData(data);
        setExisting(false);
        setShow(true);
    };

    return (
        <div className="card m-2 shadow rounded" id="petDashCard">
            <div className="card-body text-center">
                <h3 className="card-title">Vaccinations</h3>
                <div className="pet-table">
                    <ul className="overflow-auto">
                        {vaccinations && vaccinations.length > 0 ? vaccinations.map((vacc) => (
                            <li
                                key={vacc._id}
                                onClick={(e) => update(e, vacc)}
                                className="pet-list btn w-100 container py-1 mb-2"
                            >
                                <div className="row">
                                    <div className="col">{vacc.Name}</div>
                                </div>
                                <div className="row">
                                    <div className="col text-muted small">
                                        Administered: <Moment format="MM/DD/YYYY">{vacc.DateAdministered}</Moment>
                                    </div>
                                </div>
                                {vacc.NextDueDate && (
                                    <div className="row">
                                        <div className={`col small ${new Date(vacc.NextDueDate) < new Date() ? 'text-danger font-weight-bold' : 'text-muted'}`}>
                                            {new Date(vacc.NextDueDate) < new Date() && <i className="fa fa-exclamation-circle me-1"></i>}
                                            Due: <Moment format="MM/DD/YYYY">{vacc.NextDueDate}</Moment>
                                        </div>
                                    </div>
                                )}
                            </li>
                        )) : <p className="empty-list-msg">No vaccinations added.</p>}
                    </ul>
                </div>
                <button
                    onClick={(e) => add(e, { _id: 0 })}
                    className="edit-medications-btn btn btn-circle shadow"
                >
                    <i className="fa fa-plus my-float"></i>
                </button>

                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add or Edit Vaccination</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <AddVaccination data={modalData} existing={existing} />
                    </Modal.Body>
                    <Modal.Footer>
                        {existing ? (
                            <Button
                                className="delete-saved-entry"
                                onClick={(e) => handleDelVacc(e, document.forms, postVacc)}
                            >
                                Remove Vaccination
                            </Button>
                        ) : null}
                        <Button
                            className="save-updated-entry"
                            onClick={(e) => handleAddUpdateVacc(e, document.forms, postVacc)}
                        >
                            Submit Changes
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default Vaccinations;
